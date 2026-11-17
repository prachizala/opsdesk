"use client";

import React from "react";
import { Inbox, UserCheck, Building2, Layers, RotateCcw, Filter } from "lucide-react";
import { Tabs, TabItem, Button } from "@/components/ui";

export interface QueueTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isRequester: boolean;
  totalCount: number;
  hasActiveFilters: boolean;
  onToggleMobileFilters: () => void;
}

export function QueueTabs({
  activeTab,
  onTabChange,
  isRequester,
  totalCount,
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
    <div className="flex items-center justify-between gap-3 border-b border-border">
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

      {/* Mobile Filter Toggle Button */}
      <div className="sm:hidden shrink-0 pb-1.5">
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
  );
}
