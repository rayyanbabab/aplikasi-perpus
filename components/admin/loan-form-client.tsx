'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLoan } from '@/lib/actions/peminjaman';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';

interface Member { id: string; name: string; email: string; memberId?: string | null }
interface Book { id: string; title: string; author: string; availableCopies: number; categoryName?: string | null }

interface Props {
  members: Member[];
  books: Book[];
}

export function LoanFormClient({ members, books }: Props) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createLoan(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/admin/peminjaman');
      router.refresh();
    }
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  return (
    <Card>
      <CardContent className="p-6">
        {error && (
          <div className="mb-5 p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pilih Anggota */}
          <div>
            <Label htmlFor="memberId">Anggota *</Label>
            <select
              id="memberId"
              name="memberId"
              required
              className="mt-1.5 flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="">Pilih anggota...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.memberId ? `(${m.memberId})` : ''} — {m.email}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Buku */}
          <div>
            <Label htmlFor="bookId">Buku *</Label>
            <select
              id="bookId"
              name="bookId"
              required
              onChange={(e) => {
                const book = books.find((b) => b.id === e.target.value) ?? null;
                setSelectedBook(book);
              }}
              className="mt-1.5 flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="">Pilih buku...</option>
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.availableCopies === 0}>
                  {b.title} — {b.author}
                  {b.availableCopies === 0 ? ' [Stok Habis]' : ` [${b.availableCopies} tersedia]`}
                </option>
              ))}
            </select>

            {selectedBook && (
              <div className="mt-2 p-3 bg-zinc-800 rounded-lg border border-zinc-700 text-xs space-y-1">
                <p className="text-zinc-300 font-medium">{selectedBook.title}</p>
                <p className="text-zinc-500">Penulis: {selectedBook.author}</p>
                <p className={selectedBook.availableCopies > 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {selectedBook.availableCopies > 0
                    ? `✓ ${selectedBook.availableCopies} eksemplar tersedia`
                    : '✗ Stok habis — tidak bisa dipinjam'}
                </p>
              </div>
            )}
          </div>

          {/* Durasi */}
          <div>
            <Label htmlFor="loanDays">Durasi Peminjaman (hari) *</Label>
            <select
              id="loanDays"
              name="loanDays"
              defaultValue="7"
              className="mt-1.5 flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="7">7 hari (standar)</option>
              <option value="14">14 hari</option>
              <option value="21">21 hari</option>
              <option value="30">30 hari</option>
            </select>
          </div>

          {/* Info */}
          <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-xs text-zinc-500 space-y-1">
            <p>📅 Tanggal peminjaman: <span className="text-zinc-300">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
            <p>⚠️ Anggota dengan denda belum lunas tidak bisa meminjam buku baru.</p>
            <p>📚 Maksimal 3 buku dipinjam bersamaan per anggota.</p>
            <p>💰 Denda keterlambatan: Rp 1.000/hari</p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Memproses...' : 'Buat Peminjaman'}
            </button>
            <a href="/admin/peminjaman" className="px-5 py-2.5 border border-zinc-700 text-zinc-400 text-sm rounded-lg hover:bg-zinc-800 transition-colors">
              Batal
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
