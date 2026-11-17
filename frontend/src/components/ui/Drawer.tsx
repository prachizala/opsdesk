"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./Button";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "md",
  className,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={cn(
          "relative w-full h-full bg-surface border-l border-border shadow-lg flex flex-col z-10 p-6 overflow-y-auto transition-panel",
          widthStyles[width],
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            {title && (
              <h2 className="text-section font-semibold text-content-primary tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-caption text-content-secondary mt-1">{subtitle}</p>
            )}
          </div>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Close drawer"
            onClick={onClose}
            className="text-content-tertiary hover:text-content-primary"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
