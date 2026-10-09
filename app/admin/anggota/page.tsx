import { db } from '@/lib/db';
import { users, loans, fines } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Users, UserCheck, UserX, Edit } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { MemberActions } from '@/components/admin/member-actions';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Manajemen Sivitas Anggota' };

export default async function AnggotaPage() {
  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      memberId: users.memberId,
      status: users.status,
      createdAt: users.createdAt,
      activeLoans: sql<number>`count(case when ${loans.status} in ('dipinjam','terlambat') then 1 end)`,
      unpaidFines: sql<number>`count(case when ${fines.paid} = false then 1 end)`,
    })
    .from(users)
    .leftJoin(loans, eq(users.id, loans.memberId))
    .leftJoin(fines, eq(loans.id, fines.loanId))
    .where(eq(users.role, 'member'))
    .groupBy(users.id)
    .orderBy(users.createdAt);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Sivitas Perpustakaan</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Keanggotaan & Pemustaka
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar anggota aktif, batas kuota sirkulasi peminjaman, dan penanganan status akun.
          </p>
        </div>

        <Link
          href="/admin/anggota/tambah"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Anggota Baru
        </Link>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Menampilkan {members.length} anggota terdaftar
        </p>
      </div>

      {/* Member Table */}
      <Card className="border-border/80 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-secondary/30">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Anggota
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nomor ID
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Kontak
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Buku Aktif
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status Denda
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status Akun
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Terdaftar Sejak
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {members.map((m) => {
                const initial = m.name ? m.name.charAt(0).toUpperCase() : '?';

                return (
                  <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {initial}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-xs leading-tight">
                            {m.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground">
                      {m.memberId ? (
                        <span className="px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border/60">
                          {m.memberId}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs">
                      {m.phone ?? '-'}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className="font-bold text-foreground">{m.activeLoans}</span>
                      <span className="text-muted-foreground"> / 3 buku</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {Number(m.unpaidFines) > 0 ? (
                        <Badge variant="destructive">{m.unpaidFines} denda aktif</Badge>
                      ) : (
                        <Badge variant="success">Bebas Denda</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={m.status === 'aktif' ? 'success' : 'destructive'}>
                        {m.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/anggota/${m.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 border border-border/80 rounded-lg text-foreground hover:bg-secondary transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Edit</span>
                        </Link>
                        <MemberActions id={m.id} name={m.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {members.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-muted-foreground">
                    <Users className="w-9 h-9 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-serif text-base italic">Belum ada anggota terdaftar dalam sistem.</p>
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
