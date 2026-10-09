import { db } from '@/lib/db';
import { users, books, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { LoanFormClient } from '@/components/admin/loan-form-client';
import { ArrowLeft, BookPlus } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Pencatatan Peminjaman Buku' };

export default async function PeminjamanBaruPage() {
  const [members, allBooks] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, memberId: users.memberId })
      .from(users)
      .where(eq(users.role, 'member'))
      .orderBy(users.name),
    db.select({
      id: books.id,
      title: books.title,
      author: books.author,
      availableCopies: books.availableCopies,
      categoryName: categories.name,
    })
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .orderBy(books.title),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link
          href="/admin/peminjaman"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Sirkulasi Peminjaman</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <BookPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Pencatatan Peminjaman Buku
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Proses registrasi peminjaman di meja sirkulasi untuk anggota aktif.
            </p>
          </div>
        </div>
      </div>

      <LoanFormClient members={members} books={allBooks} />
    </div>
  );
}
