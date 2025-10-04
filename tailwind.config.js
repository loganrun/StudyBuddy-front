/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
    "pulse-glow": {
      "0%, 100%": { filter: "drop-shadow(0 0 5px #ef4444)" },
      "50%": { filter: "drop-shadow(0 0 15px #ef4444)" },
    },
  },
  animation: {
    "pulse-glow": "pulse-glow 1.5s ease-in-out infinite",
  },
    },
  },
  plugins:  [
    require('@tailwindcss/forms'),
  ],
}

