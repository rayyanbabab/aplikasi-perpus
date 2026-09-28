import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'admin') {
    redirect('/admin/dashboard');
  }

  redirect('/member/katalog');
}
