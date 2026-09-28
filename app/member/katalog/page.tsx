import { db } from '@/lib/db';
import { books, categories } from '@/lib/db/schema';
import { eq, ilike, or, sql } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Katalog Buku' };

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; tersedia?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? '';
  const kategoriId = params.kategori ?? '';
  const onlyAvailable = params.tersedia === '1';

  let query = db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      publisher: books.publisher,
      year: books.year,
      availableCopies: books.availableCopies,
      totalCopies: books.totalCopies,
      coverUrl: books.coverUrl,
      description: books.description,
      categoryName: categories.name,
    })
    .from(books)
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .$dynamic();

  if (q) {
    query = query.where(or(ilike(books.title, `%${q}%`), ilike(books.author, `%${q}%`)));
  } else if (kategoriId) {
    query = query.where(eq(books.categoryId, kategoriId));
  }

  let allBooks = await query.orderBy(books.title);
  if (onlyAvailable) allBooks = allBooks.filter((b) => b.availableCopies > 0);

  const allCategories = await db.select().from(categories).orderBy(categories.name);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Katalog Buku</h1>
        <p className="text-zinc-500 text-sm mt-1">Temukan buku yang Anda butuhkan</p>
      </div>

      {/* Search & Filter */}
      <form className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari judul atau penulis..."
            className="w-full pl-9 pr-3 h-10 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-600"
          />
        </div>
        <select
          name="kategori"
          defaultValue={kategoriId}
          className="h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="">Semua Kategori</option>
          {allCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 cursor-pointer hover:border-zinc-600 transition-colors">
          <input name="tersedia" type="checkbox" value="1" defaultChecked={onlyAvailable} className="accent-white" />
          Hanya tersedia
        </label>
        <button type="submit" className="h-10 px-4 bg-white text-black text-sm font-medium rounded-xl hover:bg-zinc-100 transition-colors">
          Cari
        </button>
        {(q || kategoriId || onlyAvailable) && (
          <Link href="/member/katalog" className="h-10 px-4 flex items-center border border-zinc-700 text-zinc-400 text-sm rounded-xl hover:text-white transition-colors">
            Reset
          </Link>
        )}
      </form>

      <p className="text-sm text-zinc-500">{allBooks.length} buku ditemukan</p>

      {/* Book Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {allBooks.map((book) => (
          <Link
            key={book.id}
            href={`/member/katalog/${book.id}`}
            className="group block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5"
          >
            {/* Cover */}
            <div className="relative aspect-[3/4] bg-zinc-800">
              {book.coverUrl ? (
                <Image src={book.coverUrl} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-zinc-600" />
                </div>
              )}
              {/* Availability badge */}
              <div className="absolute top-2 right-2">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${
                  book.availableCopies > 0
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-900'
                    : 'bg-red-950/80 text-red-400 border-red-900'
                }`}>
                  {book.availableCopies > 0 ? `${book.availableCopies} tersedia` : 'Habis'}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-sm font-medium text-zinc-100 line-clamp-2 group-hover:text-white transition-colors">{book.title}</p>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{book.author}</p>
              {book.categoryName && (
                <Badge variant="secondary" className="mt-2 text-[10px]">{book.categoryName}</Badge>
              )}
            </div>
          </Link>
        ))}
      </div>

      {allBooks.length === 0 && (
        <div className="py-20 text-center">
          <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">Tidak ada buku yang ditemukan</p>
          <Link href="/member/katalog" className="mt-3 inline-block text-sm text-zinc-400 hover:text-white transition-colors">
            Lihat semua buku â†’
          </Link>
        </div>
      )}
    </div>
  );
}
