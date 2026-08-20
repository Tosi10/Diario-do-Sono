/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /**
         * Ana Gonçalves — Terra, Marfim, Argila, Oliva, Areia
         * Tokens sleep.* mantidos para não reescrever todas as telas.
         */
        sleep: {
          bg: "#F1ECDF",
          bgDeep: "#E6DCC8",
          card: "#FAF6ED",
          cardSoft: "#F7F1E6",
          ink: "#5C383D",
          muted: "#8A6A6E",
          line: "#D4C8B4",
          accent: "#AC665C",
          accentSoft: "#E8D0C8",
          lavender: "#A29D79",
          lavenderSoft: "#E5E2D0",
          rose: "#78484E",
          warn: "#C4A06A",
          danger: "#B85C5C",
          ok: "#A29D79",
        },
      },
      fontFamily: {
        display: ["BodoniModa_500Medium"],
        displayBold: ["BodoniModa_600SemiBold"],
        displayItalic: ["BodoniModa_500Medium_Italic"],
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
