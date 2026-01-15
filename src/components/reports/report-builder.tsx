
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DateRangePicker, DateRange } from '../measure/date-range-picker';
import { Switch } from '../ui/switch';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { addDays } from 'date-fns';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Loader } from 'lucide-react';

interface Connection {
  id: string;
  handle: string;
}

const reportBuilderSchema = z.object({
    connectionId: z.string().min(1, "Please select a TikTok handle."),
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }),
    includeOverview: z.boolean().default(true),
    includeContent: z.boolean().default(true),
    includeAudience: z.boolean().default(true),
    includeRecommendations: z.boolean().default(true),
});

type ReportBuilderValues = z.infer<typeof reportBuilderSchema>;


export function ReportBuilder() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: connections, loading: connectionsLoading } = useCollection<Connection>(
        currentWorkspaceId ? `workspaces/${currentWorkspaceId}/connections` : ''
    );

    const form = useForm<ReportBuilderValues>({
        resolver: zodResolver(reportBuilderSchema),
        defaultValues: {
            connectionId: '',
            dateRange: {
                from: addDays(new Date(), -29),
                to: new Date(),
            },
            includeOverview: true,
            includeContent: true,
            includeAudience: true,
            includeRecommendations: true,
        },
    });

    const onSubmit = async (values: ReportBuilderValues) => {
        if (!firestore || !user || !currentWorkspaceId) {
            toast({ title: "Error", description: "Must be in a workspace to generate a report.", variant: "destructive"});
            return;
        }

        setIsSubmitting(true);
        // This is a placeholder for triggering a Cloud Function.
        // In a real app, this would call a function that generates a PDF.
        try {
            const handle = connections.find(c => c.id === values.connectionId)?.handle || 'report';
            const reportName = `${handle}_${values.dateRange.from.toISOString().split('T')[0]}_${values.dateRange.to.toISOString().split('T')[0]}`;
            
            const reportsRef = collection(firestore, `workspaces/${currentWorkspaceId}/reports`);
            await addDoc(reportsRef, {
                name: reportName,
                status: 'generating',
                createdAt: serverTimestamp(),
                createdBy: user.uid,
                params: values, // Save the generation params
            });

            toast({
                title: "Report generation started",
                description: "Your report is being created in the background. It will appear in the list below when ready."
            });
            form.reset();
        } catch (e: any) {
            toast({ title: "Failed to start report generation.", description: e.message, variant: "destructive"})
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentWorkspaceId) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Report Builder</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Please select a workspace to build a report.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Report Builder</CardTitle>
                <CardDescription>Customize and generate a new PDF report.</CardDescription>
            </CardHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="connectionId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>TikTok Handle</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={connectionsLoading}>
                                        <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a handle" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {connections.map(c => <SelectItem key={c.id} value={c.id}>@{c.handle}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="dateRange"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date Range</FormLabel>
                                        <DateRangePicker date={field.value} onDateChange={field.onChange} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div>
                            <h3 className="mb-4 text-sm font-medium">Included Sections</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="includeOverview"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Overview KPIs</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="includeContent"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Content Performance</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="includeAudience"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Audience Insights</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="includeRecommendations"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Recommendations</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
                            Generate Report
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
