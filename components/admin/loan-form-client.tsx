'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLoan } from '@/lib/actions/peminjaman';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Calendar, ShieldAlert, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

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

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(new Date());

  return (
    <Card className="border-border/80 shadow-md">
      <CardContent className="p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="leading-snug">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pilih Anggota */}
          <div>
            <Label htmlFor="memberId" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Anggota Peminjam *
            </Label>
            <select
              id="memberId"
              name="memberId"
              required
              className="mt-1.5 flex h-11 w-full rounded-xl border border-input bg-card/60 px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 [&>option]:bg-card [&>option]:text-foreground"
            >
              <option value="">Pilih anggota perpustakaan...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.memberId ? `(${m.memberId})` : ''} · {m.email}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Buku */}
          <div>
            <Label htmlFor="bookId" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Judul Buku yang Dipinjam *
            </Label>
            <select
              id="bookId"
              name="bookId"
              required
              onChange={(e) => {
                const book = books.find((b) => b.id === e.target.value) ?? null;
                setSelectedBook(book);
              }}
              className="mt-1.5 flex h-11 w-full rounded-xl border border-input bg-card/60 px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 [&>option]:bg-card [&>option]:text-foreground"
            >
              <option value="">Pilih judul koleksi...</option>
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.availableCopies === 0}>
                  {b.title} (oleh {b.author})
                  {b.availableCopies === 0 ? ' [Stok Habis]' : ` [Tersedia: ${b.availableCopies} buku]`}
                </option>
              ))}
            </select>

            {selectedBook && (
              <div className="mt-3 p-3.5 bg-secondary/50 rounded-xl border border-border/80 text-xs space-y-1">
                <p className="text-foreground font-semibold text-sm">{selectedBook.title}</p>
                <p className="text-muted-foreground">Pengarang: {selectedBook.author}</p>
                <p className={selectedBook.availableCopies > 0 ? 'text-emerald-500 font-medium' : 'text-destructive font-medium'}>
                  {selectedBook.availableCopies > 0
                    ? `Status: ${selectedBook.availableCopies} eksemplar fisik tersedia di rak.`
                    : 'Status: Seluruh eksemplar sedang dipinjam (stok kosong).'}
                </p>
              </div>
            )}
          </div>

          {/* Durasi */}
          <div>
            <Label htmlFor="loanDays" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Masa Peminjaman *
            </Label>
            <select
              id="loanDays"
              name="loanDays"
              defaultValue="7"
              className="mt-1.5 flex h-11 w-full rounded-xl border border-input bg-card/60 px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 [&>option]:bg-card [&>option]:text-foreground"
            >
              <option value="7">7 Hari (Standar Mahasiswa)</option>
              <option value="14">14 Hari (Dosen / Tugas Akhir)</option>
              <option value="21">21 Hari (Riset Khusus)</option>
              <option value="30">30 Hari (Masa Panjang)</option>
            </select>
          </div>

          {/* Ketentuan Sirkulasi */}
          <div className="p-4 bg-secondary/30 border border-border/70 rounded-xl text-xs space-y-2 text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Tanggal Peminjaman Efektif: <strong className="text-foreground font-semibold">{todayFormatted}</strong></span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <span>Tarif denda keterlambatan berlaku: <strong className="text-foreground">Rp 1.000 / hari keterlambatan</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <span>Anggota dengan tanggungan denda aktif tidak dapat meminjam koleksi baru sebelum diselesaikan.</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-6 font-semibold gap-2 shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Memproses Sirkulasi...' : 'Terbitkan Peminjaman'}
            </Button>
            <Link
              href="/admin/peminjaman"
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
