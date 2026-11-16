"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { DEMO_USERS } from "@/lib/types";
import {
  Search,
  Flame,
  BarChart3,
  Inbox,
  UserCheck,
  X,
  ArrowRight,
} from "lucide-react";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { currentUser, setCurrentUser } = useUser();

  // Toggle on Ctrl+K, Cmd+K, or slash when not typing in an input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  if (!isOpen) return null;

  const actions = [
    {
      id: "queue-triage",
      label: "Go to Operations Triage Queue",
      category: "Navigation",
      icon: <Inbox className="w-4 h-4 text-indigo-500" />,
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
      icon: <Flame className="w-4 h-4 text-rose-500" />,
      perform: () => {
        router.push("/?priority=Urgent");
        close();
      },
    },
  ];

  // User switcher quick actions
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

  const allItems = [...actions, ...userActions];
  const filtered = query.trim()
    ? allItems.filter(
        (i) =>
          i.label.toLowerCase().includes(query.toLowerCase()) ||
          i.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 sm:pt-20">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, case ID, or switch role (e.g. 'Aisha', 'Urgent', 'Queue')..."
            className="w-full text-sm bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
            autoFocus
          />
          <kbd className="hidden sm:inline-block text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
          <button onClick={close} className="text-slate-400 hover:text-slate-600 sm:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands or actions found.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={item.perform}
                className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-white transition-colors shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.category}</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Active Identity: <strong className="text-slate-600">{currentUser.name}</strong> ({currentUser.role})
          </span>
          <span className="hidden sm:inline">Use ↑ ↓ to navigate, ESC to close</span>
        </div>
      </div>
    </div>
  );
}
