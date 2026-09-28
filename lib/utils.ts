import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function calculateLateDays(dueDate: string, returnDate?: string | null): number {
  const due = new Date(dueDate);
  const ret = returnDate ? new Date(returnDate) : new Date();
  const diff = ret.getTime() - due.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getLoanStatusLabel(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    dipinjam: { label: 'Dipinjam', color: 'blue' },
    dikembalikan: { label: 'Dikembalikan', color: 'green' },
    terlambat: { label: 'Terlambat', color: 'red' },
  };
  return map[status] ?? { label: status, color: 'gray' };
}

export function getReservationStatusLabel(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    menunggu: { label: 'Menunggu', color: 'yellow' },
    tersedia: { label: 'Tersedia', color: 'green' },
    diambil: { label: 'Diambil', color: 'blue' },
    kadaluarsa: { label: 'Kadaluarsa', color: 'gray' },
    dibatalkan: { label: 'Dibatalkan', color: 'red' },
  };
  return map[status] ?? { label: status, color: 'gray' };
}
