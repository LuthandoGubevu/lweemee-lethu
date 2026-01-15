'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface Workspace {
  id: string;
  name: string;
}

export function WorkspaceSwitcher() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);

  const { data: workspaces, loading: workspacesLoading } = useCollection<Workspace>(
    user && firestore ? `users/${user.uid}/workspaces` : ''
  );
  
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);

  useEffect(() => {
      if (currentWorkspaceId) {
          setSelectedWorkspace(currentWorkspaceId);
      } else if (workspaces.length > 0) {
          setCurrentWorkspaceId(workspaces[0].id);
          setSelectedWorkspace(workspaces[0].id);
      }
  }, [currentWorkspaceId, workspaces, setCurrentWorkspaceId]);

  const handleValueChange = (value: string) => {
    setCurrentWorkspaceId(value);
    setSelectedWorkspace(value);
  };

  if (workspacesLoading) {
    return <div>Loading workspaces...</div>;
  }

  if (!workspaces || workspaces.length === 0) {
    return null;
  }

  return (
    <Select onValueChange={handleValueChange} value={selectedWorkspace || ''}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a workspace" />
      </SelectTrigger>
      <SelectContent>
        {workspaces.map((workspace) => (
          <SelectItem key={workspace.id} value={workspace.id}>
            {workspace.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
