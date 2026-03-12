import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jetpack Joyride — Neon Edition',
  description:
    'Fly with a jetpack, dodge missiles, collect coins and power-ups. A neon cyberpunk browser arcade game built with Next.js & Canvas.',
  keywords: ['jetpack joyride', 'browser game', 'arcade', 'next.js', 'canvas'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#050514',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="h-full overflow-hidden bg-[#050514]">
        {children}
      </body>
    </html>
  );
}
