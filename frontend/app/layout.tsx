import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'NetFlow ISP Management Platform',
  description: 'Production-grade ISP management platform for MikroTik routers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
