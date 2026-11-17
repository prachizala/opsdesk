"use client";

import React from "react";
import {
  Inbox,
  UserCheck,
  Building2,
  Layers,
  RotateCcw,
  Filter,
  LayoutList,
  Ticket as TicketIcon,
} from "lucide-react";
import { Tabs, TabItem, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface QueueTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isRequester: boolean;
  totalCount: number;
  viewMode?: "table" | "cards";
  onViewModeChange?: (mode: "table" | "cards") => void;
  hasActiveFilters: boolean;
  onToggleMobileFilters: () => void;
}

export function QueueTabs({
  activeTab,
  onTabChange,
  isRequester,
  totalCount,
  viewMode = "table",
  onViewModeChange,
  hasActiveFilters,
  onToggleMobileFilters,
}: QueueTabsProps) {
  const staffTabs: TabItem[] = [
    {
      id: "triage",
      label: "Triage",
      count: activeTab === "triage" ? totalCount : undefined,
      icon: <Inbox className="w-3.5 h-3.5" />,
    },
    {
      id: "my_queue",
      label: "Assigned to me",
      count: activeTab === "my_queue" ? totalCount : undefined,
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
    {
      id: "by_region",
      label: "By region",
      count: activeTab === "by_region" ? totalCount : undefined,
      icon: <Building2 className="w-3.5 h-3.5" />,
    },
    {
      id: "by_intent",
      label: "By intent",
      count: activeTab === "by_intent" ? totalCount : undefined,
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: "linked",
      label: "Linked cases",
      count: activeTab === "linked" ? totalCount : undefined,
      icon: <RotateCcw className="w-3.5 h-3.5" />,
    },
  ];

  const requesterTabs: TabItem[] = [
    {
      id: "my_agency",
      label: "Our Agency Tickets",
      count: activeTab === "my_agency" ? totalCount : undefined,
      icon: <Inbox className="w-3.5 h-3.5" />,
    },
    {
      id: "by_intent",
      label: "By intent",
      count: activeTab === "by_intent" ? totalCount : undefined,
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: "linked",
      label: "Linked cases",
      count: activeTab === "linked" ? totalCount : undefined,
      icon: <RotateCcw className="w-3.5 h-3.5" />,
    },
  ];

  const tabs = isRequester ? requesterTabs : staffTabs;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-1">
      {/* Gliding Underline Tabs */}
      <div className="flex-1 min-w-0">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={onTabChange}
          variant="underline"
          ariaLabel="Operations queue tabs"
          className="border-b-0"
        />
      </div>

      {/* Right Controls: View Toggle (Table | Cards) & Mobile Filter */}
      <div className="flex items-center gap-2 shrink-0 pb-1 self-end sm:self-center">
        {/* View Toggle: Table | Cards (Desktop & Tablet) */}
        {onViewModeChange && (
          <div
            role="group"
            aria-label="View layout toggle"
            className="hidden sm:inline-flex items-center p-0.5 rounded-input bg-surface-subtle border border-border select-none"
          >
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[12px] font-medium transition-subtle cursor-pointer",
                viewMode === "table"
                  ? "bg-surface text-content-primary shadow-xs font-semibold"
                  : "text-content-secondary hover:text-content-primary"
              )}
              aria-pressed={viewMode === "table"}
              title="Table View (fits 1280px)"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("cards")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[12px] font-medium transition-subtle cursor-pointer",
                viewMode === "cards"
                  ? "bg-surface text-content-primary shadow-xs font-semibold"
                  : "text-content-secondary hover:text-content-primary"
              )}
              aria-pressed={viewMode === "cards"}
              title="Cards View (Boarding pass cards)"
            >
              <TicketIcon className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        )}

        {/* Mobile Filter Toggle Button */}
        <div className="sm:hidden">
          <Button
            variant="secondary"
            size="sm"
            icon={<Filter className="w-3.5 h-3.5" />}
            onClick={onToggleMobileFilters}
          >
            Filters {hasActiveFilters && "(Active)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
