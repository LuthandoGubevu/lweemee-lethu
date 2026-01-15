
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
import { useFirestore } from '@/firebase';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  handle: z.string().min(2, 'Handle must be at least 2 characters.').refine(val => !val.startsWith('@'), { message: "Handle should not start with '@'" }),
});

export function AddHandleForm({ disabled }: { disabled?: boolean }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [currentWorkspaceId] = useLocalStorage('currentWorkspaceId', null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      handle: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !currentWorkspaceId) {
      toast({
        title: 'Error',
        description: 'Could not add handle. Workspace not found.',
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
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Handle Added',
        description: `@${values.handle} is now being tracked.`,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="handle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TikTok Handle</FormLabel>
              <FormControl>
                <Input placeholder="e.g., mybrand" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting || disabled}>
          {form.formState.isSubmitting ? 'Adding...' : 'Add Handle'}
        </Button>
      </form>
    </Form>
  );
}
