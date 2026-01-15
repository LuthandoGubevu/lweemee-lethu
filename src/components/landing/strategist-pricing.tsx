import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Badge } from '../ui/badge';

const tiers = [
  {
    name: 'Insights Access',
    price: 'R3,500',
    period: 'once-off',
    description: 'For small businesses that need clarity, fast.',
    features: [
      'Social media audit (1–2 platforms)',
      'High-level performance & engagement review',
      'Content, tone & messaging assessment',
      'Audience & engagement insights',
      '5 clear, prioritised recommendations',
      'Perfect for founders managing their own social media',
    ],
    outcome: '“I finally understand what’s happening and what to fix first.”',
    cta: 'Get Insights',
    isPrimary: false,
  },
  {
    name: 'Strategic Growth & Guidance',
    price: 'R5,500',
    period: 'per month',
    description: 'Ongoing strategist support for small teams ready to improve.',
    features: [
      'Everything in Insights Access',
      'Monthly performance & audience review',
      'Strategic content & messaging direction',
      'Clear guidance on what to focus on next',
      'One monthly strategy call or voice-note summary',
      'Email or WhatsApp support for quick questions',
    ],
    outcome: '“I know exactly what to focus on each month.”',
    cta: 'Work With a Strategist',
    isPrimary: true,
  },
  {
    name: 'Strategic Partnership',
    price: 'R8,500',
    period: 'per month',
    description: 'A hands-on strategist supporting your decisions month to month.',
    features: [
        'Everything in Strategic Growth',
        'Deeper campaign & launch guidance',
        'Trend & audience behaviour insights',
        'Ongoing strategic advisory',
        'Priority support & flexible check-ins',
        'Leadership-level summaries and recommendations',
    ],
    outcome: '“I make better decisions with expert insight on hand.”',
    cta: 'Become a Partner',
    isPrimary: false,
  },
];

export function StrategistPricing() {
  return (
    <section id="strategist-pricing" className="w-full py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Strategist-Led Support
          </h2>
          <p className="mt-4 text-foreground/80 md:text-xl">
            We use the tools. You get the clarity, direction, and expert guidance — without dashboards, data, or software to manage.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl items-start gap-8 md:grid-cols-3">
           {tiers.map((tier) => (
            <Card key={tier.name} className={`relative flex flex-col ${tier.isPrimary ? 'border-primary ring-2 ring-primary shadow-2xl' : 'shadow-lg'}`}>
                {tier.isPrimary && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">RECOMMENDED</Badge>
                )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {tier.price}
                  </span>
                  <span className="text-sm text-muted-foreground"> · {tier.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-3 text-left">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-primary mt-1" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm italic text-muted-foreground text-center pt-4">
                    {tier.outcome}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" variant={tier.isPrimary ? 'default' : 'outline'}>
                  {tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8 space-y-2">
             <p className="text-xs text-muted-foreground">All prices are in South African Rand (ZAR) and exclude VAT.</p>
             <p className="text-xs text-muted-foreground">These services are strategist-led and done for you. You do not need access to the Lweemee platform to benefit from this support.</p>
        </div>
      </div>
    </section>
  );
}
