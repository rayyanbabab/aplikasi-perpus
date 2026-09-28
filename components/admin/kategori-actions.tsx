'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, deleteCategory } from '@/lib/actions/buku';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, Plus } from 'lucide-react';

interface Props {
  mode: 'create' | 'delete';
  id?: string;
  name?: string;
}

export function KategoriActions({ mode, id, name }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (mode === 'delete') {
    async function handleDelete() {
      if (!confirm(`Hapus kategori "${name}"?`)) return;
      setLoading(true);
      const result = await deleteCategory(id!);
      if (result.error) alert(result.error);
      else router.refresh();
      setLoading(false);
    }

    return (
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 rounded-md border border-red-900 text-red-400 hover:bg-red-950/50 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    );
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createCategory(formData);
    if (result.error) setError(result.error);
    else {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleCreate} className="space-y-3">
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div>
        <Label htmlFor="catName">Nama Kategori</Label>
        <Input id="catName" name="name" className="mt-1.5" required placeholder="contoh: Teknologi Informasi" />
      </div>
      <div>
        <Label htmlFor="catDesc">Deskripsi (opsional)</Label>
        <Input id="catDesc" name="description" className="mt-1.5" placeholder="Deskripsi singkat..." />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {loading ? 'Menyimpan...' : 'Tambah Kategori'}
      </button>
    </form>
  );
}
