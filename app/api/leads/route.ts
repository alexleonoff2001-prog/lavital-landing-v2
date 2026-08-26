import { ensureDatabase, getDatabase } from '@/db/client';

export const runtime = 'edge';

const jsonHeaders = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const response = (message: string, status: number) => Response.json({ message }, { status, headers: jsonHeaders });

async function rateKey(request: Request) {
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const bytes = new TextEncoder().encode(`lavital:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) return response('Formato de solicitud no válido.', 415);
  if (Number(request.headers.get('content-length') || 0) > 4096) return response('Solicitud demasiado grande.', 413);
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return response('Origen no permitido.', 403);

  let payload: unknown;
  try { payload = await request.json(); } catch { return response('Los datos enviados no son válidos.', 400); }
  if (!payload || typeof payload !== 'object') return response('Los datos enviados no son válidos.', 400);
  const { name, phone, consent, website, startedAt } = payload as Record<string, unknown>;

  if (typeof website === 'string' && website.trim()) return response('Solicitud recibida.', 202);
  if (typeof startedAt !== 'number' || Date.now() - startedAt < 1500 || Date.now() - startedAt > 86_400_000) return response('Espera un momento y vuelve a intentar.', 400);
  if (consent !== true) return response('Debes autorizar el tratamiento de datos.', 400);
  if (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 80 || !/^[\p{L}\p{M}'’ .-]+$/u.test(name.trim())) return response('Ingresa un nombre válido.', 400);
  if (typeof phone !== 'string' || phone.length > 20 || !/^[0-9+() .-]+$/.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15) return response('Ingresa un teléfono válido.', 400);

  try {
    const database = getDatabase();
    await ensureDatabase(database);
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - 3600;
    const key = await rateKey(request);
    await database.prepare('DELETE FROM rate_limits WHERE window_started < ?').bind(now - 86400).run();
    const limit = await database.prepare(`
      INSERT INTO rate_limits (rate_key, request_count, window_started) VALUES (?, 1, ?)
      ON CONFLICT(rate_key) DO UPDATE SET
        request_count = CASE WHEN window_started < ? THEN 1 ELSE request_count + 1 END,
        window_started = CASE WHEN window_started < ? THEN excluded.window_started ELSE window_started END
      RETURNING request_count
    `).bind(key, now, windowStart, windowStart).first<{ request_count: number }>();
    if ((limit?.request_count ?? 1) > 5) return response('Has realizado varios intentos. Intenta de nuevo más tarde.', 429);

    const createdAt = new Date().toISOString();
    await database.prepare('INSERT INTO leads (id, name, phone, consent_at, created_at, source) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), name.trim().replace(/\s+/g, ' '), phone.trim(), createdAt, createdAt, 'landing-lavital').run();
    return response('Solicitud recibida correctamente.', 201);
  } catch {
    return response('El servicio no está disponible en este momento. Intenta nuevamente.', 503);
  }
}

export function GET() { return response('Método no permitido.', 405); }
