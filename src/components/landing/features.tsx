import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    value: 'tracking',
    title: 'Advanced Handle Tracking',
    description: 'Monitor what matters. Track views, likes, shares, follower growth, and more for any public TikTok handle. See your performance and benchmark against competitors.',
    imageId: 'tiktok-tracking',
  },
  {
    value: 'listening',
    title: 'AI-Powered Social Listening',
    description: 'Tune into the conversation. Our tool identifies trending topics, hashtags, and sounds relevant to your brand in South Africa. Understand comment sentiment at scale with our AI-powered analysis.',
    imageId: 'social-listening',
  },
  {
    value: 'reports',
    title: 'Clear, Customizable Reports',
    description: 'Clarity on demand. Generate beautiful, easy-to-understand reports that summarize key metrics, trends, and growth opportunities. Perfect for sharing with stakeholders.',
    imageId: 'custom-reports',
  },
  {
    value: 'notes',
    title: 'Expert Consultant Notes',
    description: 'Insights, not just data. Each report comes with expert observations and actionable recommendations from our team, helping you bridge the gap between analytics and action.',
    imageId: 'consultant-notes',
  },
];

export function Features() {
  const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

  return (
    <section id="features" className="w-full py-20 md:py-24 lg:py-32 bg-primary/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Everything You Need to Win on TikTok
          </h2>
          <p className="mt-4 text-foreground/80 md:text-xl">
            Our platform is packed with powerful features to give you a competitive edge.
          </p>
        </div>
        <div className="mt-12">
          <Tabs defaultValue="tracking" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="listening">Listening</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="notes">Consultant Notes</TabsTrigger>
            </TabsList>
            {features.map((feature) => {
              const image = getImage(feature.imageId);
              return (
                <TabsContent key={feature.value} value={feature.value}>
                  <Card className="mt-6 border-0 shadow-none bg-transparent">
                    <CardContent className="space-y-2 p-0">
                      <div className="grid gap-8 md:grid-cols-2 md:items-center">
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold font-headline">{feature.title}</h3>
                          <p className="text-foreground/80">{feature.description}</p>
                        </div>
                        {image && (
                           <div className="overflow-hidden rounded-lg">
                             <Image
                               alt={feature.title}
                               src={image.imageUrl}
                               width={1200}
                               height={900}
                               className="object-cover transition-transform hover:scale-105"
                               data-ai-hint={image.imageHint}
                             />
                           </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
