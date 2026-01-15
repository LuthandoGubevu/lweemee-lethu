'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  businessName: z.string().min(2, 'Business name is required.'),
  role: z.string().min(1, 'Please select your role.'),
  industry: z.string().min(1, 'Please select your industry.'),
  country: z.string().min(1, 'Please select your country.'),
  teamSize: z.string().min(1, 'Please select your team size.'),
  websiteOrInstagram: z.string().optional(),
});

type Step2Props = {
  onNext: (data: any) => void;
  onBack: () => void;
};

export default function Step2BusinessDetails({ onNext, onBack }: Step2Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: '',
      role: '',
      industry: '',
      country: 'South Africa',
      teamSize: '',
      websiteOrInstagram: '',
    },
  });

  const roles = ['Founder', 'Social Media Manager', 'Marketing Manager', 'Consultant/Agency', 'Other'];
  const industries = ['Beauty', 'Food', 'Retail', 'Services', 'Tech', 'Education', 'Media/Podcast', 'Other'];
  const teamSizes = ['1', '2-5', '6-10', '11-25', '26+'];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business / Brand Name</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Brand" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select an industry" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="teamSize"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Team Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select team size" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {teamSizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <FormField
          control={form.control}
          name="websiteOrInstagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website or Instagram (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="www.example.com or @yourhandle" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
}
