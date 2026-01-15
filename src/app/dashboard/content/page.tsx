
'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { ContentPerformance } from '@/components/content/content-performance';

export default function ContentPage() {
    const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);

    if (!currentWorkspaceId) {
      return (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
            <h3 className="text-xl font-bold tracking-tight">No workspace selected</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">Please select or create a workspace to see content performance.</p>
        </div>
      )
  }

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold">Content Performance</h1>
        <ContentPerformance />
    </div>
  );
}
