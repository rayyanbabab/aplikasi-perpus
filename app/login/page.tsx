'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Eye, EyeOff, Loader2, KeyRound, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email atau kata sandi tidak sesuai. Periksa kembali data login Anda.');
      } else {
        router.refresh();
        router.push('/');
      }
    } catch {
      setError('Terjadi kendala saat menghubungkan ke server. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  function fillCredentials(fillEmail: string, fillPass: string) {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError('');
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Warm Library Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(217,119,6,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in my-8">
        {/* Academic Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-card rounded-2xl border border-primary/30 shadow-lg shadow-black/20 flex items-center justify-center mb-4 text-primary">
            <BookOpen className="w-7 h-7" />
          </div>
          <span className="text-xs uppercase tracking-widest text-primary font-semibold font-sans mb-1">
            Politeknik Astra
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Perpustakaan Digital
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
            Akses katalog koleksi ilmiah, sirkulasi peminjaman, dan reservasi buku.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border/90 rounded-2xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-5 p-3.5 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm flex items-start gap-2">
              <span className="font-semibold text-xs mt-0.5">•</span>
              <p className="leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@astra.ac.id"
                required
                className="w-full h-11 px-3.5 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground/60 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus:border-primary transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full h-11 px-3.5 pr-11 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground/60 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-semibold rounded-xl shadow-md mt-2 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Memproses Masuk...' : 'Masuk ke Akun'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/80 text-center">
            <p className="text-xs text-muted-foreground">
              Belum terdaftar sebagai anggota perpustakaan?{' '}
              <Link href="/register" className="text-primary hover:underline font-semibold ml-0.5">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mt-4 p-4 bg-card/60 border border-border/70 rounded-xl text-xs">
          <p className="font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-primary" />
            Akun Demo Pengujian:
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@perpustakaan.ac.id', 'admin123')}
              className="p-2 text-left rounded-lg bg-secondary/60 hover:bg-secondary border border-border/60 transition-colors"
            >
              <span className="font-semibold text-foreground block">Pustakawan (Admin)</span>
              <span className="text-[10px] text-muted-foreground block truncate">admin@perpustakaan.ac.id</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('budi@student.ac.id', 'member123')}
              className="p-2 text-left rounded-lg bg-secondary/60 hover:bg-secondary border border-border/60 transition-colors"
            >
              <span className="font-semibold text-foreground block">Mahasiswa (Anggota)</span>
              <span className="text-[10px] text-muted-foreground block truncate">budi@student.ac.id</span>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/70 mt-6 font-sans">
          © 2024 Politeknik Astra · Sistem Informasi Perpustakaan Digital
        </p>
      </div>
    </div>
  );
}
