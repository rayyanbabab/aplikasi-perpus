'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  BookOpen,
  LayoutDashboard,
  BookCopy,
  Users,
  ArrowLeftRight,
  AlertCircle,
  BarChart3,
  Tag,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Buku',
    href: '/admin/buku',
    icon: BookCopy,
  },
  {
    label: 'Kategori',
    href: '/admin/kategori',
    icon: Tag,
  },
  {
    label: 'Anggota',
    href: '/admin/anggota',
    icon: Users,
  },
  {
    label: 'Peminjaman',
    href: '/admin/peminjaman',
    icon: ArrowLeftRight,
  },
  {
    label: 'Denda',
    href: '/admin/denda',
    icon: AlertCircle,
  },
  {
    label: 'Laporan',
    href: '/admin/laporan',
    icon: BarChart3,
  },
];

export function AdminSidebar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-zinc-950 border-r border-zinc-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-zinc-800">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-black" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">Perpustakaan</p>
          <p className="text-xs text-zinc-500 truncate">ASTRAtech</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group',
                isActive
                  ? 'bg-white text-black font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-zinc-300">
              {userName?.charAt(0).toUpperCase() ?? 'A'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-zinc-200 truncate">{userName ?? 'Admin'}</p>
            <p className="text-[10px] text-zinc-500">Administrator</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
