
'use client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useCollection } from '@/firebase';
import { useEffect, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PostCard } from './post-card';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

interface Post {
  id: string;
  content: string;
  mediaUrl?: string;
  status: PostStatus;
  scheduledAt?: { toDate: () => Date };
  publishedAt?: { toDate: () => Date };
  tiktokPostUrl?: string;
  createdBy: string;
}

interface PostMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime: number; // in seconds
  videoLength: number; // in seconds
}

export interface EnhancedPost extends Post {
  metrics?: PostMetrics;
}

type SortOption = 'publishedAt' | 'views' | 'likes' | 'watchTime';


export function ContentPerformance() {
  const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
  const firestore = useFirestore();
  const [posts, setPosts] = useState<EnhancedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('publishedAt');

  useEffect(() => {
    const fetchPostsAndMetrics = async () => {
      if (!currentWorkspaceId || !firestore) return;

      setLoading(true);
      setError(null);
      try {
        // 1. Fetch all published posts
        const postsQuery = query(
          collection(firestore, `workspaces/${currentWorkspaceId}/posts`),
          where('status', '==', 'published')
        );
        const postsSnapshot = await getDocs(postsQuery);
        const publishedPosts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

        if (publishedPosts.length === 0) {
            setPosts([]);
            setLoading(false);
            return;
        }

        // 2. Fetch metrics for all published posts
        const postIds = publishedPosts.map(p => p.id);
        const metricsQuery = query(
            collection(firestore, `workspaces/${currentWorkspaceId}/postMetrics`),
            where('__name__', 'in', postIds)
        );
        const metricsSnapshot = await getDocs(metricsQuery);
        const metricsMap = new Map<string, PostMetrics>();
        metricsSnapshot.forEach(doc => {
            metricsMap.set(doc.id, doc.data() as PostMetrics);
        });
        
        // 3. Combine posts with their metrics
        const enhancedPosts: EnhancedPost[] = publishedPosts.map(post => ({
            ...post,
            metrics: metricsMap.get(post.id)
        }));

        setPosts(enhancedPosts);

      } catch (err: any) {
        console.error("Error fetching content performance:", err);
        setError("Failed to load content performance. You may not have permission.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostsAndMetrics();
  }, [currentWorkspaceId, firestore]);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
        switch (sortOption) {
            case 'views':
                return (b.metrics?.views || 0) - (a.metrics?.views || 0);
            case 'likes':
                return (b.metrics?.likes || 0) - (a.metrics?.likes || 0);
            case 'watchTime':
                return (b.metrics?.watchTime || 0) - (a.metrics?.watchTime || 0);
            case 'publishedAt':
            default:
                const dateA = a.publishedAt?.toDate()?.getTime() || 0;
                const dateB = b.publishedAt?.toDate()?.getTime() || 0;
                return dateB - dateA;
        }
    });
  }, [posts, sortOption]);

  const performanceTiers = useMemo(() => {
    if (posts.length < 2) return { top10: 0, bottom25: Infinity };

    const views = posts.map(p => p.metrics?.views || 0).sort((a, b) => b - a);
    const watchTimes = posts.map(p => p.metrics?.watchTime || 0).sort((a, b) => b - a);
    const likes = posts.map(p => p.metrics?.likes || 0).sort((a, b) => a - b); // ascending

    const top10Index = Math.floor(posts.length * 0.1);
    const bottom25Index = Math.floor(posts.length * 0.25);
    
    return {
        top10Views: views[top10Index],
        top25WatchTime: watchTimes[bottom25Index],
        bottom25Likes: likes[bottom25Index],
    };
  }, [posts]);


  if (loading) {
    return <p>Loading content...</p>;
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }
  
  return (
    <div>
        <div className="flex justify-end mb-4">
             <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="publishedAt">Most Recent</SelectItem>
                    <SelectItem value="views">Top Views</SelectItem>
                    <SelectItem value="likes">Top Likes</SelectItem>
                    <SelectItem value="watchTime">Top Watch Time</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {posts.length === 0 ? (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
                <h3 className="text-xl font-bold tracking-tight">No Published Content</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-4">There are no published posts with metrics yet. Publish some content to see its performance here.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedPosts.map(post => (
                    <PostCard key={post.id} post={post} performanceTiers={performanceTiers} />
                ))}
            </div>
        )}
    </div>
  );
}
