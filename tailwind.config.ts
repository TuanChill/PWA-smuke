import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        paper: "#f7f4ee",
        moss: "#315a4f",
        coral: "#d96c4f",
        signal: "#246bfe",
        citrus: "#e6b43c",
        fog: "#e8e5dc"
      },
      boxShadow: {
        panel: "0 18px 50px rgba(17, 24, 39, 0.14)",
        card: "0 24px 70px rgba(17, 24, 39, 0.20)"
      }
    }
  },
  plugins: []
};

export default config;
