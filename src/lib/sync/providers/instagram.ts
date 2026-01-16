
import type { SyncProvider, ProviderSyncResult, Post } from '../types';

const getSeed = (handle: string, dateStr: string): number => {
    let hash = 0;
    const combined = handle + dateStr;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};


class InstagramProvider implements SyncProvider {
    async sync(handle: string): Promise<ProviderSyncResult> {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const seed = getSeed(handle, dateStr);

        const dailyMetric = {
            followers: (seed % 15000) + 1000,
            totalViews: 0, // Instagram handles don't have total views in the same way
            totalEngagements: (seed % 30000) + 2000,
            profileViews: (seed % 8000) + 500,
        };

        const audienceSnapshot = {
            gender: {
                male: (seed % 45) + 10,
                female: (seed % 50) + 40,
                other: (seed % 5),
            },
            age: {
                "13-17": (seed % 10) + 5,
                "18-24": (seed % 25) + 20,
                "25-34": (seed % 30) + 25,
                "35-44": (seed % 20) + 10,
                "45+": (seed % 10) + 5,
            },
            countries: {
                ZA: (seed % 70) + 20,
                NG: (seed % 10) + 1,
                US: (seed % 5) + 1,
            }
        };

        const posts: Post[] = Array.from({ length: 3 }).map((_, i) => {
            const postSeed = getSeed(handle, `${dateStr}-${i}`);
            const postId = `${postSeed}`;
            return {
                id: postId,
                content: `Mock Instagram post #${i} for ${handle}`,
                mediaUrl: `https://picsum.photos/seed/${postId}/500/500`,
                publishedAt: new Date(today.getTime() - i * 24 * 60 * 60 * 1000), // a few days back
                metrics: {
                    views: (postSeed % 8000) + 500, // For IG, this could be "reach"
                    likes: (postSeed % 1000) + 50,
                    comments: (postSeed % 100) + 5,
                    shares: 0, // IG shares are not public
                    watchTime: 0,
                    videoLength: 0,
                }
            }
        });

        return { dailyMetric, audienceSnapshot, posts };
    }
}
export const instagramProvider = new InstagramProvider();
