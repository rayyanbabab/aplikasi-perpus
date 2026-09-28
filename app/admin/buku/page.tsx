import { db } from '@/lib/db';
import { books, categories } from '@/lib/db/schema';
import { eq, ilike, or, sql } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Search, BookOpen } from 'lucide-react';
import { DeleteBookButton } from '@/components/admin/delete-book-button';
import Image from 'next/image';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Manajemen Buku' };

export default async function BukuPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? '';
  const kategoriId = params.kategori ?? '';

  const query = db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      isbn: books.isbn,
      year: books.year,
      totalCopies: books.totalCopies,
      availableCopies: books.availableCopies,
      coverUrl: books.coverUrl,
      categoryName: categories.name,
    })
    .from(books)
    .leftJoin(categories, eq(books.categoryId, categories.id));

  const allBooks = await (q
    ? query.where(or(ilike(books.title, `%${q}%`), ilike(books.author, `%${q}%`), ilike(books.isbn, `%${q}%`)))
    : kategoriId
    ? query.where(eq(books.categoryId, kategoriId))
    : query);

  const allCategories = await db.select().from(categories).orderBy(categories.name);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manajemen Buku</h1>
          <p className="text-zinc-500 text-sm mt-1">{allBooks.length} buku terdaftar</p>
        </div>
        <Link
          href="/admin/buku/tambah"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Buku
        </Link>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4">
          <form className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari judul, penulis, atau ISBN..."
                className="w-full pl-9 pr-3 h-9 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <select
              name="kategori"
              defaultValue={kategoriId}
              className="h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="">Semua Kategori</option>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="h-9 px-4 bg-zinc-700 text-white text-sm rounded-lg hover:bg-zinc-600 transition-colors"
            >
              Cari
            </button>
            {(q || kategoriId) && (
              <Link
                href="/admin/buku"
                className="h-9 px-4 bg-transparent border border-zinc-700 text-zinc-400 text-sm rounded-lg hover:text-white hover:border-zinc-500 transition-colors flex items-center"
              >
                Reset
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Buku</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Penulis</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Stok</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {allBooks.map((book) => (
                <tr key={book.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-12 rounded bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                        {book.coverUrl ? (
                          <Image
                            src={book.coverUrl}
                            alt={book.title}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100 line-clamp-1">{book.title}</p>
                        <p className="text-xs text-zinc-500">{book.isbn ?? 'Tanpa ISBN'} Â· {book.year ?? '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{book.author}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{book.categoryName ?? 'Umum'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {book.availableCopies}/{book.totalCopies}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={book.availableCopies > 0 ? 'success' : 'destructive'}>
                      {book.availableCopies > 0 ? 'Tersedia' : 'Habis'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/buku/${book.id}/edit`}
                        className="text-xs px-3 py-1.5 border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteBookButton id={book.id} title={book.title} />
                    </div>
                  </td>
                </tr>
              ))}
              {allBooks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-600">
                    {q ? `Tidak ada buku yang cocok dengan "${q}"` : 'Belum ada buku terdaftar'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
