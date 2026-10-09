import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MemberNav } from '@/components/member-nav';

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <MemberNav userName={session.user.name} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 pb-16">
        {children}
      </main>
    </div>
  );
}
