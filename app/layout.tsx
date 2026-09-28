import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Perpustakaan Digital | ASTRAtech',
    template: '%s | Perpustakaan ASTRAtech',
  },
  description: 'Sistem Informasi Perpustakaan Digital Politeknik Astra — kelola koleksi buku, peminjaman, dan anggota secara efisien.',
  keywords: ['perpustakaan', 'digital', 'politeknik astra', 'sistem informasi'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
