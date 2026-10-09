import { db } from '@/lib/db';
import { books, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { BookFormClient } from '@/components/admin/book-form-client';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Sunting Data Buku' };

export default async function EditBukuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  if (!book) notFound();

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
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Sunting Data Buku
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Mengubah rincian katalog untuk: <span className="font-semibold text-foreground">{book.title}</span>
            </p>
          </div>
        </div>
      </div>

      <BookFormClient categories={allCategories} defaultValues={book} isEdit bookId={id} />
    </div>
  );
}
