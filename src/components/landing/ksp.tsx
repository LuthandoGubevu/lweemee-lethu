import { CheckCircle2 } from 'lucide-react';

const advantages = [
  "Finally understand what content *actually* works.",
  "Save hours on data interpretation with clear, automated reports.",
  "Identify trends and relevant conversations before they peak.",
  "Get a clear view of campaign performance, beyond vanity metrics.",
  "Receive consultant-grade notes to guide your next move.",
  "Built for the South African market, with local context.",
  "Make confident, insight-led decisions that drive measurable growth.",
  "Stop the scroll. Start with strategy.",
];

export function KeySellingPoints() {
  return (
    <section id="ksp" className="w-full py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            The Lweemee Advantage
          </h2>
          <p className="mt-4 text-foreground/80 md:text-xl">
            We bridge the gap between raw data and real-world results.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
          {advantages.map((advantage, index) => (
            <div key={index} className="flex items-start gap-4">
              <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <p className="text-foreground/90">{advantage}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
