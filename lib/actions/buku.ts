'use server';

import { db } from '@/lib/db';
import { books, categories } from '@/lib/db/schema';
import { eq, ne, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { bookSchema, categorySchema } from '@/lib/validations';

// ─── CRUD Buku ────────────────────────────────────────────────────────────────

export async function createBook(formData: FormData) {
  const session = await auth();
  if (session?.user.role !== 'admin') return { error: 'Tidak diizinkan' };

  const rawData = {
    isbn: formData.get('isbn') || undefined,
    title: formData.get('title'),
    author: formData.get('author'),
    publisher: formData.get('publisher') || undefined,
    year: formData.get('year') || undefined,
    categoryId: formData.get('categoryId') || null,
    totalCopies: formData.get('totalCopies'),
    availableCopies: formData.get('availableCopies'),
    coverUrl: formData.get('coverUrl') || undefined,
    description: formData.get('description') || undefined,
  };

  const parsed = bookSchema.safeParse(rawData);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    const { coverUrl, ...rest } = parsed.data;
    await db.insert(books).values({
      ...rest,
      coverUrl: coverUrl || null,
      isbn: rest.isbn || null,
      publisher: rest.publisher || null,
      year: rest.year || null,
      description: rest.description || null,
      categoryId: rest.categoryId || null,
    });
    revalidatePath('/admin/buku');
    revalidatePath('/member/katalog');
    return { success: true };
  } catch {
    return { error: 'Gagal menambah buku. ISBN mungkin sudah terdaftar.' };
  }
}

export async function updateBook(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user.role !== 'admin') return { error: 'Tidak diizinkan' };

  const rawData = {
    isbn: formData.get('isbn') || undefined,
    title: formData.get('title'),
    author: formData.get('author'),
    publisher: formData.get('publisher') || undefined,
    year: formData.get('year') || undefined,
    categoryId: formData.get('categoryId') || null,
    totalCopies: formData.get('totalCopies'),
    availableCopies: formData.get('availableCopies'),
    coverUrl: formData.get('coverUrl') || undefined,
    description: formData.get('description') || undefined,
  };

  const parsed = bookSchema.safeParse(rawData);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    const { coverUrl, ...rest } = parsed.data;
    await db
      .update(books)
      .set({
        ...rest,
        coverUrl: coverUrl || null,
        isbn: rest.isbn || null,
        publisher: rest.publisher || null,
        year: rest.year || null,
        description: rest.description || null,
        categoryId: rest.categoryId || null,
      })
      .where(eq(books.id, id));
    revalidatePath('/admin/buku');
    revalidatePath('/member/katalog');
    return { success: true };
  } catch {
    return { error: 'Gagal mengupdate buku' };
  }
}

export async function deleteBook(id: string) {
  const session = await auth();
  if (session?.user.role !== 'admin') return { error: 'Tidak diizinkan' };

  try {
    await db.delete(books).where(eq(books.id, id));
    revalidatePath('/admin/buku');
    return { success: true };
  } catch {
    return { error: 'Gagal menghapus buku. Mungkin ada peminjaman terkait.' };
  }
}

// ─── CRUD Kategori ────────────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (session?.user.role !== 'admin') return { error: 'Tidak diizinkan' };

  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await db.insert(categories).values(parsed.data);
    revalidatePath('/admin/kategori');
    return { success: true };
  } catch {
    return { error: 'Kategori sudah ada' };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user.role !== 'admin') return { error: 'Tidak diizinkan' };

  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await db.update(categories).set(parsed.data).where(eq(categories.id, id));
    revalidatePath('/admin/kategori');
    return { success: true };
  } catch {
    return { error: 'Gagal mengupdate kategori' };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (session?.user.role !== 'admin') return { error: 'Tidak diizinkan' };

  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath('/admin/kategori');
    return { success: true };
  } catch {
    return { error: 'Gagal menghapus kategori. Ada buku yang menggunakan kategori ini.' };
  }
}
