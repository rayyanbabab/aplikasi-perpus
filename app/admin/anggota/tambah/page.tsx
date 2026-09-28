import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { MemberFormClient } from '@/components/admin/member-form-client';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Tambah Anggota' };

export default async function TambahAnggotaPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <a href="/admin/anggota" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">â† Kembali</a>
        <h1 className="text-2xl font-semibold text-white mt-2">Tambah Anggota Baru</h1>
      </div>
      <MemberFormClient />
    </div>
  );
}
