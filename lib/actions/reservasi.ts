'use server';

import { db } from '@/lib/db';
import { reservations, books, notifications } from '@/lib/db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

export async function createReservation(bookId: string) {
  const session = await auth();
  if (!session) return { error: 'Silakan login terlebih dahulu' };

  const memberId = session.user.id;

  try {
    // Cek apakah buku tersedia (tidak perlu reservasi)
    const [book] = await db
      .select({ availableCopies: books.availableCopies, title: books.title })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book) return { error: 'Buku tidak ditemukan' };
    if (book.availableCopies > 0) return { error: 'Buku masih tersedia, silakan pinjam langsung ke petugas' };

    // Cek apakah sudah pernah reservasi buku ini
    const existing = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.bookId, bookId),
          eq(reservations.memberId, memberId),
          eq(reservations.status, 'menunggu')
        )
      )
      .limit(1);

    if (existing.length > 0) return { error: 'Anda sudah mereservasi buku ini' };

    await db.insert(reservations).values({ bookId, memberId, status: 'menunggu' });

    revalidatePath('/member/reservasi');
    revalidatePath('/member/katalog');
    return { success: true, message: `Reservasi buku "${book.title}" berhasil. Anda akan dinotifikasi saat buku tersedia.` };
  } catch {
    return { error: 'Gagal membuat reservasi' };
  }
}

export async function cancelReservation(reservationId: string) {
  const session = await auth();
  if (!session) return { error: 'Tidak diizinkan' };

  try {
    const where = session.user.role === 'admin'
      ? eq(reservations.id, reservationId)
      : and(eq(reservations.id, reservationId), eq(reservations.memberId, session.user.id));

    await db.update(reservations).set({ status: 'dibatalkan' }).where(where);

    revalidatePath('/member/reservasi');
    revalidatePath('/admin/peminjaman');
    return { success: true };
  } catch {
    return { error: 'Gagal membatalkan reservasi' };
  }
}

// Cron: expire reservasi yang sudah lewat window waktu
export async function expireReservations() {
  const now = new Date();
  await db
    .update(reservations)
    .set({ status: 'kadaluarsa' })
    .where(and(eq(reservations.status, 'tersedia'), lt(reservations.expiresAt, now)));
}
