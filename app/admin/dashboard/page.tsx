import { db } from '@/lib/db';
import { books, users, loans, fines } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookCopy,
  Users,
  ArrowLeftRight,
  AlertTriangle,
  Receipt,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { formatRupiah, formatDate } from '@/lib/utils';
import { DashboardChart } from '@/components/dashboard-chart';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Dashboard Pustakawan' };

async function getDashboardStats() {
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
  dipinjam: { label: 'Sedang Dipinjam', variant: 'warning' },
  dikembalikan: { label: 'Selesai / Dikembalikan', variant: 'success' },
  terlambat: { label: 'Terlambat', variant: 'destructive' },
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Editorial Page Header & Operational Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Pusat Kendali Sirkulasi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ringkasan ketersediaan koleksi, status peminjaman, dan penanganan denda aktif.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/peminjaman/baru"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Catat Peminjaman
          </Link>
          <Link
            href="/admin/buku/tambah"
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-xl hover:bg-secondary/80 border border-border/70 transition-colors"
          >
            <BookCopy className="w-4 h-4 text-muted-foreground" />
            Entri Buku Baru
          </Link>
        </div>
      </div>

      {/* Operational Priority Alert (If there are overdue items) */}
      {stats.terlambat > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-destructive/10 border border-destructive/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Perhatian: {stats.terlambat} Peminjaman Melewati Batas Waktu
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Terdapat buku yang belum dikembalikan melewati jatuh tempo. Hubungi peminjam atau kenakan denda keterlambatan.
              </p>
            </div>
          </div>
          <Link
            href="/admin/peminjaman"
            className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-xl hover:bg-destructive/90 transition-colors self-start sm:self-auto flex-shrink-0"
          >
            Tinjau Peminjaman Terlambat
          </Link>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="border-border/80 hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Buku Beredar
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-foreground">
              {stats.sedangDipinjam}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              eksemplar sedang dibaca anggota
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border-border/80 hover:border-destructive/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Terlambat Kembali
              </span>
              <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-destructive">
              {stats.terlambat}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              perlu konfirmasi dan penindakan
            </p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border-border/80 hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Denda Tertunggak
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-foreground">
              {formatRupiah(stats.totalDendaBelumLunas)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              total denda belum diselesaikan
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="border-border/80 hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Koleksi
              </span>
              <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                <BookCopy className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-foreground">
              {stats.totalBuku}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              judul terdaftar dalam katalog
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Library Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circulation Trend Chart */}
        <Card className="lg:col-span-2 border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg font-bold">Aktivitas Sirkulasi Koleksi</CardTitle>
            <CardDescription>
              Volume peminjaman buku tercatat per bulan selama 6 bulan terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <DashboardChart data={stats.loansByMonth} />
          </CardContent>
        </Card>

        {/* Quick Health Status */}
        <Card className="border-border/80 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg font-bold">Ringkasan Sistem</CardTitle>
            <CardDescription>Indikator kapasitas dan keanggotaan aktif.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-foreground">Anggota Terdaftar</span>
              </div>
              <span className="text-sm font-bold text-foreground font-serif">{stats.totalAnggota} orang</span>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-xs font-medium text-foreground">Total Transaksi Beredar</span>
              </div>
              <span className="text-sm font-bold text-foreground font-serif">
                {stats.sedangDipinjam + stats.terlambat} buku
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                <span className="text-xs font-medium text-foreground">Buku Butuh Tindakan</span>
              </div>
              <span className="text-sm font-bold text-destructive font-serif">{stats.terlambat} buku</span>
            </div>

            <div className="pt-2">
              <Link
                href="/admin/laporan"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/80 transition-colors"
              >
                Buka Laporan Peminjaman Lengkap
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Loans Section */}
      <Card className="border-border/80">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4">
          <div>
            <CardTitle className="font-serif text-lg font-bold">Catatan Peminjaman Terkini</CardTitle>
            <CardDescription>8 transaksi terakhir yang tercatat dalam sistem sirkulasi.</CardDescription>
          </div>
          <Link
            href="/admin/peminjaman"
            className="text-xs font-semibold text-primary hover:underline self-start sm:self-auto"
          >
            Lihat semua transaksi peminjaman
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-secondary/30">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Anggota Peminjam
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Judul Buku
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tanggal Pinjam
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Batas Waktu
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {stats.recentLoans.map((loan) => {
                  const s = statusBadge[loan.status] ?? { label: loan.status, variant: 'default' as const };
                  const initial = loan.memberName ? loan.memberName.charAt(0).toUpperCase() : '?';

                  return (
                    <tr key={loan.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {initial}
                          </div>
                          <span className="font-medium text-foreground">{loan.memberName ?? 'Anonim'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground font-medium max-w-[260px] truncate">
                        {loan.bookTitle ?? 'Judul tidak tersedia'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {formatDate(loan.loanDate)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {formatDate(loan.dueDate)}
                      </td>
                      <td className="py-3 px-5">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {stats.recentLoans.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
                      <p className="font-serif italic">Belum ada riwayat transaksi peminjaman.</p>
                      <Link
                        href="/admin/peminjaman/baru"
                        className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                      >
                        Catat peminjaman pertama sekarang
                      </Link>
                    </td>
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
