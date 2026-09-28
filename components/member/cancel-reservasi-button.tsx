'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelReservation } from '@/lib/actions/reservasi';
import { Loader2, X } from 'lucide-react';

export function CancelReservasiButton({ reservationId, bookTitle }: { reservationId: string; bookTitle: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    if (!confirm(`Batalkan reservasi untuk "${bookTitle}"?`)) return;
    setLoading(true);
    const result = await cancelReservation(reservationId);
    if (result.error) alert(result.error);
    else router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="p-2 rounded-md border border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 transition-colors disabled:opacity-50 flex-shrink-0"
      title="Batalkan reservasi"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
    </button>
  );
}
