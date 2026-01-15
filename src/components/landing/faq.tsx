import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    question: "How do you get TikTok data without the official API?",
    answer: "Great question! For our MVP, we use two primary methods: 'Handle Mode' for tracking public metrics of specific accounts and 'Manual Import' where you can upload your own data exports. This ensures we operate respectfully within TikTok's guidelines without scraping. We are actively pursuing official API access for even deeper integration.",
  },
  {
    question: "Is this tool only for TikTok?",
    answer: "Yes, for now. We believe that winning on TikTok requires a dedicated focus. Our entire platform is purpose-built to provide the deepest possible insights for this unique channel.",
  },
  {
    question: "Who is Lweemee for?",
    answer: "Lweemee is designed for South African consultants, agencies, brands, and creators who are serious about making data-informed content decisions to drive growth on TikTok.",
  },
  {
    question: "What makes this different from TikTok's own analytics?",
    answer: "TikTok Analytics is great for raw data. Lweemee adds crucial layers on top: competitor benchmarking, AI-powered sentiment analysis on comments, trend listening, and most importantly, consultant-grade insights to tell you *what to do* with the data.",
  },
  {
    question: "What does 'Lweemee' mean?",
    answer: "Lweemee is derived from the Zulu word 'ulwimi', meaning 'tongue' or 'language'. It represents our mission to help you understand the language of your audience and the platform.",
  },
  {
    question: "Can I try it for free?",
    answer: "We don't offer a free trial due to the hands-on, consultant-led nature of our higher tiers. However, our 'Insights Access' plan is a great, low-commitment way to experience the power of the platform on a single project.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="w-full py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-foreground/80 md:text-xl">
            Have questions? We've got answers.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-foreground/80">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
