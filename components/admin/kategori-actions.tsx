'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, deleteCategory } from '@/lib/actions/buku';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Plus, AlertCircle } from 'lucide-react';

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
      if (!confirm(`Hapus kategori "${name}"? Buku yang menggunakan kategori ini akan dialihkan ke kategori umum.`)) return;
      setLoading(true);
      const result = await deleteCategory(id!);
      if (result.error) alert(result.error);
      else router.refresh();
      setLoading(false);
    }

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={loading}
        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        title={`Hapus kategori ${name}`}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </Button>
    );
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createCategory(formData);
    if (result.error) {
      setError(result.error);
    } else {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleCreate} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <div>
        <Label htmlFor="catName" className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Nama Kategori
        </Label>
        <Input
          id="catName"
          name="name"
          className="mt-1.5"
          required
          placeholder="Contoh: Rekayasa Perangkat Lunak"
        />
      </div>
      <div>
        <Label htmlFor="catDesc" className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Keterangan Singkat (Opsional)
        </Label>
        <Input
          id="catDesc"
          name="description"
          className="mt-1.5"
          placeholder="Ringkasan cakupan topik koleksi..."
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-10 font-semibold gap-2 shadow-sm"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Menyimpan Kategori...' : 'Tambah Kategori Koleksi'}
      </Button>
    </form>
  );
}
