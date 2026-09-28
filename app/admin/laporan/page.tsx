import { db } from '@/lib/db';
import { loans, books, users, fines } from '@/lib/db/schema';
import { eq, gte, lte, sql, and, desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRupiah, formatDate } from '@/lib/utils';
import { ExportButtons } from '@/components/admin/export-buttons';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Laporan' };

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
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Laporan</h1>
          <p className="text-zinc-500 text-sm mt-1">Rekap data perpustakaan per periode</p>
        </div>
        <ExportButtons loans={loanReport} from={from} to={to} />
      </div>

      {/* Filter periode */}
      <Card>
        <CardContent className="p-4">
          <form className="flex gap-3 flex-wrap items-end">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Dari Tanggal</label>
              <input
                name="from"
                type="date"
                defaultValue={from}
                className="h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Sampai Tanggal</label>
              <input
                name="to"
                type="date"
                defaultValue={to}
                className="h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <button type="submit" className="h-9 px-4 bg-zinc-700 text-white text-sm rounded-lg hover:bg-zinc-600 transition-colors">
              Tampilkan
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Peminjaman', value: loanReport.length },
          { label: 'Masih Dipinjam', value: loanReport.filter((l) => l.status === 'dipinjam' || l.status === 'terlambat').length },
          { label: 'Total Denda', value: formatRupiah(Number(fineStats?.total_amount ?? 0)) },
          { label: 'Denda Belum Lunas', value: formatRupiah(Number(fineStats?.unpaid_amount ?? 0)) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500 uppercase font-medium mb-2">{s.label}</p>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Books */}
        <Card>
          <CardHeader>
            <CardTitle>Buku Paling Populer</CardTitle>
            <CardDescription>5 buku paling sering dipinjam</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-800">
              {(topBooks.rows as any[]).map((b, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-200 line-clamp-1">{b.title}</p>
                      <p className="text-xs text-zinc-500">{b.author}</p>
                    </div>
                  </div>
                  <Badge variant="info">{b.borrow_count}x</Badge>
                </div>
              ))}
              {topBooks.rows.length === 0 && <div className="px-5 py-6 text-center text-zinc-600 text-sm">Tidak ada data</div>}
            </div>
          </CardContent>
        </Card>

        {/* Top Members */}
        <Card>
          <CardHeader>
            <CardTitle>Anggota Paling Aktif</CardTitle>
            <CardDescription>5 anggota dengan peminjaman terbanyak</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-800">
              {(topMembers.rows as any[]).map((m, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{m.name}</p>
                      <p className="text-xs text-zinc-500">{m.email}</p>
                    </div>
                  </div>
                  <Badge variant="success">{m.loan_count} pinjaman</Badge>
                </div>
              ))}
              {topMembers.rows.length === 0 && <div className="px-5 py-6 text-center text-zinc-600 text-sm">Tidak ada data</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Peminjaman</CardTitle>
          <CardDescription>{loanReport.length} transaksi periode {formatDate(from)} â€” {formatDate(to)}</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Anggota</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Buku</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Pinjam</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Jatuh Tempo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Kembali</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loanReport.slice(0, 50).map((loan) => (
                <tr key={loan.id} className="hover:bg-zinc-900/30">
                  <td className="px-5 py-2.5 text-zinc-300">{loan.memberName}</td>
                  <td className="px-4 py-2.5 text-zinc-400 max-w-[200px] truncate">{loan.bookTitle}</td>
                  <td className="px-4 py-2.5 text-zinc-500 text-xs">{formatDate(loan.loanDate)}</td>
                  <td className="px-4 py-2.5 text-zinc-500 text-xs">{formatDate(loan.dueDate)}</td>
                  <td className="px-4 py-2.5 text-zinc-500 text-xs">{formatDate(loan.returnDate)}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={loan.status === 'dikembalikan' ? 'success' : loan.status === 'terlambat' ? 'destructive' : 'info'}>
                      {loan.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
