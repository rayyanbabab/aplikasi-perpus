import { db } from '@/lib/db';
import { loans, books, users, fines } from '@/lib/db/schema';
import { eq, desc, or } from 'drizzle-orm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, RotateCcw } from 'lucide-react';
import { formatDate, formatRupiah } from '@/lib/utils';
import { ReturnBookButton } from '@/components/admin/return-book-button';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Peminjaman' };

const statusBadge: Record<string, { label: string; variant: any }> = {
  dipinjam: { label: 'Dipinjam', variant: 'info' },
  dikembalikan: { label: 'Dikembalikan', variant: 'success' },
  terlambat: { label: 'Terlambat âš ï¸', variant: 'destructive' },
};

export default async function PeminjamanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const filterStatus = params.status;

  const query = db
    .select({
      id: loans.id,
      loanDate: loans.loanDate,
      dueDate: loans.dueDate,
      returnDate: loans.returnDate,
      status: loans.status,
      bookTitle: books.title,
      bookId: books.id,
      memberName: users.name,
      memberId: users.id,
      memberEmail: users.email,
      fineAmount: fines.amount,
      finePaid: fines.paid,
      fineId: fines.id,
    })
    .from(loans)
    .leftJoin(books, eq(loans.bookId, books.id))
    .leftJoin(users, eq(loans.memberId, users.id))
    .leftJoin(fines, eq(loans.id, fines.loanId))
    .orderBy(desc(loans.createdAt));

  const allLoans = filterStatus
    ? await query.where(eq(loans.status, filterStatus as any))
    : await query;

  const statuses = ['semua', 'dipinjam', 'terlambat', 'dikembalikan'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Peminjaman</h1>
          <p className="text-zinc-500 text-sm mt-1">{allLoans.length} transaksi</p>
        </div>
        <Link
          href="/admin/peminjaman/baru"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Buat Peminjaman
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === 'semua' ? '/admin/peminjaman' : `/admin/peminjaman?status=${s}`}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              (s === 'semua' && !filterStatus) || filterStatus === s
                ? 'bg-white text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Anggota</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Buku</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Pinjam</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Jatuh Tempo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Kembali</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Denda</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {allLoans.map((loan) => {
                const s = statusBadge[loan.status] ?? { label: loan.status, variant: 'default' };
                const isActive = loan.status === 'dipinjam' || loan.status === 'terlambat';
                return (
                  <tr key={loan.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-zinc-200">{loan.memberName}</p>
                      <p className="text-xs text-zinc-500">{loan.memberEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 max-w-[180px]">
                      <p className="line-clamp-2">{loan.bookTitle}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{formatDate(loan.loanDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={loan.status === 'terlambat' ? 'text-red-400 font-medium' : 'text-zinc-500'}>
                        {formatDate(loan.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                      {loan.returnDate ? formatDate(loan.returnDate) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {loan.fineAmount ? (
                        <span className={loan.finePaid ? 'text-zinc-500 line-through text-xs' : 'text-amber-400 font-medium text-xs'}>
                          {formatRupiah(loan.fineAmount)}
                          {loan.finePaid && ' (lunas)'}
                        </span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {isActive && <ReturnBookButton loanId={loan.id} bookTitle={loan.bookTitle ?? ''} />}
                    </td>
                  </tr>
                );
              })}
              {allLoans.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-zinc-600">Tidak ada transaksi peminjaman</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
