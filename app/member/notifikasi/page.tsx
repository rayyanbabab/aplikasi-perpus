import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Bell, BellOff } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { MarkReadButton } from '@/components/member/mark-read-button';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Notifikasi' };

export default async function NotifikasiPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const myNotifs = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt));

  const unread = myNotifs.filter((n) => !n.read);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Notifikasi</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {unread.length > 0 ? `${unread.length} belum dibaca` : 'Semua sudah dibaca'}
          </p>
        </div>
        {unread.length > 0 && <MarkReadButton userId={session.user.id} />}
      </div>

      {myNotifs.length === 0 ? (
        <div className="py-20 text-center">
          <BellOff className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">Tidak ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {myNotifs.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 transition-colors ${!notif.read ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800/50 bg-zinc-900/40'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.read ? 'bg-blue-400' : 'bg-zinc-700'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!notif.read ? 'text-white' : 'text-zinc-400'}`}>{notif.title}</p>
                  <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-zinc-600 mt-2">{formatDate(notif.createdAt)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
