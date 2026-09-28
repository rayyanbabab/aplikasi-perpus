import { db } from '@/lib/db';
import { books, users, loans, fines, reservations } from '@/lib/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookCopy, Users, ArrowLeftRight, AlertCircle, DollarSign, Clock } from 'lucide-react';
import { formatRupiah, formatDate } from '@/lib/utils';
import { DashboardChart } from '@/components/dashboard-chart';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Dashboard' };

async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0];
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    totalBuku,
    totalAnggota,
    sedangDipinjam,
    terlambat,
    totalDendaBelumLunas,
    recentLoans,
    loansByMonth,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(books),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'member')),
    db.select({ count: sql<number>`count(*)` }).from(loans).where(eq(loans.status, 'dipinjam')),
    db.select({ count: sql<number>`count(*)` }).from(loans).where(eq(loans.status, 'terlambat')),
    db.select({ total: sql<number>`coalesce(sum(amount), 0)` }).from(fines).where(eq(fines.paid, false)),
    db
      .select({
        id: loans.id,
        loanDate: loans.loanDate,
        dueDate: loans.dueDate,
        status: loans.status,
        bookTitle: books.title,
        memberName: users.name,
      })
      .from(loans)
      .leftJoin(books, eq(loans.bookId, books.id))
      .leftJoin(users, eq(loans.memberId, users.id))
      .orderBy(sql`${loans.createdAt} DESC`)
      .limit(8),
    db.execute(
      sql`SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        TO_CHAR(created_at, 'YYYY-MM') as month_key,
        COUNT(*) as count
        FROM loans
        WHERE created_at >= ${sixMonthsAgo.toISOString()}
        GROUP BY month_key, month
        ORDER BY month_key ASC`
    ),
  ]);

  return {
    totalBuku: Number(totalBuku[0]?.count ?? 0),
    totalAnggota: Number(totalAnggota[0]?.count ?? 0),
    sedangDipinjam: Number(sedangDipinjam[0]?.count ?? 0),
    terlambat: Number(terlambat[0]?.count ?? 0),
    totalDendaBelumLunas: Number(totalDendaBelumLunas[0]?.total ?? 0),
    recentLoans,
    loansByMonth: (loansByMonth.rows as any[]).map((r) => ({
      month: r.month,
      count: Number(r.count),
    })),
  };
}

const statusBadge: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'destructive' }> = {
  dipinjam: { label: 'Dipinjam', variant: 'info' },
  dikembalikan: { label: 'Dikembalikan', variant: 'success' },
  terlambat: { label: 'Terlambat', variant: 'destructive' },
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    { label: 'Total Buku', value: stats.totalBuku, icon: BookCopy, color: 'text-blue-400', sub: 'koleksi terdaftar' },
    { label: 'Total Anggota', value: stats.totalAnggota, icon: Users, color: 'text-purple-400', sub: 'anggota aktif' },
    { label: 'Sedang Dipinjam', value: stats.sedangDipinjam, icon: ArrowLeftRight, color: 'text-amber-400', sub: 'buku beredar' },
    { label: 'Terlambat', value: stats.terlambat, icon: Clock, color: 'text-red-400', sub: 'perlu tindakan' },
    {
      label: 'Denda Belum Lunas',
      value: formatRupiah(stats.totalDendaBelumLunas),
      icon: DollarSign,
      color: 'text-orange-400',
      sub: 'perlu ditagih',
      isRupiah: true,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Selamat datang di Sistem Informasi Perpustakaan ASTRAtech</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="hover:border-zinc-700 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{stat.label}</p>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold text-white ${stat.isRupiah ? 'text-lg' : ''}`}>{stat.value}</p>
              <p className="text-xs text-zinc-600 mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Aktivitas Peminjaman</CardTitle>
            <CardDescription>6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardChart data={stats.loansByMonth} />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Status Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Total Peminjaman Aktif', value: stats.sedangDipinjam + stats.terlambat, color: 'bg-blue-500' },
              { label: 'Terlambat (perlu tindakan)', value: stats.terlambat, color: 'bg-red-500' },
              { label: 'Total Anggota Terdaftar', value: stats.totalAnggota, color: 'bg-purple-500' },
              { label: 'Total Koleksi Buku', value: stats.totalBuku, color: 'bg-emerald-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-sm text-zinc-400">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Loans */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Peminjaman Terbaru</CardTitle>
            <CardDescription className="mt-1">8 transaksi terakhir</CardDescription>
          </div>
          <a href="/admin/peminjaman" className="text-xs text-zinc-400 hover:text-white transition-colors">
            Lihat semua â†’
          </a>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 pr-4 text-xs font-medium text-zinc-500 uppercase">Anggota</th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-zinc-500 uppercase">Buku</th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-zinc-500 uppercase">Pinjam</th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-zinc-500 uppercase">Jatuh Tempo</th>
                  <th className="text-left py-2 text-xs font-medium text-zinc-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {stats.recentLoans.map((loan) => {
                  const s = statusBadge[loan.status] ?? { label: loan.status, variant: 'default' as const };
                  return (
                    <tr key={loan.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 pr-4 text-zinc-200 font-medium">{loan.memberName ?? '-'}</td>
                      <td className="py-3 pr-4 text-zinc-400 max-w-[200px] truncate">{loan.bookTitle ?? '-'}</td>
                      <td className="py-3 pr-4 text-zinc-500">{formatDate(loan.loanDate)}</td>
                      <td className="py-3 pr-4 text-zinc-500">{formatDate(loan.dueDate)}</td>
                      <td className="py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {stats.recentLoans.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-600">Belum ada transaksi peminjaman</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
