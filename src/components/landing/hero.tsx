
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40 text-black">
       <Image
          src="/background.jpg"
          alt="Abstract background"
          layout="fill"
          objectFit="cover"
          className="z-0"
          data-ai-hint="abstract purple"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-primary/30 z-10"></div>
      <div className="container relative z-20 mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-black/10 px-3 py-1 text-sm font-medium text-black">
            TikTok Insights for the South African Market
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
            Stop Guessing. <span className="text-primary">Start Growing.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-black/80 md:text-xl">
            Lweemee is the TikTok-first insights platform for South African brands, creators, and consultants who want to make smarter content decisions.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Get a Demo
            </Button>
            <Button size="lg" variant="outline" className="bg-background/50 border-border text-foreground hover:bg-background/80 hover:text-foreground">
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
