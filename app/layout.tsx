import type { Metadata } from 'next';
import { Outfit, DM_Sans } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/components/ReduxProvider';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'BMS — Système de Gestion',
  description: 'Business Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${outfit.variable} ${dmSans.variable} font-sans bg-surface-50 text-ink antialiased `}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
