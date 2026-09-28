import { db } from '@/lib/db';
import { fines, loans, books, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRupiah, formatDate } from '@/lib/utils';
import { PayFineButton } from '@/components/admin/pay-fine-button';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Manajemen Denda' };

export default async function DendaPage() {
  const allFines = await db
    .select({
      fineId: fines.id,
      amount: fines.amount,
      paid: fines.paid,
      paidAt: fines.paidAt,
      createdAt: fines.createdAt,
      loanId: loans.id,
      loanDate: loans.loanDate,
      dueDate: loans.dueDate,
      returnDate: loans.returnDate,
      bookTitle: books.title,
      memberName: users.name,
      memberEmail: users.email,
    })
    .from(fines)
    .leftJoin(loans, eq(fines.loanId, loans.id))
    .leftJoin(books, eq(loans.bookId, books.id))
    .leftJoin(users, eq(loans.memberId, users.id))
    .orderBy(desc(fines.createdAt));

  const totalUnpaid = allFines.filter((f) => !f.paid).reduce((acc, f) => acc + f.amount, 0);
  const totalPaid = allFines.filter((f) => f.paid).reduce((acc, f) => acc + f.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">Manajemen Denda</h1>
        <p className="text-zinc-500 text-sm mt-1">{allFines.length} total denda</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="p-5">
            <p className="text-xs text-zinc-500 uppercase font-medium mb-2">Total Belum Lunas</p>
            <p className="text-2xl font-bold text-amber-400">{formatRupiah(totalUnpaid)}</p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-xs text-zinc-500 uppercase font-medium mb-2">Total Sudah Lunas</p>
            <p className="text-2xl font-bold text-emerald-400">{formatRupiah(totalPaid)}</p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-xs text-zinc-500 uppercase font-medium mb-2">Jumlah Denda</p>
            <p className="text-2xl font-bold text-white">{allFines.length} transaksi</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Anggota</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Buku</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Jatuh Tempo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Dikembalikan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Jumlah Denda</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {allFines.map((fine) => (
                <tr key={fine.fineId} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-zinc-200">{fine.memberName}</p>
                    <p className="text-xs text-zinc-500">{fine.memberEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 max-w-[180px]">
                    <p className="line-clamp-2">{fine.bookTitle}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{formatDate(fine.dueDate)}</td>
                  <td className="px-4 py-3 text-zinc-500">{formatDate(fine.returnDate)}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-amber-400">{formatRupiah(fine.amount)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={fine.paid ? 'success' : 'warning'}>
                      {fine.paid ? `Lunas â€¢ ${formatDate(fine.paidAt)}` : 'Belum Lunas'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!fine.paid && <PayFineButton fineId={fine.fineId} amount={fine.amount} memberName={fine.memberName ?? ''} />}
                  </td>
                </tr>
              ))}
              {allFines.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-600">Tidak ada denda</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
