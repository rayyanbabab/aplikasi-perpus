import { db } from '@/lib/db';
import { loans, books, fines } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatRupiah } from '@/lib/utils';
import { BookOpen, Clock, AlertTriangle, History, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Riwayat Peminjaman Koleksi' };

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
  const unpaidFines = myLoans.filter((l) => l.fineAmount && !l.finePaid);
  const totalUnpaid = unpaidFines.reduce((acc, l) => acc + (l.fineAmount ?? 0), 0);

  const statusBadge = {
    dipinjam: { label: 'Sedang Dipinjam', variant: 'warning' as const },
    dikembalikan: { label: 'Telah Kembali', variant: 'success' as const },
    terlambat: { label: 'Terlambat', variant: 'destructive' as const },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
          <History className="w-3.5 h-3.5" />
          <span>Sirkulasi Mandiri</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Peminjaman & Riwayat Baca
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pantau status koleksi yang sedang Anda bawa dan tinjau arsip riwayat literatur sebelumnya.
        </p>
      </div>

      {/* Denda Alert */}
      {totalUnpaid > 0 && (
        <div className="flex items-start gap-3.5 p-5 bg-destructive/10 border border-destructive/30 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Kewajiban Denda Sirkulasi</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Anda memiliki tanggungan denda keterlambatan sebesar <strong className="text-destructive font-bold">{formatRupiah(totalUnpaid)}</strong>. Silakan selesaikan pembayaran di meja kasir perpustakaan agar hak peminjaman baru tetap aktif.
            </p>
          </div>
        </div>
      )}

      {/* Sedang Dipinjam (Buku Aktif) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-foreground">
            Buku Sedang Dipinjam ({active.length})
          </h2>
          <span className="text-xs text-muted-foreground">Batas maksimal: 3 buku</span>
        </div>

        {active.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((loan) => {
              const today = new Date();
              const due = new Date(loan.dueDate);
              const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isLate = loan.status === 'terlambat';
              const s = statusBadge[loan.status as keyof typeof statusBadge] ?? { label: loan.status, variant: 'default' as const };

              return (
                <Card
                  key={loan.id}
                  className={`border-border/80 p-4 transition-all shadow-sm ${
                    isLate ? 'border-destructive/60 bg-destructive/5' : 'hover:border-primary/40'
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-22 rounded-lg bg-secondary overflow-hidden flex-shrink-0 relative border border-border/80 shadow-xs book-spine-depth">
                      {loan.bookCover ? (
                        <Image
                          src={loan.bookCover}
                          alt={loan.bookTitle ?? 'Cover'}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                          <BookOpen className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <Link
                        href={`/member/katalog/${loan.bookId}`}
                        className="font-serif font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 block"
                      >
                        {loan.bookTitle}
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {loan.bookAuthor}
                      </p>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <Badge variant={s.variant}>{s.label}</Badge>
                        <span className={`text-xs flex items-center gap-1 font-medium ${isLate ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                          <Clock className="w-3 h-3" />
                          {isLate
                            ? `Terlambat ${Math.abs(diffDays)} hari`
                            : diffDays === 0
                            ? 'Jatuh tempo hari ini'
                            : `Sisa ${diffDays} hari lagi`}
                        </span>
                      </div>

                      <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/50 flex justify-between items-center">
                        <span>Pinjam: {formatDate(loan.loanDate)}</span>
                        <span className="font-semibold text-foreground">Batas: {formatDate(loan.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed border-border/80 p-8 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-serif italic text-sm text-foreground">Anda sedang tidak meminjam buku apa pun saat ini.</p>
            <Link
              href="/member/katalog"
              className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
            >
              Jelajahi katalog buku untuk dipinjam
            </Link>
          </Card>
        )}
      </div>

      {/* Riwayat Lengkap */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-foreground">
          Arsip Riwayat Lengkap ({myLoans.length})
        </h2>

        <Card className="border-border/80 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-secondary/30">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Judul Koleksi
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
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {myLoans.map((loan) => {
                  const s = statusBadge[loan.status as keyof typeof statusBadge] ?? {
                    label: loan.status,
                    variant: 'default' as const,
                  };

                  return (
                    <tr key={loan.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/member/katalog/${loan.bookId}`}
                          className="font-semibold text-foreground text-xs hover:text-primary transition-colors line-clamp-1"
                        >
                          {loan.bookTitle}
                        </Link>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{loan.bookAuthor}</p>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(loan.loanDate)}
                      </td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap">
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
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {myLoans.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm font-serif italic">
                      Belum ada catatan riwayat peminjaman.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
