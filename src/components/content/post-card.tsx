
'use client';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import type { EnhancedPost } from './content-performance';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface PostCardProps {
    post: EnhancedPost;
    performanceTiers: {
        top10Views: number;
        top25WatchTime: number;
        bottom25Likes: number;
    }
}

const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

export function PostCard({ post, performanceTiers }: PostCardProps) {
    const { content, mediaUrl, metrics } = post;
    const placeholderImage = PlaceHolderImages.find(img => img.id === 'post-thumbnail');

    const badges = [];
    if (metrics) {
        if (metrics.views >= performanceTiers.top10Views && performanceTiers.top10Views > 0) {
            badges.push({ label: 'Top Performer', variant: 'default', icon: <TrendingUp className="mr-1 h-3 w-3" /> });
        }
        if (metrics.watchTime >= performanceTiers.top25WatchTime && performanceTiers.top25WatchTime > 0) {
            badges.push({ label: 'High Watch Time', variant: 'secondary', icon: <Clock className="mr-1 h-3 w-3" /> });
        }
        if (metrics.likes <= performanceTiers.bottom25Likes) {
            badges.push({ label: 'Low Engagement', variant: 'destructive', icon: <TrendingDown className="mr-1 h-3 w-3" /> });
        }
    }


  return (
    <Card className="overflow-hidden">
        <div className="relative aspect-[9/16] w-full bg-muted">
            <Image
                src={mediaUrl || placeholderImage?.imageUrl || "https://picsum.photos/seed/1/400/600"}
                alt={content}
                layout="fill"
                objectFit="cover"
                data-ai-hint={placeholderImage?.imageHint}
            />
            <div className="absolute top-2 left-2 flex flex-wrap gap-2">
                {badges.map(b => (
                    <Badge key={b.label} variant={b.variant as any} className="flex items-center">
                        {b.icon}
                        {b.label}
                    </Badge>
                ))}
            </div>
        </div>
      <CardContent className="p-4">
        <p className="truncate text-sm font-medium">{content}</p>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{formatNumber(metrics?.views || 0)}</span>
            </div>
             <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{formatNumber(metrics?.likes || 0)}</span>
            </div>
             <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{metrics?.watchTime?.toFixed(1) || 0}s</span>
            </div>
        </div>
        {post.publishedAt && (
             <p className="text-xs text-muted-foreground mt-2">
                Published on {post.publishedAt.toDate().toLocaleDateString()}
             </p>
        )}
      </CardContent>
    </Card>
  );
}
