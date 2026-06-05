/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#001F5F",
          50: "#EAF0FB",
          700: "#0A2E7A",
        },
        accent: {
          DEFAULT: "#F59E0B",
          600: "#D97706",
        },
        status: {
          created: "#64748B",
          assigned: "#6366F1",
          pickedup: "#0EA5E9",
          transit: "#3B82F6",
          delivered: "#16A34A",
          failed: "#DC2626",
          delayed: "#F59E0B",
        },
      },
      fontFamily: {
        sans: ["Inter", "Cairo", "system-ui", "sans-serif"],
        arabic: ["Cairo", "Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
    },
  },
  plugins: [],
}

