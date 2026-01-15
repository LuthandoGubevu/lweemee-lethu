
'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useCollection, useFirestore, useUser } from '@/firebase';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Edit, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PostForm } from './post-form';
import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';

type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

interface Post {
  id: string;
  content: string;
  mediaUrl?: string;
  status: PostStatus;
  scheduledAt?: { toDate: () => Date };
  publishedAt?: { toDate: () => Date };
  tiktokPostUrl?: string;
  createdBy: string;
}

interface Member {
    id: string;
    userId: string;
    role: 'admin' | 'consultant' | 'client' | 'viewer';
}

export function PostsList({ status }: { status: PostStatus }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
  const { data: posts, loading, error } = useCollection<Post>(
    currentWorkspaceId ? `workspaces/${currentWorkspaceId}/posts` : '',
    { where: ['status', '==', status] }
  );

  const { data: members } = useCollection<Member>(
    currentWorkspaceId ? `workspaces/${currentWorkspaceId}/members` : ''
  );
  
  const currentUserMemberInfo = members.find(m => m.userId === user?.uid);
  const canManagePosts = currentUserMemberInfo?.role === 'admin' || currentUserMemberInfo?.role === 'consultant';

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [manualPublishPost, setManualPublishPost] = useState<Post | null>(null);
  const [tiktokUrl, setTiktokUrl] = useState('');


  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setIsEditFormOpen(true);
  };
  
  const handleDelete = async (postId: string) => {
      if (!firestore || !currentWorkspaceId) return;
      try {
          await deleteDoc(doc(firestore, `workspaces/${currentWorkspaceId}/posts`, postId));
          toast({title: "Post deleted"});
      } catch (e: any) {
          toast({title: "Error deleting post", description: e.message, variant: 'destructive'});
      }
  }

  const handleManualPublish = async () => {
    if (!firestore || !currentWorkspaceId || !manualPublishPost || !tiktokUrl) return;

    try {
        const postRef = doc(firestore, `workspaces/${currentWorkspaceId}/posts`, manualPublishPost.id);
        await updateDoc(postRef, {
            status: 'published',
            tiktokPostUrl: tiktokUrl,
            publishedAt: serverTimestamp()
        });
        toast({ title: "Post marked as published!"});
        setManualPublishPost(null);
        setTiktokUrl('');
    } catch(e: any) {
        toast({title: 'Error publishing post', description: e.message, variant: 'destructive'});
    }
  }


  if (loading) {
    return <div className="p-4 text-center">Loading posts...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive">Error loading posts. You might not have permission to view them.</div>;
  }

  return (
    <div>
        {isEditFormOpen && editingPost && (
             <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                    </DialogHeader>
                    <PostForm onSave={() => setIsEditFormOpen(false)} post={editingPost} />
                </DialogContent>
            </Dialog>
        )}

        {manualPublishPost && (
             <Dialog open={!!manualPublishPost} onOpenChange={() => setManualPublishPost(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manually Mark as Published</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>Paste the URL of the published TikTok post below.</p>
                        <Input 
                            value={tiktokUrl}
                            onChange={(e) => setTiktokUrl(e.target.value)}
                            placeholder="https://www.tiktok.com/@user/video/123..."
                        />
                        <Button onClick={handleManualPublish}>Confirm Publication</Button>
                    </div>
                </DialogContent>
             </Dialog>
        )}


      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Content</TableHead>
            <TableHead>Scheduled/Published</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length > 0 ? (
            posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <p className="font-medium truncate max-w-md">{post.content}</p>
                  {post.mediaUrl && <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View Media</a>}
                </TableCell>
                <TableCell>
                    {post.status === 'scheduled' && post.scheduledAt ? (
                        <span>{post.scheduledAt.toDate().toLocaleString()}</span>
                    ) : post.status === 'published' && post.publishedAt ? (
                        <span>{post.publishedAt.toDate().toLocaleString()}</span>
                    ) : (
                        'N/A'
                    )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {post.status === 'scheduled' && (
                        <Alert className="text-left text-sm p-2 mr-2 border-amber-500/50 text-amber-600 dark:text-amber-400">
                           <AlertDescription>
                            Manual publish required. Once posted, add the URL.
                           </AlertDescription>
                        </Alert>
                    )}
                    {post.tiktokPostUrl ? (
                         <Button variant="outline" size="sm" asChild>
                            <a href={post.tiktokPostUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-3 w-3" /> View on TikTok</a>
                        </Button>
                    ) : canManagePosts && (
                         <Button variant="outline" size="sm" onClick={() => setManualPublishPost(post)}>Mark as Published</Button>
                    )}
                    {canManagePosts && (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEdit(post)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(post.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No {status} posts found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
