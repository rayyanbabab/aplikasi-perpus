import { db } from '@/lib/db';
import { books, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { BookFormClient } from '@/components/admin/book-form-client';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Edit Buku' };

export default async function EditBukuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  if (!book) notFound();

  const allCategories = await db.select().from(categories).orderBy(categories.name);

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <a href="/admin/buku" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Kembali ke Daftar Buku
        </a>
        <h1 className="text-2xl font-semibold text-white mt-2">Edit Buku</h1>
        <p className="text-zinc-500 text-sm mt-1">{book.title}</p>
      </div>
      <BookFormClient categories={allCategories} defaultValues={book} isEdit bookId={id} />
    </div>
  );
}
