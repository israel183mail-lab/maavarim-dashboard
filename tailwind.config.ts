import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-assistant)", "Segoe UI", "Arial", "sans-serif"],
        heebo: ["var(--font-heebo)", "Segoe UI", "Arial", "sans-serif"],
      },
      colors: {
        // Navy used for the top nav / headers across the reference deck.
        brand: {
          50: "#eef1f8",
          100: "#d7ddec",
          200: "#aeb9d9",
          300: "#8695c5",
          400: "#4a5892",
          500: "#2c3768",
          600: "#232c53",
          700: "#1D2445",
          800: "#161b35",
          900: "#0f1325",
        },
        // Risk semaphore — exact hues from the design deck.
        risk: {
          normal: "#21B524",
          review: "#F5C518",
          elevated: "#F7901E",
          critical: "#FF3131",
        },
        // Orange is the primary CTA/highlight color in the deck (logo mark,
        // KPI pills, active badges) — navy is for structure, not action.
        accent: {
          50: "#fff4e6",
          100: "#ffe3bf",
          200: "#ffcb8a",
          300: "#ffae4d",
          400: "#fc9a2e",
          500: "#F7901E",
          600: "#e07800",
          700: "#b85f00",
          800: "#8f4a00",
          900: "#6b3800",
        },
      },
    },
  },
  plugins: [],
};
export default config;
