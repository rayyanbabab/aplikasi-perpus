'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { BookOpen, Library, History, Bookmark, Bell, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Katalog', href: '/member/katalog', icon: Library },
  { label: 'Riwayat', href: '/member/riwayat', icon: History },
  { label: 'Reservasi', href: '/member/reservasi', icon: Bookmark },
  { label: 'Notifikasi', href: '/member/notifikasi', icon: Bell },
];

export function MemberNav({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/member/katalog" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-black" />
          </div>
          <span className="text-sm font-semibold text-white hidden sm:block">Perpustakaan</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                  isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:block">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-medium text-zinc-300">{userName}</p>
            <p className="text-[10px] text-zinc-600">Anggota</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
