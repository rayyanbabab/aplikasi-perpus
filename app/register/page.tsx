'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Loader2, CheckCircle2 } from 'lucide-react';
import { registerMember } from '@/lib/actions/anggota';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerMember(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess('Pendaftaran berhasil! Akun anggota Anda telah dibuat. Mengalihkan ke halaman masuk...');
      setTimeout(() => router.push('/login'), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Warm Academic Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(217,119,6,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in my-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-card rounded-2xl border border-primary/30 shadow-lg shadow-black/20 flex items-center justify-center mb-4 text-primary">
            <BookOpen className="w-7 h-7" />
          </div>
          <span className="text-xs uppercase tracking-widest text-primary font-semibold font-sans mb-1">
            Politeknik Astra
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Pendaftaran Anggota
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
            Daftarkan diri Anda untuk mengakses katalog koleksi buku dan layanan sirkulasi.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-card border border-border/90 rounded-2xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-5 p-3.5 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm flex items-start gap-2">
              <span className="font-semibold text-xs mt-0.5">•</span>
              <p className="leading-snug">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-sm flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="leading-snug">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Nama Lengkap
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                className="w-full h-11 px-3.5 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground/60 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Alamat Email Institusi / Pribadi
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="nama@email.com"
                className="w-full h-11 px-3.5 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground/60 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Nomor Telepon / WhatsApp (Opsional)
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="081234567890"
                className="w-full h-11 px-3.5 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground/60 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Kata Sandi Baru
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter kombinasi"
                className="w-full h-11 px-3.5 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground/60 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus:border-primary transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !!success}
              className="w-full h-11 text-sm font-semibold rounded-xl shadow-md mt-2 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Mendaftarkan Akun...' : 'Daftar Sebagai Anggota'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/80 text-center">
            <p className="text-xs text-muted-foreground">
              Sudah memiliki akun anggota?{' '}
              <Link href="/login" className="text-primary hover:underline font-semibold ml-0.5">
                Masuk ke sini
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/70 mt-6 font-sans">
          © 2024 Politeknik Astra · Sistem Informasi Perpustakaan Digital
        </p>
      </div>
    </div>
  );
}
