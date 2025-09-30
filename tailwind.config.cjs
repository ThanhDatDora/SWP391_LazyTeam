/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(214.3 31.8% 91.4%)",
        background: "hsl(210 20% 98%)",
        foreground: "hsl(222.2 47.4% 11.2%)",
        primary: { DEFAULT: "hsl(222.2 47.4% 11.2%)", foreground: "hsl(210 20% 98%)" },
        secondary: { DEFAULT: "hsl(210 40% 98%)", foreground: "hsl(222.2 47.4% 11.2%)" },
        muted: { DEFAULT: "hsl(210 40% 96.1%)", foreground: "hsl(215.4 16.3% 46.9%)" },
        ring: "hsl(215 20.2% 65.1%)",
      },
      borderRadius: { xl: "0.75rem", "2xl": "1rem" }
    },
  },
  plugins: [],
}