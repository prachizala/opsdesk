"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { DEMO_USERS } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Search, ChevronDown, Check, ShieldAlert, X, AlertCircle, RefreshCw } from "lucide-react";
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
  const router = useRouter();
  const { currentUser, setCurrentUser } = useUser();
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("opsdesk_demo_banner_dismissed") === "true";
    }
    return false;
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [globalSearch, setGlobalSearch] = useState<string>("");

  // Keyboard shortcut: Ctrl+K / Cmd+K focuses global search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // API unreachable monitoring state
  const [isApiDown, setIsApiDown] = useState<boolean>(false);
  const [retryingIn, setRetryingIn] = useState<number>(15);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const checkApiHealth = useCallback(async () => {
    setIsRetrying(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/docs", {
        method: "HEAD",
        mode: "no-cors",
      }).catch(() => null);

      if (res !== null) {
        setIsApiDown(false);
        setRetryingIn(15);
      } else {
        setIsApiDown(true);
      }
    } catch {
      setIsApiDown(true);
    } finally {
      setIsRetrying(false);
    }
  }, []);

  // Periodic API health check
  useEffect(() => {
    checkApiHealth();
    const interval = setInterval(() => {
      checkApiHealth();
    }, 30000);
    return () => clearInterval(interval);
  }, [checkApiHealth]);

  // Countdown timer when API is detected down
  useEffect(() => {
    if (!isApiDown) return;
    const timer = setInterval(() => {
      setRetryingIn((prev) => {
        if (prev <= 1) {
          checkApiHealth();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isApiDown, checkApiHealth]);

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

  // Dismiss demo banner for current session
  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("opsdesk_demo_banner_dismissed", "true");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border shadow-xs">
      {/* 1. API Unreachable Error State Banner (persistent red-50 bar) */}
      {isApiDown && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-red-50 border-b border-red-200 h-8 px-4 text-caption text-red-800 flex items-center justify-between transition-subtle"
        >
          <div className="flex items-center gap-2 mx-auto">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>
              Operations API unreachable — changes cannot be saved. Retrying in {retryingIn}s...
            </span>
            <button
              type="button"
              onClick={checkApiHealth}
              disabled={isRetrying}
              className="underline font-semibold hover:text-red-950 ml-1.5 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
            >
              <RefreshCw className={cn("w-3 h-3", isRetrying && "animate-spin")} />
              Retry now
            </button>
          </div>
        </div>
      )}

      {/* 2. Slim amber demo-auth banner (32px, dismissible per session) */}
      {!isBannerDismissed && !isApiDown && (
        <div className="bg-amber-50 border-b border-amber-200 h-8 px-4 text-caption text-amber-800 flex items-center justify-between transition-subtle">
          <div className="flex items-center gap-2 mx-auto">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              Demo authentication — identity is client-supplied and not secure.
            </span>
          </div>
          <button
            type="button"
            onClick={handleDismissBanner}
            aria-label="Dismiss demo authentication banner"
            className="text-amber-700 hover:text-amber-900 p-1 rounded-input transition-subtle cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Main 56px Top Bar */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Geometric flight-path 'O' logo mark SVG + 'OpsDesk' */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-content-primary hover:opacity-90 transition-subtle focus-visible:outline-brand-500 rounded-input min-h-[44px] min-w-[44px]"
            aria-label="OpsDesk Home"
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

        {/* Center: Global Search Bar (Ctrl+K Focus Trigger) */}
        <div className="flex-1 max-w-md mx-auto hidden sm:block">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (globalSearch.trim()) {
                router.push(`/?search=${encodeURIComponent(globalSearch.trim())}`);
              }
            }}
            className="relative flex items-center"
          >
            <Search className="w-4 h-4 text-content-tertiary absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  searchInputRef.current?.blur();
                }
              }}
              placeholder="Search tickets, bookings, tags..."
              aria-label="Search tickets and bookings (Ctrl+K)"
              className="w-full h-9 pl-9 pr-16 rounded-input bg-surface-subtle text-caption text-content-primary placeholder:text-content-disabled border border-border hover:border-border-strong focus:border-brand-500 focus:bg-surface focus:outline-none transition-subtle"
            />
            <kbd className="absolute right-2.5 font-mono-numbers text-[10px] bg-surface text-content-tertiary px-1.5 py-0.5 rounded border border-border pointer-events-none select-none">
              Ctrl+K
            </kbd>
          </form>
        </div>

        {/* Right: Role Switcher showing avatar, name, role, agency/region */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            aria-label={`Active user persona: ${currentUser.name} (${currentUser.role})`}
            className="flex items-center gap-2.5 p-1.5 rounded-input hover:bg-surface-subtle transition-subtle cursor-pointer border border-transparent hover:border-border min-h-[44px]"
          >
            <Avatar name={currentUser.name} id={currentUser.id} size="sm" />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-caption font-semibold text-content-primary leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-content-tertiary leading-tight">
                {currentUser.role} {currentUser.agencyId ? `• ${currentUser.agencyId}` : currentUser.region ? `• ${currentUser.region}` : ""}
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
                        "w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-surface-subtle transition-subtle cursor-pointer min-h-[44px]",
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
