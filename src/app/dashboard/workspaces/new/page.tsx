'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

const formSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters.'),
  industry: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewWorkspacePage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setCurrentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      industry: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!firestore || !user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a workspace.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
        const batch = writeBatch(firestore);

        // 1. Create the workspace document
        const workspaceRef = doc(collection(firestore, 'workspaces'));
        batch.set(workspaceRef, {
            name: data.name,
            ...(data.industry && { industry: data.industry }),
            createdAt: serverTimestamp(),
            ownerId: user.uid,
        });

        // 2. Add the user as an admin member
        const memberRef = doc(firestore, `workspaces/${workspaceRef.id}/members/${user.uid}`);
        batch.set(memberRef, {
            userId: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'admin',
        });
        
        // 3. Add workspace to user's workspace list for easy lookup
        const userWorkspaceRef = doc(firestore, `users/${user.uid}/workspaces/${workspaceRef.id}`);
        batch.set(userWorkspaceRef, {
            name: data.name,
            role: 'admin'
        });


        await batch.commit();

        toast({
            title: 'Workspace Created',
            description: `Successfully created ${data.name}.`,
        });

        setCurrentWorkspaceId(workspaceRef.id);
        router.push('/dashboard');

    } catch (error: any) {
      console.error('Error creating workspace:', error);
      toast({
        title: 'Error creating workspace',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Workspace</CardTitle>
        <CardDescription>
          Workspaces help you organize your TikTok accounts and collaborate with your team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My Awesome Brand" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Fashion, Tech, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Create Workspace
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
