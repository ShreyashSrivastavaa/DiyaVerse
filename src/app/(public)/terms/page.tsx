import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service • DiyaVerse",
  description: "Terms and Community Guidelines for lighting virtual diyas and sharing wishes on DiyaVerse.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ivory-50 tracking-tight">
          Terms of Service & Guidelines
        </h1>
        <p className="text-xs text-flame-400 font-mono">
          Last updated: October 21, 2026
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8 text-ivory-200 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-flame-300">1. Welcome to DiyaVerse</h2>
          <p>
            DiyaVerse is a free, non-commercial public platform celebrating the spirit of Diwali across India and the globe. By using this platform to light a diya or share greetings, you agree to these Terms and Community Guidelines.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-flame-300">2. Community Guidelines & Acceptable Wishes</h2>
          <p>DiyaVerse is a sacred and peaceful space. You agree that any wish or dedication you write will:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-ivory-300">
            <li>Reflect festive goodwill, hope, gratitude, or warm personal greetings.</li>
            <li>Be respectful of people of all faiths, backgrounds, and communities.</li>
            <li><strong>Not</strong> include personal contact details: full names, mobile numbers, email addresses, or personal social handles.</li>
            <li><strong>Not</strong> contain profanity, slurs, hate speech, violent references, or sexually explicit content.</li>
            <li><strong>Not</strong> contain commercial advertising, promotional links, or political slogans.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-flame-300">3. Moderation & Content Rights</h2>
          <p>
            DiyaVerse uses automated filtering and community reporting to maintain safety. We reserve the absolute right to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-ivory-300">
            <li>Reject wishes at submission time that trigger safety filters.</li>
            <li>Hide publicly visible text on reported diyas (&ldquo;wishVisible = false&rdquo;) while preserving the light on the wall.</li>
            <li>Soft-delete spam or abusive entries that compromise the integrity of the wall.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-flame-300">4. Service Availability</h2>
          <p>
            DiyaVerse is provided &ldquo;as is&rdquo; without warranties of any kind. While we strive for 100% uptime during the festive period, we are not liable for transient network disruptions or third-party platform limitations (such as WhatsApp share sheet behavior).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-flame-300">5. Questions & Feedback</h2>
          <p>
            For any questions regarding these terms, please visit our{" "}
            <Link href="/contact" className="text-flame-400 underline">
              Contact Page
            </Link>{" "}
            or email us at{" "}
            <a href="mailto:support@diyaverse.in" className="text-flame-400 underline">
              support@diyaverse.in
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
