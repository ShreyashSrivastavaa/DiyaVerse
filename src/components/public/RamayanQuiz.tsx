"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RAMAYAN_QUESTIONS, QuizQuestion } from "@/data/ramayanQuizData";

export function RamayanQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("hi");
  const [copiedShare, setCopiedShare] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const currentQuestion: QuizQuestion = RAMAYAN_QUESTIONS[currentIndex];
  const totalQuestions = RAMAYAN_QUESTIONS.length;

  const handleSelectOption = (optionId: "A" | "B" | "C" | "D") => {
    if (hasAnsweredCurrent) return; // Prevent re-selection
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
    setHasAnsweredCurrent(true);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setHasAnsweredCurrent(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setHasAnsweredCurrent(false);
    setIsFinished(false);
    setShowReview(false);
  };

  // Calculate scores
  const score = Object.entries(selectedAnswers).reduce((acc, [qId, ans]) => {
    const question = RAMAYAN_QUESTIONS.find((q) => q.id === Number(qId));
    return question && question.correctAnswer === ans ? acc + 1 : acc;
  }, 0);

  const easyScore = RAMAYAN_QUESTIONS.filter(
    (q) => q.difficulty === "Easy" && selectedAnswers[q.id] === q.correctAnswer
  ).length;

  const mediumScore = RAMAYAN_QUESTIONS.filter(
    (q) => q.difficulty === "Medium" && selectedAnswers[q.id] === q.correctAnswer
  ).length;

  const hardScore = RAMAYAN_QUESTIONS.filter(
    (q) => q.difficulty === "Hard" && selectedAnswers[q.id] === q.correctAnswer
  ).length;

  const getScoreTitle = (pts: number) => {
    if (pts === 10) {
      return {
        title: "Ramayana Maha-Pandit 👑",
        titleHi: "रामायण महा-पण्डित 👑",
        subtitle: "Incredible mastery! You know the sacred epic from start to finish.",
        subtitleHi: "अद्भुत ज्ञान! आप आदि काव्य रामायण के गूढ़ रहस्यों से भली-भांति परिचित हैं।",
        color: "text-amber-300",
      };
    }
    if (pts >= 8) {
      return {
        title: "Ramayana Shiromani 🌟",
        titleHi: "रामायण शिरोमणि 🌟",
        subtitle: "Exceptional knowledge of the great Ramayana epic!",
        subtitleHi: "उत्कृष्ट ज्ञान! आपका रामायण का अध्ययन अत्यंत प्रशंसनीय है।",
        color: "text-flame-400",
      };
    }
    if (pts >= 5) {
      return {
        title: "Dharma Jigyasu 🪔",
        titleHi: "धर्म जिज्ञासु 🪔",
        subtitle: "Good effort! A wonderful grasp on the sacred story of Shri Rama.",
        subtitleHi: "सराहनीय प्रयास! प्रभु श्री राम के जीवन चरित्र का सुंदर बोध है।",
        color: "text-flame-300",
      };
    }
    return {
      title: "Shubh Aarambh 🙏",
      titleHi: "शुभ आरम्भ 🙏",
      subtitle: "A sacred journey of learning begins today. May knowledge illuminate your path!",
      subtitleHi: "ज्ञान की पवित्र यात्रा का आरम्भ! रामायण का अध्ययन जीवन को प्रकाशमय बनाता है।",
      color: "text-ivory-200",
    };
  };

  const scoreDetails = getScoreTitle(score);

  const shareText = `I scored ${score}/10 on the DiyaVerse Ramayana Gyan Quiz! 🪔 Test your knowledge of the sacred epic here:`;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/quiz` : "https://diyaverse.vercel.app/quiz";

  const handleShareWhatsApp = () => {
    const fullText = encodeURIComponent(`${shareText} ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${fullText}`, "_blank", "noopener,noreferrer");
  };

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Top Banner with Language Switcher */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-night-800">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label="Bow and Arrow">
            🏹
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-ivory-50 tracking-wide">
              {language === "hi" ? "श्री रामायण ज्ञान परीक्षा" : "Ramayana Gyan Quiz"}
            </h1>
            <p className="text-xs text-flame-300/80">
              {language === "hi"
                ? "बाल काण्ड से युद्ध काण्ड तक 10 प्रामाणिक प्रश्न (3 सरल, 3 मध्यम, 4 कठिन)"
                : "10 Curated MCQs from Bala Kanda to Yuddha Kanda (3 Easy, 3 Medium, 4 Hard)"}
            </p>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center bg-night-900 border border-night-800 rounded-lg p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLanguage("hi")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              language === "hi"
                ? "bg-flame-500 text-night-950 shadow-sm"
                : "text-ivory-300 hover:text-ivory-50"
            }`}
          >
            हिंदी
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              language === "en"
                ? "bg-flame-500 text-night-950 shadow-sm"
                : "text-ivory-300 hover:text-ivory-50"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {!isFinished ? (
        /* QUIZ IN PROGRESS */
        <div className="space-y-6">
          {/* Progress Bar & Badges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-ivory-300">
              <span className="font-mono text-flame-300 font-semibold">
                {language === "hi"
                  ? `प्रश्न ${currentIndex + 1} / ${totalQuestions}`
                  : `Question ${currentIndex + 1} of ${totalQuestions}`}
              </span>
              <div className="flex items-center gap-2">
                {/* Kanda Badge */}
                <span className="px-2.5 py-0.5 rounded-full bg-night-900 border border-night-700 text-ivory-200 text-[11px] font-medium">
                  📖 {currentQuestion.kanda}
                </span>

                {/* Difficulty Badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    currentQuestion.difficulty === "Easy"
                      ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                      : currentQuestion.difficulty === "Medium"
                      ? "bg-amber-950/60 border-amber-500/40 text-amber-400"
                      : "bg-rose-950/60 border-rose-500/40 text-rose-400"
                  }`}
                >
                  {currentQuestion.difficulty === "Easy" && (language === "hi" ? "सरल" : "Easy")}
                  {currentQuestion.difficulty === "Medium" && (language === "hi" ? "मध्यम" : "Medium")}
                  {currentQuestion.difficulty === "Hard" && (language === "hi" ? "कठिन" : "Hard")}
                </span>
              </div>
            </div>

            {/* Glowing Progress bar */}
            <div className="w-full h-2 bg-night-900 rounded-full overflow-hidden border border-night-800">
              <div
                className="h-full bg-gradient-to-r from-flame-500 via-amber-400 to-flame-300 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="relative rounded-2xl bg-gradient-to-b from-night-900 to-night-950 border border-flame-500/20 p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-lg sm:text-xl font-serif text-ivory-50 leading-relaxed font-semibold">
              {language === "hi" ? currentQuestion.questionHi : currentQuestion.question}
            </h2>

            {/* Options List */}
            <div className="mt-6 grid grid-cols-1 gap-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                const isCorrect = opt.id === currentQuestion.correctAnswer;
                const showFeedback = hasAnsweredCurrent;

                let buttonStyles = "bg-night-850 hover:bg-night-800 border-night-700/80 text-ivory-100";
                let circleStyles = "bg-night-900 text-ivory-300 border-night-700";

                if (showFeedback) {
                  if (isCorrect) {
                    buttonStyles = "bg-emerald-950/60 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                    circleStyles = "bg-emerald-500 text-night-950 border-emerald-400 font-bold";
                  } else if (isSelected && !isCorrect) {
                    buttonStyles = "bg-rose-950/60 border-rose-500 text-rose-100";
                    circleStyles = "bg-rose-500 text-white border-rose-400 font-bold";
                  } else {
                    buttonStyles = "bg-night-900/40 border-night-800 text-ivory-300/40 opacity-50 cursor-not-allowed";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={hasAnsweredCurrent}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-4 min-h-[52px] cursor-pointer ${buttonStyles}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${circleStyles}`}
                      >
                        {opt.id}
                      </span>
                      <span className="text-sm sm:text-base font-medium">
                        {language === "hi" ? opt.textHi : opt.text}
                      </span>
                    </div>

                    {showFeedback && isCorrect && (
                      <span className="text-emerald-400 font-bold text-lg" aria-label="Correct">
                        ✓
                      </span>
                    )}
                    {showFeedback && isSelected && !isCorrect && (
                      <span className="text-rose-400 font-bold text-lg" aria-label="Incorrect">
                        ✗
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Box (Visible once answered) */}
            {hasAnsweredCurrent && (
              <div className="mt-6 p-4 rounded-xl bg-night-950/90 border border-flame-400/30 text-xs sm:text-sm text-ivory-200 space-y-1.5 animate-fade-in">
                <div className="flex items-center gap-1.5 text-flame-300 font-semibold uppercase tracking-wider text-[11px]">
                  <span>🪔</span>
                  <span>{language === "hi" ? "तथ्य और संदर्भ" : "Sacred Lore & Fact"}</span>
                </div>
                <p className="leading-relaxed text-ivory-200">
                  {language === "hi" ? currentQuestion.explanationHi : currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-ivory-300/60 font-mono">
              Score: {score} / {currentIndex + (hasAnsweredCurrent ? 1 : 0)}
            </span>

            {hasAnsweredCurrent && (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-xl font-semibold text-sm text-night-950 bg-gradient-to-r from-flame-500 to-flame-400 hover:from-flame-400 hover:to-flame-300 shadow-md shadow-flame-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {currentIndex < totalQuestions - 1
                  ? language === "hi"
                    ? "अगला प्रश्न →"
                    : "Next Question →"
                  : language === "hi"
                  ? "परिणाम देखें 🏆"
                  : "View Score 🏆"}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* FINAL SCORE SCREEN */
        <div className="space-y-8 animate-fade-in">
          {/* Grand Score Card */}
          <div className="relative rounded-2xl bg-gradient-to-b from-night-900 to-night-950 border border-flame-400/40 p-8 sm:p-10 text-center shadow-[0_0_40px_rgba(255,159,28,0.2)] overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-flame-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <span className="text-5xl sm:text-6xl" role="img" aria-label="Celebration Diya">
                🪔
              </span>

              <h2 className={`text-2xl sm:text-3xl font-serif font-bold ${scoreDetails.color}`}>
                {language === "hi" ? scoreDetails.titleHi : scoreDetails.title}
              </h2>

              <p className="text-sm text-ivory-300 max-w-md mx-auto">
                {language === "hi" ? scoreDetails.subtitleHi : scoreDetails.subtitle}
              </p>

              {/* Numerical Score Badge */}
              <div className="inline-flex flex-col items-center justify-center p-6 rounded-2xl bg-night-950/80 border border-flame-400/30 my-4 shadow-inner min-w-[200px]">
                <span className="text-xs uppercase tracking-widest text-flame-400 font-semibold mb-1">
                  {language === "hi" ? "आपका कुल अंक" : "Your Total Score"}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-mono font-bold text-ivory-50">{score}</span>
                  <span className="text-2xl font-mono text-ivory-300/60">/ {totalQuestions}</span>
                </div>
                <span className="text-xs text-flame-300/80 mt-1 font-mono">
                  {Math.round((score / totalQuestions) * 100)}% Accuracy
                </span>
              </div>

              {/* Difficulty Breakdown */}
              <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-night-850/80 border border-emerald-500/30">
                  <span className="text-emerald-400 font-semibold block mb-0.5">
                    {language === "hi" ? "सरल" : "Easy"}
                  </span>
                  <span className="font-mono text-ivory-100 font-bold">{easyScore} / 3</span>
                </div>
                <div className="p-2.5 rounded-xl bg-night-850/80 border border-amber-500/30">
                  <span className="text-amber-400 font-semibold block mb-0.5">
                    {language === "hi" ? "मध्यम" : "Medium"}
                  </span>
                  <span className="font-mono text-ivory-100 font-bold">{mediumScore} / 3</span>
                </div>
                <div className="p-2.5 rounded-xl bg-night-850/80 border border-rose-500/30">
                  <span className="text-rose-400 font-semibold block mb-0.5">
                    {language === "hi" ? "कठिन" : "Hard"}
                  </span>
                  <span className="font-mono text-ivory-100 font-bold">{hardScore} / 4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Share & Actions Card */}
          <div className="bg-night-900/60 border border-night-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-center text-sm font-semibold text-ivory-100">
              {language === "hi" ? "अपना स्कोर साझा करें और चुनौती दें" : "Share Your Score & Challenge Friends"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full min-h-[44px] py-3 px-4 rounded-xl font-medium text-sm text-white bg-[#25D366] hover:bg-[#20ba5a] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span className="font-bold">WhatsApp</span>
                <span className="text-xs opacity-90">{language === "hi" ? "पर भेजें" : "Share"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyShare}
                className="w-full min-h-[44px] py-3 px-4 rounded-xl text-sm font-medium text-ivory-200 bg-night-850 hover:bg-night-800 border border-night-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🔗</span>
                <span>{copiedShare ? (language === "hi" ? "कॉपी हो गया!" : "Copied!") : (language === "hi" ? "स्कोर लिंक कॉपी करें" : "Copy Score Link")}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                href="/light"
                className="w-full min-h-[44px] py-3 px-4 rounded-xl text-sm font-semibold text-night-950 bg-flame-400 hover:bg-flame-300 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer text-center"
              >
                <span>🪔</span>
                <span>{language === "hi" ? "एक दीया जलाएं" : "Light a Sacred Diya"}</span>
              </Link>

              <button
                type="button"
                onClick={handleRestart}
                className="w-full min-h-[44px] py-3 px-4 rounded-xl text-sm font-medium text-flame-300 bg-transparent hover:bg-night-850 border border-flame-400/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🔄</span>
                <span>{language === "hi" ? "पुनः परीक्षा दें" : "Retake Quiz"}</span>
              </button>
            </div>
          </div>

          {/* Review Answers Toggle Button */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setShowReview(!showReview)}
              className="inline-flex items-center gap-2 text-sm text-flame-400 hover:text-flame-300 underline font-medium cursor-pointer"
            >
              <span>{showReview ? (language === "hi" ? "उत्तर समीक्षा छिपाएं ▲" : "Hide Detailed Review ▲") : (language === "hi" ? "सभी 10 प्रश्नों के सही उत्तर और संदर्भ देखें ▼" : "Review All 10 Questions & Answers ▼")}</span>
            </button>
          </div>

          {/* Full Detailed Answers Accordion */}
          {showReview && (
            <div className="space-y-4 pt-2 animate-fade-in">
              <h3 className="text-base font-serif font-bold text-ivory-100 flex items-center gap-2">
                <span>📜</span>
                <span>{language === "hi" ? "विस्तृत उत्तर समीक्षा" : "Detailed Answer Review"}</span>
              </h3>

              <div className="space-y-3">
                {RAMAYAN_QUESTIONS.map((q, idx) => {
                  const userAnswer = selectedAnswers[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;
                  const correctOption = q.options.find((o) => o.id === q.correctAnswer);
                  const userOption = q.options.find((o) => o.id === userAnswer);

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-night-900/60 border border-night-800 space-y-2 text-xs sm:text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-ivory-100">
                          {idx + 1}. {language === "hi" ? q.questionHi : q.question}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            isCorrect
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                              : "bg-rose-950 text-rose-400 border border-rose-500/40"
                          }`}
                        >
                          {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="text-emerald-400">
                          <span className="font-semibold">{language === "hi" ? "सही उत्तर: " : "Correct Answer: "}</span>
                          {correctOption ? (language === "hi" ? correctOption.textHi : correctOption.text) : ""}
                        </div>

                        {!isCorrect && (
                          <div className="text-rose-400">
                            <span className="font-semibold">{language === "hi" ? "आपका उत्तर: " : "Your Pick: "}</span>
                            {userOption ? (language === "hi" ? userOption.textHi : userOption.text) : (language === "hi" ? "कोई नहीं" : "None")}
                          </div>
                        )}

                        <div className="text-ivory-300/70 pt-1 border-t border-night-800/80 leading-relaxed">
                          {language === "hi" ? q.explanationHi : q.explanation}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
