'use server';

import { db } from '@/lib/db';
import { fines } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

export async function payFine(fineId: string) {
  const session = await auth();
  if (session?.user.role !== 'admin') return { error: 'Tidak diizinkan' };

  try {
    await db
      .update(fines)
      .set({ paid: true, paidAt: new Date() })
      .where(eq(fines.id, fineId));

    revalidatePath('/admin/denda');
    revalidatePath('/admin/dashboard');
    revalidatePath('/member/riwayat');
    return { success: true };
  } catch {
    return { error: 'Gagal memperbarui status denda' };
  }
}
