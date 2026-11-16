"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { DEMO_USERS } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Search, ChevronDown, Check, ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoMark({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Geometric 'O' ring */}
      <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="2.5" className="text-brand-500" />
      {/* Flight path arc crossing the ring */}
      <path
        d="M 6 22 C 12 18, 18 10, 26 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-brand-700"
      />
      {/* Supersonic trajectory beacon */}
      <circle cx="26" cy="6" r="2.2" fill="currentColor" className="text-brand-600" />
    </svg>
  );
}

export function TopNav() {
  const { currentUser, setCurrentUser } = useUser();
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Dispatch custom keyboard event for Ctrl+K global search
  const openCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border shadow-xs">
      {/* Persistent Slim Demo Auth Warning Banner (32px, session dismissable) */}
      {!isBannerDismissed && (
        <div className="bg-amber-50 border-b border-amber-200 h-8 px-4 text-caption text-amber-800 flex items-center justify-between transition-subtle">
          <div className="flex items-center gap-2 mx-auto">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              Demo authentication — identity is client-supplied and not secure.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsBannerDismissed(true)}
            aria-label="Dismiss demo authentication banner"
            className="text-amber-700 hover:text-amber-900 p-1 rounded-input transition-subtle cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main 56px Top Bar */}
      <div className="w-full max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Geometric Logo Mark + OpsDesk Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-content-primary hover:opacity-90 transition-subtle focus-visible:outline-brand-500 rounded-input"
          >
            <LogoMark className="w-7 h-7 text-brand-600" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-section tracking-tight text-content-primary">
                OpsDesk
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-brand-50 text-brand-700 border border-brand-100">
                Operations
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar (Cmd/Ctrl+K Focus Trigger) */}
        <div className="flex-1 max-w-md mx-auto hidden sm:block">
          <button
            type="button"
            onClick={openCommandPalette}
            className="w-full h-9 flex items-center justify-between px-3 rounded-input bg-surface-subtle text-caption text-content-secondary border border-border hover:border-border-strong transition-subtle cursor-pointer select-none"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-content-tertiary" />
              <span>Search tickets, bookings, tags...</span>
            </span>
            <kbd className="font-mono-numbers text-[10px] bg-surface text-content-tertiary px-1.5 py-0.5 rounded border border-border">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Persona Role Switcher & User Avatar */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            className="flex items-center gap-2.5 p-1.5 rounded-input hover:bg-surface-subtle transition-subtle cursor-pointer border border-transparent hover:border-border"
          >
            <Avatar name={currentUser.name} id={currentUser.id} size="sm" />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-caption font-semibold text-content-primary leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-content-tertiary leading-tight">
                {currentUser.role} {currentUser.region ? `• ${currentUser.region}` : ""}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-content-tertiary shrink-0" />
          </button>

          {/* Role Switcher Dropdown Popover */}
          {isDropdownOpen && (
            <div
              role="listbox"
              className="absolute right-0 mt-2 w-72 bg-surface border border-border rounded-card shadow-md py-1 z-50 animate-in fade-in zoom-in-95 duration-120"
            >
              <div className="px-3 py-2 border-b border-border bg-surface-subtle/50">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-content-tertiary">
                  Switch Active Persona
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto py-1">
                {DEMO_USERS.map((user) => {
                  const isSelected = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setCurrentUser(user);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-surface-subtle transition-subtle cursor-pointer",
                        isSelected && "bg-brand-50/70"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Avatar name={user.name} id={user.id} size="sm" />
                        <div className="truncate">
                          <p className="text-caption font-semibold text-content-primary leading-tight truncate">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-content-secondary leading-tight truncate">
                            {user.description}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-brand-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
