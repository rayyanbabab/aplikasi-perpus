import { NextResponse } from 'next/server';

// Prevent static analysis/pre-rendering during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Dipanggil oleh Vercel Cron: setiap hari jam 00:00 WIB
// Konfigurasi di vercel.json
export async function GET(request: Request) {
  // Security: cek secret token untuk mencegah akses luar
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Lazy import agar tidak dievaluasi saat build
  const { updateOverdueStatus } = await import('@/lib/actions/peminjaman');
  const { expireReservations } = await import('@/lib/actions/reservasi');

  try {
    // 1. Update status peminjaman yang melewati due_date → 'terlambat'
    await updateOverdueStatus();

    // 2. Expire reservasi yang sudah melewati window waktu
    await expireReservations();

    return NextResponse.json({
      success: true,
      message: 'Cron job berhasil: status peminjaman dan reservasi diperbarui',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
