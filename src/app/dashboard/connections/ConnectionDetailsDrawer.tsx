
'use client';
import { useState } from 'react';
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription,
    SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clapperboard, Camera, Loader, AlertCircle } from 'lucide-react';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Define the connection type locally as it's used across files
export interface Connection {
  id: string;
  handle: string;
  connectionType: 'handle' | 'oauth' | 'manual';
  createdAt: { toDate: () => Date };
  updatedAt?: { toDate: () => Date };
  platform?: 'tiktok' | 'instagram';
  status?: 'pending' | 'active' | 'error';
  lastSyncAt?: { toDate: () => Date };
  lastError?: { message: string; code?: string; at: { toDate: () => Date } };
}

const PLATFORM_META = {
    tiktok: { label: "TikTok", icon: <Clapperboard className="h-5 w-5" /> },
    instagram: { label: "Instagram", icon: <Camera className="h-5 w-5" /> }
};

interface ConnectionDetailsDrawerProps {
    connection: Connection | null;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function ConnectionDetailsDrawer({ connection, isOpen, onOpenChange }: ConnectionDetailsDrawerProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
    const [isSyncing, setIsSyncing] = useState(false);

    if (!connection) return null;

    const platformMeta = PLATFORM_META[connection.platform || 'tiktok'];

    const handleSyncNow = async () => {
        if (!connection || !user || !currentWorkspaceId) {
            toast({ title: "Error", description: "Not logged in or no workspace selected.", variant: "destructive" });
            return;
        }

        setIsSyncing(true);
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/sync-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    workspaceId: currentWorkspaceId,
                    connectionId: connection.id,
                }),
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type") || "";
                let errorMessage;

                if (contentType.includes("application/json")) {
                    const errorData = await response.json();
                    errorMessage = errorData.details || errorData.error || "An unknown JSON error occurred.";
                } else {
                    const textResponse = await response.text();
                    errorMessage = `Expected JSON response, but received '${contentType}'. Check server logs. Response: ${textResponse.slice(0, 200)}...`;
                }
                
                toast({ 
                    title: `Sync Failed (Status: ${response.status})`, 
                    description: errorMessage, 
                    variant: "destructive",
                    duration: 9000,
                });

            } else {
                toast({ title: "Sync started", description: "Connection is being updated in the background." });
                onOpenChange(false); // Only close drawer on success
            }

        } catch (error: any) {
            toast({ title: "Sync Request Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSyncing(false);
        }
    };
    
    const getStatusVariant = (status?: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'error': return 'destructive';
            default: return 'secondary';
        }
    }


    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        {platformMeta.icon}
                        <span>@{connection.handle}</span>
                        <Badge variant={getStatusVariant(connection.status)} className="capitalize">{connection.status || 'pending'}</Badge>
                    </SheetTitle>
                    <SheetDescription>
                        Details and actions for this connection.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-4">
                    <div className="text-sm">
                        <span className="font-medium text-muted-foreground w-28 inline-block">Platform</span>
                        <span className="font-semibold">{platformMeta.label}</span>
                    </div>
                     <div className="text-sm">
                        <span className="font-medium text-muted-foreground w-28 inline-block">Method</span>
                        <span className="font-semibold capitalize">{connection.connectionType}</span>
                    </div>
                     <div className="text-sm">
                        <span className="font-medium text-muted-foreground w-28 inline-block">Connected On</span>
                        <span className="font-semibold">{connection.createdAt.toDate().toLocaleDateString()}</span>
                    </div>
                     <div className="text-sm">
                        <span className="font-medium text-muted-foreground w-28 inline-block">Last Synced</span>
                        <span className="font-semibold">{connection.lastSyncAt ? connection.lastSyncAt.toDate().toLocaleString() : 'Not yet synced'}</span>
                    </div>

                    {connection.status === 'error' && connection.lastError && (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                            <h4 className="font-semibold text-destructive flex items-center gap-2"><AlertCircle size={16}/>Last Error</h4>
                            <p className="text-sm text-destructive/90 mt-2 font-mono">{connection.lastError.message}</p>
                            {connection.lastError.at && <p className="text-xs text-destructive/70 mt-1">{connection.lastError.at.toDate().toLocaleString()}</p>}
                        </div>
                    )}
                </div>
                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    <Button onClick={handleSyncNow} disabled={isSyncing}>
                        {isSyncing && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Sync Now
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
