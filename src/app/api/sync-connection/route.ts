

import { NextResponse, type NextRequest } from 'next/server';
import { db, auth as adminAuth } from '@/lib/firebase-admin';
import { syncConnection } from '@/lib/sync/sync-service';

export async function POST(request: NextRequest) {
    try {
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
        const workspaceId = request.nextUrl.searchParams.get('workspaceId');
        const connectionId = request.nextUrl.searchParams.get('connectionId');

        console.error(`[API] Sync failed for connection ${connectionId} in workspace ${workspaceId}:`, error);
        
        // Best-effort attempt to update the connection status to error.
        if (workspaceId && connectionId && db) {
             try {
                const { Timestamp } = await import('firebase-admin/firestore');
                const connectionRef = db.doc(`workspaces/${workspaceId}/connections/${connectionId}`);
                await connectionRef.update({
                    status: 'error',
                    lastError: {
                        message: error.message || 'An unknown error occurred during sync.',
                        code: error.code || 'SYNC_FAILED',
                        at: Timestamp.now()
                    },
                    updatedAt: Timestamp.now()
                });
             } catch (dbError) {
                 console.error(`[API] Failed to update connection status to 'error' after initial failure:`, dbError);
             }
        }

        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Unauthorized: Token expired', details: error.message }, { status: 401 });
        }
        
        return NextResponse.json({ error: 'Internal Server Error', details: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}
