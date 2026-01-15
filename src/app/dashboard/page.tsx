'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface Workspace {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);

  const { data: workspaces, loading: workspacesLoading } = useCollection<Workspace>(
    user && firestore ? `users/${user.uid}/workspaces` : ''
  );

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!workspacesLoading && workspaces.length > 0 && !currentWorkspaceId) {
      setCurrentWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, workspacesLoading, currentWorkspaceId, setCurrentWorkspaceId]);


  if (userLoading || workspacesLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (workspaces.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
            <h3 className="text-xl font-bold tracking-tight">You have no workspaces</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">Get started by creating a new workspace.</p>
            <Button asChild>
                <Link href="/dashboard/workspaces/new">Create Workspace</Link>
            </Button>
        </div>
    )
  }

  const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId);

  return (
    <div>
        <h1 className="text-2xl font-bold font-headline mb-4">
            Welcome to {currentWorkspace?.name || "your dashboard"}!
        </h1>
        <p className="text-foreground/80">
            This is your main dashboard. Content will go here.
        </p>
    </div>
  );
}
