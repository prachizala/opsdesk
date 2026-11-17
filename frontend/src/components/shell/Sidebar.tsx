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
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

export interface SidebarProps {
  className?: string;
  onToggleCollapse?: (collapsed: boolean) => void;
}

interface RegionLoad {
  code: "MEA" | "APAC" | "EU" | "AMER";
  name: string;
  loadPct: number;
  textColor: string;
  barColor: string;
  bgColor: string;
}

const REGION_LOADS: RegionLoad[] = [
  { code: "MEA", name: "Middle East & Africa", loadPct: 78, textColor: "#D97706", barColor: "#D97706", bgColor: "#FEF3C7" },
  { code: "APAC", name: "Asia-Pacific", loadPct: 64, textColor: "#0D9488", barColor: "#0D9488", bgColor: "#CCFBF1" },
  { code: "EU", name: "Europe", loadPct: 91, textColor: "#2563EB", barColor: "#2563EB", bgColor: "#DBEAFE" },
  { code: "AMER", name: "Americas", loadPct: 45, textColor: "#7C3AED", barColor: "#7C3AED", bgColor: "#EDE9FE" },
];

export function Sidebar({ className, onToggleCollapse }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isHoverExpanded, setIsHoverExpanded] = useState<boolean>(false);
  const pathname = usePathname();
  const { isLead, isEscalationManager, isRequester } = useUser();

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    setIsHoverExpanded(false);
    if (onToggleCollapse) {
      onToggleCollapse(next);
    }
  };

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

  const effectivelyExpanded = !collapsed || isHoverExpanded;

  return (
    <div
      className={cn(
        "relative shrink-0 select-none",
        collapsed ? "w-16" : "w-[232px]",
        className
      )}
      onMouseEnter={() => {
        if (collapsed) setIsHoverExpanded(true);
      }}
      onMouseLeave={() => {
        if (collapsed) setIsHoverExpanded(false);
      }}
    >
      <aside
        className={cn(
          "bg-chrome-navy-900 border-r border-[#16384C] text-chrome-text flex flex-col justify-between py-4 min-h-[calc(100vh-56px)] transition-panel",
          collapsed && !isHoverExpanded
            ? "w-16"
            : "w-[232px]",
          collapsed && isHoverExpanded && "absolute top-0 left-0 z-30 shadow-2xl border-r border-[#1E455A]"
        )}
        aria-label="Sidebar Navigation"
      >
        <div className="flex flex-col gap-6">
          {/* Navigation Category Label */}
          {effectivelyExpanded ? (
            <div className="px-4">
              <span className="text-micro-label font-medium uppercase tracking-wider text-chrome-muted">
                {isRequester ? "Agency Workspace" : "Control Tower"}
              </span>
            </div>
          ) : (
            <div className="h-4" />
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
                      "group flex items-center gap-3 rounded-input text-table font-medium transition-subtle py-2 px-3",
                      isActive
                        ? "bg-chrome-navy-800 text-white font-semibold border-l-[3px] border-brand-500 pl-[9px]"
                        : "text-chrome-muted hover:text-chrome-text hover:bg-[#12303F]/70"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform duration-120 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5",
                        isActive ? "text-brand-500" : "text-chrome-muted group-hover:text-chrome-text"
                      )}
                    />
                    {effectivelyExpanded && <span className="truncate">{item.label}</span>}
                  </Link>
                );

                if (!effectivelyExpanded) {
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
        <div className="px-2 pt-4 border-t border-[#16384C] flex flex-col gap-3">
          {/* Region Load Bars */}
          {effectivelyExpanded ? (
            <div className="px-2 py-1 flex flex-col gap-2 bg-chrome-navy-800/60 rounded-input border border-[#1A3D52]/60">
              <div className="flex items-center justify-between text-[11px] text-chrome-muted font-mono-numbers">
                <span className="flex items-center gap-1 uppercase tracking-wider font-semibold">
                  <Activity className="w-3 h-3 text-brand-500" />
                  Region Load
                </span>
                <span className="text-[10px]">AVG 70%</span>
              </div>
              <div className="space-y-1.5 pt-0.5">
                {REGION_LOADS.map((reg) => (
                  <div key={reg.code} className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-center text-[10px] font-mono-numbers leading-tight">
                      <span className="font-semibold text-chrome-text">{reg.code}</span>
                      <span className="text-chrome-muted">{reg.loadPct}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-[#0E2736] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${reg.loadPct}%`,
                          backgroundColor: reg.barColor,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Tooltip
              content={
                <div className="p-1 space-y-1 font-mono-numbers text-[10px]">
                  <p className="font-semibold text-white mb-1">Region Operational Load:</p>
                  {REGION_LOADS.map((r) => (
                    <div key={r.code} className="flex justify-between gap-3">
                      <span>{r.code}:</span>
                      <span style={{ color: r.textColor }}>{r.loadPct}%</span>
                    </div>
                  ))}
                </div>
              }
              position="right"
            >
              <div className="flex flex-col items-center gap-1 py-1 cursor-default">
                <div className="flex items-center gap-0.5">
                  {REGION_LOADS.map((r) => (
                    <div
                      key={r.code}
                      className="w-1.5 h-3 rounded-xs"
                      style={{ backgroundColor: r.barColor }}
                      title={`${r.code} ${r.loadPct}%`}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono-numbers text-chrome-muted uppercase">LOAD</span>
              </div>
            </Tooltip>
          )}

          {/* Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={handleToggle}
            aria-label={collapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
            className={cn(
              "flex items-center gap-3 w-full rounded-input text-caption font-medium text-chrome-muted hover:text-white hover:bg-chrome-navy-800 transition-subtle py-2 px-3 cursor-pointer",
              !effectivelyExpanded && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <PanelLeft className="w-4 h-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 shrink-0" />
                <span>Collapse rail</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}
