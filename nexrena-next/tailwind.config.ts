import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0C0F12",
        slate: "#1E2530",
        gold: {
          DEFAULT: "#C9A96E",
          dim: "#9B7D4E",
        },
        cream: "#F5F0E8",
        warmWhite: "#FDFCFA",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(201, 169, 110, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(201, 169, 110, 0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-pattern": "4rem 4rem",
      },
    },
  },
  plugins: [],
};

export default config;
