
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

export function usePlan(enabled: boolean = true) {
    const firestore = useFirestore();
    const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);

    const { data: billingInfo, loading: billingLoading, error: billingError } = useDoc<BillingInfo>(
        currentWorkspaceId && enabled ? `workspaces/${currentWorkspaceId}/billing/config` : ''
    );

    const { data: connections, loading: connectionsLoading } = useCollection<{id: string}>(
        currentWorkspaceId && enabled ? `workspaces/${currentWorkspaceId}/connections` : ''
    );
    
    const [reportsCount, setReportsCount] = useState(0);
    const [reportsLoading, setReportsLoading] = useState(true);

    useEffect(() => {
        if (!enabled) {
            setReportsLoading(false);
            return;
        }

        const fetchReportCount = async () => {
            if (!firestore || !currentWorkspaceId ) {
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
            try {
                const snapshot = await getDocs(reportsQuery);
                setReportsCount(snapshot.size);
            } catch (error) {
                console.error("Failed to fetch report count:", error);
            } finally {
                setReportsLoading(false);
            }
        }
        fetchReportCount();

    }, [currentWorkspaceId, firestore, enabled]);

    const planId = billingInfo?.plan || 'Starter';
    const plan = PLANS[planId];

    const usage = {
        connections: connections.length,
        reports: reportsCount,
    }

    if (!enabled) {
        return {
            plan: null,
            limits: null,
            usage: { connections: 0, reports: 0},
            loading: false,
        }
    }
    
    // If there's a billing error (like permission denied), but we are supposed to be enabled,
    // we should still return loading state until the calling component handles the non-admin case.
    const isLoading = billingLoading || connectionsLoading || reportsLoading;


    return {
        plan: plan?.name,
        limits: plan?.limits,
        usage,
        loading: isLoading,
    };
}
