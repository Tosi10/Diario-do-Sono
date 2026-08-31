/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /**
         * Ana Gonçalves — Terra, Marfim, Argila, Oliva, Areia (Manual 2026)
         * Tokens sleep.* mantidos para não reescrever todas as telas.
         */
        sleep: {
          bg: "#F2EDE0",
          bgDeep: "#E8E0CF",
          card: "#FAF7F0",
          cardSoft: "#F7F2E8",
          ink: "#5A383C",
          muted: "#8A6A6E",
          line: "#D4C8B4",
          accent: "#AD665C",
          accentSoft: "#E8D0C8",
          lavender: "#A39D79",
          lavenderSoft: "#E5E2D0",
          rose: "#78494E",
          warn: "#C4A06A",
          danger: "#B85C5C",
          ok: "#A39D79",
        },
      },
      fontFamily: {
        display: ["BethanyElingston"],
        displayBold: ["BethanyElingston"],
        displayItalic: ["BethanyElingston-Italic"],
        sans: ["WorkSans_400Regular"],
        sansMed: ["WorkSans_500Medium"],
        sansBold: ["WorkSans_600SemiBold"],
        sansExtra: ["WorkSans_700Bold"],
      },
      borderRadius: {
        clay: "24px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
