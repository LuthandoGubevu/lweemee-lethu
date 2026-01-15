
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
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

type Status = 'todo' | 'in-progress' | 'done';
type Priority = 'low' | 'medium' | 'high';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  evidenceLinks?: string[];
  createdBy: string;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in-progress', 'done']),
  evidenceLinks: z.string().optional(),
});

type RecommendationFormProps = {
  recommendation?: Recommendation;
  onSave: () => void;
};

export function RecommendationForm({ recommendation, onSave }: RecommendationFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: recommendation?.title || '',
      description: recommendation?.description || '',
      priority: recommendation?.priority || 'medium',
      status: recommendation?.status || 'todo',
      evidenceLinks: recommendation?.evidenceLinks?.join(', ') || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !user || !currentWorkspaceId) {
      toast({ title: 'Error', description: 'User or workspace not found.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const recommendationData = {
        ...values,
        evidenceLinks: values.evidenceLinks ? values.evidenceLinks.split(',').map(s => s.trim()) : [],
        createdBy: recommendation?.createdBy || user.uid,
        createdAt: recommendation?.id ? undefined : serverTimestamp(), // only on create
        updatedAt: serverTimestamp(),
      };
      
      if (recommendation?.id) {
        // Update existing recommendation
        const recommendationRef = doc(firestore, `workspaces/${currentWorkspaceId}/recommendations`, recommendation.id);
        await setDoc(recommendationRef, recommendationData, { merge: true });
        toast({ title: 'Recommendation updated successfully' });
      } else {
        // Create new recommendation
        const recommendationsRef = collection(firestore, `workspaces/${currentWorkspaceId}/recommendations`);
        await addDoc(recommendationsRef, recommendationData);
        toast({ title: 'Recommendation created successfully' });
      }

      onSave();
    } catch (e: any) {
      toast({ title: 'Error saving recommendation', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Improve video hook" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Explain the recommendation in more detail." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
            <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
                <FormItem className="flex-1">
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
                <FormItem className="flex-1">
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="evidenceLinks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evidence Links (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Paste links, separated by commas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          {recommendation?.id ? 'Save Changes' : 'Create Recommendation'}
        </Button>
      </form>
    </Form>
  );
}
