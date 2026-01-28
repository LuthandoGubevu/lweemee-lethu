
import { NextResponse } from 'next/server';
import { db, auth as adminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { syncConnection } from '@/lib/sync/sync-service';

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
        if (!adminAuth) {
            throw new Error('Firebase Admin Auth not initialized.');
        }
        // 1. Verify user token
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const userId = decodedToken.uid;

        if (!db) {
            throw new Error('Firestore not initialized.');
        }

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
        
        // 3. Call the new sync service
        await syncConnection(workspaceId, connectionId);

        return NextResponse.json({ message: 'Sync successful' });

    } catch (error: any) {
        console.error(`[API] Sync failed for connection ${connectionId} in workspace ${workspaceId}:`, error);
        
        // Update connection to show error status
        if (workspaceId && connectionId && db) {
            const connectionRef = db.doc(`workspaces/${workspaceId}/connections/${connectionId}`);
            await connectionRef.update({
                status: 'error',
                lastError: {
                    message: error.message || 'An unknown error occurred during sync.',
                    code: error.code || 'SYNC_FAILED',
                    at: Timestamp.now()
                },
                updatedAt: Timestamp.now()
            }).catch(console.error); // Best effort, don't let this fail the main error response
        }

        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Unauthorized: Token expired' }, { status: 401 });
        }
        
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
