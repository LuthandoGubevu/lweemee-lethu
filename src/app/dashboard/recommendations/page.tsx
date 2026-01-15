
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Lightbulb } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RecommendationForm } from '@/components/recommendations/recommendation-form';
import { RecommendationsList } from '@/components/recommendations/recommendations-list';
import { useUser, useCollection } from '@/firebase';

interface Member {
    id: string;
    userId: string;
    role: 'admin' | 'consultant' | 'client' | 'viewer';
}

export default function RecommendationsPage() {
    const { user } = useUser();
    const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: members } = useCollection<Member>(
        currentWorkspaceId ? `workspaces/${currentWorkspaceId}/members` : ''
    );
    
    const currentUserMemberInfo = members.find(m => m.userId === user?.uid);
    const canManageRecommendations = currentUserMemberInfo?.role === 'admin' || currentUserMemberInfo?.role === 'consultant';

    if (!currentWorkspaceId) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
            <h3 className="text-xl font-bold tracking-tight">No workspace selected</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">Please select a workspace to manage recommendations.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Recommendations</h1>
                {canManageRecommendations && (
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Recommendation
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>Create a New Recommendation</DialogTitle>
                        </DialogHeader>
                        <RecommendationForm onSave={() => setIsFormOpen(false)} />
                    </DialogContent>
                    </Dialog>
                )}
            </div>

            <RecommendationsList />
            
        </div>
    )
}
