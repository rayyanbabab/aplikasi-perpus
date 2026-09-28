'use client';

import { useState } from 'react';
import { createReservation } from '@/lib/actions/reservasi';
import { Loader2, Bookmark, BookmarkCheck } from 'lucide-react';

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
      setMessage((result as any).message ?? 'Reservasi berhasil!');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleReserve}
        disabled={loading || reserved}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
          reserved
            ? 'bg-emerald-900/40 border border-emerald-800 text-emerald-400 cursor-default'
            : 'bg-white text-black hover:bg-zinc-100 active:bg-zinc-200'
        } disabled:opacity-50`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : reserved ? (
          <BookmarkCheck className="w-4 h-4" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
        {loading ? 'Memproses...' : reserved ? 'Sudah Direservasi' : 'Reservasi Buku Ini'}
      </button>

      {message && (
        <p className={`text-xs ${reserved ? 'text-emerald-400' : 'text-red-400'}`}>{message}</p>
      )}
    </div>
  );
}
