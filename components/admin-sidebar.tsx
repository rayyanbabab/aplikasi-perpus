'use client';

import { useState } from 'react';
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
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavSection {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    title: 'Sirkulasi & Layanan',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Peminjaman', href: '/admin/peminjaman', icon: ArrowLeftRight },
      { label: 'Denda & Pembayaran', href: '/admin/denda', icon: AlertCircle },
    ],
  },
  {
    title: 'Koleksi & Pustaka',
    items: [
      { label: 'Daftar Buku', href: '/admin/buku', icon: BookCopy },
      { label: 'Kategori Koleksi', href: '/admin/kategori', icon: Tag },
    ],
  },
  {
    title: 'Keanggotaan & Laporan',
    items: [
      { label: 'Data Anggota', href: '/admin/anggota', icon: Users },
      { label: 'Laporan & Ekspor', href: '/admin/laporan', icon: BarChart3 },
    ],
  },
];

export function AdminSidebar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initial = userName ? userName.charAt(0).toUpperCase() : 'A';

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="font-serif font-bold text-sm tracking-tight text-sidebar-foreground block leading-tight">
              Perpustakaan
            </span>
            <span className="text-[11px] font-sans font-medium text-primary tracking-wide block">
              ASTRAtech Digital
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          aria-label="Tutup Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h4 className="px-3 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
              {section.title}
            </h4>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin/dashboard' && pathname.startsWith(item.href + '/'));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative',
                      isActive
                        ? 'bg-primary/15 text-primary font-semibold shadow-sm'
                        : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                      )}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-primary opacity-80" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profile */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar/50">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-card/40 border border-sidebar-border/60 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-sidebar-foreground truncate leading-tight">
              {userName ?? 'Administrator'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Pustakawan
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors border border-transparent hover:border-destructive/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-sm text-sidebar-foreground">
            Perpustakaan ASTRAtech
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          aria-label="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop & Panel */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85%] bg-sidebar h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border sticky top-0 h-screen flex-shrink-0">
        <NavContent />
      </aside>
    </>
  );
}
