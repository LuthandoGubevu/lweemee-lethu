'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { InviteMemberForm } from '@/components/invite-member-form';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


interface Member {
  id: string; // This will be the user's UID
  userId: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'consultant' | 'client' | 'viewer';
}

export default function MembersPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
  const { toast } = useToast();

  const { data: members, loading: membersLoading, error } = useCollection<Member>(
    currentWorkspaceId ? `workspaces/${currentWorkspaceId}/members` : ''
  );

  const currentUserMemberInfo = members.find(m => m.userId === user?.uid);
  const canManageMembers = currentUserMemberInfo?.role === 'admin' || currentUserMemberInfo?.role === 'consultant';


  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };

  const handleRemoveMember = async (memberUserId: string) => {
      if (!firestore || !currentWorkspaceId) return;

      if (user?.uid === memberUserId) {
          toast({ title: "Cannot remove yourself", variant: 'destructive'});
          return;
      }

      try {
          // Remove from workspace members subcollection (doc id is the userId)
          await deleteDoc(doc(firestore, `workspaces/${currentWorkspaceId}/members`, memberUserId));
          // Remove from user's workspaces list
          await deleteDoc(doc(firestore, `users/${memberUserId}/workspaces`, currentWorkspaceId));

          toast({ title: 'Member removed successfully' });
      } catch (error: any) {
          toast({ title: 'Error removing member', description: error.message, variant: 'destructive'})
      }
  }

  if (userLoading || membersLoading) {
    return <div>Loading...</div>;
  }
  
  if (!currentWorkspaceId) {
      return (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
            <h3 className="text-xl font-bold tracking-tight">No workspace selected</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">Please select or create a workspace to see its members.</p>
        </div>
      )
  }

  if (error) {
      return (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-destructive/50 p-12 text-center h-full">
            <h3 className="text-xl font-bold tracking-tight text-destructive">Access Denied</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">You do not have permission to view members of this workspace.</p>
        </div>
      )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Workspace Members</CardTitle>
          <CardDescription>
            Manage who has access to this workspace.
          </CardDescription>
        </div>
        {canManageMembers && (
            <Dialog>
            <DialogTrigger asChild>
                <Button>Invite Member</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Invite a new member</DialogTitle>
                </DialogHeader>
                <InviteMemberForm />
            </DialogContent>
            </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.photoURL} />
                      <AvatarFallback>
                        {getInitials(member.displayName || member.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">{member.role}</Badge>
                </TableCell>
                <TableCell className="text-right">
                {canManageMembers && user?.uid !== member.userId && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRemoveMember(member.userId)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                </TableCell>
              </TableRow>
            ))}
             {members.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No members yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
