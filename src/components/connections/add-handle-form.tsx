'use client';

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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  handle: z.string()
    .trim()
    .min(2, 'Handle must be at least 2 characters.')
    .refine(val => !val.startsWith('@'), { message: "Handle should not start with '@'" })
    .transform(val => val.toLowerCase()),
});

export function AddHandleForm({ disabled, platform = 'tiktok' }: { disabled?: boolean, platform?: 'tiktok' | 'instagram' }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [currentWorkspaceId] = useLocalStorage('currentWorkspaceId', null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      handle: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !currentWorkspaceId || !user) {
      toast({
        title: 'Error',
        description: 'Could not add handle. Workspace or user not found.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const connectionsRef = collection(
        firestore,
        `workspaces/${currentWorkspaceId}/connections`
      );
      await addDoc(connectionsRef, {
        handle: values.handle,
        connectionType: 'handle',
        platform: platform,
        status: 'pending',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      const platformName = platform === 'tiktok' ? 'TikTok' : 'Instagram';
      const description = platform === 'instagram'
        ? `@${values.handle} has been added and is pending sync.`
        : `@${values.handle} is now being tracked.`;
      
      toast({
        title: `${platformName} Account Added`,
        description: description,
      });
      form.reset();
    } catch (error: any) {
      toast({
        title: 'Failed to add handle',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const platformName = platform === 'tiktok' ? 'TikTok' : 'Instagram';
  const handleName = platform === 'tiktok' ? 'Handle' : 'Username';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="handle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{platformName} {handleName}</FormLabel>
              <FormControl>
                <Input placeholder="e.g., lweemeeofficial" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting || disabled}>
          {form.formState.isSubmitting ? 'Adding...' : `Add ${handleName}`}
        </Button>
      </form>
    </Form>
  );
}
