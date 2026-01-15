
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { usePlan } from "@/hooks/use-plan";
import { Button } from "@/components/ui/button";
import { Check, Loader, ShieldAlert } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { Progress } from "@/components/ui/progress";
import { useUser, useCollection } from '@/firebase';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface Member {
    id: string;
    userId: string;
    role: 'admin' | 'consultant' | 'client' | 'viewer';
}

export default function BillingPage() {
    const { user } = useUser();
    const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);

    const { data: members, loading: membersLoading } = useCollection<Member>(
        currentWorkspaceId ? `workspaces/${currentWorkspaceId}/members` : ''
    );
    
    // Defer fetching plan data until we confirm the user is an admin.
    const currentUserMemberInfo = members.find(m => m.userId === user?.uid);
    const isAdmin = !!user && !!currentUserMemberInfo && currentUserMemberInfo.role === 'admin';
    
    const { plan, limits, usage, loading: planLoading } = usePlan(isAdmin);

    if (membersLoading || (isAdmin && planLoading)) {
        return <div className="flex justify-center items-center h-full"><Loader className="h-8 w-8 animate-spin" /></div>
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-destructive/50 p-12 text-center h-full">
                <ShieldAlert className="h-12 w-12 text-destructive" />
                <h3 className="text-xl font-bold tracking-tight text-destructive mt-4">Access Denied</h3>
                <p className="text-sm text-muted-foreground mt-2">Only workspace administrators can manage billing.</p>
            </div>
        )
    }

    const currentPlan = Object.values(PLANS).find(p => p.name === plan);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Billing & Plan</h1>
                <p className="text-muted-foreground">Manage your subscription and view your current usage.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Plan: {plan}</CardTitle>
                    <CardDescription>
                        {currentPlan?.id === 'Partnership' ? "You are on the top-tier plan with maximum benefits." : "You can upgrade your plan to unlock more features and increase your limits."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Current Usage</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1 text-sm">
                                    <span className="font-medium">Connections</span>
                                    <span className="text-muted-foreground">{usage.connections} / {limits?.connections}</span>
                                </div>
                                <Progress value={limits ? (usage.connections / limits.connections) * 100 : 0} />
                            </div>
                             <div>
                                <div className="flex justify-between mb-1 text-sm">
                                    <span className="font-medium">Reports this month</span>
                                    <span className="text-muted-foreground">{usage.reports} / {limits?.reports === -1 ? 'Unlimited' : limits?.reports}</span>
                                </div>
                                {limits?.reports !== -1 && <Progress value={limits ? (usage.reports / limits.reports) * 100 : 0} />}
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                     <Button disabled>Upgrade Plan (Coming Soon)</Button>
                </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {Object.values(PLANS).map(p => (
                     <Card key={p.id} className={p.name === plan ? "border-primary" : ""}>
                         <CardHeader>
                             <CardTitle>{p.name}</CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-4">
                             <div className="text-3xl font-bold">
                                 {p.id === 'Starter' ? 'R9,500' : p.id === 'Growth' ? 'R22,000' : 'R42,000'}
                                 <span className="text-sm font-normal text-muted-foreground">{p.id === 'Starter' ? ' / project' : ' / month'}</span>
                             </div>
                             <ul className="space-y-2 text-sm text-muted-foreground">
                                 <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {p.limits.connections} TikTok Connection(s)</li>
                                 <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {p.limits.reports === -1 ? 'Unlimited' : p.limits.reports} Reports/month</li>
                                 <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Full tracking & listening</li>
                             </ul>
                         </CardContent>
                         <CardFooter>
                             <Button className="w-full" variant={p.name === plan ? "default" : "outline"} disabled>
                                 {p.name === plan ? 'Current Plan' : 'Select Plan'}
                            </Button>
                         </CardFooter>
                     </Card>
                 ))}
            </div>
        </div>
    )
}
