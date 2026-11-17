"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  ariaLabel?: string;
  variant?: "underline" | "pill";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  ariaLabel = "Navigation tabs",
  variant = "underline",
}: TabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      onChange(tabs[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      onChange(tabs[prevIndex].id);
    }
  };

  if (variant === "pill") {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          "flex items-center gap-1 p-1 bg-surface-subtle border border-border rounded-input w-fit overflow-x-auto max-w-full",
          className
        )}
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-input text-caption font-medium transition-subtle shrink-0 cursor-pointer select-none",
                isActive
                  ? "bg-surface text-content-primary shadow-xs font-semibold"
                  : "text-content-secondary hover:text-content-primary hover:bg-surface/50"
              )}
            >
              {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "font-mono-numbers px-1.5 py-0.5 rounded-full text-[11px] leading-none",
                    isActive
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "bg-surface-subtle text-content-tertiary"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline style (OpsDesk default)
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex items-center gap-6 border-b border-border w-full overflow-x-auto select-none",
        className
      )}
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              "flex items-center gap-2 pb-2.5 pt-1 text-table font-medium transition-subtle shrink-0 cursor-pointer border-b-2 -mb-px focus-visible:outline-none",
              isActive
                ? "border-brand-500 text-brand-700 font-semibold"
                : "border-transparent text-content-secondary hover:text-content-primary hover:border-border-strong"
            )}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "font-mono-numbers px-1.5 py-0.5 rounded-full text-[11px] leading-none shrink-0",
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "bg-surface-subtle text-content-tertiary"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
