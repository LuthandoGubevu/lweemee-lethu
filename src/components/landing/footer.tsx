
'use client'; // To allow using new Date() without hydration errors

import Link from 'next/link';
import { BotMessageSquare } from 'lucide-react';

const navLinks = [
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#faq', label: 'FAQ' },
    { href: '/terms', label: 'Terms of Use' },
    { href: '/privacy', label: 'Privacy Policy' },
];

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link href="/" className="flex items-center space-x-2">
            <BotMessageSquare className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline">
              Lweemee
            </span>
          </Link>
           <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Lweemee Insights. All rights reserved.
          </p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
        </nav>
      </div>
    </footer>
  );
}
