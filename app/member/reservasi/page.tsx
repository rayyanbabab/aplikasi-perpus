import { db } from '@/lib/db';
import { reservations, books } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { CancelReservasiButton } from '@/components/member/cancel-reservasi-button';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Reservasi Saya' };

const statusBadge = {
  menunggu: { label: 'Menunggu', variant: 'warning' as const },
  tersedia: { label: 'Tersedia! Segera Ambil', variant: 'success' as const },
  diambil: { label: 'Sudah Diambil', variant: 'info' as const },
  kadaluarsa: { label: 'Kadaluarsa', variant: 'secondary' as const },
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

  const active = myReservations.filter((r) => r.status === 'menunggu' || r.status === 'tersedia');
  const history = myReservations.filter((r) => r.status !== 'menunggu' && r.status !== 'tersedia');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">Reservasi Saya</h1>
        <p className="text-zinc-500 text-sm mt-1">{myReservations.length} total reservasi</p>
      </div>

      {/* Tersedia - priority notification */}
      {myReservations.filter((r) => r.status === 'tersedia').map((r) => (
        <div key={r.id} className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-xl">
          <p className="text-emerald-400 font-semibold">ðŸŽ‰ Buku tersedia untuk Anda!</p>
          <p className="text-sm text-zinc-400 mt-1">
            <strong className="text-white">{r.bookTitle}</strong> sudah tersedia.
            Segera ambil sebelum <strong className="text-emerald-400">{formatDate(r.expiresAt)}</strong> atau reservasi akan hangus otomatis.
          </p>
        </div>
      ))}

      {/* Aktif */}
      {active.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Reservasi Aktif ({active.length})</h2>
          <div className="space-y-3">
            {active.map((r) => {
              const s = statusBadge[r.status as keyof typeof statusBadge];
              return (
                <Card key={r.id} className={`p-4 flex items-center gap-4 ${r.status === 'tersedia' ? 'border-emerald-800' : ''}`}>
                  <div className="w-12 h-16 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                    {r.bookCover ? (
                      <img src={r.bookCover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/member/katalog/${r.bookId}`} className="font-medium text-zinc-100 hover:text-white transition-colors line-clamp-1">
                      {r.bookTitle}
                    </Link>
                    <p className="text-xs text-zinc-500">{r.bookAuthor}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <Badge variant={s?.variant ?? 'default'}>{s?.label ?? r.status}</Badge>
                      {r.expiresAt && r.status === 'tersedia' && (
                        <span className="text-xs text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Kadaluarsa: {formatDate(r.expiresAt)}
                        </span>
                      )}
                      <span className="text-xs text-zinc-600">
                        Direservasi: {formatDate(r.reservedAt)}
                      </span>
                    </div>
                  </div>
                  {r.status === 'menunggu' && (
                    <CancelReservasiButton reservationId={r.id} bookTitle={r.bookTitle ?? ''} />
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Riwayat */}
      {history.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Riwayat Reservasi</h2>
          <Card>
            <div className="divide-y divide-zinc-800">
              {history.map((r) => {
                const s = statusBadge[r.status as keyof typeof statusBadge];
                return (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-300">{r.bookTitle}</p>
                      <p className="text-xs text-zinc-600">{formatDate(r.reservedAt)}</p>
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
        <div className="py-20 text-center">
          <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">Belum ada reservasi</p>
          <Link href="/member/katalog" className="mt-3 inline-block text-sm text-zinc-400 hover:text-white transition-colors">
            Jelajahi katalog â†’
          </Link>
        </div>
      )}
    </div>
  );
}
