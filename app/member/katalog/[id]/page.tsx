import { db } from '@/lib/db';
import { books, categories, reservations, loans } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Calendar, Building2, Hash, Users, ArrowLeft } from 'lucide-react';
import { ReservasiButton } from '@/components/member/reservasi-button';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book] = await db.select({ title: books.title }).from(books).where(eq(books.id, id)).limit(1);
  return { title: book?.title ?? 'Detail Buku' };
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
    <div className="animate-fade-in">
      <Link href="/member/katalog" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cover */}
        <div className="md:col-span-1">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
            {book.coverUrl ? (
              <Image src={book.coverUrl} alt={book.title} fill className="object-cover" sizes="400px" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-zinc-700" />
              </div>
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="md:col-span-2 space-y-6">
          <div>
            {book.categoryName && <Badge variant="secondary" className="mb-3">{book.categoryName}</Badge>}
            <h1 className="text-2xl font-bold text-white leading-tight">{book.title}</h1>
            <p className="text-lg text-zinc-400 mt-1">oleh {book.author}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Building2, label: 'Penerbit', value: book.publisher ?? '-' },
              { icon: Calendar, label: 'Tahun Terbit', value: book.year?.toString() ?? '-' },
              { icon: Hash, label: 'ISBN', value: book.isbn ?? '-' },
              { icon: Users, label: 'Total Eksemplar', value: `${book.totalCopies} buku` },
            ].map((item) => (
              <div key={item.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs text-zinc-500">{item.label}</span>
                </div>
                <p className="text-sm font-medium text-zinc-200">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Ketersediaan */}
          <div className={`p-4 rounded-xl border ${
            book.availableCopies > 0
              ? 'bg-emerald-950/30 border-emerald-900'
              : 'bg-amber-950/30 border-amber-900'
          }`}>
            {book.availableCopies > 0 ? (
              <>
                <p className="text-emerald-400 font-medium">✓ Tersedia untuk Dipinjam</p>
                <p className="text-sm text-zinc-400 mt-1">
                  {book.availableCopies} dari {book.totalCopies} eksemplar tersedia saat ini.
                  Silakan datang ke meja sirkulasi untuk meminjam.
                </p>
              </>
            ) : (
              <>
                <p className="text-amber-400 font-medium">⏳ Semua Eksemplar Sedang Dipinjam</p>
                <p className="text-sm text-zinc-400 mt-1">
                  {queueCount > 0
                    ? `${queueCount} orang dalam antrian reservasi.`
                    : 'Belum ada antrian.'} Reservasi untuk mendapat notifikasi saat buku tersedia.
                </p>
              </>
            )}
          </div>

          {/* Aksi */}
          {book.availableCopies === 0 && session && (
            <ReservasiButton
              bookId={book.id}
              bookTitle={book.title}
              userHasReservation={userHasReservation}
            />
          )}

          {!session && (
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-500">
              <Link href="/login" className="text-white hover:underline">Login</Link> untuk bisa membuat reservasi.
            </div>
          )}

          {/* Deskripsi */}
          {book.description && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Deskripsi</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">{book.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
