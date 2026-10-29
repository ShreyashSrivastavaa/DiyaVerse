import React from "react";

const STEPS = [
  {
    num: "1",
    title: "Choose Your Diya",
    hindiTitle: "दीया चुनें",
    desc: "Select from five handcrafted styles, from traditional terracotta clay to sacred brass and floating lotus.",
    icon: "🪔",
  },
  {
    num: "2",
    title: "Attach Your Wish",
    hindiTitle: "शुभकामना जोड़ें",
    desc: "Pen a personal blessing for family, friends, or the world, or let our library of 2,000 curated blessings surprise you.",
    icon: "📜",
  },
  {
    num: "3",
    title: "Light & Share",
    hindiTitle: "जलाएं और शेयर करें",
    desc: "Witness your sacred diya flicker to life, join the collective wall, and send a beautiful greeting card via WhatsApp.",
    icon: "✨",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-xs uppercase tracking-widest text-flame-400 font-bold mb-2">
          Simple & Meaningful
        </h2>
        <p className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50">
          How DiyaVerse Works
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className="p-5 sm:p-6 rounded-2xl bg-night-900/60 border border-night-800 hover:border-flame-400/40 hover:bg-night-850/80 transition-all duration-300 relative flex flex-col justify-between group shadow-sm hover:shadow-[0_0_20px_rgba(255,159,28,0.1)]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-full bg-night-800 border border-flame-400/30 text-flame-300 flex items-center justify-center font-bold font-serif text-base group-hover:scale-110 transition-transform">
                  {step.num}
                </span>
                <span className="text-2xl">{step.icon}</span>
              </div>
              <h3 className="text-lg font-serif font-semibold text-ivory-50 mb-1">
                {step.title}
              </h3>
              <p className="text-xs font-hindi text-flame-400/80 mb-3">
                {step.hindiTitle}
              </p>
              <p className="text-base text-ivory-200/90 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
