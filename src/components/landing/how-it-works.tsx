import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plug, Search, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: <Plug className="h-8 w-8 text-primary" />,
    title: 'Connect Your World',
    description: "Easily connect your TikTok account via our 'Handle Mode' or use Manual Import. Our platform is designed for flexibility, respecting TikTok's data access policies.",
  },
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: 'Uncover Insights',
    description: 'Our proprietary tool tracks key metrics and listens to conversations, while our AI analyzes sentiment to tell you what your audience truly thinks.',
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: 'Act with Confidence',
    description: 'Receive clear reports and consultant-grade notes that translate complex data into actionable content strategies for measurable growth.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-20 md:py-24 lg:py-32 bg-primary/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            From Data to Decision in 3 Simple Steps
          </h2>
          <p className="mt-4 text-foreground/80 md:text-xl">
            Our streamlined process makes it easy to turn complex TikTok data into clear, actionable strategies.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-1 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={index} className="flex flex-col items-center text-center shadow-lg transition-transform hover:scale-105 hover:shadow-xl">
              <CardHeader className="items-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  {step.icon}
                </div>
                <CardTitle className="font-headline">{step.title}</CardTitle>
                <CardDescription className="pt-2">
                  {step.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
