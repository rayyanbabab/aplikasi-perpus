import { db } from '@/lib/db';
import { reservations, books } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Clock, Bookmark, BellRing, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { CancelReservasiButton } from '@/components/member/cancel-reservasi-button';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Daftar Reservasi Koleksi' };

const statusBadge = {
  menunggu: { label: 'Dalam Antrian', variant: 'warning' as const },
  tersedia: { label: 'Siap Diambil di Sirkulasi', variant: 'success' as const },
  diambil: { label: 'Telah Diambil', variant: 'info' as const },
  kadaluarsa: { label: 'Masa Ambil Kadaluarsa', variant: 'secondary' as const },
  dibatalkan: { label: 'Dibatalkan', variant: 'secondary' as const },
};

export default async function ReservasiPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const myReservations = await db
    .select({
      id: reservations.id,
      status: reservations.status,
      reservedAt: reservations.reservedAt,
      expiresAt: reservations.expiresAt,
      bookTitle: books.title,
      bookAuthor: books.author,
      bookCover: books.coverUrl,
      bookId: books.id,
    })
    .from(reservations)
    .leftJoin(books, eq(reservations.bookId, books.id))
    .where(eq(reservations.memberId, session.user.id))
    .orderBy(desc(reservations.reservedAt));

  const ready = myReservations.filter((r) => r.status === 'tersedia');
  const active = myReservations.filter((r) => r.status === 'menunggu' || r.status === 'tersedia');
  const history = myReservations.filter((r) => r.status !== 'menunggu' && r.status !== 'tersedia');

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
          <Bookmark className="w-3.5 h-3.5" />
          <span>Layanan Antrian Pustaka</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Reservasi Koleksi Saya
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola permohonan antrian peminjaman buku yang stok fisiknya sedang dipinjam sivitas lain.
        </p>
      </div>

      {/* Notifikasi Buku Siap Diambil */}
      {ready.map((r) => (
        <div
          key={r.id}
          className="p-5 bg-emerald-950/25 border border-emerald-700/50 rounded-2xl flex items-start gap-4 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <BellRing className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="font-serif font-bold text-base text-emerald-300">
              Koleksi Tersedia untuk Anda
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Buku <strong className="text-foreground">{r.bookTitle}</strong> telah dikembalikan ke perpustakaan dan disisihkan khusus untuk Anda. Silakan ambil di meja sirkulasi sebelum{' '}
              <strong className="text-primary font-semibold">{formatDate(r.expiresAt)}</strong> agar antrian tidak kadaluarsa.
            </p>
          </div>
        </div>
      ))}

      {/* Reservasi Aktif */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-foreground">
          Antrian Reservasi Aktif ({active.length})
        </h2>

        {active.length > 0 ? (
          <div className="space-y-3">
            {active.map((r) => {
              const s = statusBadge[r.status as keyof typeof statusBadge];

              return (
                <Card
                  key={r.id}
                  className={`border-border/80 p-4 transition-all shadow-sm ${
                    r.status === 'tersedia' ? 'border-emerald-700/60 bg-emerald-950/10' : 'hover:border-primary/40'
                  }`}
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-16 rounded-md bg-secondary overflow-hidden flex-shrink-0 relative border border-border/80 book-spine-depth shadow-xs">
                      {r.bookCover ? (
                        <Image
                          src={r.bookCover}
                          alt={r.bookTitle ?? 'Cover'}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/member/katalog/${r.bookId}`}
                        className="font-serif font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 block"
                      >
                        {r.bookTitle}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.bookAuthor}</p>

                      <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                        <Badge variant={s?.variant ?? 'default'}>{s?.label ?? r.status}</Badge>
                        {r.expiresAt && r.status === 'tersedia' && (
                          <span className="text-xs font-semibold text-primary flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Batas Pengambilan: {formatDate(r.expiresAt)}
                          </span>
                        )}
                        <span className="text-muted-foreground/70 text-[11px]">
                          Diajukan: {formatDate(r.reservedAt)}
                        </span>
                      </div>
                    </div>

                    {r.status === 'menunggu' && (
                      <CancelReservasiButton reservationId={r.id} bookTitle={r.bookTitle ?? ''} />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed border-border/80 p-8 text-center">
            <Bookmark className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-serif italic text-sm text-foreground">Tidak ada antrian reservasi yang sedang aktif.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Bila buku yang Anda cari sedang habis terpinjam, Anda dapat mengajukan reservasi dari katalog.
            </p>
          </Card>
        )}
      </div>

      {/* Riwayat Reservasi */}
      {history.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-foreground">
            Riwayat Antrian Selesai
          </h2>

          <Card className="border-border/80 shadow-md">
            <div className="divide-y divide-border/60">
              {history.map((r) => {
                const s = statusBadge[r.status as keyof typeof statusBadge];
                return (
                  <div key={r.id} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                    <div>
                      <p className="font-serif font-bold text-sm text-foreground">{r.bookTitle}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Diajukan pada {formatDate(r.reservedAt)}</p>
                    </div>
                    <Badge variant={s?.variant ?? 'secondary'}>{s?.label ?? r.status}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {myReservations.length === 0 && (
        <div className="py-16 text-center border border-dashed border-border/80 rounded-2xl p-8">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-serif text-base font-bold text-foreground">Belum Ada Riwayat Reservasi</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Gunakan fitur reservasi saat menemukan buku yang stok fisiknya sedang dipinjam oleh pemustaka lain.
          </p>
          <Link
            href="/member/katalog"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Buka katalog pustaka
          </Link>
        </div>
      )}
    </div>
  );
}
