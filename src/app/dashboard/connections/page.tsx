
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

export default function ConnectionsPage() {
    const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);

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
      <h1 className="text-2xl font-bold">Connections</h1>
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
              <AddHandleForm />
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
