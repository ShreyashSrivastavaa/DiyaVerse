import React from "react";
import { Metadata } from "next";
import Script from "next/script";
import { RamayanQuiz } from "@/components/public/RamayanQuiz";
import { RAMAYAN_QUESTIONS } from "@/data/ramayanQuizData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diyaverse.vercel.app";

export const metadata: Metadata = {
  title: "Ramayana Quiz Online | Questions and Answers for Diwali 2026",
  description:
    "Play the interactive Ramayana Quiz online this Diwali. Test your knowledge with curated Ramayana questions and answers from Bala Kanda to Yuddha Kanda.",
  keywords: [
    "Ramayana quiz online",
    "Ramayana questions and answers",
    "Ramayana Gyan Quiz",
    "Diwali quiz 2026",
    "Shri Rama quiz",
    "रामायण प्रश्नोत्तरी",
    "रामायण ज्ञान परीक्षा",
  ],
  alternates: {
    canonical: "/quiz",
  },
  openGraph: {
    title: "Ramayana Quiz Online | Ramayana Questions and Answers",
    description:
      "Play the sacred Ramayana Gyan Quiz this Diwali. 10 curated MCQs from Bala Kanda to Yuddha Kanda with instant answers and scoring.",
    url: `${siteUrl}/quiz`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ramayana Quiz Online | DiyaVerse",
    description:
      "Test your sacred knowledge of the Ramayana this Diwali with 10 curated questions & answers.",
  },
};

export default function QuizPage() {
  const quizSchema = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: "Ramayana Gyan Quiz - DiyaVerse",
    description:
      "A curated 10-question sacred Ramayana quiz covering Bala Kanda to Yuddha Kanda for Diwali 2026.",
    url: `${siteUrl}/quiz`,
    educationalLevel: "All",
    about: {
      "@type": "Thing",
      name: "Ramayana",
    },
    hasPart: RAMAYAN_QUESTIONS.map((q) => ({
      "@type": "Question",
      name: q.question,
      text: q.question,
      suggestedAnswer: q.options.map((opt) => ({
        "@type": "Answer",
        text: opt.text,
      })),
      acceptedAnswer: {
        "@type": "Answer",
        text: q.options.find((o) => o.id === q.correctAnswer)?.text || "",
      },
    })),
  };

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ramayana Quiz",
        item: `${siteUrl}/quiz`,
      },
    ],
  };

  return (
    <>
      <Script
        id="quiz-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
      />
      <Script
        id="quiz-breadcrumbs-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <main className="min-h-screen py-6 sm:py-10">
        <RamayanQuiz />
      </main>
    </>
  );
}
