import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy • DiyaVerse",
  description: "Privacy policy for DiyaVerse, aligned with India's Digital Personal Data Protection (DPDP) Act, 2023.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ivory-50 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-flame-400 font-mono">
          Last updated: October 21, 2026 • DPDP Act 2023 Aligned
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8 text-ivory-200 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-flame-300">1. Our Privacy Philosophy</h2>
          <p>
            DiyaVerse is built upon a fundamental tenet: <strong>Data Minimization</strong>. Lighting a festive diya requires no personal identification, no registration, no contact lists, and no location tracking. You are completely anonymous.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-flame-300">2. Information We Collect</h2>
          <p>When you light a diya or interact with DiyaVerse, we collect only the minimal data required to display your diya:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-ivory-300">
            <li><strong>Diya Attributes:</strong> Selected diya style (e.g. clay, lotus), wish text, dedication category or short text, and language preference.</li>
            <li><strong>Anonymous Identifiers:</strong> A randomly generated session token stored in your browser&apos;s sessionStorage to ensure smooth navigation. If you accept the analytics notice, an anonymous visitor ID is stored in localStorage.</li>
            <li><strong>Technical Context:</strong> Coarse device type (mobile, tablet, desktop) and browser family derived on the server. The raw User-Agent string is immediately discarded.</li>
            <li><strong>Referral Context:</strong> Referrer hostname (e.g. whatsapp.com) and standard UTM campaign parameters to understand traffic sources.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-flame-300">3. What We Strictly Never Collect</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-ivory-300">
            <li>We do <strong>not</strong> collect names, mobile numbers, or email addresses (except when you voluntarily write to us via the contact form).</li>
            <li>We do <strong>not</strong> track precise GPS coordinates or city-level geolocation.</li>
            <li>We do <strong>not</strong> store raw IP addresses. A daily-rotating, salted cryptographic hash is used solely in memory for rate limiting and coarse spam defense, and is discarded.</li>
            <li>We do <strong>not</strong> use third-party advertising cookies or cross-site tracking pixels.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-flame-300">4. Data Retention</h2>
          <p>
            Raw, anonymized analytics event logs are automatically expunged after 90 days. Aggregated daily counts (such as total diyas lit per day) are retained indefinitely to preserve historical festival milestones.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-flame-300">5. Right to Erasure & Removal</h2>
          <p>
            If you or someone else attached a wish containing accidental personal information, you have the full right to have it deleted.
          </p>
          <p>
            You can report the diya directly via the &ldquo;Report&rdquo; button on its page, or submit a removal request on our{" "}
            <Link href="/contact" className="text-flame-400 underline">
              Contact Page
            </Link>{" "}
            specifying the Diya ID (e.g. <code>/d/abc123XYZ9</code>). Our moderation team processes removals within 24 hours.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-flame-300">6. Contact Our Grievance Officer</h2>
          <p>
            For any queries or grievance under the Digital Personal Data Protection Act, please contact us at:{" "}
            <a href="mailto:privacy@diyaverse.in" className="text-flame-400 underline">
              privacy@diyaverse.in
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
