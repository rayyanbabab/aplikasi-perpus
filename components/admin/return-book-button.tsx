'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { processReturn } from '@/lib/actions/peminjaman';
import { Loader2, RotateCcw } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function ReturnBookButton({ loanId, bookTitle }: { loanId: string; bookTitle: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleReturn() {
    if (!confirm(`Konfirmasi pengembalian buku "${bookTitle}" ke sirkulasi pustaka?`)) return;
    setLoading(true);
    const result = await processReturn(loanId);
    if (result.error) {
      alert(result.error);
    } else {
      const { fineAmount, lateDays } = result as any;
      if (fineAmount > 0) {
        alert(`Buku berhasil dikembalikan. Terlambat ${lateDays} hari, tercatat denda sirkulasi: ${formatRupiah(fineAmount)}.`);
      } else {
        alert('Buku berhasil dikembalikan tepat waktu.');
      }
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReturn}
      disabled={loading}
      className="h-8 gap-1.5 text-xs font-semibold hover:border-primary/60 hover:text-primary transition-colors"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3 text-primary" />}
      <span>{loading ? 'Memproses...' : 'Proses Kembali'}</span>
    </Button>
  );
}
