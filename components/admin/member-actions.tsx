'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteMember } from '@/lib/actions/anggota';
import { Loader2, UserX } from 'lucide-react';

export function MemberActions({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDeactivate() {
    if (!confirm(`Nonaktifkan anggota "${name}"?`)) return;
    setLoading(true);
    const result = await deleteMember(id);
    if (result.error) alert(result.error);
    else router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDeactivate}
      disabled={loading}
      title="Nonaktifkan anggota"
      className="text-xs px-2 py-1.5 border border-zinc-700 rounded-md text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
    </button>
  );
}
