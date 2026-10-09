import { MemberFormClient } from '@/components/admin/member-form-client';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Pendaftaran Anggota Baru' };

export default async function TambahAnggotaPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link
          href="/admin/anggota"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Data Anggota</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Pendaftaran Anggota Baru
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Registrasi identitas sivitas akademika untuk akses hak peminjaman pustaka.
            </p>
          </div>
        </div>
      </div>
      <MemberFormClient />
    </div>
  );
}
