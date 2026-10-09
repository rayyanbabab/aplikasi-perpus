'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMember, updateMember } from '@/lib/actions/anggota';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface DefaultValues {
  name: string;
  email: string;
  phone?: string | null;
  memberId?: string | null;
  status: 'aktif' | 'nonaktif';
}

interface Props {
  defaultValues?: DefaultValues;
  isEdit?: boolean;
  memberId?: string;
}

export function MemberFormClient({ defaultValues, isEdit, memberId }: Props) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = isEdit && memberId
      ? await updateMember(memberId, formData)
      : await createMember(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/admin/anggota');
      router.refresh();
    }
  }

  return (
    <Card className="border-border/80 shadow-md">
      <CardContent className="p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="leading-snug">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Label htmlFor="mName" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Nama Lengkap *
              </Label>
              <Input
                id="mName"
                name="name"
                defaultValue={defaultValues?.name}
                required
                className="mt-1.5"
                placeholder="Contoh: Budi Santoso"
              />
            </div>
            <div>
              <Label htmlFor="mEmail" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Alamat Email *
              </Label>
              <Input
                id="mEmail"
                name="email"
                type="email"
                defaultValue={defaultValues?.email}
                required
                className="mt-1.5"
                placeholder="email@astra.ac.id"
              />
            </div>
            <div>
              <Label htmlFor="mPhone" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Nomor Telepon / WhatsApp
              </Label>
              <Input
                id="mPhone"
                name="phone"
                defaultValue={defaultValues?.phone ?? ''}
                className="mt-1.5"
                placeholder="081234567890"
              />
            </div>
            <div>
              <Label htmlFor="mMemberId" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Nomor Anggota (ID)
              </Label>
              <Input
                id="mMemberId"
                name="memberId"
                defaultValue={defaultValues?.memberId ?? ''}
                className="mt-1.5"
                placeholder="ASTRA-001 (kosongkan untuk otomatis)"
              />
            </div>
            <div>
              <Label htmlFor="mStatus" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Status Keanggotaan
              </Label>
              <select
                id="mStatus"
                name="status"
                defaultValue={defaultValues?.status ?? 'aktif'}
                className="mt-1.5 flex h-10 w-full rounded-xl border border-input bg-card/60 px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 [&>option]:bg-card [&>option]:text-foreground"
              >
                <option value="aktif">Aktif (Dapat Meminjam)</option>
                <option value="nonaktif">Nonaktif (Sirkulasi Ditangguhkan)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="mPassword" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {isEdit ? 'Kata Sandi Baru (Kosongkan bila tidak diganti)' : 'Kata Sandi Awal *'}
              </Label>
              <Input
                id="mPassword"
                name="password"
                type="password"
                required={!isEdit}
                minLength={6}
                className="mt-1.5"
                placeholder="Minimal 6 karakter"
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
              {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan Anggota' : 'Daftarkan Anggota Baru'}
            </Button>
            <Link
              href="/admin/anggota"
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
