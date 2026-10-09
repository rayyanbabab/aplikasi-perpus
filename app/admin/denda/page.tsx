import { db } from '@/lib/db';
import { fines, loans, books, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRupiah, formatDate } from '@/lib/utils';
import { PayFineButton } from '@/components/admin/pay-fine-button';
import { Receipt, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Manajemen Denda Keterlambatan' };

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
          <Receipt className="w-3.5 h-3.5" />
          <span>Keuangan & Sirkulasi</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Denda & Keterlambatan
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pencatatan penalti sanksi keterlambatan pengembalian buku dan konfirmasi pembayaran anggota.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80 hover:border-destructive/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tunggakan Aktif
              </span>
              <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-destructive">
              {formatRupiah(totalUnpaid)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              total denda belum diselesaikan
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 hover:border-emerald-500/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Denda Terbayar
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-emerald-500">
              {formatRupiah(totalPaid)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              telah disetorkan ke kas perpustakaan
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Kasus
              </span>
              <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-foreground">
              {allFines.length} <span className="text-sm font-normal text-muted-foreground">kejadian</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              riwayat penalti yang pernah tercatat
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fines Table */}
      <Card className="border-border/80 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-secondary/30">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Anggota
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Judul Buku
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Jatuh Tempo
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Dikembalikan
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nominal Denda
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
              {allFines.map((fine) => {
                const initial = fine.memberName ? fine.memberName.charAt(0).toUpperCase() : '?';

                return (
                  <tr key={fine.fineId} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {initial}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-xs leading-tight">
                            {fine.memberName ?? 'Anonim'}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {fine.memberEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-foreground font-medium max-w-[200px]">
                      <p className="line-clamp-2 text-xs leading-snug">
                        {fine.bookTitle}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(fine.dueDate)}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                      {fine.returnDate ? formatDate(fine.returnDate) : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap font-bold">
                      <span className={fine.paid ? 'text-muted-foreground' : 'text-primary'}>
                        {formatRupiah(fine.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge variant={fine.paid ? 'success' : 'warning'}>
                        {fine.paid
                          ? `Lunas · ${fine.paidAt ? formatDate(fine.paidAt) : 'Tercatat'}`
                          : 'Belum Diselesaikan'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {!fine.paid && (
                        <PayFineButton
                          fineId={fine.fineId}
                          amount={fine.amount}
                          memberName={fine.memberName ?? 'Anggota'}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
              {allFines.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-muted-foreground">
                    <CheckCircle2 className="w-9 h-9 mx-auto mb-2 text-emerald-500/60" />
                    <p className="font-serif text-base italic">Tidak ada catatan denda keterlambatan.</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Seluruh peminjaman dikembalikan tepat waktu atau belum dikenakan sanksi.</p>
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
