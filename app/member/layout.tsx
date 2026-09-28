import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MemberNav } from '@/components/member-nav';

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-black">
      <MemberNav userName={session.user.name} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
