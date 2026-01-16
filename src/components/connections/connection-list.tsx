
'use client';

import React from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Trash2, Clapperboard, Camera } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

interface Connection {
  id: string;
  handle: string;
  connectionType: 'handle' | 'oauth' | 'manual';
  createdAt: {
    toDate: () => Date;
  };
  platform?: 'tiktok' | 'instagram';
}

interface Member {
    id: string;
    userId: string;
    role: 'admin' | 'consultant' | 'client' | 'viewer';
}

const PLATFORM_META = {
    tiktok: { label: "TikTok", icon: <Clapperboard className="h-5 w-5" /> },
    instagram: { label: "Instagram", icon: <Camera className="h-5 w-5" /> }
}

function normalizeConnection(connection: Connection) {
    const platformKey = connection.platform || 'tiktok'; // Default to tiktok for backward compatibility
    return PLATFORM_META[platformKey] || PLATFORM_META.tiktok;
}


export function ConnectionList() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [currentWorkspaceId] = useLocalStorage<string | null>(
    'currentWorkspaceId',
    null
  );
  const { toast } = useToast();

  const { data: connections, loading, error } = useCollection<Connection>(
    currentWorkspaceId ? `workspaces/${currentWorkspaceId}/connections` : ''
  );

  const { data: members } = useCollection<Member>(
    currentWorkspaceId ? `workspaces/${currentWorkspaceId}/members` : ''
  );

  const currentUserMemberInfo = members.find(m => m.userId === user?.uid);
  const canManageConnections = currentUserMemberInfo?.role === 'admin' || currentUserMemberInfo?.role === 'consultant';


  const handleDelete = async (connectionId: string) => {
    if (!firestore || !currentWorkspaceId) return;

    try {
      await deleteDoc(doc(firestore, `workspaces/${currentWorkspaceId}/connections`, connectionId));
      toast({ title: 'Connection removed' });
    } catch (e: any) {
      toast({ title: 'Error removing connection', description: e.message, variant: 'destructive'});
    }
  }

  if (loading) {
    return <div>Loading connections...</div>;
  }
  
  if (error) {
    return <p className="text-destructive">Error loading connections: You might not have permission to view this.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Handle</TableHead>
              <TableHead>Connection Type</TableHead>
              <TableHead>Connected On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connections.length > 0 ? (
              connections.map((conn) => {
                const platform = normalizeConnection(conn);
                return (
                <TableRow key={conn.id}>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            {platform.icon}
                            <Badge variant="outline">{platform.label}</Badge>
                        </div>
                    </TableCell>
                  <TableCell className="font-medium">@{conn.handle}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">{conn.connectionType.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    {conn.createdAt?.toDate().toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {canManageConnections && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(conn.id)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )})
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No TikTok accounts connected yet. Add a TikTok handle or import data to start tracking.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
