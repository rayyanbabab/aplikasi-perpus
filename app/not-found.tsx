import Link from 'next/link';
import { BookOpen, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(217,119,6,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative text-center max-w-md p-8 bg-card border border-border/90 rounded-2xl shadow-xl animate-fade-in">
        <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
          <Compass className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase tracking-widest text-primary font-semibold font-sans mb-1 block">
          Galat 404
        </span>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
          Koleksi Tidak Ditemukan
        </h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Halaman atau berkas katalog yang Anda cari tidak tersedia dalam arsip perpustakaan kami.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-11 px-6 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
        >
          Kembali ke Meja Sirkulasi
        </Link>
      </div>
    </div>
  );
}
