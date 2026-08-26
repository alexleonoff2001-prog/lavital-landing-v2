import { ensureDatabase, getDatabase } from '@/db/client';

export const runtime = 'edge';

const githubPagesOrigin = 'https://alexleonoff2001-prog.github.io';
const jsonHeaders = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

function isAllowedOrigin(origin: string, requestUrl: string) {
  try {
    return origin === githubPagesOrigin || new URL(origin).host === new URL(requestUrl).host;
  } catch {
    return false;
  }
}

function corsHeaders(origin: string | null) {
  return origin && origin === githubPagesOrigin
    ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
    : {};
}

const response = (message: string, status: number, origin: string | null = null) =>
  Response.json({ message }, { status, headers: { ...jsonHeaders, ...corsHeaders(origin) } });

async function rateKey(request: Request) {
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const bytes = new TextEncoder().encode(`lavital:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && !isAllowedOrigin(origin, request.url)) return response('Origen no permitido.', 403);
  const reply = (message: string, status: number) => response(message, status, origin);
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) return reply('Formato de solicitud no válido.', 415);
  if (Number(request.headers.get('content-length') || 0) > 4096) return reply('Solicitud demasiado grande.', 413);

  let payload: unknown;
  try { payload = await request.json(); } catch { return reply('Los datos enviados no son válidos.', 400); }
  if (!payload || typeof payload !== 'object') return reply('Los datos enviados no son válidos.', 400);
  const { name, phone, consent, website, startedAt } = payload as Record<string, unknown>;

  if (typeof website === 'string' && website.trim()) return reply('Solicitud recibida.', 202);
  if (typeof startedAt !== 'number' || Date.now() - startedAt < 1500 || Date.now() - startedAt > 86_400_000) return reply('Espera un momento y vuelve a intentar.', 400);
  if (consent !== true) return reply('Debes autorizar el tratamiento de datos.', 400);
  if (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 80 || !/^[\p{L}\p{M}'’ .-]+$/u.test(name.trim())) return reply('Ingresa un nombre válido.', 400);
  if (typeof phone !== 'string' || phone.length > 20 || !/^[0-9+() .-]+$/.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15) return reply('Ingresa un teléfono válido.', 400);

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
    if ((limit?.request_count ?? 1) > 5) return reply('Has realizado varios intentos. Intenta de nuevo más tarde.', 429);

    const createdAt = new Date().toISOString();
    await database.prepare('INSERT INTO leads (id, name, phone, consent_at, created_at, source) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), name.trim().replace(/\s+/g, ' '), phone.trim(), createdAt, createdAt, 'landing-lavital').run();
    return reply('Solicitud recibida correctamente.', 201);
  } catch {
    return reply('El servicio no está disponible en este momento. Intenta nuevamente.', 503);
  }
}

export function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || !isAllowedOrigin(origin, request.url)) return response('Origen no permitido.', 403);
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(origin),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export function GET() { return response('Método no permitido.', 405); }
