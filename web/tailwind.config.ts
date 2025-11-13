import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import typographyPlugin from "@tailwindcss/typography";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1536px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        status: {
          completed: {
            DEFAULT: "hsl(142.1 76.2% 36.3%)",
            foreground: "hsl(145.1 100% 98%)",
          },
          executing: {
            DEFAULT: "hsl(186.2 95.2% 40.3%)",
            foreground: "hsl(186.2 100% 98%)",
          },
          awaiting: {
            DEFAULT: "hsl(45.9 95.2% 50.3%)",
            foreground: "hsl(45.9 95.2% 10%)",
          },
          failed: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          canceled: {
            DEFAULT: "hsl(24.6 95.2% 53.3%)",
            foreground: "hsl(24.6 100% 98%)",
          },
        },
      },
      borderRadius: {
        none: "0",
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        full: "9999px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: ({ theme }: { theme: (path: string) => string | string[] }) => ({
        DEFAULT: {
          css: {
            p: {
              marginTop: theme("spacing.3"),
              marginBottom: theme("spacing.3"),
            },
            h1: {
              marginTop: theme("spacing.6"),
              marginBottom: theme("spacing.4"),
            },
            h2: {
              marginTop: theme("spacing.5"),
              marginBottom: theme("spacing.3"),
            },
            h3: {
              marginTop: theme("spacing.4"),
              marginBottom: theme("spacing.2"),
            },
            pre: {
              backgroundColor: theme("colors.background"),
              fontFamily: theme("fontFamily.mono").toString(),
            },
            code: {
              fontFamily: theme("fontFamily.mono").toString(),
            },
          },
        },
      }),
    },
  },
  plugins: [tailwindcssAnimate, typographyPlugin],
} satisfies Config;

export default config;
