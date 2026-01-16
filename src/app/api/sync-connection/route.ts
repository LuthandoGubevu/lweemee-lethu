import { NextResponse } from 'next/server';
import { db, auth as adminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { format } from 'date-fns';

export async function POST(request: Request) {
    const { workspaceId, connectionId } = await request.json();
    const authorization = request.headers.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    if (!idToken) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token format' }, { status: 401 });
    }

    if (!workspaceId || !connectionId) {
        return NextResponse.json({ error: 'Missing workspaceId or connectionId' }, { status: 400 });
    }

    try {
        // 1. Verify user token
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const userId = decodedToken.uid;

        // 2. Check user's role in the workspace
        const memberRef = db.doc(`workspaces/${workspaceId}/members/${userId}`);
        const memberDoc = await memberRef.get();

        if (!memberDoc.exists) {
            return NextResponse.json({ error: 'Forbidden: User is not a member of this workspace' }, { status: 403 });
        }
        
        const memberData = memberDoc.data();
        const userRole = memberData?.role;

        if (userRole !== 'admin' && userRole !== 'consultant') {
            return NextResponse.json({ error: 'Forbidden: User does not have permission to sync connections' }, { status: 403 });
        }
        
        // 3. Update the connection document (and write stub metrics)
        const connectionRef = db.doc(`workspaces/${workspaceId}/connections/${connectionId}`);
        const connectionSnap = await connectionRef.get();
        if (!connectionSnap.exists) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
        }

        const batch = db.batch();

        // Update connection
        batch.update(connectionRef, {
            status: 'active',
            lastSyncAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            lastError: null
        });

        // Write stub daily metric
        const today = format(new Date(), 'yyyy-MM-dd');
        const dailyMetricRef = db.doc(`workspaces/${workspaceId}/connections/${connectionId}/dailyMetrics/${today}`);
        batch.set(dailyMetricRef, {
            date: today,
            followers: Math.floor(Math.random() * 10000),
            totalViews: Math.floor(Math.random() * 500000),
            totalEngagements: Math.floor(Math.random() * 25000),
            profileViews: Math.floor(Math.random() * 5000),
        }, { merge: true });

        // Write stub audience snapshot
        const audienceSnapshotRef = db.doc(`workspaces/${workspaceId}/connections/${connectionId}/audienceSnapshots/${today}`);
        batch.set(audienceSnapshotRef, {
            date: today,
            gender: {
                male: Math.random() * 100,
                female: Math.random() * 100,
                other: Math.random() * 5,
            },
            age: {
                "13-17": Math.random() * 15,
                "18-24": Math.random() * 35,
                "25-34": Math.random() * 30,
                "35-44": Math.random() * 15,
                "45+": Math.random() * 5,
            },
            countries: {
                ZA: Math.random() * 80 + 10,
                NG: Math.random() * 10,
                GB: Math.random() * 5,
            }
        }, { merge: true });


        await batch.commit();

        return NextResponse.json({ message: 'Sync successful' });

    } catch (error: any) {
        console.error('Sync failed:', error);
        
        // Update connection to show error status
        if (workspaceId && connectionId) {
            const connectionRef = db.doc(`workspaces/${workspaceId}/connections/${connectionId}`);
            await connectionRef.update({
                status: 'error',
                lastError: {
                    message: error.message || 'An unknown error occurred during sync.',
                    code: error.code || 'UNKNOWN',
                    at: Timestamp.now()
                },
                updatedAt: Timestamp.now()
            }).catch(console.error);
        }

        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Unauthorized: Token expired' }, { status: 401 });
        }
        
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
