import { db } from '@/lib/db';
import { books, categories } from '@/lib/db/schema';
import { eq, ilike, or } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Layers, Sparkles, Filter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Katalog Koleksi Pustaka' };

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
      categoryId: books.categoryId,
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
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Header Banner */}
      <div className="relative rounded-2xl bg-card border border-border/80 p-6 sm:p-8 overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative max-w-2xl">
          <span className="text-xs uppercase tracking-widest text-primary font-semibold font-sans block mb-1.5">
            Perpustakaan Digital ASTRAtech
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
            Koleksi & Ruang Pustaka
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Telusuri literatur ilmiah, buku pegangan praktikum industri, serta referensi akademik kurasi Politeknik Astra.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <form className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari judul buku, pengarang, atau topik ilmu..."
              className="w-full pl-10 pr-3.5 h-11 bg-card border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 shadow-xs"
            />
          </div>

          <label className="flex items-center gap-2.5 h-11 px-4 bg-card border border-input rounded-xl text-xs font-semibold text-foreground cursor-pointer hover:bg-secondary/40 transition-colors flex-shrink-0 shadow-xs">
            <input
              name="tersedia"
              type="checkbox"
              value="1"
              defaultChecked={onlyAvailable}
              className="w-4 h-4 accent-amber-600 rounded"
            />
            <span>Hanya Koleksi Tersedia</span>
          </label>

          <button
            type="submit"
            className="h-11 px-6 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
          >
            <span>Cari Buku</span>
          </button>

          {(q || kategoriId || onlyAvailable) && (
            <Link
              href="/member/katalog"
              className="h-11 px-4 flex items-center justify-center border border-border/80 text-muted-foreground text-xs font-semibold rounded-xl hover:text-foreground hover:bg-secondary transition-colors flex-shrink-0"
            >
              Reset Filter
            </Link>
          )}
        </form>

        {/* Quick Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <Link
            href={`/member/katalog${onlyAvailable ? '?tersedia=1' : ''}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap ${
              !kategoriId
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-card text-muted-foreground hover:text-foreground border-border/70 hover:bg-secondary'
            }`}
          >
            Semua Bidang
          </Link>
          {allCategories.map((c) => {
            const isSelected = kategoriId === c.id;
            return (
              <Link
                key={c.id}
                href={`/member/katalog?kategori=${c.id}${onlyAvailable ? '&tersedia=1' : ''}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card text-muted-foreground hover:text-foreground border-border/70 hover:bg-secondary'
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Catalog Results Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Menemukan {allBooks.length} judul koleksi
        </p>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {allBooks.map((book) => (
          <Link
            key={book.id}
            href={`/member/katalog/${book.id}`}
            className="group flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg shadow-xs"
          >
            {/* Visual Book Cover Presentation */}
            <div className="relative aspect-[3/4] bg-secondary overflow-hidden book-spine-depth">
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-card to-secondary">
                  <BookOpen className="w-10 h-10 text-muted-foreground/40 mb-2" />
                  <p className="font-serif text-xs font-bold text-foreground line-clamp-3 leading-snug">
                    {book.title}
                  </p>
                </div>
              )}

              {/* Status Stock Badge */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs backdrop-blur-xs ${
                    book.availableCopies > 0
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                  }`}
                >
                  {book.availableCopies > 0 ? `${book.availableCopies} siap` : 'Reservasi'}
                </span>
              </div>
            </div>

            {/* Book Metadata */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <p className="font-serif font-bold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {book.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {book.author}
                </p>
              </div>

              {book.categoryName && (
                <div className="mt-3 pt-2 border-t border-border/50">
                  <span className="text-[10px] font-semibold text-muted-foreground/80 tracking-wide uppercase">
                    {book.categoryName}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {allBooks.length === 0 && (
        <div className="py-20 text-center rounded-2xl border border-dashed border-border/80 p-8">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-foreground">Koleksi Tidak Ditemukan</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Tidak ada buku yang sesuai dengan kata kunci pencarian atau filter yang dipilih.
          </p>
          <Link
            href="/member/katalog"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Tampilkan seluruh katalog buku
          </Link>
        </div>
      )}
    </div>
  );
}
