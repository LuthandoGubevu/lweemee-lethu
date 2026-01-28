
import { db } from '@/lib/firebase-admin';
import { format } from 'date-fns';
import { providers } from './providers';
import type { Connection } from '@/app/dashboard/connections/ConnectionDetailsDrawer';

export async function syncConnection(workspaceId: string, connectionId: string): Promise<void> {
    if (!db) {
        throw new Error('Firebase Admin SDK is not initialized. Check server environment variables.');
    }
    
    const { Timestamp } = await import('firebase-admin/firestore');

    const connectionRef = db.doc(`workspaces/${workspaceId}/connections/${connectionId}`);
    const connectionSnap = await connectionRef.get();

    if (!connectionSnap.exists) {
        throw new Error('Connection not found');
    }

    const connection = connectionSnap.data() as Connection;
    const platform = connection.platform || 'tiktok'; // Default to tiktok for legacy data

    const provider = providers[platform];
    if (!provider) {
        throw new Error(`No sync provider found for platform: ${platform}`);
    }

    console.log(`[Sync Service] Starting sync for ${connection.handle} (${platform})`);

    const { dailyMetric, audienceSnapshot, posts } = await provider.sync(connection.handle);

    const batch = db.batch();

    // 1. Update connection document
    batch.update(connectionRef, {
        status: 'active',
        lastSyncAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastError: null
    });

    const today = format(new Date(), 'yyyy-MM-dd');

    // 2. Write daily metric
    const dailyMetricRef = db.doc(`workspaces/${workspaceId}/connections/${connectionId}/dailyMetrics/${today}`);
    batch.set(dailyMetricRef, {
        ...dailyMetric,
        date: today,
        platform,
    }, { merge: true });

    // 3. Write audience snapshot
    const audienceSnapshotRef = db.doc(`workspaces/${workspaceId}/connections/${connectionId}/audienceSnapshots/${today}`);
    batch.set(audienceSnapshotRef, {
        ...audienceSnapshot,
        date: today,
        platform,
    }, { merge: true });

    // 4. Write post metrics for each post
    let postsWritten = 0;
    for (const post of posts) {
        // Create the post document
        const postRef = db.doc(`workspaces/${workspaceId}/posts/${post.id}`);
        batch.set(postRef, {
            content: post.content,
            mediaUrl: post.mediaUrl,
            status: 'published',
            publishedAt: post.publishedAt,
            createdAt: Timestamp.now(),
            createdBy: 'sync-service', // Or associate with a system user
            platform: platform,
            connectionId: connectionId,
            ...(post.tiktokPostUrl && { tiktokPostUrl: post.tiktokPostUrl })
        }, { merge: true });
        
        // Create the post metrics document
        const postMetricRef = db.doc(`workspaces/${workspaceId}/postMetrics/${post.id}`);
        batch.set(postMetricRef, {
            ...post.metrics,
            platform,
            lastUpdated: Timestamp.now(),
        }, { merge: true });
        postsWritten++;
    }

    await batch.commit();
    console.log(`[Sync Service] Sync complete for ${connection.handle}. Wrote ${2 + (postsWritten * 2)} documents.`);
}
