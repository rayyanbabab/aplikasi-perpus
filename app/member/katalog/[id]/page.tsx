import { db } from '@/lib/db';
import { books, categories, reservations, loans } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Calendar, Building2, Hash, Users, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { ReservasiButton } from '@/components/member/reservasi-button';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book] = await db.select({ title: books.title }).from(books).where(eq(books.id, id)).limit(1);
  return { title: book?.title ?? 'Detail Koleksi Buku' };
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const [book] = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      publisher: books.publisher,
      year: books.year,
      isbn: books.isbn,
      totalCopies: books.totalCopies,
      availableCopies: books.availableCopies,
      coverUrl: books.coverUrl,
      description: books.description,
      categoryName: categories.name,
    })
    .from(books)
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .where(eq(books.id, id))
    .limit(1);

  if (!book) notFound();

  // Cek antrian reservasi
  const reservationCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(reservations)
    .where(and(eq(reservations.bookId, id), eq(reservations.status, 'menunggu')));

  const queueCount = Number(reservationCount[0]?.count ?? 0);

  // Cek apakah user sudah reservasi buku ini
  let userHasReservation = false;
  if (session) {
    const existing = await db
      .select({ id: reservations.id })
      .from(reservations)
      .where(
        and(
          eq(reservations.bookId, id),
          eq(reservations.memberId, session.user.id),
          eq(reservations.status, 'menunggu')
        )
      )
      .limit(1);
    userHasReservation = existing.length > 0;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <Link
        href="/member/katalog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali ke Katalog Pustaka</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Cover Presentation */}
        <div className="md:col-span-4">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border/90 shadow-xl book-spine-depth">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 350px"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-card to-secondary">
                <BookOpen className="w-16 h-16 text-muted-foreground/30 mb-3" />
                <p className="font-serif text-sm font-bold text-foreground line-clamp-4">
                  {book.title}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{book.author}</p>
              </div>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="md:col-span-8 space-y-6">
          <div>
            {book.categoryName && (
              <Badge variant="secondary" className="mb-3 uppercase text-[10px] tracking-wider font-semibold">
                {book.categoryName}
              </Badge>
            )}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground leading-snug">
              {book.title}
            </h1>
            <p className="text-base text-muted-foreground mt-1.5 font-sans">
              Karya intelektual oleh <span className="text-foreground font-semibold">{book.author}</span>
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Building2, label: 'Penerbit', value: book.publisher ?? '-' },
              { icon: Calendar, label: 'Tahun', value: book.year?.toString() ?? '-' },
              { icon: Hash, label: 'ISBN', value: book.isbn ?? '-' },
              { icon: Users, label: 'Total Fisik', value: `${book.totalCopies} buku` },
            ].map((item) => (
              <div key={item.label} className="bg-card border border-border/80 rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                  <item.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] uppercase tracking-wider font-semibold">{item.label}</span>
                </div>
                <p className="text-xs font-semibold text-foreground truncate">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Availability Box */}
          <div
            className={`p-5 rounded-2xl border ${
              book.availableCopies > 0
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                : 'bg-amber-950/20 border-amber-800/40 text-amber-300'
            }`}
          >
            {book.availableCopies > 0 ? (
              <div className="space-y-1">
                <p className="font-serif font-bold text-base flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Tersedia untuk Dipinjam Langsung
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tersedia <strong className="text-foreground font-semibold">{book.availableCopies} dari {book.totalCopies} eksemplar fisik</strong> di rak perpustakaan. Silakan kunjungi meja sirkulasi perpustakaan dengan menunjukkan kartu anggota Anda untuk meminjam.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-serif font-bold text-base flex items-center gap-2 text-amber-400">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  Seluruh Eksemplar Sedang Dipinjam
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Saat ini terdapat {queueCount > 0 ? `${queueCount} anggota` : 'belum ada'} dalam daftar antrian reservasi. Anda dapat mengajukan reservasi di bawah ini untuk prioritas peminjaman saat buku dikembalikan.
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {book.availableCopies === 0 && session && (
            <ReservasiButton
              bookId={book.id}
              bookTitle={book.title}
              userHasReservation={userHasReservation}
            />
          )}

          {!session && (
            <div className="p-4 bg-card border border-border/80 rounded-xl text-xs text-muted-foreground">
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Masuk ke akun Anda
              </Link>{' '}
              untuk dapat melakukan reservasi buku ini.
            </div>
          )}

          {/* Synopsis */}
          {book.description && (
            <div className="pt-4 border-t border-border/60">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Sinopsis & Ringkasan Koleksi
              </h2>
              <p className="text-sm text-foreground/90 leading-relaxed font-sans">
                {book.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
