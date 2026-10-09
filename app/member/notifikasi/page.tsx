import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Bell, BellOff, Info, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { MarkReadButton } from '@/components/member/mark-read-button';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Pemberitahuan Sirkulasi' };

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
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <Bell className="w-3.5 h-3.5" />
            <span>Pusat Informasi</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Pemberitahuan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unread.length > 0
              ? `${unread.length} pesan baru membutuhkan perhatian Anda`
              : 'Semua informasi telah dibaca'}
          </p>
        </div>

        {unread.length > 0 && <MarkReadButton userId={session.user.id} />}
      </div>

      {/* Notifications List */}
      {myNotifs.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border/80 rounded-2xl p-8">
          <BellOff className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-serif text-base font-bold text-foreground">Kotak Masuk Bersih</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Belum ada notifikasi terkait sirkulasi, pengingat jatuh tempo, atau status reservasi.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myNotifs.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 sm:p-5 transition-all shadow-xs ${
                !notif.read
                  ? 'border-primary/40 bg-card shadow-sm'
                  : 'border-border/60 bg-card/60 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${
                    !notif.read ? 'bg-primary ring-4 ring-primary/20' : 'bg-muted-foreground/30'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className={`font-serif font-bold text-sm ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[11px] text-muted-foreground/70">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
