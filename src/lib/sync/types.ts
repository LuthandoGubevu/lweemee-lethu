
export interface PostMetric {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime: number;
  videoLength: number;
}

export interface Post {
  id: string;
  content: string;
  mediaUrl: string;
  tiktokPostUrl?: string;
  publishedAt: Date;
  metrics: PostMetric;
}

export interface DailyMetric {
  followers: number;
  totalViews: number;
  totalEngagements: number;
  profileViews: number;
}

export interface AudienceSnapshot {
  gender: { male: number; female: number; other: number };
  age: { [key: string]: number };
  countries: { [key: string]: number };
}

export interface ProviderSyncResult {
  dailyMetric: DailyMetric;
  audienceSnapshot: AudienceSnapshot;
  posts: Post[];
}

export interface SyncProvider {
  sync(handle: string): Promise<ProviderSyncResult>;
}
