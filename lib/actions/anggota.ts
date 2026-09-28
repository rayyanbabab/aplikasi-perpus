'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { memberSchema, registerSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export async function createMember(formData: FormData) {
  const session = await auth();
  if (session?.user.role !== 'admin') return { error: 'Tidak diizinkan' };

  const parsed = memberSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    phone: formData.get('phone') || undefined,
    memberId: formData.get('memberId') || undefined,
    status: formData.get('status') || 'aktif',
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };
  const { password, ...data } = parsed.data;
  if (!password) return { error: 'Password wajib diisi' };

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await db.insert(users).values({ ...data, passwordHash, role: 'member' });
    revalidatePath('/admin/anggota');
    return { success: true };
  } catch {
    return { error: 'Email sudah terdaftar' };
  }
}

export async function updateMember(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user.role !== 'admin') return { error: 'Tidak diizinkan' };

  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password') || undefined,
    phone: formData.get('phone') || undefined,
    memberId: formData.get('memberId') || undefined,
    status: formData.get('status') || 'aktif',
  };

  const parsed = memberSchema.safeParse(rawData);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    const { password, ...data } = parsed.data;
    const updateData: any = { ...data };
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }
    await db.update(users).set(updateData).where(eq(users.id, id));
    revalidatePath('/admin/anggota');
    return { success: true };
  } catch {
    return { error: 'Gagal mengupdate anggota' };
  }
}

export async function deleteMember(id: string) {
  const session = await auth();
  if (session?.user.role !== 'admin') return { error: 'Tidak diizinkan' };

  try {
    await db.update(users).set({ status: 'nonaktif' }).where(eq(users.id, id));
    revalidatePath('/admin/anggota');
    return { success: true };
  } catch {
    return { error: 'Gagal menonaktifkan anggota' };
  }
}

// Self-register untuk anggota baru
export async function registerMember(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    phone: formData.get('phone') || undefined,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    const { password, ...data } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate member ID otomatis: M + timestamp
    const memberId = `M${Date.now().toString().slice(-6)}`;

    await db.insert(users).values({
      ...data,
      passwordHash,
      role: 'member',
      memberId,
      status: 'aktif',
    });

    return { success: true };
  } catch {
    return { error: 'Email sudah terdaftar' };
  }
}
