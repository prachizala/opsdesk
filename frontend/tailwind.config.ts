import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: {
          DEFAULT: "var(--surface)",
          subtle: "var(--surface-subtle)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          disabled: "var(--text-disabled)",
        },
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
        },
        sla: {
          normal: {
            text: "var(--sla-normal-text)",
            bg: "var(--sla-normal-bg)",
          },
          at_risk: {
            text: "var(--sla-at-risk-text)",
            bg: "var(--sla-at-risk-bg)",
          },
          breached: {
            text: "var(--sla-breached-text)",
            bg: "var(--sla-breached-bg)",
          },
          escalated: {
            text: "var(--sla-escalated-text)",
            bg: "var(--sla-escalated-bg)",
          },
        },
        priority: {
          urgent: {
            text: "var(--priority-urgent-text)",
            bg: "var(--priority-urgent-bg)",
          },
          high: {
            text: "var(--priority-high-text)",
            bg: "var(--priority-high-bg)",
          },
          medium: {
            text: "var(--priority-medium-text)",
            bg: "var(--priority-medium-bg)",
          },
          low: {
            text: "var(--priority-low-text)",
            bg: "var(--priority-low-bg)",
          },
        },
        status: {
          new: {
            text: "var(--status-new-text)",
            bg: "var(--status-new-bg)",
          },
          open: {
            text: "var(--status-open-text)",
            bg: "var(--status-open-bg)",
          },
          pending: {
            text: "var(--status-pending-text)",
            bg: "var(--status-pending-bg)",
          },
          escalated: {
            text: "var(--status-escalated-text)",
            bg: "var(--status-escalated-bg)",
          },
          resolved: {
            text: "var(--status-resolved-text)",
            bg: "var(--status-resolved-bg)",
          },
          closed: {
            text: "var(--status-closed-text)",
            bg: "var(--status-closed-bg)",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        caption: ["12px", { lineHeight: "16px" }],
        table: ["13px", { lineHeight: "20px" }],
        body: ["14px", { lineHeight: "20px" }],
        section: ["16px", { lineHeight: "24px" }],
        page: ["20px", { lineHeight: "28px" }],
        kpi: ["28px", { lineHeight: "36px" }],
        "micro-label": ["11px", { lineHeight: "14px", letterSpacing: "0.05em" }],
      },
      borderRadius: {
        input: "var(--radius-input)",
        card: "var(--radius-card)",
        modal: "var(--radius-modal)",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
        md: "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)",
        lg: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
      },
      transitionDuration: {
        hover: "var(--duration-hover)",
        panel: "var(--duration-panel)",
      },
    },
  },
  plugins: [],
};

export default config;
