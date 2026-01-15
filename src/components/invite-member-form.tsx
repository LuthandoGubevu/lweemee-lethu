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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'consultant', 'client', 'viewer']),
});

export function InviteMemberForm() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [currentWorkspaceId] = useLocalStorage('currentWorkspaceId', null);

  const form = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'client',
    },
  });

  const onSubmit = async (values: z.infer<typeof inviteSchema>) => {
    if (!firestore || !currentWorkspaceId || !user) {
      toast({
        title: 'Error',
        description: 'Could not invite member. Workspace or user not found.',
        variant: 'destructive',
      });
      return;
    }
    
    // This is a simplified invite flow. A production app would use a Cloud Function
    // to send an email and securely add the user.
    // For this MVP, we'll find the user by email and add them directly.
    try {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("email", "==", values.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({ title: "User not found", description: "No user exists with that email address.", variant: 'destructive' });
            return;
        }

        const invitedUser = querySnapshot.docs[0].data();
        const invitedUserId = querySnapshot.docs[0].id;

        const membersRef = collection(firestore, `workspaces/${currentWorkspaceId}/members`);
        await addDoc(membersRef, {
            userId: invitedUserId,
            email: invitedUser.email,
            displayName: invitedUser.displayName,
            photoURL: invitedUser.photoURL,
            role: values.role,
        });

        // Also add the workspace to the invited user's list
        const userWorkspaceRef = doc(firestore, `users/${invitedUserId}/workspaces`, currentWorkspaceId);
        const workspaceDoc = await getDoc(doc(firestore, "workspaces", currentWorkspaceId));

        await setDoc(userWorkspaceRef, {
            name: workspaceDoc.data()?.name,
            role: values.role
        });

        toast({
            title: 'Member Invited',
            description: `${invitedUser.email} has been added to the workspace.`,
        });
        form.reset();

    } catch (error: any) {
        toast({
            title: 'Invite Failed',
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Send Invitation</Button>
      </form>
    </Form>
  );
}
