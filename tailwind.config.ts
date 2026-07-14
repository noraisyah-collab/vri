import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "vri-blue": "#2C4A6E",
        "vri-purple": "#7A4F8C",
        "vri-terracotta": "#A24C3D",
      },
    },
  },
  plugins: [],
};

export default config;
