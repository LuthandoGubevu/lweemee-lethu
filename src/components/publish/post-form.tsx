
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, doc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

interface Post {
  id: string;
  content: string;
  mediaUrl?: string;
  status: PostStatus;
  scheduledAt?: { toDate: () => Date };
  createdBy: string;
}

const formSchema = z.object({
  content: z.string().min(1, 'Content is required.'),
  media: z.any().optional(),
  scheduledAt: z.date().optional(),
});

type PostFormProps = {
  post?: Post;
  onSave: () => void;
};

export function PostForm({ post, onSave }: PostFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: post?.content || '',
      scheduledAt: post?.scheduledAt?.toDate(),
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !user || !currentWorkspaceId) {
      toast({ title: 'Error', description: 'User or workspace not found.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      let mediaUrl = post?.mediaUrl || '';
      const file = values.media?.[0];
      
      if (file) {
        const storage = getStorage();
        const storagePath = `posts/${currentWorkspaceId}/${user.uid}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadResult = await uploadBytes(storageRef, file);
        mediaUrl = await getDownloadURL(uploadResult.ref);
      }

      const postData = {
        content: values.content,
        mediaUrl: mediaUrl,
        status: values.scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: values.scheduledAt ? Timestamp.fromDate(values.scheduledAt) : null,
        createdBy: post?.createdBy || user.uid,
        createdAt: post?.id ? undefined : serverTimestamp(), // only on create
        updatedAt: serverTimestamp(),
      };
      
      if (post?.id) {
        // Update existing post
        const postRef = doc(firestore, `workspaces/${currentWorkspaceId}/posts`, post.id);
        await setDoc(postRef, postData, { merge: true });
        toast({ title: 'Post updated successfully' });
      } else {
        // Create new post
        const postsRef = collection(firestore, `workspaces/${currentWorkspaceId}/posts`);
        await addDoc(postsRef, postData);
        toast({ title: 'Post created successfully' });
      }

      onSave();
    } catch (e: any) {
      toast({ title: 'Error saving post', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caption</FormLabel>
              <FormControl>
                <Textarea placeholder="What's on your mind for this post?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="media"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>Media (Video/Image)</FormLabel>
              <FormControl>
                <Input type="file" onChange={(e) => onChange(e.target.files)} {...rest} />
              </FormControl>
               {post?.mediaUrl && !value?.[0] && (
                 <FormDescription>
                    <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View current media</a>
                </FormDescription>
               )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scheduledAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Schedule (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                If you schedule, it will require manual publishing at the scheduled time.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          {post?.id ? 'Save Changes' : 'Create Post'}
        </Button>
      </form>
    </Form>
  );
}

