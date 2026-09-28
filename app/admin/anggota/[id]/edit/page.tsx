import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { MemberFormClient } from '@/components/admin/member-form-client';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Edit Anggota' };

export default async function EditAnggotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [member] = await db
    .select({ id: users.id, name: users.name, email: users.email, phone: users.phone, memberId: users.memberId, status: users.status })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!member) notFound();

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <a href="/admin/anggota" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">← Kembali</a>
        <h1 className="text-2xl font-semibold text-white mt-2">Edit Anggota</h1>
        <p className="text-zinc-500 text-sm mt-1">{member.name}</p>
      </div>
      <MemberFormClient
        defaultValues={{ ...member, status: member.status as 'aktif' | 'nonaktif' }}
        isEdit
        memberId={id}
      />
    </div>
  );
}
