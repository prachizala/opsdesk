"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { DEMO_USERS } from "@/lib/types";
import {
  Search,
  Flame,
  BarChart3,
  Inbox,
  UserCheck,
  Sun,
  Moon,
  Monitor,
  X,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { currentUser, setCurrentUser } = useUser();

  // Toggle on Ctrl+K, Cmd+K, or Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  const setTheme = (mode: "light" | "dark" | "system") => {
    try {
      localStorage.setItem("opsdesk_theme", mode);
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = mode === "dark" || (mode === "system" && isSystemDark);
      if (isDark) {
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        document.documentElement.classList.remove("dark");
      }
    } catch {}
    close();
  };

  const navActions = [
    {
      id: "queue-triage",
      label: "Go to Operations Queue",
      category: "Navigation",
      icon: <Inbox className="w-4 h-4 text-brand-orange-text dark:text-brand-orange" />,
      perform: () => {
        router.push("/");
        close();
      },
    },
    {
      id: "insights",
      label: "Open Operational Insights & Root Cause Trends",
      category: "Navigation",
      icon: <BarChart3 className="w-4 h-4 text-purple-500" />,
      perform: () => {
        router.push("/insights");
        close();
      },
    },
    {
      id: "urgent-cases",
      label: "Filter for Urgent Priority Cases",
      category: "Operations Filter",
      icon: <Flame className="w-4 h-4 text-amber-500" />,
      perform: () => {
        router.push("/?priority=Urgent");
        close();
      },
    },
  ];

  const themeActions = [
    {
      id: "theme-light",
      label: "Toggle Theme: Light Mode",
      category: "Appearance",
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      perform: () => setTheme("light"),
    },
    {
      id: "theme-dark",
      label: "Toggle Theme: Dark Mode",
      category: "Appearance",
      icon: <Moon className="w-4 h-4 text-blue-400" />,
      perform: () => setTheme("dark"),
    },
    {
      id: "theme-system",
      label: "Toggle Theme: System Default",
      category: "Appearance",
      icon: <Monitor className="w-4 h-4 text-slate-400" />,
      perform: () => setTheme("system"),
    },
  ];

  const userActions = DEMO_USERS.map((u) => ({
    id: `switch-${u.id}`,
    label: `Switch Identity: ${u.name} (${u.role})`,
    category: "Role Switcher",
    icon: <UserCheck className="w-4 h-4 text-emerald-500" />,
    perform: () => {
      setCurrentUser(u);
      close();
    },
  }));

  const allItems = [...navActions, ...themeActions, ...userActions];
  const filtered = query.trim()
    ? allItems.filter(
        (i) =>
          i.label.toLowerCase().includes(query.toLowerCase()) ||
          i.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].perform();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center p-4 sm:pt-20 select-none animate-in fade-in duration-150"
    >
      <div
        className="fixed inset-0"
        onClick={close}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl bg-surface border border-border rounded-modal shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-border flex items-center gap-3">
          <Search className="w-5 h-5 text-content-tertiary ml-2 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, page jump, role, or theme..."
            className="flex-1 bg-transparent text-body text-content-primary placeholder:text-content-disabled outline-none h-10 pr-2"
          />
          <button
            type="button"
            onClick={close}
            className="text-content-tertiary hover:text-content-primary p-1.5 rounded-full hover:bg-surface-subtle transition-subtle"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-border/40">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-caption text-content-tertiary">
              No matching commands or destinations found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.perform}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-body transition-subtle cursor-pointer",
                    isSelected
                      ? "bg-surface-subtle text-content-primary font-medium"
                      : "text-content-secondary hover:bg-surface-subtle/60"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface border border-border text-content-tertiary">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-brand-orange" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-surface-subtle border-t border-border flex items-center justify-between text-[11px] text-content-tertiary">
          <span>
            Current user: <strong className="text-content-primary">{currentUser.name}</strong> ({currentUser.role})
          </span>
          <div className="flex items-center gap-2 font-mono-numbers">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
