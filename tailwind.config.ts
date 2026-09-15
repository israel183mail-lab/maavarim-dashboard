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
      },
    },
  },
  plugins: [],
};
export default config;
