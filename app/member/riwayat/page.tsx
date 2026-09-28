import { db } from '@/lib/db';
import { loans, books, fines } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate, formatRupiah } from '@/lib/utils';
import { BookOpen, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Riwayat Peminjaman' };

export default async function RiwayatPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const myLoans = await db
    .select({
      id: loans.id,
      loanDate: loans.loanDate,
      dueDate: loans.dueDate,
      returnDate: loans.returnDate,
      status: loans.status,
      bookTitle: books.title,
      bookAuthor: books.author,
      bookCover: books.coverUrl,
      bookId: books.id,
      fineAmount: fines.amount,
      finePaid: fines.paid,
    })
    .from(loans)
    .leftJoin(books, eq(loans.bookId, books.id))
    .leftJoin(fines, eq(loans.id, fines.loanId))
    .where(eq(loans.memberId, session.user.id))
    .orderBy(desc(loans.createdAt));

  const active = myLoans.filter((l) => l.status === 'dipinjam' || l.status === 'terlambat');
  const returned = myLoans.filter((l) => l.status === 'dikembalikan' || l.status === 'terlambat');
  const unpaidFines = myLoans.filter((l) => l.fineAmount && !l.finePaid);
  const totalUnpaid = unpaidFines.reduce((acc, l) => acc + (l.fineAmount ?? 0), 0);

  const statusBadge = {
    dipinjam: { label: 'Dipinjam', variant: 'info' as const },
    dikembalikan: { label: 'Dikembalikan', variant: 'success' as const },
    terlambat: { label: 'Terlambat', variant: 'destructive' as const },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">Riwayat Peminjaman</h1>
        <p className="text-zinc-500 text-sm mt-1">{myLoans.length} total transaksi</p>
      </div>

      {/* Alert denda */}
      {totalUnpaid > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-950/40 border border-amber-900 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">Denda Belum Lunas</p>
            <p className="text-xs text-zinc-400 mt-1">
              Anda memiliki denda sebesar <strong className="text-amber-400">{formatRupiah(totalUnpaid)}</strong> yang belum dilunasi.
              Hubungi petugas perpustakaan untuk pembayaran.
            </p>
          </div>
        </div>
      )}

      {/* Sedang Dipinjam */}
      {active.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
            Sedang Dipinjam ({active.length})
          </h2>
          <div className="space-y-3">
            {active.map((loan) => {
              const today = new Date();
              const due = new Date(loan.dueDate);
              const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isLate = loan.status === 'terlambat';
              const s = statusBadge[loan.status as keyof typeof statusBadge];

              return (
                <Card key={loan.id} className={`p-4 flex items-center gap-4 ${isLate ? 'border-red-900' : ''}`}>
                  <div className="w-12 h-16 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                    {loan.bookCover ? (
                      <img src={loan.bookCover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/member/katalog/${loan.bookId}`} className="font-medium text-zinc-100 hover:text-white transition-colors line-clamp-1">
                      {loan.bookTitle}
                    </Link>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <Badge variant={s.variant}>{s.label}</Badge>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {isLate
                          ? `Terlambat ${Math.abs(diffDays)} hari`
                          : diffDays === 0
                          ? 'Jatuh tempo hari ini!'
                          : `${diffDays} hari lagi`}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">
                      Pinjam: {formatDate(loan.loanDate)} Â· Jatuh tempo: {formatDate(loan.dueDate)}
                    </p>
                  </div>
                  {isLate && loan.fineAmount && !loan.finePaid && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-zinc-500">Estimasi denda</p>
                      <p className="text-sm font-bold text-amber-400">{formatRupiah(loan.fineAmount)}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Riwayat */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
          Riwayat Lengkap ({myLoans.length})
        </h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Buku</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Tanggal Pinjam</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Jatuh Tempo</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Dikembalikan</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Denda</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {myLoans.map((loan) => {
                  const s = statusBadge[loan.status as keyof typeof statusBadge] ?? { label: loan.status, variant: 'default' as const };
                  return (
                    <tr key={loan.id} className="hover:bg-zinc-900/30">
                      <td className="px-5 py-3">
                        <Link href={`/member/katalog/${loan.bookId}`} className="font-medium text-zinc-200 hover:text-white transition-colors line-clamp-1">
                          {loan.bookTitle}
                        </Link>
                        <p className="text-xs text-zinc-500">{loan.bookAuthor}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{formatDate(loan.loanDate)}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        <span className={loan.status === 'terlambat' ? 'text-red-400 font-medium' : 'text-zinc-500'}>
                          {formatDate(loan.dueDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{formatDate(loan.returnDate)}</td>
                      <td className="px-4 py-3">
                        {loan.fineAmount ? (
                          <span className={loan.finePaid ? 'text-zinc-600 text-xs line-through' : 'text-amber-400 text-xs font-medium'}>
                            {formatRupiah(loan.fineAmount)}
                            {loan.finePaid && ' âœ“'}
                          </span>
                        ) : <span className="text-zinc-700">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {myLoans.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-zinc-600">Belum ada riwayat peminjaman</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
