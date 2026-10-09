import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { MemberFormClient } from '@/components/admin/member-form-client';
import { ArrowLeft, UserCheck } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Sunting Data Anggota' };

export default async function EditAnggotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [member] = await db
    .select({ id: users.id, name: users.name, email: users.email, phone: users.phone, memberId: users.memberId, status: users.status })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!member) notFound();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link
          href="/admin/anggota"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Data Anggota</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Sunting Data Anggota
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Profil anggota: <span className="font-semibold text-foreground">{member.name}</span>
            </p>
          </div>
        </div>
      </div>
      <MemberFormClient
        defaultValues={{ ...member, status: member.status as 'aktif' | 'nonaktif' }}
        isEdit
        memberId={id}
      />
    </div>
  );
}
