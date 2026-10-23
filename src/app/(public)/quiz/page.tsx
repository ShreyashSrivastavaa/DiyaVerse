import React from "react";
import { Metadata } from "next";
import { RamayanQuiz } from "@/components/public/RamayanQuiz";

export const metadata: Metadata = {
  title: "Ramayana Gyan Quiz | DiyaVerse",
  description:
    "Test your sacred knowledge of the Ramayana this Diwali. 10 curated MCQs from Bala Kanda to Yuddha Kanda with instant feedback, scoring, and cultural lore.",
  openGraph: {
    title: "Ramayana Gyan Quiz | DiyaVerse",
    description:
      "Test your sacred knowledge of the Ramayana this Diwali. 10 curated MCQs from Bala Kanda to Yuddha Kanda.",
  },
};

export default function QuizPage() {
  return (
    <main className="min-h-screen py-6 sm:py-10">
      <RamayanQuiz />
    </main>
  );
}
