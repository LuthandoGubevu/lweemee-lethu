
'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Edit, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { RecommendationForm } from './recommendation-form';
import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

type Status = 'todo' | 'in-progress' | 'done';
type Priority = 'low' | 'medium' | 'high';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  evidenceLinks?: string[];
  createdAt: { toDate: () => Date };
  createdBy: string;
  acknowledgedAt?: { toDate: () => Date };
  acknowledgedBy?: string;
}

interface Member {
    id: string;
    userId: string;
    role: 'admin' | 'consultant' | 'client' | 'viewer';
}

const priorityColors = {
    high: 'bg-red-500 hover:bg-red-500/90',
    medium: 'bg-yellow-500 hover:bg-yellow-500/90',
    low: 'bg-green-500 hover:bg-green-500/90',
};

export function RecommendationsList() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
  
  const { data: recommendations, loading, error } = useCollection<Recommendation>(
    currentWorkspaceId ? `workspaces/${currentWorkspaceId}/recommendations` : '',
    { orderBy: ['createdAt', 'desc'] }
  );

  const { data: members } = useCollection<Member>(
    currentWorkspaceId ? `workspaces/${currentWorkspaceId}/members` : ''
  );
  
  const currentUserMemberInfo = members.find(m => m.userId === user?.uid);
  const canManage = currentUserMemberInfo?.role === 'admin' || currentUserMemberInfo?.role === 'consultant';
  const canAcknowledge = currentUserMemberInfo?.role === 'client';

  const [editingRecommendation, setEditingRecommendation] = useState<Recommendation | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const handleEdit = (recommendation: Recommendation) => {
    setEditingRecommendation(recommendation);
    setIsEditFormOpen(true);
  };
  
  const handleDelete = async (recommendationId: string) => {
      if (!firestore || !currentWorkspaceId) return;
      try {
          await deleteDoc(doc(firestore, `workspaces/${currentWorkspaceId}/recommendations`, recommendationId));
          toast({title: "Recommendation deleted"});
      } catch (e: any) {
          toast({title: "Error deleting recommendation", description: e.message, variant: 'destructive'});
      }
  }

  const handleAcknowledge = async (recommendationId: string) => {
    if (!firestore || !currentWorkspaceId || !user) return;
     try {
        const recommendationRef = doc(firestore, `workspaces/${currentWorkspaceId}/recommendations`, recommendationId);
        await updateDoc(recommendationRef, {
            acknowledgedAt: serverTimestamp(),
            acknowledgedBy: user.uid,
        });
        toast({ title: "Recommendation acknowledged!"});
    } catch(e: any) {
        toast({title: 'Error acknowledging recommendation', description: e.message, variant: 'destructive'});
    }
  }

  if (loading) {
    return <div className="p-4 text-center">Loading recommendations...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive">Error loading recommendations. You might not have permission.</div>;
  }

  return (
    <div>
        {isEditFormOpen && editingRecommendation && (
             <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Edit Recommendation</DialogTitle>
                    </DialogHeader>
                    <RecommendationForm onSave={() => setIsEditFormOpen(false)} recommendation={editingRecommendation} />
                </DialogContent>
            </Dialog>
        )}

        {recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
                <h3 className="text-xl font-bold tracking-tight">No Recommendations Yet</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-4">Consultants can add recommendations here for the client to review.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {recommendations.map(rec => (
                    <Card key={rec.id}>
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-lg">{rec.title}</CardTitle>
                                <CardDescription>Created on {rec.createdAt?.toDate().toLocaleDateString()}</CardDescription>
                            </div>
                             <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="capitalize">{rec.status}</Badge>
                                <Badge className={`capitalize text-primary-foreground ${priorityColors[rec.priority]}`}>{rec.priority}</Badge>
                                {canManage && (
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleEdit(rec)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(rec.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                            {rec.evidenceLinks && rec.evidenceLinks.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">Evidence</h4>
                                    <div className="flex flex-col space-y-1 mt-1">
                                    {rec.evidenceLinks.map((link, i) => (
                                        <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">{link}</a>
                                    ))}
                                    </div>
                                </div>
                            )}
                            <div className="mt-4 flex items-center justify-between">
                                {rec.acknowledgedAt ? (
                                    <div className="text-sm text-green-600 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Acknowledged on {rec.acknowledgedAt.toDate().toLocaleDateString()}</span>
                                    </div>
                                ) : (
                                    canAcknowledge && <Button onClick={() => handleAcknowledge(rec.id)}>Acknowledge</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
    </div>
  );
}
