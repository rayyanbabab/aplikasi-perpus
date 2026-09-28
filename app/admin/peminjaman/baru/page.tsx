import { db } from '@/lib/db';
import { users, books, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { LoanFormClient } from '@/components/admin/loan-form-client';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Buat Peminjaman Baru' };

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
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <a href="/admin/peminjaman" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">â† Kembali ke Peminjaman</a>
        <h1 className="text-2xl font-semibold text-white mt-2">Buat Peminjaman Baru</h1>
        <p className="text-zinc-500 text-sm mt-1">Petugas memproses peminjaman di meja sirkulasi</p>
      </div>
      <LoanFormClient members={members} books={allBooks} />
    </div>
  );
}
