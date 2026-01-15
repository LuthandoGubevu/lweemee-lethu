
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddHandleForm } from '@/components/connections/add-handle-form';
import { ManualImport } from '@/components/connections/manual-import';
import { ConnectionList } from '@/components/connections/connection-list';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { usePlan } from '@/hooks/use-plan';
import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ConnectionsPage() {
    const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
    const { plan, usage, limits, loading } = usePlan();

    const canAddConnection = !limits || usage.connections < limits.connections;

    if (!currentWorkspaceId) {
      return (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
            <h3 className="text-xl font-bold tracking-tight">No workspace selected</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">Please select or create a workspace to manage connections.</p>
        </div>
      )
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold">Connections</h1>
        {!loading && plan && limits && (
            <div className="text-sm text-muted-foreground">
                <p>{plan} Plan</p>
                <p>{usage.connections} / {limits.connections} Connections</p>
            </div>
        )}
      </div>

      {!canAddConnection && (
          <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Connection Limit Reached</AlertTitle>
              <AlertDescription>
                  You have reached the maximum number of connections for the {plan} plan.
                  Please upgrade your plan to add more.
                   <Button variant="link" asChild><Link href="/dashboard/billing">Upgrade Plan</Link></Button>
              </AlertDescription>
          </Alert>
      )}

      <Tabs defaultValue="add_handle">
        <TabsList>
          <TabsTrigger value="add_handle">Add TikTok Handle</TabsTrigger>
          <TabsTrigger value="manual_import">Manual Import</TabsTrigger>
          <TabsTrigger value="oauth" disabled>
            Connect with TikTok (OAuth)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="add_handle">
          <Card>
            <CardHeader>
              <CardTitle>Connect via Handle</CardTitle>
              <CardDescription>
                Enter a public TikTok handle to start tracking its basic metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddHandleForm disabled={!canAddConnection}/>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="manual_import">
            <ManualImport />
        </TabsContent>
      </Tabs>

      <ConnectionList />
    </div>
  );
}
