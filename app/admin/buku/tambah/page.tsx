import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { BookFormClient } from '@/components/admin/book-form-client';
import { ArrowLeft, BookPlus } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Pendaftaran Koleksi Baru' };

export default async function TambahBukuPage() {
  const allCategories = await db.select().from(categories).orderBy(categories.name);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link
          href="/admin/buku"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Koleksi</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <BookPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Pendaftaran Buku Baru
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Masukkan informasi bibliografi dan kuota eksemplar fisik koleksi.
            </p>
          </div>
        </div>
      </div>

      <BookFormClient categories={allCategories} />
    </div>
  );
}
