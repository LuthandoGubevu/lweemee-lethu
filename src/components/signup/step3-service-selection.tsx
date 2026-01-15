'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  serviceType: z.enum(['platform', 'strategist', 'both'], {
    required_error: 'You need to select a service type.',
  }),
  managesMultipleBrands: z.boolean().optional(),
  brandCount: z.string().optional(),
  supportType: z.string().optional(),
  mainGoal: z.string().optional(),
  contactMethod: z.enum(['email', 'whatsapp']).optional(),
});

type Step3Props = {
  onSubmit: (data: any) => void;
  onBack: () => void;
};

export default function Step3ServiceSelection({ onSubmit, onBack }: Step3Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const serviceType = form.watch('serviceType');

  const handleFinalSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    await onSubmit(values);
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="serviceType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>I'm looking for...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <FormItem>
                    <FormControl>
                        <Card className={cn("p-4 cursor-pointer", field.value === 'platform' && "border-primary ring-2 ring-primary")}>
                            <RadioGroupItem value="platform" id="platform" className="sr-only"/>
                            <label htmlFor="platform" className="flex flex-col gap-2 cursor-pointer">
                                <FormLabel className="font-bold">Platform Access</FormLabel>
                                <FormDescription>
                                I want to use the Lweemee platform myself to view dashboards and reports.
                                </FormDescription>
                            </label>
                        </Card>
                    </FormControl>
                  </FormItem>
                  <FormItem>
                     <FormControl>
                        <Card className={cn("p-4 cursor-pointer", field.value === 'strategist' && "border-primary ring-2 ring-primary")}>
                            <RadioGroupItem value="strategist" id="strategist" className="sr-only"/>
                            <label htmlFor="strategist" className="flex flex-col gap-2 cursor-pointer">
                                <FormLabel className="font-bold">Strategist-Led Support</FormLabel>
                                <FormDescription>
                                I want expert support and strategic guidance without managing the tool.
                                </FormDescription>
                            </label>
                        </Card>
                    </FormControl>
                  </FormItem>
                   <FormItem>
                     <FormControl>
                        <Card className={cn("p-4 cursor-pointer", field.value === 'both' && "border-primary ring-2 ring-primary")}>
                            <RadioGroupItem value="both" id="both" className="sr-only"/>
                            <label htmlFor="both" className="flex flex-col gap-2 cursor-pointer">
                                <FormLabel className="font-bold">Both</FormLabel>
                                <FormDescription>
                                I want platform access plus strategist support.
                                </FormDescription>
                            </label>
                        </Card>
                    </FormControl>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {(serviceType === 'platform' || serviceType === 'both') && (
            <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-medium">Platform Details</h3>
                 <FormField
                    control={form.control}
                    name="managesMultipleBrands"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Are you managing multiple brands/clients?</FormLabel>
                             <RadioGroup
                                onValueChange={(val) => field.onChange(val === 'true')}
                                defaultValue={String(field.value)}
                                className="flex gap-4"
                                >
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl><RadioGroupItem value="true" id="yes" /></FormControl>
                                    <FormLabel htmlFor="yes" className="font-normal">Yes</FormLabel>
                                </FormItem>
                                 <FormItem className="flex items-center space-x-2">
                                    <FormControl><RadioGroupItem value="false" id="no" /></FormControl>
                                    <FormLabel htmlFor="no" className="font-normal">No</FormLabel>
                                </FormItem>
                             </RadioGroup>
                        </FormItem>
                    )}
                 />
                 {form.watch('managesMultipleBrands') && (
                     <FormField
                        control={form.control}
                        name="brandCount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>How many brands/accounts will you manage?</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a number" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="2-3">2-3</SelectItem>
                                        <SelectItem value="4-10">4-10</SelectItem>
                                        <SelectItem value="11+">11+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                 )}
            </div>
        )}

        {(serviceType === 'strategist' || serviceType === 'both') && (
            <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-medium">Support Details</h3>
                 <FormField
                    control={form.control}
                    name="supportType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>What kind of support do you need?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a support type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="one-off">One-off insights</SelectItem>
                                    <SelectItem value="monthly">Monthly guidance</SelectItem>
                                    <SelectItem value="partnership">Ongoing partnership</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="mainGoal"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>What's your main goal right now?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a goal" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="reach">More views/reach</SelectItem>
                                    <SelectItem value="engagement">Better engagement</SelectItem>
                                    <SelectItem value="direction">Content direction</SelectItem>
                                    <SelectItem value="campaign">Campaign performance</SelectItem>
                                    <SelectItem value="client-reporting">Reporting & insights for clients</SelectItem>
                                </SelectContent>
                            </Select>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="contactMethod"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Preferred contact method</FormLabel>
                             <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex gap-4"
                                >
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl><RadioGroupItem value="email" id="email" /></FormControl>
                                    <FormLabel htmlFor="email" className="font-normal">Email</FormLabel>
                                </FormItem>
                                 <FormItem className="flex items-center space-x-2">
                                    <FormControl><RadioGroupItem value="whatsapp" id="whatsapp" /></FormControl>
                                    <FormLabel htmlFor="whatsapp" className="font-normal">WhatsApp</FormLabel>
                                </FormItem>
                             </RadioGroup>
                             <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
        )}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </div>
      </form>
    </Form>
  );
}
