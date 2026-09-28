'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { markAllNotificationsRead } from '@/lib/actions/notifikasi';
import { Loader2, CheckCheck } from 'lucide-react';

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
    <button
      onClick={handleMarkRead}
      disabled={loading}
      className="inline-flex items-center gap-2 text-xs px-3 py-1.5 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
      Tandai Semua Dibaca
    </button>
  );
}
