import type { Metadata } from 'next';
import './globals.css';

const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase,
  title: 'Lavital | Activa tu bienestar',
  description: 'Lavital acompaña tu rutina saludable y apoya tu metabolismo. Suplemento dietario de 30 unidades para acompañar hábitos saludables.',
  applicationName: 'Lavital',
  keywords: ['Lavital', 'suplemento dietario', 'bienestar', 'hábitos saludables', 'Colombia'],
  icons: { icon: '/favicon.png' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website', locale: 'es_CO', siteName: 'Lavital',
    title: 'Lavital | Activa tu bienestar',
    description: 'Lavital acompaña tu rutina saludable.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Activa tu bienestar con Lavital' }],
  },
  twitter: { card: 'summary_large_image', title: 'Lavital | Activa tu bienestar', description: 'Lavital acompaña tu rutina saludable.', images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-CO"><body>{children}</body></html>;
}
