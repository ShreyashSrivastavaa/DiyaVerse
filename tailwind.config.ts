import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        night: {
          950: "var(--night-950)",
          900: "var(--night-900)",
          850: "var(--night-850)",
          800: "var(--night-800)",
          750: "var(--night-750)",
        },
        plum: {
          700: "var(--plum-700)",
        },
        flame: {
          300: "var(--flame-300)",
          400: "var(--flame-400)",
          500: "var(--flame-500)",
        },
        ember: {
          600: "var(--ember-600)",
        },
        marigold: {
          500: "var(--marigold-500)",
        },
        saffron: {
          600: "var(--saffron-600)",
        },
        ivory: {
          50: "var(--ivory-50)",
          300: "var(--ivory-300)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        devanagari: ["var(--font-devanagari)", "sans-serif"],
      },
      animation: {
        flicker: "flicker 2.5s infinite ease-in-out",
        emberFloat: "emberFloat 6s infinite linear",
        glowPulse: "glowPulse 3s infinite ease-in-out",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.95" },
          "25%": { transform: "scale(0.97, 1.03) translateY(-1px)", opacity: "0.85" },
          "50%": { transform: "scale(1.02, 0.98)", opacity: "1" },
          "75%": { transform: "scale(0.98, 1.02) translateX(0.5px)", opacity: "0.9" },
        },
        emberFloat: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "20%": { opacity: "0.8" },
          "80%": { opacity: "0.6" },
          "100%": { transform: "translateY(-120px) translateX(25px)", opacity: "0" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "0.95", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
