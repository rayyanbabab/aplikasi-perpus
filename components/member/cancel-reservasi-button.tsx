'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelReservation } from '@/lib/actions/reservasi';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CancelReservasiButton({ reservationId, bookTitle }: { reservationId: string; bookTitle: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    if (!confirm(`Batalkan permohonan antrian reservasi untuk "${bookTitle}"?`)) return;
    setLoading(true);
    const result = await cancelReservation(reservationId);
    if (result.error) alert(result.error);
    else router.refresh();
    setLoading(false);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCancel}
      disabled={loading}
      className="h-8 px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      title="Batalkan reservasi ini"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
      <span className="text-xs">Batal</span>
    </Button>
  );
}
