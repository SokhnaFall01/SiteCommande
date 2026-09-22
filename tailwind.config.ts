import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vert forêt du logo SamaBoutik
        brand: {
          50: "#eef6ef",
          100: "#d5e8d8",
          200: "#aecfb3",
          300: "#7fb187",
          400: "#4c9059",
          500: "#2c7a3d",
          600: "#1c6531",
          700: "#155129",
          800: "#124324",
          900: "#0e3620",
        },
        // Or du logo SamaBoutik
        gold: {
          50: "#fdf7e8",
          100: "#f8ebc4",
          200: "#f0d98c",
          300: "#e6c556",
          400: "#dcb02f",
          500: "#d4a017",
          600: "#b8850f",
          700: "#94680f",
          800: "#795513",
          900: "#674815",
        },
      },
    },
  },
  plugins: [],
};

export default config;
