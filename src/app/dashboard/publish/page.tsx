
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { PostsList } from '@/components/publish/posts-list';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PostForm } from '@/components/publish/post-form';
import { PlusCircle } from 'lucide-react';
import { useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';

interface Member {
    id: string;
    userId: string;
    role: 'admin' | 'consultant' | 'client' | 'viewer';
}

export default function PublishPage() {
  const { user } = useUser();
  const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: members } = useCollection<Member>(
    currentWorkspaceId ? `workspaces/${currentWorkspaceId}/members` : ''
  );
  
  const currentUserMemberInfo = members.find(m => m.userId === user?.uid);
  const canManagePosts = currentUserMemberInfo?.role === 'admin' || currentUserMemberInfo?.role === 'consultant';

  if (!currentWorkspaceId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
        <h3 className="text-xl font-bold tracking-tight">No workspace selected</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">Please select a workspace to manage posts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Publish</h1>
        {canManagePosts && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Post
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Create a new post</DialogTitle>
                </DialogHeader>
                <PostForm onSave={() => setIsFormOpen(false)} />
            </DialogContent>
            </Dialog>
        )}
      </div>

      <Card>
         <CardHeader>
            <CardTitle>Content Pipeline</CardTitle>
            <CardDescription>Manage your content from draft to publication.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="draft">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="draft">Drafts</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                    <TabsTrigger value="failed">Failed</TabsTrigger>
                </TabsList>
                <TabsContent value="draft">
                    <PostsList status="draft" />
                </TabsContent>
                <TabsContent value="scheduled">
                    <PostsList status="scheduled" />
                </TabsContent>
                <TabsContent value="published">
                    <PostsList status="published" />
                </TabsContent>
                <TabsContent value="failed">
                    <PostsList status="failed" />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
