import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf3",
          100: "#d6f9e1",
          200: "#b0f1c8",
          300: "#7be3a8",
          400: "#40cd82",
          500: "#18b364",
          600: "#0c9051",
          700: "#0b7243",
          800: "#0d5a38",
          900: "#0c4a30",
        },
      },
    },
  },
  plugins: [],
};

export default config;
