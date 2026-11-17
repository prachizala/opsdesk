"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
}

export function ThemeToggle({ className, showLabels = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState<boolean>(false);

  // Apply theme to document
  const applyTheme = useCallback((mode: ThemeMode) => {
    try {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = mode === "dark" || (mode === "system" && isSystemDark);

      if (isDark) {
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // Ignore if running outside browser
    }
  }, []);

  // Initialize theme from localStorage or default to system
  useEffect(() => {
    try {
      const stored = localStorage.getItem("opsdesk_theme") as ThemeMode | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setTheme(stored);
        applyTheme(stored);
      } else {
        setTheme("system");
        applyTheme("system");
      }
    } catch {
      setTheme("system");
      applyTheme("system");
    }
    setMounted(true);
  }, [applyTheme]);

  // Listen for system theme changes when theme === "system"
  useEffect(() => {
    if (!mounted || theme !== "system") return;

    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        applyTheme("system");
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } catch {
      // Fallback if mediaQuery listener not supported
    }
  }, [mounted, theme, applyTheme]);

  const handleSelect = (mode: ThemeMode) => {
    setTheme(mode);
    try {
      localStorage.setItem("opsdesk_theme", mode);
    } catch {
      // Ignore localStorage errors (e.g. private mode)
    }
    applyTheme(mode);
  };

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: "light", label: "Light", icon: <Sun className="w-3.5 h-3.5" /> },
    { mode: "dark", label: "Dark", icon: <Moon className="w-3.5 h-3.5" /> },
    { mode: "system", label: "System", icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme mode"
      className={cn(
        "inline-flex items-center p-0.5 rounded-full bg-surface-subtle border border-border text-caption select-none",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = mounted ? theme === opt.mode : opt.mode === "system";
        return (
          <button
            key={opt.mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${opt.label} theme`}
            title={`${opt.label} theme`}
            onClick={() => handleSelect(opt.mode)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium transition-subtle cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              isActive
                ? "bg-surface text-content-primary shadow-xs font-semibold"
                : "text-content-tertiary hover:text-content-primary hover:bg-surface/50"
            )}
          >
            <span className="shrink-0">{opt.icon}</span>
            {showLabels && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
