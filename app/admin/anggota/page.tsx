import { db } from '@/lib/db';
import { users, loans, fines } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, UserCheck, UserX } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { MemberActions } from '@/components/admin/member-actions';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Manajemen Anggota' };

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
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manajemen Anggota</h1>
          <p className="text-zinc-500 text-sm mt-1">{members.length} anggota terdaftar</p>
        </div>
        <Link
          href="/admin/anggota/tambah"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Anggota
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Anggota</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">No. Anggota</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Kontak</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Pinjaman Aktif</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Denda</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Bergabung</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-zinc-300">{m.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100">{m.name}</p>
                        <p className="text-xs text-zinc-500">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{m.memberId ?? '-'}</td>
                  <td className="px-4 py-3 text-zinc-400">{m.phone ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className="text-zinc-300 font-medium">{m.activeLoans}</span>
                    <span className="text-zinc-600"> / 3</span>
                  </td>
                  <td className="px-4 py-3">
                    {Number(m.unpaidFines) > 0 ? (
                      <Badge variant="destructive">{m.unpaidFines} belum lunas</Badge>
                    ) : (
                      <Badge variant="success">Lunas</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {m.status === 'aktif' ? (
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <UserX className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <Badge variant={m.status === 'aktif' ? 'success' : 'destructive'}>
                        {m.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(m.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/anggota/${m.id}/edit`}
                        className="text-xs px-3 py-1.5 border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-800 transition-colors"
                      >
                        Edit
                      </Link>
                      <MemberActions id={m.id} name={m.name} />
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-zinc-600">Belum ada anggota terdaftar</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
