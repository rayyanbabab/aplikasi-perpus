'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteMember } from '@/lib/actions/anggota';
import { Loader2, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MemberActions({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDeactivate() {
    if (!confirm(`Nonaktifkan keanggotaan "${name}"? Anggota tidak akan dapat meminjam buku selama nonaktif.`)) return;
    setLoading(true);
    const result = await deleteMember(id);
    if (result.error) alert(result.error);
    else router.refresh();
    setLoading(false);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDeactivate}
      disabled={loading}
      title="Nonaktifkan anggota"
      className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
      <span className="sr-only">Nonaktifkan</span>
    </Button>
  );
}
