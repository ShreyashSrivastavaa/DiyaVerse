import React from "react";
import Link from "next/link";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diyaverse.vercel.app";

const FAQS = [
  {
    q: "How do I light a virtual diya on DiyaVerse?",
    qHi: "दीयावर्स पर वर्चुअल दीया कैसे जलाएं?",
    a: "Lighting a virtual diya takes less than 10 seconds. Head to our Light a Diya page, select your preferred festive diya design (Terracotta, Sacred Golden Brass, Lotus, Marigold, or Rangoli), choose or write a personal Diwali wish, and ignite your flame with our interactive matchstick igniter. Your light instantly joins our nationwide wall.",
    linkText: "Light a Diya Now",
    linkHref: "/light",
  },
  {
    q: "Is DiyaVerse free to use?",
    qHi: "क्या दीयावर्स पूरी तरह से निःशुल्क है?",
    a: "Yes, DiyaVerse is 100% free and open for everyone. There are no fees, subscriptions, or paywalls. It is our non-profit festive gift to connect people across India and the global diaspora this Diwali 2026.",
  },
  {
    q: "Do I need to sign up or share personal data?",
    qHi: "क्या मुझे साइन अप या व्यक्तिगत जानकारी देने की आवश्यकता है?",
    a: "No registration or sign-up is required. In accordance with India's Digital Personal Data Protection (DPDP) Act, DiyaVerse follows strict data minimization principles. You do not need to provide phone numbers, email addresses, or social media logins.",
  },
  {
    q: "Can I download and share my diya card?",
    qHi: "क्या मैं अपना दीया कार्ड डाउनलोड और शेयर कर सकता हूँ?",
    a: "Yes! Once you light a diya, you can download a high-resolution festive greeting card image (PNG) decorated with your dedicated wish, or share a direct personalized link via WhatsApp, Instagram, X (Twitter), and Facebook.",
    linkText: "Explore the Diya Wall",
    linkHref: "/wall",
  },
  {
    q: "What is the Ramayana Gyan Quiz?",
    qHi: "श्री रामायण ज्ञान परीक्षा क्या है?",
    a: "The Ramayana Gyan Quiz is an interactive cultural quiz with 10 authentic questions covering Bala Kanda through Yuddha Kanda. Available in both Hindi and English, it offers instant cultural explanations and festive scoring.",
    linkText: "Play Ramayana Quiz",
    linkHref: "/quiz",
  },
];

export function DiwaliStoryAndFaq() {
  const websiteAndOrgSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "DiyaVerse",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`,
          width: 512,
          height: 512,
        },
        description:
          "DiyaVerse is a nationwide digital Deepotsav connecting hearts across India for Diwali 2026.",
        sameAs: ["https://twitter.com/DiyaVerse", "https://github.com/ShreyashSrivastavaa/DiyaVerse"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "DiyaVerse",
        description:
          "Light a virtual diya, attach Diwali wishes, explore the collective Diya Wall, and celebrate Diwali 2026 together.",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        inLanguage: ["en-IN", "hi-IN"],
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <Script
        id="homepage-org-website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteAndOrgSchema) }}
      />
      <Script
        id="homepage-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Crawlable Story Section */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto border-t border-night-900/80">
        <div className="bg-gradient-to-b from-night-900/60 to-night-950/80 border border-flame-500/20 rounded-3xl p-8 sm:p-12 shadow-[0_0_40px_rgba(255,159,28,0.1)] text-center sm:text-left space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-flame-400/20 pb-6">
            <span className="text-4xl sm:text-5xl" role="img" aria-label="Sacred Diya">
              🪔
            </span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50 tracking-tight">
                The Sacred Spirit of Diwali &amp; DiyaVerse
              </h2>
              <p className="text-xs sm:text-sm text-flame-300 font-medium">
                तमसो मा ज्योतिर्गमय • From Darkness unto Light • Shubh Deepavali 2026
              </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-ivory-200 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              Diwali (Deepavali), the revered Festival of Lights, commemorates the triumphant return of{" "}
              <strong>Lord Rama, Mata Sita, and Lakshmana</strong> to Ayodhya after fourteen years of
              vanvas and the victory of dharma over adharma. In timeless tradition, the citizens of Ayodhya
              illuminated the holy capital with millions of earthenware diyas, signifying that even a
              gentle flicker of truth dispels the deepest shadow.
            </p>
            <p>
              <strong>DiyaVerse</strong> translates this timeless sacred bond into an honest, nationwide
              digital Deepotsav. In under ten seconds, you can{" "}
              <Link
                href="/light"
                className="text-flame-400 font-semibold hover:text-flame-300 underline underline-offset-4 decoration-flame-400/50 hover:decoration-flame-300"
              >
                light a virtual diya online
              </Link>
              , attach your heartfelt Diwali wishes, and see your flame join our truthful, nationwide{" "}
              <Link
                href="/wall"
                className="text-flame-400 font-semibold hover:text-flame-300 underline underline-offset-4 decoration-flame-400/50 hover:decoration-flame-300"
              >
                Diya Wall
              </Link>
              . Celebrate the heritage of Shri Rama with our interactive{" "}
              <Link
                href="/quiz"
                className="text-flame-400 font-semibold hover:text-flame-300 underline underline-offset-4 decoration-flame-400/50 hover:decoration-flame-300"
              >
                Ramayana Gyan Quiz
              </Link>{" "}
              and share joy with loved ones across India and the world.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto mb-8">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-flame-400 bg-flame-400/10 px-3.5 py-1 rounded-full border border-flame-400/20">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-ivory-50 tracking-tight">
            अक्सर पूछे जाने वाले प्रश्न • FAQs
          </h2>
          <p className="text-sm text-ivory-300/80 max-w-xl mx-auto">
            Everything you need to know about lighting virtual diyas, sharing wishes, and participating in DiyaVerse.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="bg-night-900/70 border border-night-800 hover:border-flame-400/30 rounded-2xl p-4 sm:p-6 transition-all duration-300 shadow-sm"
            >
              <h3 className="text-base sm:text-lg font-serif font-semibold text-ivory-100 mb-2 flex items-start gap-2">
                <span className="text-flame-400 text-sm mt-1 shrink-0">✦</span>
                <span className="break-words">
                  {faq.q}
                  <span className="block text-xs font-normal text-flame-300/75 mt-0.5">
                    {faq.qHi}
                  </span>
                </span>
              </h3>
              <p className="text-base text-ivory-200/90 leading-relaxed pl-3 sm:pl-5 break-words">
                {faq.a}
                {faq.linkHref && faq.linkText && (
                  <span className="block mt-2">
                    <Link
                      href={faq.linkHref}
                      className="inline-flex items-center text-sm font-semibold text-flame-400 hover:text-flame-300 underline underline-offset-4 min-h-[44px]"
                    >
                      {faq.linkText} →
                    </Link>
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
