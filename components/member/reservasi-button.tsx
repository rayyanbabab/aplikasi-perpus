'use client';

import { useState } from 'react';
import { createReservation } from '@/lib/actions/reservasi';
import { Loader2, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  bookId: string;
  bookTitle: string;
  userHasReservation: boolean;
}

export function ReservasiButton({ bookId, bookTitle, userHasReservation }: Props) {
  const [loading, setLoading] = useState(false);
  const [reserved, setReserved] = useState(userHasReservation);
  const [message, setMessage] = useState('');

  async function handleReserve() {
    if (reserved) return;
    setLoading(true);
    const result = await createReservation(bookId);
    if (result.error) {
      setMessage(result.error);
    } else {
      setReserved(true);
      setMessage((result as any).message ?? 'Reservasi berhasil didaftarkan ke sistem.');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-2.5">
      <Button
        onClick={handleReserve}
        disabled={loading || reserved}
        className={`h-11 px-6 rounded-xl font-semibold gap-2 shadow-sm transition-all ${
          reserved
            ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/50 cursor-default'
            : ''
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : reserved ? (
          <BookmarkCheck className="w-4 h-4 text-emerald-400" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
        {loading ? 'Memproses Reservasi...' : reserved ? 'Buku Telah Anda Reservasi' : 'Ajukan Reservasi Buku'}
      </Button>

      {message && (
        <p className={`text-xs font-medium ${reserved ? 'text-emerald-400' : 'text-destructive'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
