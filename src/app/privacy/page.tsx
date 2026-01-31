
'use client'; // To allow using new Date() without hydration errors

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="mx-auto max-w-4xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline text-center">
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-foreground/80">
              <p className="text-center text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              
              <p>
                Lweemee (“we”, “our”, or “us”) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use our website, application, and services (“Services”).
              </p>

              <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">1. Information We Collect</h2>
                    <h3 className="text-lg font-medium mt-2">a. Information You Provide</h3>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Name and email address</li>
                        <li>Account and workspace details</li>
                        <li>Social media handles you choose to connect</li>
                    </ul>
                    <h3 className="text-lg font-medium mt-4">b. Social Media Data (with Your Permission)</h3>
                    <p>When you connect a social media account (e.g. Instagram, Threads, TikTok), we may collect:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Account identifiers (username, platform ID)</li>
                        <li>Public profile information</li>
                        <li>Performance and analytics data (posts, engagement metrics, timestamps)</li>
                    </ul>
                    <p className="mt-2">Lweemee does not post, message, or interact on your behalf unless explicitly enabled by you.</p>
                    <h3 className="text-lg font-medium mt-4">c. Technical Data</h3>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>IP address</li>
                        <li>Browser and device information</li>
                        <li>Usage and activity logs</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">2. How We Use Your Information</h2>
                    <p>We use your information to:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Provide analytics and insights</li>
                        <li>Sync and display connected account data</li>
                        <li>Improve platform performance and reliability</li>
                        <li>Communicate important service updates</li>
                        <li>Maintain security and prevent misuse</li>
                    </ul>
                </div>
                
                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">3. Legal Basis for Processing</h2>
                    <p>We process your data based on:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Your consent (connecting accounts, enabling features)</li>
                        <li>Contractual necessity (providing the Services)</li>
                        <li>Legitimate interests (security, analytics, product improvement)</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">4. Data Storage & Security</h2>
                     <ul className="list-disc space-y-2 pl-6">
                        <li>Data is securely stored using trusted infrastructure (e.g. Firebase).</li>
                        <li>Access is restricted and encrypted where appropriate.</li>
                        <li>We implement technical and organizational safeguards to protect your data.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">5. Data Sharing</h2>
                    <p>We do not sell your personal data.</p>
                    <p>We may share limited data with:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Trusted service providers (e.g. hosting, analytics, authentication)</li>
                        <li>Social media platforms strictly as required by their APIs</li>
                        <li>Legal authorities if required by law</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">6. Third-Party Platforms</h2>
                    <p>Your use of connected platforms is also governed by their privacy policies, including:</p>
                     <ul className="list-disc space-y-2 pl-6">
                        <li>Meta (Instagram, Threads)</li>
                        <li>TikTok</li>
                    </ul>
                    <p className="mt-2">Lweemee is not responsible for how third-party platforms process your data.</p>
                </div>
                
                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">7. Data Retention</h2>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>We retain data only as long as necessary to provide the Services.</li>
                        <li>You may disconnect accounts at any time.</li>
                        <li>Upon account deletion, associated data is removed or anonymized unless legally required to retain it.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">8. Your Rights</h2>
                    <p>Depending on your location, you may have the right to:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Access your data</li>
                        <li>Correct inaccurate data</li>
                        <li>Request deletion of your data</li>
                        <li>Withdraw consent at any time</li>
                        <li>Object to or restrict processing</li>
                    </ul>
                     <p className="mt-2">Requests can be made by contacting us.</p>
                </div>

                 <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">9. Children’s Privacy</h2>
                    <p>
                    Lweemee is not intended for users under the age of 18. We do not knowingly collect data from minors.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold font-headline mb-2">10. Changes to This Policy</h2>
                    <p>
                    We may update this Privacy Policy from time to time. Continued use of Lweemee after updates means you accept the revised policy.
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
