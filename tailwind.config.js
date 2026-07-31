/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /**
         * Marca Dra. Ana Heloisa — Manual V1.0
         * Índigo Noite · Lavanda · Sálvia · Ouro Rosé
         */
        sleep: {
          bg: "#1E2238",
          bgDeep: "#15182A",
          card: "#2A2F48",
          cardSoft: "#32385A",
          ink: "#F3EDE6",
          muted: "#A8A0C4",
          line: "#3D4466",
          accent: "#A3B899",
          accentSoft: "#3A4638",
          lavender: "#8C82B6",
          lavenderSoft: "#3A3654",
          rose: "#EAD5C3",
          warn: "#D4A574",
          danger: "#C97B7B",
          ok: "#A3B899",
        },
      },
      fontFamily: {
        display: ["CormorantGaramond_500Medium"],
        displayBold: ["CormorantGaramond_600SemiBold"],
        displayItalic: ["CormorantGaramond_500Medium_Italic"],
        sans: ["PlusJakartaSans_400Regular"],
        sansMed: ["PlusJakartaSans_500Medium"],
        sansBold: ["PlusJakartaSans_600SemiBold"],
        sansExtra: ["PlusJakartaSans_700Bold"],
      },
      borderRadius: {
        clay: "24px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
