import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Badge } from '../ui/badge';

const tiers = [
  {
    name: 'Insights Access',
    price: 'R9,500',
    period: 'once-off',
    for: 'Perfect for one-off projects, campaign reviews, or a deep-dive analysis.',
    features: [
      'Platform access for one project',
      'Full tracking & listening features',
      'Final report with consultant notes',
    ],
    cta: 'Get Project Insights',
    isPrimary: false,
  },
  {
    name: 'Strategy + Platform Insights',
    price: 'R22,000',
    period: '/ month',
    for: 'Ideal for brands and creators needing ongoing insights and strategic guidance.',
    features: [
      'Everything in Insights Access',
      'Continuous monitoring',
      'Monthly strategy sessions',
      'Priority support',
    ],
    cta: 'Start Platform Plan',
    isPrimary: true,
  },
  {
    name: 'Insights + Platform Partnership',
    price: 'R42,000',
    period: '/ month',
    for: 'Our full-service partnership for agencies and businesses requiring comprehensive support.',
    features: [
      'Everything in Strategy+',
      'Dedicated consultant',
      'Bespoke report generation',
      'Team onboarding & training',
    ],
    cta: 'Access Platform',
    isPrimary: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="w-full py-20 md:py-24 lg:py-32 bg-primary/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Lweemee Insights Platform
          </h2>
          <p className="mt-4 text-foreground/80 md:text-xl">
            Self-serve software for tracking, listening, and reporting.
          </p>
          <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto">
            This is a tool you use yourself. You get access to dashboards, tracking, listening, and downloadable reports. Best for teams who want data on demand and are comfortable working inside a platform.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl items-start gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.name} className={`flex flex-col ${tier.isPrimary ? 'border-primary ring-2 ring-primary shadow-2xl' : 'shadow-lg'}`}>
               <CardHeader className="text-center relative">
                 <Badge variant="secondary" className="absolute top-2 right-2">Platform Access</Badge>
                <CardTitle className="text-2xl font-headline pt-4">{tier.name}</CardTitle>
                <CardDescription>{tier.for}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {tier.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" variant={tier.isPrimary ? 'default' : 'outline'}>
                  {tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
