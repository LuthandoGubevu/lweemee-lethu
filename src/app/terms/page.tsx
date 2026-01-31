'use client'; // To allow using new Date() without hydration errors

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfUsePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="mx-auto max-w-4xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline text-center">
                Terms of Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-foreground/80">
              <p className="text-center text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              
              <p>
                Welcome to Lweemee. By accessing or using our website, application, or services (“Services”), you agree to be bound by these Terms of Use (“Terms”). If you do not agree, please do not use Lweemee.
              </p>

              <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">1. About Lweemee</h2>
                    <p>
                    Lweemee is a platform that allows users to connect social media accounts (such as Instagram, Threads, and TikTok) to analyze performance, sync data, and view insights.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">2. Eligibility</h2>
                    <p>
                    You must be at least 18 years old and legally able to enter into a binding agreement to use Lweemee.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">3. User Accounts</h2>
                    <ul className="list-disc space-y-2 pl-6">
                    <li>You are responsible for maintaining the security of your account.</li>
                    <li>You agree to provide accurate and up-to-date information.</li>
                    <li>You are responsible for all activity that occurs under your account.</li>
                    </ul>
                </div>
                
                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">4. Connected Social Accounts</h2>
                    <p>By connecting a social media account, you confirm that:</p>
                    <ul className="list-disc space-y-2 pl-6">
                    <li>You own or have permission to access the account.</li>
                    <li>You authorize Lweemee to retrieve, process, and store data from the platform solely to provide the Services.</li>
                    <li>Lweemee does not post or act on your behalf without explicit permission.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">5. Use of Data</h2>
                    <ul className="list-disc space-y-2 pl-6">
                    <li>Data collected is used only to provide analytics, insights, and platform functionality.</li>
                    <li>Lweemee does not sell user data.</li>
                    <li>Use of third-party platforms is subject to their own terms and policies.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">6. Acceptable Use</h2>
                    <p>You agree not to:</p>
                    <ul className="list-disc space-y-2 pl-6">
                    <li>Use Lweemee for unlawful or fraudulent purposes.</li>
                    <li>Attempt to reverse engineer, disrupt, or abuse the Services.</li>
                    <li>Circumvent platform limits or third-party API restrictions.</li>
                    </ul>
                </div>
                
                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">7. Service Availability</h2>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Lweemee is provided “as is” and “as available.”</li>
                        <li>We do not guarantee uninterrupted service, accuracy of analytics, or availability of third-party integrations.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">8. Termination</h2>
                    <p>
                    We may suspend or terminate access to Lweemee at any time if you violate these Terms or misuse the Services.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">9. Intellectual Property</h2>
                    <p>
                    All trademarks, logos, software, and content related to Lweemee are owned by Lweemee or its licensors. You may not copy or reuse them without permission.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">10. Limitation of Liability</h2>
                    <p>To the fullest extent permitted by law, Lweemee is not liable for:</p>
                    <ul className="list-disc space-y-2 pl-6">
                    <li>Loss of data</li>
                    <li>Loss of revenue or business</li>
                    <li>Third-party platform issues or API changes</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">11. Changes to These Terms</h2>
                    <p>
                    We may update these Terms from time to time. Continued use of Lweemee after changes means you accept the updated Terms.
                    </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
