import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { KeySellingPoints } from "@/components/landing/ksp";
import { UseCases } from "@/components/landing/use-cases";
import { Pricing } from "@/components/landing/pricing";
import { StrategistPricing } from "@/components/landing/strategist-pricing";
import { AddOns } from "@/components/landing/add-ons";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { SentimentDemo } from "@/components/landing/sentiment-demo";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <KeySellingPoints />
        <Features />
        <SentimentDemo />
        <UseCases />
        
        <section className="w-full py-20 md:py-24">
           <div className="container mx-auto px-4 md:px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                        Two Ways to Work With Lweemee
                    </h2>
                    <p className="mt-4 text-foreground/80 md:text-xl">
                        Choose between a self-serve insights platform or hands-on strategist-led support. Some clients use one. Some use both.
                    </p>
                </div>
           </div>
        </section>

        <Pricing />

        <div className="container mx-auto px-4 md:px-6">
            <Card className="mx-auto max-w-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
                <p className="font-bold mb-2">Not sure which to choose?</p>
                <ul className="space-y-2 list-disc list-inside text-left">
                    <li>Choose the <span className="font-semibold">Platform</span> if you want hands-on access to data and reports.</li>
                    <li>Choose <span className="font-semibold">Strategist-Led Consulting</span> if you want clarity, direction, and expert input — without managing tools.</li>
                    <li>Some clients start with consulting and add the platform later.</li>
                </ul>
            </Card>
        </div>

        <StrategistPricing />
        <AddOns />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
