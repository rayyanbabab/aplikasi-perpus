'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMember, updateMember } from '@/lib/actions/anggota';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

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
    <Card>
      <CardContent className="p-6">
        {error && (
          <div className="mb-5 p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="mName">Nama Lengkap *</Label>
            <Input id="mName" name="name" defaultValue={defaultValues?.name} required className="mt-1.5" placeholder="Budi Santoso" />
          </div>
          <div>
            <Label htmlFor="mEmail">Email *</Label>
            <Input id="mEmail" name="email" type="email" defaultValue={defaultValues?.email} required className="mt-1.5" placeholder="email@domain.com" />
          </div>
          <div>
            <Label htmlFor="mPhone">No. HP</Label>
            <Input id="mPhone" name="phone" defaultValue={defaultValues?.phone ?? ''} className="mt-1.5" placeholder="08xxxxxxxxxx" />
          </div>
          <div>
            <Label htmlFor="mMemberId">No. Anggota</Label>
            <Input id="mMemberId" name="memberId" defaultValue={defaultValues?.memberId ?? ''} className="mt-1.5" placeholder="M001 (kosong = otomatis)" />
          </div>
          <div>
            <Label htmlFor="mStatus">Status</Label>
            <select
              id="mStatus"
              name="status"
              defaultValue={defaultValues?.status ?? 'aktif'}
              className="mt-1.5 flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
          <div>
            <Label htmlFor="mPassword">{isEdit ? 'Password Baru (kosong = tidak diubah)' : 'Password *'}</Label>
            <Input id="mPassword" name="password" type="password" required={!isEdit} minLength={6} className="mt-1.5" placeholder="Min. 6 karakter" />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Akun Anggota'}
            </button>
            <a href="/admin/anggota" className="px-5 py-2.5 border border-zinc-700 text-zinc-400 text-sm rounded-lg hover:bg-zinc-800 transition-colors">
              Batal
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
