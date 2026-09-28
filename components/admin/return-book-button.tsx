'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { processReturn } from '@/lib/actions/peminjaman';
import { Loader2, RotateCcw } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export function ReturnBookButton({ loanId, bookTitle }: { loanId: string; bookTitle: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleReturn() {
    if (!confirm(`Proses pengembalian buku "${bookTitle}"?`)) return;
    setLoading(true);
    const result = await processReturn(loanId);
    if (result.error) {
      alert(result.error);
    } else {
      const { fineAmount, lateDays } = result as any;
      if (fineAmount > 0) {
        alert(`✅ Buku dikembalikan. Terlambat ${lateDays} hari → Denda: ${formatRupiah(fineAmount)}`);
      } else {
        alert('✅ Buku dikembalikan tepat waktu.');
      }
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleReturn}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
      {loading ? 'Memproses...' : 'Kembalikan'}
    </button>
  );
}
