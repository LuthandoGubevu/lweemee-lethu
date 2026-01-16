
import type { SyncProvider, ProviderSyncResult, Post } from '../types';

// The existing logic from the API route, now as a provider.
class TikTokProvider implements SyncProvider {
    async sync(handle: string): Promise<ProviderSyncResult> {
        const today = new Date();

        const dailyMetric = {
            followers: Math.floor(Math.random() * 10000),
            totalViews: Math.floor(Math.random() * 500000),
            totalEngagements: Math.floor(Math.random() * 25000),
            profileViews: Math.floor(Math.random() * 5000),
        };

        const audienceSnapshot = {
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
        };

        // Generate a few mock posts
        const posts: Post[] = Array.from({ length: 3 }).map((_, i) => {
            const postId = `${handle}_${today.getTime()}_${i}`;
            return {
                id: postId,
                content: `This is a mock post #${i} for ${handle}`,
                mediaUrl: `https://picsum.photos/seed/${postId}/400/600`,
                tiktokPostUrl: `https://www.tiktok.com/@${handle}/video/${postId}`,
                publishedAt: today,
                metrics: {
                    views: Math.floor(Math.random() * 100000),
                    likes: Math.floor(Math.random() * 10000),
                    comments: Math.floor(Math.random() * 1000),
                    shares: Math.floor(Math.random() * 500),
                    watchTime: Math.floor(Math.random() * 30),
                    videoLength: Math.floor(Math.random() * 25) + 5,
                }
            }
        });

        return { dailyMetric, audienceSnapshot, posts };
    }
}

export const tiktokProvider = new TikTokProvider();
