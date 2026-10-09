import { db } from '@/lib/db';
import { books, categories } from '@/lib/db/schema';
import { eq, ilike, or } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Search, BookOpen, Layers, Edit, Eye } from 'lucide-react';
import { DeleteBookButton } from '@/components/admin/delete-book-button';
import Image from 'next/image';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Manajemen Koleksi Buku' };

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Koleksi Pustaka</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Manajemen Buku
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola data bibliografi, stok eksemplar, dan informasi pengarang dalam repositori.
          </p>
        </div>

        <Link
          href="/admin/buku/tambah"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Buku Baru
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4">
          <form className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari judul buku, penulis, atau nomor ISBN..."
                className="w-full pl-10 pr-3.5 h-10 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              />
            </div>
            <select
              name="kategori"
              defaultValue={kategoriId}
              className="h-10 px-3.5 bg-background border border-input rounded-xl text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:w-56"
            >
              <option value="">Semua Kategori</option>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-10 px-5 bg-secondary text-secondary-foreground font-medium text-sm rounded-xl hover:bg-secondary/80 border border-border/80 transition-colors"
            >
              Filter
            </button>
            {(q || kategoriId) && (
              <Link
                href="/admin/buku"
                className="h-10 px-4 flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground border border-border/60 rounded-xl transition-colors"
              >
                Reset
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Menampilkan {allBooks.length} buku terdaftar
        </p>
      </div>

      {/* Books Table */}
      <Card className="border-border/80 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-secondary/30">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Buku & Informasi
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Penulis
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Kategori
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Stok Eksemplar
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ketersediaan
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {allBooks.map((book) => (
                <tr key={book.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-14 rounded-md bg-secondary overflow-hidden flex-shrink-0 relative border border-border/80 shadow-xs book-spine-depth">
                        {book.coverUrl ? (
                          <Image
                            src={book.coverUrl}
                            alt={book.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-[320px]">
                        <p className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {book.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ISBN: {book.isbn ?? 'Tidak tercatat'} · Terbit {book.year ?? '-'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs font-medium">
                    {book.author}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="secondary" className="font-normal text-[11px]">
                      {book.categoryName ?? 'Umum'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-foreground font-medium text-xs">
                    {book.availableCopies} dari {book.totalCopies} buku
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={book.availableCopies > 0 ? 'success' : 'destructive'}>
                      {book.availableCopies > 0 ? 'Tersedia' : 'Habis'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/buku/${book.id}/edit`}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 border border-border/80 rounded-lg text-foreground hover:bg-secondary transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Edit</span>
                      </Link>
                      <DeleteBookButton id={book.id} title={book.title} />
                    </div>
                  </td>
                </tr>
              ))}
              {allBooks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="font-serif text-base italic">
                      {q ? `Tidak ada judul buku yang sesuai dengan kueri "${q}"` : 'Belum ada koleksi buku yang terdaftar.'}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {q ? 'Coba gunakan kata kunci lain atau reset filter.' : 'Mulai daftarkan koleksi pustaka pertama Anda.'}
                    </p>
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
