
'use client';
import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import { PLANS, type Plan, type PlanId } from '@/lib/plans';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface BillingInfo {
    plan: PlanId;
    status: 'active' | 'inactive' | 'trialing';
}

export function usePlan() {
    const firestore = useFirestore();
    const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);

    const { data: billingInfo, loading: billingLoading } = useDoc<BillingInfo>(
        currentWorkspaceId ? `workspaces/${currentWorkspaceId}/billing/config` : ''
    );

    const { data: connections, loading: connectionsLoading } = useCollection<{id: string}>(
        currentWorkspaceId ? `workspaces/${currentWorkspaceId}/connections` : ''
    );
    
    const [reportsCount, setReportsCount] = useState(0);
    const [reportsLoading, setReportsLoading] = useState(true);

    useEffect(() => {
        const fetchReportCount = async () => {
            if (!firestore || !currentWorkspaceId) {
                setReportsLoading(false);
                return;
            };

            // This should ideally be handled by a counter in the billing doc updated by a Cloud Function
            // For MVP, we'll count docs from the start of the month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const reportsQuery = query(
                collection(firestore, `workspaces/${currentWorkspaceId}/reports`),
                where('createdAt', '>=', startOfMonth)
            );
            
            setReportsLoading(true);
            const snapshot = await getDocs(reportsQuery);
            setReportsCount(snapshot.size);
            setReportsLoading(false);
        }
        fetchReportCount();

    }, [currentWorkspaceId, firestore]);

    const planId = billingInfo?.plan || 'Starter';
    const plan = PLANS[planId];

    const usage = {
        connections: connections.length,
        reports: reportsCount,
    }

    return {
        plan: plan?.name,
        limits: plan?.limits,
        usage,
        loading: billingLoading || connectionsLoading || reportsLoading,
    };
}
