'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { payFine } from '@/lib/actions/denda';
import { formatRupiah } from '@/lib/utils';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PayFineButton({ fineId, amount, memberName }: { fineId: string; amount: number; memberName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePay() {
    if (!confirm(`Konfirmasi penerimaan pelunasan denda sejumlah ${formatRupiah(amount)} untuk anggota ${memberName}?`)) return;
    setLoading(true);
    const result = await payFine(fineId);
    if (result.error) alert(result.error);
    else router.refresh();
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePay}
      disabled={loading}
      className="h-8 gap-1.5 text-xs font-semibold text-emerald-400 border-emerald-800/60 hover:bg-emerald-950/40 hover:text-emerald-300 transition-colors"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
      <span>{loading ? 'Memproses...' : 'Tandai Lunas'}</span>
    </Button>
  );
}
