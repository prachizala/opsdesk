"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Layers,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

export interface SidebarProps {
  className?: string;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const pathname = usePathname();
  const { isLead, isEscalationManager, isRequester } = useUser();

  const navItems = [
    {
      href: "/",
      label: "Operations Queue",
      shortLabel: "Queue",
      icon: Layers,
      visible: true,
    },
    {
      href: "/insights",
      label: "Insights & Themes",
      shortLabel: "Insights",
      icon: BarChart3,
      visible: isLead || isEscalationManager,
    },
  ];

  return (
    <aside
      className={cn(
        "bg-surface border-r border-border transition-panel select-none shrink-0 flex flex-col justify-between py-4",
        collapsed ? "w-16" : "w-[232px]",
        className
      )}
      aria-label="Sidebar Navigation"
    >
      <div className="flex flex-col gap-6">
        {/* Navigation Category Label (Visible only when expanded) */}
        {!collapsed && (
          <div className="px-4">
            <span className="text-micro-label font-medium uppercase text-content-tertiary">
              {isRequester ? "Agency Workspace" : "Mission Control"}
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 px-2" role="navigation">
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-input text-table font-medium transition-subtle py-2 px-3",
                    isActive
                      ? "bg-brand-50 text-brand-700 font-semibold border-l-[3px] border-brand-600 pl-[9px]"
                      : "text-content-secondary hover:text-content-primary hover:bg-surface-subtle"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-brand-600" : "text-content-tertiary")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href} content={item.label} position="right">
                    {linkContent}
                  </Tooltip>
                );
              }

              return linkContent;
            })}
        </nav>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="px-2 pt-4 border-t border-border flex flex-col gap-2">
        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
          className={cn(
            "flex items-center gap-3 w-full rounded-input text-caption font-medium text-content-tertiary hover:text-content-primary hover:bg-surface-subtle transition-subtle py-2 px-3 cursor-pointer",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 shrink-0" />
              <span>Collapse sidebar</span>
            </>
          )}
        </button>

        {/* Short Version Label (Expanded only) */}
        {!collapsed && (
          <div className="px-3 pt-2 text-[11px] text-content-disabled flex items-center justify-between">
            <span>OpsDesk v1.0</span>
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>SLA Ready</span>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
