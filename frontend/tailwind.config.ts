import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chrome: {
          navy: {
            900: "var(--chrome-navy-900)",
            800: "var(--chrome-navy-800)",
          },
          text: "var(--chrome-text)",
          muted: "var(--chrome-muted)",
        },
        navy: {
          900: "var(--chrome-navy-900)",
          800: "var(--chrome-navy-800)",
        },
        departure: {
          amber: "var(--departure-amber)",
        },
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
          muted: "var(--text-muted)",
        },
        brand: {
          DEFAULT: "var(--brand-orange)",
          orange: "var(--brand-orange)",
          "orange-text": "var(--brand-orange-text)",
          "orange-fill": "var(--brand-orange-fill)",
          "orange-navy": "var(--brand-orange-navy)",
          tint: "var(--orange-tint)",
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
        },
        "focus-ring": "var(--focus-ring)",
        region: {
          mea: {
            text: "var(--region-mea-text)",
            bg: "var(--region-mea-bg)",
          },
          apac: {
            text: "var(--region-apac-text)",
            bg: "var(--region-apac-bg)",
          },
          eu: {
            text: "var(--region-eu-text)",
            bg: "var(--region-eu-bg)",
          },
          amer: {
            text: "var(--region-amer-text)",
            bg: "var(--region-amer-bg)",
          },
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
          stopped: {
            text: "var(--sla-stopped-text)",
            bg: "var(--sla-stopped-bg)",
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
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        11: ["11px", { lineHeight: "14px", letterSpacing: "0.05em" }],
        12: ["12px", { lineHeight: "16px" }],
        13: ["13px", { lineHeight: "20px" }],
        14: ["14px", { lineHeight: "20px" }],
        16: ["16px", { lineHeight: "24px" }],
        20: ["20px", { lineHeight: "28px" }],
        28: ["28px", { lineHeight: "36px" }],
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
        chip: "var(--radius-chip)",
        card: "var(--radius-card)",
        modal: "var(--radius-modal)",
        panel: "var(--radius-panel)",
        island: "var(--radius-panel)",
        24: "24px",
        12: "12px",
        8: "8px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(15, 23, 42, 0.04)",
        sm: "0 1px 3px rgba(15, 23, 42, 0.08)",
        md: "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)",
        lg: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
        glow: "0 0 16px -2px var(--brand-500)",
        "glow-amber": "0 0 16px -2px var(--departure-amber)",
      },
      transitionDuration: {
        hover: "var(--duration-hover)",
        panel: "var(--duration-panel)",
      },
      keyframes: {
        "sla-breach-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.08)" },
        },
        "shine-sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        "flap-flip": {
          "0%": { transform: "rotateX(0deg)" },
          "50%": { transform: "rotateX(-90deg)" },
          "100%": { transform: "rotateX(0deg)" },
        },
      },
      animation: {
        "sla-breach": "sla-breach-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shine": "shine-sweep 0.75s ease-in-out",
        "flap": "flap-flip 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
