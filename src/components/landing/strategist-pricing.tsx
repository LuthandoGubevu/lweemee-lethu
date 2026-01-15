import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const includedFeatures = [
    'We track and review your social media performance using our insights tools',
    'Monthly performance and audience review',
    'Clear, plain-language guidance on what’s working and what’s not',
    'Strategic content and messaging direction',
    'Priority, actionable recommendations (not dashboards or data dumps)',
    'One monthly strategy call or voice-note summary',
    'WhatsApp or email support for quick questions',
];

export function StrategistPricing() {
  return (
    <section id="strategist-pricing" className="w-full py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Strategist-Led Support (We Use the Tools — You Get the Guidance)
          </h2>
          <p className="mt-4 text-foreground/80 md:text-xl">
            For small business owners who want clarity, direction, and expert input — without learning or managing software.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-2xl items-start gap-8">
            <Card className="flex flex-col border-primary ring-2 ring-primary shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">Strategist-Led Insights Support</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    R5,500
                  </span>
                  <span className="text-sm text-muted-foreground"> / month</span>
                </div>
                 <CardDescription className="pt-2">Expert strategy, powered by insights tools — managed entirely on your behalf.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-8">
                <ul className="space-y-3 text-left">
                  {includedFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-primary mt-1" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-lg border bg-muted/50 p-6 text-center">
                    <p className="text-lg font-medium italic text-foreground">“I don’t have to figure this out alone. I know what to focus on each month.”</p>
                </div>
                
                <div>
                    <h4 className="font-semibold text-center mb-2">What this is not:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 text-center">
                        <li>• No platform access required</li>
                        <li>• No dashboards to learn</li>
                        <li>• No daily posting or content creation</li>
                    </ul>
                </div>

              </CardContent>
              <CardFooter className="flex-col">
                <Button className="w-full" size="lg">
                  Work With a Strategist
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                    Perfect for small businesses that want guidance, not another tool.
                </p>
              </CardFooter>
            </Card>
        </div>
        <div className="text-center mt-8">
             <p className="text-xs text-muted-foreground">All prices are in South African Rand (ZAR) and exclude VAT.</p>
        </div>
      </div>
    </section>
  );
}
