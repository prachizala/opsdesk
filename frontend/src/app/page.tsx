"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { fetchTickets, createTicket, suggestIntent, getExportUrl } from "@/lib/api";
import { TicketSummary } from "@/lib/types";
import {
  Button,
  Input,
  Select,
  Textarea,
  Tabs,
  Chip,
  PriorityChip,
  StatusChip,
  SlaBadge,
  Avatar,
  Modal,
  TableRowSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/ui";
import {
  Plus,
  Download,
  Search,
  Filter,
  X,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Layers,
  Inbox,
  UserCheck,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function QueuePage() {
  const { currentUser, isStaff, isLead, isRequester } = useUser();
  const { showToast } = useToast();
  const router = useRouter();

  // Navigation and Query state
  const [activeTab, setActiveTab] = useState<string>("triage");
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const pageSize = 15;

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [intentFilter, setIntentFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [atRiskOnly, setAtRiskOnly] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Create Ticket Modal State
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createTboh, setCreateTboh] = useState("");
  const [createPrio, setCreatePrio] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [createCheckin, setCreateCheckin] = useState("");
  const [createLcd, setCreateLcd] = useState("");
  const [createIntent, setCreateIntent] = useState("");
  const [suggestedIntentChip, setSuggestedIntentChip] = useState<string | null>(null);
  const [createAgency, setCreateAgency] = useState("AGY-001");
  const [suggestingIntent, setSuggestingIntent] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Set default tab on role switch
  useEffect(() => {
    if (isRequester) {
      setActiveTab("my_agency");
    } else {
      setActiveTab("triage");
    }
    setPage(0);
  }, [currentUser.id, isRequester]);

  // Load Queue Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const viewParam = isRequester
        ? activeTab === "my_agency"
          ? "triage"
          : activeTab
        : activeTab;

      const res = await fetchTickets(
        viewParam,
        pageSize,
        page * pageSize,
        currentUser.id,
        intentFilter || undefined,
        debouncedSearch || undefined,
        priorityFilter || undefined,
        statusFilter || undefined
      );

      let fetchedTickets = res.tickets || [];

      // Client-side At Risk / Breached toggle
      if (atRiskOnly) {
        fetchedTickets = fetchedTickets.filter(
          (t) => t.sla.status === "AT_RISK" || t.sla.status === "BREACHED"
        );
      }

      setTickets(fetchedTickets);
      setTotalCount(res.total || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load operations queue");
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    page,
    currentUser.id,
    isRequester,
    intentFilter,
    debouncedSearch,
    priorityFilter,
    statusFilter,
    atRiskOnly,
  ]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Tab definitions matching role
  const staffTabs = [
    { id: "triage", label: "Triage Active", icon: <Inbox className="w-3.5 h-3.5" /> },
    { id: "my_queue", label: "Assigned to Me", icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: "by_region", label: "By Region", icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: "by_intent", label: "By Intent", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "linked", label: "Linked Cases", icon: <RotateCcw className="w-3.5 h-3.5" /> },
  ];

  const requesterTabs = [
    { id: "my_agency", label: "Our Agency Tickets", icon: <Inbox className="w-3.5 h-3.5" /> },
    { id: "by_intent", label: "By Category", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "linked", label: "Linked Trips", icon: <RotateCcw className="w-3.5 h-3.5" /> },
  ];

  const currentTabs = isRequester ? requesterTabs : staffTabs;

  // Handle Export CSV
  const handleExportCsv = async () => {
    if (!isLead) {
      showToast(
        "CSV export is restricted to Operations Team Lead (RBAC rule). Current role: " +
          currentUser.role,
        "warning"
      );
      return;
    }
    setIsExporting(true);
    showToast("Preparing download: streaming operations database...", "info");
    try {
      const res = await fetch(getExportUrl(), {
        headers: { "X-User-Id": currentUser.id },
      });
      if (!res.ok) {
        throw new Error(`Export failed with HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `opsdesk_tickets_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Operations queue export downloaded successfully.", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Export failed. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Auto-Suggest Intent
  const handleSuggest = async () => {
    if (!createTitle.trim() && !createDesc.trim()) return;
    setSuggestingIntent(true);
    try {
      const res = await suggestIntent(createTitle, createDesc, currentUser.id);
      if (res && res.intent) {
        setSuggestedIntentChip(res.intent);
      }
    } catch {
      // Graceful fallback
    } finally {
      setSuggestingIntent(false);
    }
  };

  // Submit Create Ticket
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const newTicket = await createTicket(
        {
          title: createTitle.trim(),
          description: createDesc.trim(),
          tboh_id: createTboh.trim(),
          priority: createPrio,
          check_in_date: new Date(createCheckin).toISOString(),
          lcd_date: createLcd ? new Date(createLcd).toISOString() : null,
          intent: createIntent || undefined,
          agency_id: isStaff ? createAgency : undefined,
        },
        currentUser.id
      );

      setIsCreateOpen(false);
      // Reset form
      setCreateTitle("");
      setCreateDesc("");
      setCreateTboh("");
      setCreateCheckin("");
      setCreateLcd("");
      setCreateIntent("");
      setSuggestedIntentChip(null);

      showToast(`Ticket ${newTicket.id} created successfully!`, "success");
      loadData();
      router.push(`/ticket/${newTicket.id}`);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setCreating(false);
    }
  };

  // Clear all filters
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(intentFilter) ||
    Boolean(priorityFilter) ||
    Boolean(statusFilter) ||
    atRiskOnly;

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setIntentFilter("");
    setPriorityFilter("");
    setStatusFilter("");
    setAtRiskOnly(false);
    setPage(0);
  };

  // Form validity check
  const isFormValid =
    createTitle.trim().length >= 3 &&
    createDesc.trim().length >= 5 &&
    createTboh.trim().length >= 3 &&
    Boolean(createCheckin);

  // Pagination bounds
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = Math.min((page + 1) * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-page font-semibold text-content-primary tracking-tight">
              Operations Queue
            </h1>
            <span className="font-mono-numbers text-caption px-2 py-0.5 rounded-full bg-surface border border-border text-content-secondary font-medium">
              {totalCount.toLocaleString()} cases
            </span>
          </div>
          <p className="text-caption text-content-secondary mt-1">
            Real-time travel dispatching with LCD-aware SLA countdowns and tenant isolation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {isStaff && (
            <Button
              variant="secondary"
              size="md"
              loading={isExporting}
              icon={<Download className="w-4 h-4 text-content-secondary" />}
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            New ticket
          </Button>
        </div>
      </div>

      {/* 2. View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs
          tabs={currentTabs}
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setPage(0);
          }}
          ariaLabel="Queue view modes"
        />

        {/* Mobile Filter Sheet Toggle Button */}
        <div className="sm:hidden flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            icon={<Filter className="w-3.5 h-3.5" />}
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            Filters {hasActiveFilters && "(Active)"}
          </Button>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div
        className={cn(
          "bg-surface border border-border rounded-card p-3 shadow-xs flex flex-col gap-3",
          mobileFiltersOpen ? "block" : "hidden sm:flex"
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="lg:col-span-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search TBOH, TCK-ID, keyword..."
              leftIcon={<Search className="w-4 h-4 text-content-tertiary" />}
              rightIcon={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="cursor-pointer text-content-tertiary hover:text-content-primary"
                    aria-label="Clear search query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : undefined
              }
            />
          </div>

          {/* Intent Category Select */}
          <div className="lg:col-span-3">
            <Select
              value={intentFilter}
              onChange={(e) => {
                setIntentFilter(e.target.value);
                setPage(0);
              }}
              options={[
                { value: "", label: "All Intent Categories" },
                { value: "Refund Request", label: "Refund Request" },
                { value: "Cancellation Inconvenience", label: "Cancellation Inconvenience" },
                { value: "Date Amendment", label: "Date Amendment" },
                { value: "Bedding / Room Preference", label: "Bedding / Room Preference" },
                { value: "Voucher Resend", label: "Voucher Resend" },
                { value: "Emergency Check-in Assist", label: "Emergency Check-in Assist" },
                { value: "Unclassified", label: "Unclassified" },
              ]}
            />
          </div>

          {/* Priority Select */}
          <div className="lg:col-span-2">
            <Select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(0);
              }}
              options={[
                { value: "", label: "All Priorities" },
                { value: "Urgent", label: "Urgent" },
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
              ]}
            />
          </div>

          {/* Status Select */}
          <div className="lg:col-span-2">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              options={[
                { value: "", label: "All Statuses" },
                { value: "New", label: "New" },
                { value: "Open", label: "Open" },
                { value: "Pending", label: "Pending" },
                { value: "Escalated", label: "Escalated" },
                { value: "Resolved", label: "Resolved" },
                { value: "Closed", label: "Closed" },
              ]}
            />
          </div>

          {/* At Risk Only Toggle */}
          <div className="lg:col-span-1 flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                setAtRiskOnly(!atRiskOnly);
                setPage(0);
              }}
              className={cn(
                "h-9 px-2.5 rounded-input text-caption font-medium border flex items-center gap-1.5 transition-subtle cursor-pointer select-none whitespace-nowrap",
                atRiskOnly
                  ? "bg-amber-100 text-amber-900 border-amber-300 font-semibold"
                  : "bg-surface text-content-secondary border-border hover:border-border-strong"
              )}
              title="Filter by At-Risk or Breached SLAs only"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>At risk</span>
            </button>
          </div>
        </div>

        {/* Removable Active Filter Chips & Clear Filters Link */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border text-caption">
            <span className="text-content-tertiary font-medium">Active filters:</span>
            {debouncedSearch && (
              <Chip size="sm" variant="brand">
                Search: &quot;{debouncedSearch}&quot;
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="ml-1 text-content-tertiary hover:text-content-primary cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </Chip>
            )}
            {intentFilter && (
              <Chip size="sm" variant="default">
                Intent: {intentFilter}
                <button
                  type="button"
                  onClick={() => setIntentFilter("")}
                  className="ml-1 text-content-tertiary hover:text-content-primary cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </Chip>
            )}
            {priorityFilter && (
              <Chip size="sm" variant="default">
                Priority: {priorityFilter}
                <button
                  type="button"
                  onClick={() => setPriorityFilter("")}
                  className="ml-1 text-content-tertiary hover:text-content-primary cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </Chip>
            )}
            {statusFilter && (
              <Chip size="sm" variant="default">
                Status: {statusFilter}
                <button
                  type="button"
                  onClick={() => setStatusFilter("")}
                  className="ml-1 text-content-tertiary hover:text-content-primary cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </Chip>
            )}
            {atRiskOnly && (
              <Chip size="sm" variant="default" className="bg-amber-50 text-amber-900 border-amber-200">
                At risk only
                <button
                  type="button"
                  onClick={() => setAtRiskOnly(false)}
                  className="ml-1 text-content-tertiary hover:text-content-primary cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </Chip>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="text-brand-600 hover:text-brand-700 font-medium ml-auto cursor-pointer underline text-caption"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Desktop Table & Mobile Stacked Cards */}
      <div className="bg-surface border border-border rounded-card shadow-xs overflow-hidden">
        {error ? (
          <div className="p-6">
            <ErrorState title="Failed to load tickets" message={error} onRetry={loadData} />
          </div>
        ) : loading && tickets.length === 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-micro-label uppercase text-content-tertiary">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-4">SLA Countdown</th>
                  <th className="py-3 px-4">Case Reference</th>
                  <th className="py-3 px-4">Agency</th>
                  <th className="py-3 px-3">Intent</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4">Deadlines (Check-in / LCD)</th>
                  <th className="py-3 px-4">Assignee</th>
                  {isStaff && <th className="py-3 px-3 text-right">Score</th>}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRowSkeleton key={i} columns={isStaff ? 10 : 9} />
                ))}
              </tbody>
            </table>
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No cases found in this view"
            description={
              hasActiveFilters
                ? "Try adjusting your search keywords or resetting active filters."
                : "Your operations dispatch queue is clear. Good job!"
            }
            actionLabel={hasActiveFilters ? "Clear active filters" : "Create new ticket"}
            onAction={hasActiveFilters ? clearFilters : () => setIsCreateOpen(true)}
            className="my-6"
          />
        ) : (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-subtle text-micro-label uppercase text-content-tertiary sticky top-0 z-10">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-4 min-w-[160px]">SLA Countdown</th>
                    <th className="py-3 px-4 min-w-[240px]">Case Details</th>
                    <th className="py-3 px-4 min-w-[150px]">Agency</th>
                    <th className="py-3 px-3">Intent</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 min-w-[160px]">Deadlines</th>
                    <th className="py-3 px-4 min-w-[150px]">Assignee</th>
                    {isStaff && <th className="py-3 px-3 text-right w-16">Score</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tickets.map((t, idx) => {
                    const rank = page * pageSize + idx + 1;
                    const isRankOneEmergency =
                      rank === 1 &&
                      t.priority === "Urgent" &&
                      (t.sla.status === "AT_RISK" || t.sla.status === "BREACHED");

                    // 4px left SLA color bar
                    const slaBorderColor = {
                      NORMAL: "border-l-emerald-500",
                      AT_RISK: "border-l-amber-500",
                      BREACHED: "border-l-red-600",
                      STOPPED: "border-l-slate-300",
                    }[t.sla.status] || "border-l-slate-300";

                    return (
                      <tr
                        key={t.id}
                        onClick={() => router.push(`/ticket/${t.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") router.push(`/ticket/${t.id}`);
                        }}
                        tabIndex={0}
                        className={cn(
                          "h-14 hover:bg-surface-subtle transition-subtle cursor-pointer border-l-4 group select-none",
                          slaBorderColor
                        )}
                        role="link"
                        aria-label={`View ticket ${t.id} - ${t.title}`}
                      >
                        {/* Gutter Rank Column */}
                        <td className="py-3 px-3 text-center text-caption font-mono-numbers text-content-tertiary">
                          {rank}
                        </td>

                        {/* SLA Badge with Live Tabular Countdown */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <SlaBadge sla={t.sla} isEscalated={t.status === "Escalated"} />
                            {isRankOneEmergency && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-100 px-1.5 py-0.2 rounded">
                                Check-in &lt; 4h
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Case Details */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-mono-numbers text-table font-semibold text-content-primary group-hover:text-brand-600 transition-subtle">
                                {t.id}
                              </span>
                              <span className="font-mono-numbers text-[11px] text-content-tertiary">
                                {t.tboh_id}
                              </span>
                            </div>
                            <span className="text-table text-content-secondary truncate max-w-sm" title={t.title}>
                              {t.title}
                            </span>
                          </div>
                        </td>

                        {/* Agency */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar name={t.agency_id} id={t.agency_id} size="sm" />
                            <span className="text-table font-medium text-content-secondary truncate max-w-[120px]">
                              {t.agency_id}
                            </span>
                          </div>
                        </td>

                        {/* Intent */}
                        <td className="py-3 px-3">
                          <Chip size="sm" variant="brand" className="truncate max-w-[140px]">
                            {t.intent || "General"}
                          </Chip>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3">
                          <PriorityChip priority={t.priority} />
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <StatusChip status={t.status} />
                        </td>

                        {/* Deadlines (Check-in / LCD) */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col text-[11px] gap-0.5">
                            <div className="flex items-center gap-1.5 text-content-secondary">
                              <Calendar className="w-3 h-3 text-content-tertiary shrink-0" />
                              <span
                                className={cn(
                                  "font-mono-numbers",
                                  t.intent === "Emergency Check-in Assist" && "font-semibold text-content-primary"
                                )}
                              >
                                In: {new Date(t.check_in_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                              </span>
                            </div>
                            {t.lcd_date && (
                              <div className="flex items-center gap-1.5 text-content-tertiary">
                                <Clock className="w-3 h-3 text-content-disabled shrink-0" />
                                <span
                                  className={cn(
                                    "font-mono-numbers",
                                    t.intent !== "Emergency Check-in Assist" && "font-semibold text-content-primary"
                                  )}
                                >
                                  LCD: {new Date(t.lcd_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Assignee */}
                        <td className="py-3 px-4">
                          {t.assigned_to ? (
                            <div className="flex items-center gap-2">
                              <Avatar name={t.assigned_to} id={t.assigned_to} size="sm" />
                              <span className="text-table font-medium text-content-secondary">
                                {t.assigned_to}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-input text-caption text-content-disabled border border-dashed border-border">
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Queue Score (Staff only) */}
                        {isStaff && (
                          <td className="py-3 px-3 text-right">
                            {t.queue_score !== null && t.queue_score !== undefined ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className="font-mono-numbers text-caption font-semibold text-content-primary">
                                  {t.queue_score}
                                </span>
                                <div className="w-8 h-1 bg-surface-subtle rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-brand-500 rounded-full"
                                    style={{ width: `${Math.min(100, (t.queue_score / 150) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-content-disabled text-caption font-mono-numbers">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (< 768px) */}
            <div className="block md:hidden divide-y divide-border">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => router.push(`/ticket/${t.id}`)}
                  className="p-4 hover:bg-surface-subtle transition-subtle cursor-pointer flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-numbers text-table font-semibold text-content-primary">
                        {t.id}
                      </span>
                      <span className="font-mono-numbers text-[11px] text-content-tertiary">
                        {t.tboh_id}
                      </span>
                    </div>
                    <SlaBadge sla={t.sla} isEscalated={t.status === "Escalated"} />
                  </div>

                  <p className="text-table text-content-primary font-medium line-clamp-2">
                    {t.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <PriorityChip priority={t.priority} />
                    <StatusChip status={t.status} />
                    <Chip size="sm" variant="brand">
                      {t.intent || "General"}
                    </Chip>
                  </div>

                  <div className="flex items-center justify-between text-caption text-content-secondary pt-2 border-t border-border/60">
                    <span className="font-mono-numbers">
                      In: {new Date(t.check_in_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </span>
                    <span>{t.assigned_to ? `Assigned: ${t.assigned_to}` : "Unassigned"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 5. Pagination Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-surface-subtle/50 text-caption text-content-secondary">
              <span className="font-mono-numbers">
                Showing {startItem}–{endItem} of {totalCount.toLocaleString()} cases
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 0 || loading}
                  icon={<ChevronLeft className="w-3.5 h-3.5" />}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <span className="font-mono-numbers px-2">
                  Page {page + 1} of {Math.max(1, totalPages)}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page + 1 >= totalPages || loading}
                  icon={<ChevronRight className="w-3.5 h-3.5" />}
                  iconPosition="right"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 6. Create Ticket Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Operations Ticket"
        subtitle="Dispatch an operations incident with atomic tenant verification and travel SLA computation."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-5 pt-2">
          {createError && (
            <div className="p-3 bg-red-50 text-red-700 text-caption rounded-input border border-red-200">
              {createError}
            </div>
          )}

          {/* Section 1: Booking & Tenant Parameters */}
          <div className="flex flex-col gap-3">
            <h4 className="text-micro-label uppercase text-content-tertiary font-semibold tracking-wider">
              1. Booking &amp; Itinerary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="TBOH Booking ID *"
                value={createTboh}
                onChange={(e) => setCreateTboh(e.target.value.toUpperCase())}
                placeholder="TBOH-1001"
                required
                helperText="External supplier booking identifier"
              />

              {isStaff ? (
                <Select
                  label="Agency Tenant *"
                  value={createAgency}
                  onChange={(e) => setCreateAgency(e.target.value)}
                  options={[
                    { value: "AGY-001", label: "Grand Travel Agency (AGY-001)" },
                    { value: "AGY-002", label: "Apex Journeys (AGY-002)" },
                    { value: "AGY-003", label: "Skyline Holidays (AGY-003)" },
                    { value: "AGY-004", label: "Nomad Corp (AGY-004)" },
                  ]}
                />
              ) : (
                <Input
                  label="Agency Tenant"
                  value={currentUser.name}
                  disabled
                  helperText="Strictly tenant-scoped to your agency"
                />
              )}

              <Input
                type="datetime-local"
                label="Guest Check-in Date *"
                value={createCheckin}
                onChange={(e) => setCreateCheckin(e.target.value)}
                required
                helperText="Controlling deadline for Emergency Assist"
              />

              <Input
                type="datetime-local"
                label="Last Cancellation Date (LCD)"
                value={createLcd}
                onChange={(e) => setCreateLcd(e.target.value)}
                helperText="Controlling deadline for Refund &amp; Cancellation"
              />
            </div>
          </div>

          {/* Section 2: Issue Details */}
          <div className="flex flex-col gap-3 pt-3 border-t border-border">
            <h4 className="text-micro-label uppercase text-content-tertiary font-semibold tracking-wider">
              2. Operations Issue
            </h4>

            <Input
              label="Subject / Ticket Title *"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="e.g. Supplier failed to confirm room allocation"
              required
            />

            <Textarea
              label="Issue Description *"
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              placeholder="Detailed description of guest status, supplier communication, and required resolution..."
              rows={3}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div>
                <Select
                  label="Category / Intent"
                  value={createIntent}
                  onChange={(e) => setCreateIntent(e.target.value)}
                  options={[
                    { value: "", label: "Select category..." },
                    { value: "Refund Request", label: "Refund Request" },
                    { value: "Cancellation Inconvenience", label: "Cancellation Inconvenience" },
                    { value: "Date Amendment", label: "Date Amendment" },
                    { value: "Bedding / Room Preference", label: "Bedding / Room Preference" },
                    { value: "Voucher Resend", label: "Voucher Resend" },
                    { value: "Emergency Check-in Assist", label: "Emergency Check-in Assist" },
                    { value: "Unclassified", label: "Unclassified" },
                  ]}
                />

                <div className="mt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    loading={suggestingIntent}
                    icon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
                    onClick={handleSuggest}
                    className="text-brand-600 hover:text-brand-700 p-0 text-caption"
                  >
                    Auto-suggest intent
                  </Button>

                  {suggestedIntentChip && (
                    <div className="flex items-center gap-1.5 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-input text-caption text-brand-700">
                      <span>Suggested: {suggestedIntentChip}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCreateIntent(suggestedIntentChip);
                          setSuggestedIntentChip(null);
                        }}
                        className="font-bold underline ml-1 cursor-pointer"
                        title="Accept suggestion"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => setSuggestedIntentChip(null)}
                        className="cursor-pointer text-content-tertiary hover:text-content-primary"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Select
                label="Priority Level *"
                value={createPrio}
                onChange={(e) => setCreatePrio(e.target.value as "Low" | "Medium" | "High" | "Urgent")}
                options={[
                  { value: "Low", label: "Low (Normal SLA)" },
                  { value: "Medium", label: "Medium (Standard 24h SLA)" },
                  { value: "High", label: "High (Accelerated SLA)" },
                  { value: "Urgent", label: "Urgent (Immediate Triage)" },
                ]}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!isFormValid || creating}
              loading={creating}
            >
              Dispatch Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
