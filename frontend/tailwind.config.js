/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        saro: { navy: "#001F5F", accent: "#0a7d5a" },
      },
    },
  },
  plugins: [],
}

