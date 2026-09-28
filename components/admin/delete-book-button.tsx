'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBook } from '@/lib/actions/buku';
import { Trash2 } from 'lucide-react';

export function DeleteBookButton({ id, title }: { id: string; title: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Hapus buku "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
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
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs px-3 py-1.5 border border-red-900 rounded-md text-red-400 hover:bg-red-950/50 transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-3 h-3" />
    </button>
  );
}
