'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBook, updateBook } from '@/lib/actions/buku';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Category { id: string; name: string }
interface BookData {
  isbn?: string | null;
  title: string;
  author: string;
  publisher?: string | null;
  year?: number | null;
  categoryId?: string | null;
  totalCopies: number;
  availableCopies: number;
  coverUrl?: string | null;
  description?: string | null;
}

interface Props {
  categories: Category[];
  defaultValues?: BookData;
  isEdit?: boolean;
  bookId?: string;
}

export function BookFormClient({ categories, defaultValues, isEdit, bookId }: Props) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = isEdit && bookId
      ? await updateBook(bookId, formData)
      : await createBook(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/admin/buku');
      router.refresh();
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        {error && (
          <div className="mb-5 p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Judul Buku *</Label>
              <Input id="title" name="title" defaultValue={defaultValues?.title} required className="mt-1.5" placeholder="Judul buku..." />
            </div>
            <div>
              <Label htmlFor="author">Penulis *</Label>
              <Input id="author" name="author" defaultValue={defaultValues?.author} required className="mt-1.5" placeholder="Nama penulis" />
            </div>
            <div>
              <Label htmlFor="publisher">Penerbit</Label>
              <Input id="publisher" name="publisher" defaultValue={defaultValues?.publisher ?? ''} className="mt-1.5" placeholder="Nama penerbit" />
            </div>
            <div>
              <Label htmlFor="isbn">ISBN</Label>
              <Input id="isbn" name="isbn" defaultValue={defaultValues?.isbn ?? ''} className="mt-1.5" placeholder="978-xxx-xxx-xx-x" />
            </div>
            <div>
              <Label htmlFor="year">Tahun Terbit</Label>
              <Input id="year" name="year" type="number" defaultValue={defaultValues?.year ?? ''} className="mt-1.5" placeholder="2024" min={1000} max={9999} />
            </div>
            <div>
              <Label htmlFor="categoryId">Kategori</Label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={defaultValues?.categoryId ?? ''}
                className="mt-1.5 flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <option value="">Pilih Kategori...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="totalCopies">Total Eksemplar *</Label>
              <Input id="totalCopies" name="totalCopies" type="number" defaultValue={defaultValues?.totalCopies ?? 1} min={1} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="availableCopies">Tersedia Sekarang *</Label>
              <Input id="availableCopies" name="availableCopies" type="number" defaultValue={defaultValues?.availableCopies ?? 1} min={0} required className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="coverUrl">URL Cover Buku</Label>
              <Input id="coverUrl" name="coverUrl" type="url" defaultValue={defaultValues?.coverUrl ?? ''} className="mt-1.5" placeholder="https://..." />
              <p className="text-xs text-zinc-600 mt-1">Masukkan URL gambar dari sumber eksternal (misal: Unsplash, Google Images)</p>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Deskripsi / Sinopsis</Label>
              <Textarea id="description" name="description" defaultValue={defaultValues?.description ?? ''} className="mt-1.5" rows={4} placeholder="Deskripsi singkat tentang buku ini..." />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Buku'}
            </button>
            <a
              href="/admin/buku"
              className="px-5 py-2.5 border border-zinc-700 text-zinc-400 text-sm rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Batal
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
