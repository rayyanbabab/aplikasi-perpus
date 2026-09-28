'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { payFine } from '@/lib/actions/denda';
import { formatRupiah } from '@/lib/utils';
import { Loader2, CheckCircle } from 'lucide-react';

export function PayFineButton({ fineId, amount, memberName }: { fineId: string; amount: number; memberName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePay() {
    if (!confirm(`Konfirmasi pelunasan denda ${formatRupiah(amount)} untuk ${memberName}?`)) return;
    setLoading(true);
    const result = await payFine(fineId);
    if (result.error) alert(result.error);
    else router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-900/40 border border-emerald-800 rounded-md text-emerald-400 hover:bg-emerald-900/60 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
      {loading ? 'Memproses...' : 'Konfirmasi Lunas'}
    </button>
  );
}
