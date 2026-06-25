/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#2D2D2D",
        mutedText: "#7A7A8A",
        surface: "#FFF8F0",
        card: "#FFFFFF",
        border: "#EDE8E3",
        blush: "#F9B8C4",
        primary: "#C97C8A",
        primaryDark: "#B06678",
        lavender: "#D8C4E8",
        peach: "#FFD4A8",
        danger: "#C94F6D",
        warning: "#D4914A",
        success: "#87A878",
        lowBg: "#F0F7ED",
        midBg: "#FDF3E7",
        highBg: "#FCE8EE"
      }
    }
  },
  plugins: []
};
