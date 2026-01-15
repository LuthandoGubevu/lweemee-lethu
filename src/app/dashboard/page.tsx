'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getAuth, signOut } from 'firebase/auth';

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-md">
        <h1 className="text-2xl font-bold font-headline">Dashboard</h1>
        <p className="mt-4 text-foreground/80">
          Welcome, {user.email || 'user'}!
        </p>
        <p className="mt-2 text-foreground/80">You are now logged in.</p>
        <Button onClick={handleLogout} className="mt-6" variant="destructive">
          Log Out
        </Button>
      </div>
    </div>
  );
}
