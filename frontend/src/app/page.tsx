"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { fetchTickets, getExportUrl } from "@/lib/api";
import { TicketSummary } from "@/lib/types";
import { EmptyState, ErrorState } from "@/components/ui";
import {
  QueueHeader,
  QueueKpiStrip,
  QueueTabs,
  QueueFilterBar,
  QueueTable,
  QueuePagination,
  CreateTicketModal,
  MobileFilterSheet,
  MobileTicketCard,
} from "@/components/queue";

export default function QueuePage() {
  const { currentUser, isStaff, isRequester } = useUser();
  const { showToast } = useToast();

  // Navigation & Data state
  const [activeTab, setActiveTab] = useState<string>("triage");
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const pageSize = 50;

  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [intentFilter, setIntentFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [atRiskOnly, setAtRiskOnly] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Export & Modal state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

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

      // Client-side At Risk / Breached filter toggle
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

  // Clear filters
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(intentFilter) ||
    Boolean(priorityFilter) ||
    Boolean(statusFilter) ||
    atRiskOnly;

  const handleClearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setIntentFilter("");
    setPriorityFilter("");
    setStatusFilter("");
    setAtRiskOnly(false);
    setPage(0);
  };

  // CSV Export Handler
  const handleExportCsv = async () => {
    if (!isStaff) {
      showToast("CSV export is restricted to internal operations staff.", "warning");
      return;
    }
    setIsExporting(true);
    showToast("Preparing download: generating operations export...", "info");
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
      a.download = `opsdesk_export_${new Date().toISOString().slice(0, 10)}.csv`;
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

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Header */}
      <QueueHeader
        totalCount={totalCount}
        isStaff={isStaff}
        isExporting={isExporting}
        onExport={handleExportCsv}
        onCreateOpen={() => setIsCreateOpen(true)}
      />

      {/* 2. KPI Strip (Computed only from loaded tickets) */}
      <QueueKpiStrip tickets={tickets} />

      {/* 3. View Tabs */}
      <QueueTabs
        activeTab={activeTab}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
          setPage(0);
        }}
        isRequester={isRequester}
        totalCount={totalCount}
        hasActiveFilters={hasActiveFilters}
        onToggleMobileFilters={() => setMobileFiltersOpen((prev) => !prev)}
      />

      {/* 4. Filter Bar (Desktop) */}
      <QueueFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        debouncedSearch={debouncedSearch}
        intentFilter={intentFilter}
        onIntentChange={(val) => {
          setIntentFilter(val);
          setPage(0);
        }}
        priorityFilter={priorityFilter}
        onPriorityChange={(val) => {
          setPriorityFilter(val);
          setPage(0);
        }}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setPage(0);
        }}
        atRiskOnly={atRiskOnly}
        onToggleAtRisk={() => {
          setAtRiskOnly((prev) => !prev);
          setPage(0);
        }}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        className="hidden sm:flex"
      />

      {/* 5. Main Table & Mobile View Container */}
      <div className="bg-surface border border-border rounded-card shadow-xs overflow-hidden">
        {error ? (
          <div className="p-6">
            <ErrorState title="Failed to load tickets" message={error} onRetry={loadData} />
          </div>
        ) : !loading && tickets.length === 0 ? (
          <EmptyState
            title="No cases found in this view"
            description={
              hasActiveFilters
                ? "Try adjusting your search keywords or resetting active filters."
                : "Your operations dispatch queue is clear. Good job!"
            }
            actionLabel={hasActiveFilters ? "Clear active filters" : "Create new ticket"}
            onAction={hasActiveFilters ? handleClearFilters : () => setIsCreateOpen(true)}
            className="my-6"
          />
        ) : (
          <>
            {/* Desktop Table: Fits cleanly at 1280px+ with ZERO horizontal scrollbar */}
            <div className="hidden md:block">
              <QueueTable
                tickets={tickets}
                loading={loading}
                page={page}
                pageSize={pageSize}
                isStaff={isStaff}
              />
            </div>

            {/* Mobile View (< 768px): Stacked cards */}
            <div className="block md:hidden divide-y divide-border">
              {tickets.map((t, idx) => (
                <MobileTicketCard
                  key={t.id}
                  ticket={t}
                  rank={page * pageSize + idx + 1}
                />
              ))}
            </div>

            {/* 6. Pagination Footer */}
            <QueuePagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              loading={loading}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* 7. Mobile Filter Bottom Sheet */}
      <MobileFilterSheet
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        intentFilter={intentFilter}
        onIntentChange={(val) => {
          setIntentFilter(val);
          setPage(0);
        }}
        priorityFilter={priorityFilter}
        onPriorityChange={(val) => {
          setPriorityFilter(val);
          setPage(0);
        }}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setPage(0);
        }}
        atRiskOnly={atRiskOnly}
        onToggleAtRisk={() => {
          setAtRiskOnly((prev) => !prev);
          setPage(0);
        }}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* 8. Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
