import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function FinalCta() {
  return (
    <section className="w-full py-20 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Ready to Transform Your TikTok Strategy?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Go from posting in the dark to creating with confidence. Let's build a content plan that works.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Book Your Discovery Call
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
