import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Newsreader } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: {
    default: 'Perpustakaan Digital | ASTRAtech',
    template: '%s | Perpustakaan ASTRAtech',
  },
  description: 'Sistem Informasi Perpustakaan Digital Politeknik Astra: kelola koleksi buku, peminjaman, dan anggota secara terpadu.',
  keywords: ['perpustakaan', 'digital', 'politeknik astra', 'sistem informasi'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className={`${sans.variable} ${serif.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
