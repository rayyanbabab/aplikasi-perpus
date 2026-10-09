import { db } from '@/lib/db';
import { loans, books, users, fines } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, ArrowLeftRight, CheckCircle2, Clock } from 'lucide-react';
import { formatDate, formatRupiah } from '@/lib/utils';
import { ReturnBookButton } from '@/components/admin/return-book-button';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Sirkulasi Peminjaman' };

const statusBadge: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'destructive' }> = {
  dipinjam: { label: 'Sedang Dipinjam', variant: 'warning' },
  dikembalikan: { label: 'Sudah Kembali', variant: 'success' },
  terlambat: { label: 'Terlambat Kembali', variant: 'destructive' },
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

  const statuses = [
    { key: 'semua', label: 'Semua Transaksi' },
    { key: 'dipinjam', label: 'Sedang Dipinjam' },
    { key: 'terlambat', label: 'Terlambat' },
    { key: 'dikembalikan', label: 'Dikembalikan' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Layanan Sirkulasi</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Transaksi Peminjaman
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor sirkulasi peredaran buku, tenggat waktu pengembalian, dan penalti keterlambatan.
          </p>
        </div>

        <Link
          href="/admin/peminjaman/baru"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Catat Peminjaman Baru
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statuses.map((s) => {
          const isActive = (s.key === 'semua' && !filterStatus) || filterStatus === s.key;
          return (
            <Link
              key={s.key}
              href={s.key === 'semua' ? '/admin/peminjaman' : `/admin/peminjaman?status=${s.key}`}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all border whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/70 hover:bg-secondary'
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {/* Loans Table */}
      <Card className="border-border/80 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-secondary/30">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Anggota Peminjam
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Koleksi Buku
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tgl Pinjam
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Jatuh Tempo
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tgl Kembali
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Denda
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {allLoans.map((loan) => {
                const s = statusBadge[loan.status] ?? { label: loan.status, variant: 'default' as const };
                const isActive = loan.status === 'dipinjam' || loan.status === 'terlambat';
                const initial = loan.memberName ? loan.memberName.charAt(0).toUpperCase() : '?';

                return (
                  <tr key={loan.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {initial}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-xs leading-tight">
                            {loan.memberName ?? 'Anonim'}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {loan.memberEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-foreground font-medium max-w-[220px]">
                      <p className="line-clamp-2 text-xs leading-snug">
                        {loan.bookTitle}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(loan.loanDate)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                      <span className={loan.status === 'terlambat' ? 'text-destructive font-semibold' : 'text-foreground'}>
                        {formatDate(loan.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                      {loan.returnDate ? formatDate(loan.returnDate) : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                      {loan.fineAmount ? (
                        <span className={loan.finePaid ? 'text-muted-foreground line-through' : 'text-primary font-bold'}>
                          {formatRupiah(loan.fineAmount)}
                          {loan.finePaid && ' (lunas)'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {isActive && (
                        <ReturnBookButton loanId={loan.id} bookTitle={loan.bookTitle ?? ''} />
                      )}
                    </td>
                  </tr>
                );
              })}
              {allLoans.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-muted-foreground">
                    <CheckCircle2 className="w-9 h-9 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-serif text-base italic">Tidak ada transaksi peminjaman dalam kategori ini.</p>
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
