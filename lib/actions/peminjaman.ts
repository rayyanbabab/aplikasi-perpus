'use server';

import { db } from '@/lib/db';
import { books, loans, fines, reservations, notifications } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { loanSchema } from '@/lib/validations';

const FINE_PER_DAY = 1000; // Rp 1.000/hari
const MAX_LOANS = 3; // maks buku dipinjam bersamaan
const DEFAULT_LOAN_DAYS = 7;

// ─── Buat Peminjaman Baru ─────────────────────────────────────────────────────
export async function createLoan(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    return { error: 'Tidak diizinkan' };
  }

  const rawData = Object.fromEntries(formData.entries());
  const parsed = loanSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { bookId, memberId, loanDays } = parsed.data;

  try {
    // Cek stok buku
    const [book] = await db.select().from(books).where(eq(books.id, bookId)).limit(1);
    if (!book) return { error: 'Buku tidak ditemukan' };
    if (book.availableCopies <= 0) return { error: 'Buku sedang tidak tersedia' };

    // Cek denda belum lunas
    const unpaidFines = await db.execute(
      sql`SELECT f.id FROM fines f 
          JOIN loans l ON f.loan_id = l.id 
          WHERE l.member_id = ${memberId} AND f.paid = false LIMIT 1`
    );
    if (unpaidFines.rows.length > 0) {
      return { error: 'Anggota masih memiliki denda belum lunas. Selesaikan denda terlebih dahulu.' };
    }

    // Cek batas maksimal peminjaman
    const activeLoans = await db.execute(
      sql`SELECT COUNT(*) as count FROM loans 
          WHERE member_id = ${memberId} AND status IN ('dipinjam', 'terlambat')`
    );
    const activeCount = Number((activeLoans.rows[0] as any).count);
    if (activeCount >= MAX_LOANS) {
      return { error: `Anggota sudah meminjam ${activeCount} buku (maks ${MAX_LOANS})` };
    }

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + loanDays);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    // Buat loan + dekrement stok (transaction)
    await db.transaction(async (tx) => {
      await tx.insert(loans).values({
        bookId,
        memberId,
        loanDate: formatDate(today),
        dueDate: formatDate(dueDate),
        status: 'dipinjam',
      });

      await tx
        .update(books)
        .set({ availableCopies: sql`${books.availableCopies} - 1` })
        .where(eq(books.id, bookId));
    });

    revalidatePath('/admin/peminjaman');
    revalidatePath('/admin/dashboard');
    revalidatePath('/member/riwayat');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: 'Gagal membuat peminjaman' };
  }
}

// ─── Proses Pengembalian ──────────────────────────────────────────────────────
export async function processReturn(loanId: string) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    return { error: 'Tidak diizinkan' };
  }

  try {
    const [loan] = await db
      .select({ id: loans.id, bookId: loans.bookId, dueDate: loans.dueDate, status: loans.status })
      .from(loans)
      .where(eq(loans.id, loanId))
      .limit(1);

    if (!loan) return { error: 'Peminjaman tidak ditemukan' };
    if (loan.status === 'dikembalikan') return { error: 'Buku sudah dikembalikan' };

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dueDate = new Date(loan.dueDate);
    const diffMs = today.getTime() - dueDate.getTime();
    const lateDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const fineAmount = lateDays * FINE_PER_DAY;
    const newStatus = lateDays > 0 ? 'terlambat' : 'dikembalikan';

    await db.transaction(async (tx) => {
      // Update status loan
      await tx
        .update(loans)
        .set({ returnDate: todayStr, status: newStatus })
        .where(eq(loans.id, loanId));

      // Buat denda kalau terlambat
      if (fineAmount > 0) {
        await tx.insert(fines).values({ loanId, amount: fineAmount });
      }

      // Kembalikan stok buku
      await tx
        .update(books)
        .set({ availableCopies: sql`${books.availableCopies} + 1` })
        .where(eq(books.id, loan.bookId));

      // Cek antrian reservasi (FIFO)
      const [firstReservation] = await tx
        .select()
        .from(reservations)
        .where(and(eq(reservations.bookId, loan.bookId), eq(reservations.status, 'menunggu')))
        .orderBy(reservations.reservedAt)
        .limit(1);

      if (firstReservation) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 2); // window 48 jam

        await tx
          .update(reservations)
          .set({ status: 'tersedia', expiresAt })
          .where(eq(reservations.id, firstReservation.id));

        // Notifikasi ke anggota
        const [bookData] = await tx
          .select({ title: books.title })
          .from(books)
          .where(eq(books.id, loan.bookId))
          .limit(1);

        await tx.insert(notifications).values({
          userId: firstReservation.memberId,
          title: 'Buku Reservasi Tersedia!',
          message: `Buku "${bookData?.title}" yang Anda reservasi sudah tersedia. Segera ambil sebelum ${expiresAt.toLocaleDateString('id-ID')}.`,
        });
      }
    });

    revalidatePath('/admin/peminjaman');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/denda');
    return { success: true, fineAmount, lateDays };
  } catch (e) {
    console.error(e);
    return { error: 'Gagal memproses pengembalian' };
  }
}

// ─── Update Status Terlambat (untuk cron) ────────────────────────────────────
export async function updateOverdueStatus() {
  const today = new Date().toISOString().split('T')[0];
  await db
    .update(loans)
    .set({ status: 'terlambat' })
    .where(
      sql`status = 'dipinjam' AND due_date < ${today}`
    );
}
