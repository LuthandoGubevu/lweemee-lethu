
export type PlanId = 'Starter' | 'Growth' | 'Partnership';

export interface Plan {
    id: PlanId;
    name: string;
    limits: {
        workspaces: number;
        connections: number;
        reports: number; // -1 for unlimited
    }
}

export const PLANS: Record<PlanId, Plan> = {
    Starter: {
        id: 'Starter',
        name: 'Starter',
        limits: {
            workspaces: 1,
            connections: 1,
            reports: 1,
        }
    },
    Growth: {
        id: 'Growth',
        name: 'Growth',
        limits: {
            workspaces: 1,
            connections: 3,
            reports: 5,
        }
    },
    Partnership: {
        id: 'Partnership',
        name: 'Partnership',
        limits: {
            workspaces: 10,
            connections: 10,
            reports: -1, // Unlimited
        }
    }
}
