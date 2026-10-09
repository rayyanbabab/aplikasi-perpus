'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { BookOpen, Library, History, Bookmark, Bell, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Katalog', href: '/member/katalog', icon: Library },
  { label: 'Peminjaman Saya', href: '/member/riwayat', icon: History },
  { label: 'Reservasi', href: '/member/reservasi', icon: Bookmark },
  { label: 'Notifikasi', href: '/member/notifikasi', icon: Bell },
];

export function MemberNav({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const initial = userName ? userName.charAt(0).toUpperCase() : 'M';

  return (
    <>
      {/* Desktop & Mobile Header Bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <Link href="/member/katalog" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-sm tracking-tight text-foreground block leading-none">
                Perpustakaan ASTRAtech
              </span>
              <span className="text-[10px] font-sans font-medium text-muted-foreground tracking-wider uppercase block mt-0.5">
                Ruang Baca Digital
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border/60">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                    isActive
                      ? 'bg-card text-foreground font-semibold shadow-xs border border-border/70 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                  )}
                >
                  <item.icon className={cn('w-3.5 h-3.5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2.5 pl-3 pr-2 py-1 rounded-full bg-secondary/40 border border-border/60">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold">
                {initial}
              </div>
              <div className="text-left pr-2">
                <p className="text-xs font-semibold text-foreground truncate max-w-[120px] leading-tight">
                  {userName ?? 'Anggota'}
                </p>
                <p className="text-[10px] text-muted-foreground">Anggota Aktif</p>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border border-transparent hover:border-destructive/20"
              title="Keluar dari akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly for smartphone users) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-lg min-w-[56px] text-center transition-all',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-4 h-4 mb-0.5', isActive && 'text-primary')} />
              <span className="text-[10px] tracking-tight">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
