import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
const { nextui } = require("@nextui-org/react");
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./src/**/*.tsx",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 2s ease-in-out",
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontWeight: "700",
              fontSize: "2em",
              marginBottom: "0.5em",
            },
            h2: {
              fontWeight: "700",
              fontSize: "1.5em",
              marginBottom: "0.5em",
            },
            p: {
              marginBottom: "1em",
            },
            ul: {
              marginBottom: "1em",
            },
            ol: {
              marginBottom: "1em",
            },
            strong: {
              fontWeight: "bold",
            },
            em: {
              fontStyle: "italic",
            },
            // Add styles for other tags if needed
          },
        },
      },
    },
  },
  plugins: [nextui(), typography],
} as Config;