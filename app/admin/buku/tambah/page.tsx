import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { BookFormClient } from '@/components/admin/book-form-client';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Tambah Buku' };

export default async function TambahBukuPage() {
  const allCategories = await db.select().from(categories).orderBy(categories.name);

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <a href="/admin/buku" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          â† Kembali ke Daftar Buku
        </a>
        <h1 className="text-2xl font-semibold text-white mt-2">Tambah Buku Baru</h1>
      </div>
      <BookFormClient categories={allCategories} />
    </div>
  );
}
