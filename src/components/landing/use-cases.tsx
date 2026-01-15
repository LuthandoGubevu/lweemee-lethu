import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Briefcase, BarChart3 } from 'lucide-react';

const useCases = [
  {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    role: 'For Brands & Founders',
    description: 'Align your content with business goals, understand your audience better, and prove your marketing ROI with clear, data-driven insights.',
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    role: 'For Marketing Managers',
    description: 'Simplify your reporting, track campaign success accurately, and get ahead of the next big trend in your industry before it even peaks.',
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    role: 'For Consultants & Agencies',
    description: 'Deliver exceptional value to clients with deeper insights, data-backed strategies, and professional reporting that showcases your expertise.',
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="w-full py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Designed for Your Role
          </h2>
          <p className="mt-4 text-foreground/80 md:text-xl">
            Lweemee empowers strategic decision-makers across the board.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-1 md:grid-cols-3">
          {useCases.map((useCase) => (
            <Card key={useCase.role} className="flex flex-col text-left shadow-lg transition-transform hover:scale-105 hover:shadow-xl">
              <CardHeader>
                 <div className="mb-4 rounded-full bg-primary/10 p-3 self-start">
                  {useCase.icon}
                </div>
                <CardTitle className="font-headline">{useCase.role}</CardTitle>
                <CardDescription className="pt-2">
                  {useCase.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
