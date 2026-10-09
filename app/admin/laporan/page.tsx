import { db } from '@/lib/db';
import { loans, books, users, fines } from '@/lib/db/schema';
import { eq, gte, lte, sql, and, desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRupiah, formatDate } from '@/lib/utils';
import { ExportButtons } from '@/components/admin/export-buttons';
import { BarChart3, Filter, BookOpen, Users, Receipt, Calendar, Trophy } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Laporan & Analitik Sirkulasi' };

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const from = params.from ?? firstOfMonth;
  const to = params.to ?? today;

  const [loanReport, topBooks, topMembers, fineReport] = await Promise.all([
    // Laporan peminjaman per periode
    db
      .select({
        id: loans.id,
        loanDate: loans.loanDate,
        dueDate: loans.dueDate,
        returnDate: loans.returnDate,
        status: loans.status,
        bookTitle: books.title,
        memberName: users.name,
      })
      .from(loans)
      .leftJoin(books, eq(loans.bookId, books.id))
      .leftJoin(users, eq(loans.memberId, users.id))
      .where(and(gte(loans.loanDate, from), lte(loans.loanDate, to)))
      .orderBy(desc(loans.loanDate)),

    // Buku paling sering dipinjam
    db.execute(
      sql`SELECT b.title, b.author, COUNT(l.id) as borrow_count
          FROM loans l JOIN books b ON l.book_id = b.id
          WHERE l.loan_date BETWEEN ${from} AND ${to}
          GROUP BY b.id, b.title, b.author
          ORDER BY borrow_count DESC LIMIT 5`
    ),

    // Anggota paling aktif
    db.execute(
      sql`SELECT u.name, u.email, COUNT(l.id) as loan_count
          FROM loans l JOIN users u ON l.member_id = u.id
          WHERE l.loan_date BETWEEN ${from} AND ${to}
          GROUP BY u.id, u.name, u.email
          ORDER BY loan_count DESC LIMIT 5`
    ),

    // Rekap denda
    db.execute(
      sql`SELECT 
          COUNT(*) as total_fines,
          SUM(amount) as total_amount,
          SUM(CASE WHEN paid = true THEN amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN paid = false THEN amount ELSE 0 END) as unpaid_amount
          FROM fines f JOIN loans l ON f.loan_id = l.id
          WHERE l.loan_date BETWEEN ${from} AND ${to}`
    ),
  ]);

  const fineStats = fineReport.rows[0] as any;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Audit & Analitik Pustaka</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Laporan Rekapitulasi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Statistik sirkulasi peminjaman, buku terpopuler, dan rekapitulasi denda per periode.
          </p>
        </div>
        <ExportButtons loans={loanReport} from={from} to={to} />
      </div>

      {/* Filter Periode */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4">
          <form className="flex flex-col sm:flex-row items-start sm:items-end gap-3 flex-wrap">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Mulai Tanggal
              </label>
              <input
                name="from"
                type="date"
                defaultValue={from}
                className="h-10 px-3.5 bg-background border border-input rounded-xl text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Sampai Tanggal
              </label>
              <input
                name="to"
                type="date"
                defaultValue={to}
                className="h-10 px-3.5 bg-background border border-input rounded-xl text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Terapkan Periode</span>
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80">
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Total Peminjaman
            </span>
            <p className="font-serif text-3xl font-bold text-foreground">
              {loanReport.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">transaksi pada periode ini</p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Tercatat Selesai
            </span>
            <p className="font-serif text-3xl font-bold text-emerald-500">
              {loanReport.filter((l) => l.status === 'dikembalikan').length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">eksemplar telah dikembalikan</p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Total Denda Periode
            </span>
            <p className="font-serif text-2xl font-bold text-foreground">
              {formatRupiah(Number(fineStats?.total_amount ?? 0))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {Number(fineStats?.total_fines ?? 0)} kasus keterlambatan
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Denda Terbayar
            </span>
            <p className="font-serif text-2xl font-bold text-emerald-500">
              {formatRupiah(Number(fineStats?.paid_amount ?? 0))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              sisa tertunggak: {formatRupiah(Number(fineStats?.unpaid_amount ?? 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Books & Top Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Books */}
        <Card className="border-border/80 shadow-md">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <CardTitle className="font-serif text-base font-bold">Koleksi Terpopuler</CardTitle>
            </div>
            <CardDescription>5 judul buku paling sering dipinjam sivitas pada periode ini.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {(topBooks.rows as any[]).map((b, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-serif flex-shrink-0">
                      #{i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{b.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{b.author}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-bold flex-shrink-0">
                    {b.borrow_count} kali pinjam
                  </Badge>
                </div>
              ))}
              {topBooks.rows.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-xs italic">
                  Belum ada aktivitas peminjaman buku pada periode ini.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Members */}
        <Card className="border-border/80 shadow-md">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <CardTitle className="font-serif text-base font-bold">Anggota Paling Aktif</CardTitle>
            </div>
            <CardDescription>5 anggota dengan intensitas peminjaman literatur tertinggi.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {(topMembers.rows as any[]).map((m, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-serif flex-shrink-0">
                      #{i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.email}</p>
                    </div>
                  </div>
                  <Badge variant="success" className="font-bold flex-shrink-0">
                    {m.loan_count} transaksi
                  </Badge>
                </div>
              ))}
              {topMembers.rows.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-xs italic">
                  Belum ada transaksi peminjaman anggota pada periode ini.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Peminjaman */}
      <Card className="border-border/80 shadow-md">
        <CardHeader className="pb-4 border-b border-border/60">
          <CardTitle className="font-serif text-lg font-bold">Rincian Transaksi Sirkulasi</CardTitle>
          <CardDescription>
            {loanReport.length} transaksi sirkulasi untuk rentang waktu {formatDate(from)} s/d {formatDate(to)}
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-secondary/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Anggota
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Judul Koleksi
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tgl Pinjam
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Jatuh Tempo
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tgl Pengembalian
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loanReport.slice(0, 50).map((loan) => (
                <tr key={loan.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-3 text-foreground font-medium text-xs">
                    {loan.memberName}
                  </td>
                  <td className="px-4 py-3 text-foreground text-xs font-medium max-w-[240px] truncate">
                    {loan.bookTitle}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(loan.loanDate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(loan.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {loan.returnDate ? formatDate(loan.returnDate) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge
                      variant={
                        loan.status === 'dikembalikan'
                          ? 'success'
                          : loan.status === 'terlambat'
                          ? 'destructive'
                          : 'warning'
                      }
                    >
                      {loan.status === 'dikembalikan'
                        ? 'Selesai'
                        : loan.status === 'terlambat'
                        ? 'Terlambat'
                        : 'Dipinjam'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {loanReport.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">
                    Tidak ada rekaman transaksi sirkulasi pada rentang tanggal yang dipilih.
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
