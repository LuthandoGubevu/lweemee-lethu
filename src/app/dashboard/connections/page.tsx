'use client';

import { useState, useMemo, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { usePlan } from '@/hooks/use-plan';
import { useFirestore, useCollection, useUser } from '@/firebase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddHandleForm } from '@/components/connections/add-handle-form';
import { ManualImport } from '@/components/connections/manual-import';
import { AlertTriangle, Info, MoreHorizontal, Trash2, Clapperboard, Camera, PlusCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { AddConnectionModal } from './AddConnectionModal';

interface Connection {
  id: string;
  handle: string;
  connectionType: 'handle' | 'oauth' | 'manual';
  createdAt: {
    toDate: () => Date;
  };
  platform?: 'tiktok' | 'instagram';
  status?: 'pending' | 'active' | 'error';
}

interface Member {
    id: string;
    userId: string;
    role: 'admin' | 'consultant' | 'client' | 'viewer';
}

const PLATFORM_META = {
    tiktok: { label: "TikTok", icon: <Clapperboard className="h-5 w-5" />, platformKey: 'tiktok' },
    instagram: { label: "Instagram", icon: <Camera className="h-5 w-5" />, platformKey: 'instagram' }
}

function normalizeConnection(connection: Connection) {
    const platformKey = connection.platform || 'tiktok';
    return PLATFORM_META[platformKey] || PLATFORM_META.tiktok;
}


export default function ConnectionsPage() {
    const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
    const { plan, usage, limits, loading: planLoading } = usePlan();
    const [filter, setFilter] = useState<'all' | 'tiktok' | 'instagram'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleFormRef = useRef<HTMLDivElement>(null);
    const importFormRef = useRef<HTMLDivElement>(null);

    const canAddConnection = !limits || usage.connections < limits.connections;

    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const { data: connections, loading: connectionsLoading, error } = useCollection<Connection>(
      currentWorkspaceId ? `workspaces/${currentWorkspaceId}/connections` : ''
    );

    const { data: members } = useCollection<Member>(
      currentWorkspaceId ? `workspaces/${currentWorkspaceId}/members` : ''
    );

    const currentUserMemberInfo = members.find(m => m.userId === user?.uid);
    const canManageConnections = currentUserMemberInfo?.role === 'admin' || currentUserMemberInfo?.role === 'consultant';

    const filteredConnections = useMemo(() => {
        if (filter === 'all') {
            return connections;
        }
        return connections.filter(conn => {
            const { platformKey } = normalizeConnection(conn);
            return platformKey === filter;
        });
    }, [connections, filter]);
    
    const handleMethodSelect = (platform: 'tiktok' | 'instagram', method: 'handle' | 'import') => {
       if (method === 'handle') {
           setFilter(platform);
           setTimeout(() => handleFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
       } else if (method === 'import') {
           importFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
       }
    };

    const handleDelete = async (connectionId: string) => {
      if (!firestore || !currentWorkspaceId) return;

      try {
        await deleteDoc(doc(firestore, `workspaces/${currentWorkspaceId}/connections`, connectionId));
        toast({ title: 'Connection removed' });
      } catch (e: any) {
        toast({ title: 'Error removing connection', description: e.message, variant: 'destructive'});
      }
    }

    if (!currentWorkspaceId) {
      return (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
            <h3 className="text-xl font-bold tracking-tight">No workspace selected</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">Please select or create a workspace to manage connections.</p>
        </div>
      )
    }

    const renderEmptyState = () => {
        let title = "No accounts connected yet.";
        let description = "Add a handle or username to start tracking.";

        if (filter === 'instagram') {
            title = "No Instagram accounts connected yet.";
            description = "Add an Instagram username to start tracking.";
        } else if (filter === 'tiktok') {
            title = "No TikTok accounts connected yet.";
            description = "Add a TikTok handle to start tracking.";
        }

        return (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    <p className="font-medium">{title}</p>
                    <p className="text-muted-foreground">{description}</p>
                </TableCell>
            </TableRow>
        );
    }
    
    const platformForForm = filter === 'instagram' ? 'instagram' : 'tiktok';
    const isInstagramForm = platformForForm === 'instagram';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">Connections</h1>
                  <p className="text-muted-foreground">Manage your connected TikTok and Instagram accounts.</p>
                </div>

                <div className="flex items-center gap-4">
                    {!planLoading && plan && limits && (
                        <div className="text-sm text-muted-foreground text-right">
                            <p>{plan} Plan</p>
                            <p>{usage.connections} / {limits.connections} Connections</p>
                        </div>
                    )}
                     <Button onClick={() => setIsAddModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Connection
                    </Button>
                </div>
            </div>

            <AddConnectionModal 
                isOpen={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onComplete={handleMethodSelect}
            />

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

            <div ref={handleFormRef}>
                <Card>
                    <CardHeader>
                    <CardTitle>
                        {isInstagramForm ? 'Connect Instagram via Username' : 'Connect TikTok via Handle'}
                    </CardTitle>
                    <CardDescription>
                        {isInstagramForm
                            ? 'Enter the public Instagram username (without @).'
                            : 'Enter a public TikTok username (without @).'}
                         {' '}Select the platform via the "Add Connection" button.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <AddHandleForm
                        disabled={!canAddConnection}
                        platform={platformForForm}
                    />
                    </CardContent>
                </Card>
            </div>

            <div ref={importFormRef}>
                <ManualImport />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Connected Accounts</CardTitle>
                    <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="pt-4">
                        <TabsList>
                            <TabsTrigger value="all">All ({connections.length})</TabsTrigger>
                            <TabsTrigger value="tiktok">TikTok ({connections.filter(c => normalizeConnection(c).platformKey === 'tiktok').length})</TabsTrigger>
                            <TabsTrigger value="instagram">Instagram ({connections.filter(c => normalizeConnection(c).platformKey === 'instagram').length})</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-destructive">Error loading connections: You might not have permission to view this.</p>}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Platform</TableHead>
                                <TableHead>Handle</TableHead>
                                <TableHead>Connection Type</TableHead>
                                <TableHead>Connected On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {connectionsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Loading connections...
                                    </TableCell>
                                </TableRow>
                            ) : filteredConnections.length > 0 ? (
                                filteredConnections.map((conn) => {
                                    const platform = normalizeConnection(conn);
                                    return (
                                        <TableRow key={conn.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {platform.icon}
                                                    <Badge variant="outline">{platform.label}</Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">@{conn.handle}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="capitalize">{conn.connectionType.replace('_', ' ')}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {conn.createdAt?.toDate().toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {canManageConnections && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleDelete(conn.id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                renderEmptyState()
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
