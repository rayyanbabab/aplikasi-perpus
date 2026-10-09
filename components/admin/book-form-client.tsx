'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBook, updateBook } from '@/lib/actions/buku';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

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
    <Card className="border-border/80 shadow-md">
      <CardContent className="p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-3.5 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Judul Buku *
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={defaultValues?.title}
                required
                className="mt-1.5"
                placeholder="Contoh: Algoritma dan Pemrograman Modern"
              />
            </div>
            <div>
              <Label htmlFor="author" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Penulis / Pengarang *
              </Label>
              <Input
                id="author"
                name="author"
                defaultValue={defaultValues?.author}
                required
                className="mt-1.5"
                placeholder="Nama penulis..."
              />
            </div>
            <div>
              <Label htmlFor="publisher" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Penerbit
              </Label>
              <Input
                id="publisher"
                name="publisher"
                defaultValue={defaultValues?.publisher ?? ''}
                className="mt-1.5"
                placeholder="Penerbit buku..."
              />
            </div>
            <div>
              <Label htmlFor="isbn" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Nomor ISBN
              </Label>
              <Input
                id="isbn"
                name="isbn"
                defaultValue={defaultValues?.isbn ?? ''}
                className="mt-1.5"
                placeholder="978-602-xxx-xxx-x"
              />
            </div>
            <div>
              <Label htmlFor="year" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Tahun Terbit
              </Label>
              <Input
                id="year"
                name="year"
                type="number"
                defaultValue={defaultValues?.year ?? ''}
                className="mt-1.5"
                placeholder="2024"
                min={1800}
                max={2100}
              />
            </div>
            <div>
              <Label htmlFor="categoryId" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Kategori Koleksi
              </Label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={defaultValues?.categoryId ?? ''}
                className="mt-1.5 flex h-10 w-full rounded-xl border border-input bg-card/60 px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 [&>option]:bg-card [&>option]:text-foreground"
              >
                <option value="">Pilih Kategori Bidang...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="totalCopies" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Jumlah Eksemplar Fisik *
              </Label>
              <Input
                id="totalCopies"
                name="totalCopies"
                type="number"
                defaultValue={defaultValues?.totalCopies ?? 1}
                min={1}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="availableCopies" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Eksemplar Siap Dipinjam *
              </Label>
              <Input
                id="availableCopies"
                name="availableCopies"
                type="number"
                defaultValue={defaultValues?.availableCopies ?? 1}
                min={0}
                required
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="coverUrl" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Tautan Gambar Sampul (Cover URL)
              </Label>
              <Input
                id="coverUrl"
                name="coverUrl"
                type="url"
                defaultValue={defaultValues?.coverUrl ?? ''}
                className="mt-1.5"
                placeholder="https://images.unsplash.com/photo-..."
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Gunakan URL langsung ke file gambar sampul buku untuk tampilan katalog visual.
              </p>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Sinopsis & Ringkasan Buku
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={defaultValues?.description ?? ''}
                className="mt-1.5"
                rows={4}
                placeholder="Tuliskan ulasan ringkas mengenai isi, bab utama, atau tujuan buku..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border/80">
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-6 font-semibold gap-2 shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Menyimpan Data...' : isEdit ? 'Simpan Perubahan Buku' : 'Daftarkan Buku Baru'}
            </Button>
            <Link
              href="/admin/buku"
              className="inline-flex items-center justify-center h-11 px-5 border border-border/80 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Batal
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
