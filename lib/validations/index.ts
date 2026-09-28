import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  phone: z.string().optional(),
});

export const bookSchema = z.object({
  isbn: z.string().optional(),
  title: z.string().min(1, 'Judul wajib diisi').max(500),
  author: z.string().min(1, 'Penulis wajib diisi').max(255),
  publisher: z.string().optional(),
  year: z.coerce.number().int().min(1000).max(9999).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  totalCopies: z.coerce.number().int().min(1, 'Minimal 1 eksemplar'),
  availableCopies: z.coerce.number().int().min(0),
  coverUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi').max(100),
  description: z.string().optional(),
});

export const loanSchema = z.object({
  bookId: z.string().uuid('Pilih buku'),
  memberId: z.string().uuid('Pilih anggota'),
  loanDays: z.coerce.number().int().min(1).max(30).default(7),
});

export const memberSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  memberId: z.string().max(50).optional(),
  status: z.enum(['aktif', 'nonaktif']).default('aktif'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BookInput = z.infer<typeof bookSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type LoanInput = z.infer<typeof loanSchema>;
export type MemberInput = z.infer<typeof memberSchema>;
