import defaultTheme from "tailwindcss/defaultTheme";
import typography from "@tailwindcss/typography";

const borderPalette = {
  default: "var(--color-border-default)",
  subtle: "var(--color-border-subtle)",
  interactive: "var(--color-border-interactive)",
  focused: "var(--color-border-focused)",
  decorative: "var(--color-border-decorative)",
  success: "var(--color-border-success)",
  danger: "var(--color-border-danger)",
};

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./docs/**/*.{md,mdx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      spacing: {
        "inset-sm": "var(--spacing-inset-sm)",
        "inset-md": "var(--spacing-inset-md)",
        "inset-lg": "var(--spacing-inset-lg)",
        "stack-sm": "var(--spacing-stack-sm)",
        "stack-md": "var(--spacing-stack-md)",
        "stack-lg": "var(--spacing-stack-lg)",
        paragraph: "1em",
      },
      maxWidth: {
        prose: "75ch",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        background: {
          primary: "var(--color-background-primary)",
          secondary: "var(--color-background-secondary)",
          tertiary: "var(--color-background-tertiary)",
          overlay: "var(--color-background-overlay)",
          interactive: "var(--color-background-interactive)",
          success: "var(--color-background-success)",
          danger: "var(--color-background-danger)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          disabled: "var(--color-text-disabled)",
          accent: "var(--color-text-accent)",
          "on-interactive": "var(--color-text-on-interactive)",
          success: "var(--color-text-success)",
          warning: "var(--color-text-warning)",
          danger: "var(--color-text-danger)",
        },
        border: borderPalette,
        glow: {
          accent: "var(--color-glow-accent)",
          pulse: "var(--color-glow-pulse)",
        },
        state: {
          queued: "var(--color-state-queued)",
          running: "var(--color-state-running)",
          interrupted: "var(--color-state-interrupted)",
          success: "var(--color-state-success)",
          failed: "var(--color-state-failed)",
          grafted: "var(--color-state-grafted)",
        },
        stage: {
          "1": "var(--color-stage-1)",
          "2": "var(--color-stage-2)",
          "3": "var(--color-stage-3)",
        },
        branch: {
          a: "var(--color-branch-a)",
          b: "var(--color-branch-b)",
          c: "var(--color-branch-c)",
          d: "var(--color-branch-d)",
          e: "var(--color-branch-e)",
          active: "var(--color-branch-active)",
        },
      },
      fontSize: {
        "display-large": ["3.052rem", { lineHeight: "1.2", fontWeight: "700" }],
        "display-small": ["2.441rem", { lineHeight: "1.2", fontWeight: "700" }],
        "heading-xl": ["1.953rem", { lineHeight: "1.3", fontWeight: "600" }],
        "heading-large": ["1.563rem", { lineHeight: "1.4", fontWeight: "600" }],
        "heading-medium": ["1.25rem", { lineHeight: "1.5", fontWeight: "600" }],
        "heading-small": ["1rem", { lineHeight: "1.5", fontWeight: "600" }],
        "body-large": ["1rem", { lineHeight: "1.75", fontWeight: "400" }],
        "body-medium": ["0.875rem", { lineHeight: "1.75", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["0.75rem", { lineHeight: "1.5", fontWeight: "500" }],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        inset: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        "glow-accent": "0 0 15px 5px var(--color-glow-accent)",
      },
      borderRadius: {
        none: "0",
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px",
      },
      keyframes: {
        "data-flow": {
          "0%": {
            strokeDashoffset: "0",
          },
          "100%": {
            strokeDashoffset: "calc(var(--data-flow-length, 80px) * -1)",
          },
        },
      },
      animation: {
        "data-flow": "data-flow 0.65s linear infinite",
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.text.primary"),
            "--tw-prose-headings": theme("colors.text.primary"),
            "--tw-prose-lead": theme("colors.text.secondary"),
            "--tw-prose-links": theme("colors.text.accent"),
            "--tw-prose-bold": theme("colors.text.primary"),
            "--tw-prose-counters": theme("colors.text.secondary"),
            "--tw-prose-bullets": theme("colors.border.interactive"),
            "--tw-prose-hr": theme("colors.border.default"),
            "--tw-prose-quotes": theme("colors.text.primary"),
            "--tw-prose-quote-borders": theme("colors.border.interactive"),
            "--tw-prose-captions": theme("colors.text.tertiary"),
            "--tw-prose-code": theme("colors.text.primary"),
            "--tw-prose-pre-code": theme("colors.text.primary"),
            "--tw-prose-pre-bg": theme("colors.background.secondary"),
            maxWidth: theme("maxWidth.prose"),
            p: {
              marginTop: theme("spacing.paragraph"),
              marginBottom: theme("spacing.paragraph"),
            },
          },
        },
      }),
      borderColor: {
        DEFAULT: borderPalette.default,
        "border-default": borderPalette.default,
        "border-subtle": borderPalette.subtle,
        "border-interactive": borderPalette.interactive,
        "border-focused": borderPalette.focused,
        "border-decorative": borderPalette.decorative,
        "border-success": borderPalette.success,
        "border-danger": borderPalette.danger,
      },
    },
  },
  plugins: [typography],
};

export default config;
