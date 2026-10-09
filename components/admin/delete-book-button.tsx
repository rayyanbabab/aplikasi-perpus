'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBook } from '@/lib/actions/buku';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DeleteBookButton({ id, title }: { id: string; title: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Hapus buku "${title}" dari katalog perpustakaan? Tindakan ini tidak dapat dibatalkan.`)) return;
    setLoading(true);
    const result = await deleteBook(id);
    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="h-8 px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      title={`Hapus buku ${title}`}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      <span className="sr-only">Hapus</span>
    </Button>
  );
}
