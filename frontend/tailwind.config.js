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
        sans: ["IBM Plex Sans", "IBM Plex Sans Arabic", "system-ui", "sans-serif"],
        arabic: ["IBM Plex Sans Arabic", "IBM Plex Sans", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)",
        hover: "0 8px 24px -8px rgba(0,31,95,0.18)",
        focus: "0 0 0 3px rgba(0,31,95,0.15)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.3s ease-out both",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
}

