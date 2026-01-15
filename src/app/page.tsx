import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { KeySellingPoints } from "@/components/landing/ksp";
import { UseCases } from "@/components/landing/use-cases";
import { Pricing } from "@/components/landing/pricing";
import { AddOns } from "@/components/landing/add-ons";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { SentimentDemo } from "@/components/landing/sentiment-demo";

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
        <Pricing />
        <AddOns />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
