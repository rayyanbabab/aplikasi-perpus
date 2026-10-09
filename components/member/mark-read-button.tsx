'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { markAllNotificationsRead } from '@/lib/actions/notifikasi';
import { Loader2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MarkReadButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleMarkRead() {
    setLoading(true);
    await markAllNotificationsRead(userId);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleMarkRead}
      disabled={loading}
      className="h-9 gap-1.5 text-xs font-semibold border-border/80 hover:bg-secondary"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5 text-primary" />}
      <span>Tandai Semua Sudah Dibaca</span>
    </Button>
  );
}
