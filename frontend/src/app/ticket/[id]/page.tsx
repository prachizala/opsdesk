"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import {
  fetchTicketDetail,
  assignTicket,
  unassignTicket,
  updateTicketStatus,
  escalateTicket,
  transferTicket,
  postMessage,
  createSideThread,
  postSideThreadMessage,
  linkSuggestedBug,
} from "@/lib/api";
import { TicketDetail } from "@/lib/types";
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
  Card,
  CardHeader,
  Modal,
  KeyValue,
  EmptyState,
  ErrorState,
  Tooltip,
} from "@/components/ui";
import {
  ChevronRight,
  ArrowLeft,
  Send,
  MessageSquare,
  Lock,
  Globe,
  UserCheck,
  UserX,
  Shuffle,
  ShieldAlert,
  Bug,
  Plus,
  ExternalLink,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";

// --- HERO COMPONENT: Travel Timeline ---
interface TravelTimelineProps {
  createdAt: string;
  checkInDate: string;
  lcdDate: string | null;
}

function TravelTimeline({ createdAt, checkInDate, lcdDate }: TravelTimelineProps) {
  const tCreate = new Date(createdAt).getTime();
  const tCheckIn = new Date(checkInDate).getTime();
  const tLcd = lcdDate ? new Date(lcdDate).getTime() : null;
  const tNow = Date.now();

  const isLcdControlling = tLcd !== null && tLcd <= tCheckIn;
  const controllingTime = isLcdControlling ? tLcd : tCheckIn;
  const controllingLabel = isLcdControlling ? "LCD Deadline" : "Guest Check-in";

  // Calculate timeline bounds
  const minTime = Math.min(tCreate, tNow);
  const maxTime = Math.max(tCheckIn, tNow, tLcd || tCheckIn);
  const totalSpan = maxTime - minTime || 1;

  const clamp = (val: number) => Math.min(Math.max(val, 2), 98);
  const pctNow = clamp(((tNow - minTime) / totalSpan) * 100);
  const pctLcd = tLcd ? clamp(((tLcd - minTime) / totalSpan) * 100) : null;
  const pctCheckIn = clamp(((tCheckIn - minTime) / totalSpan) * 100);

  const hoursToControlling = Math.round((controllingTime - tNow) / (1000 * 60 * 60));

  return (
    <div className="bg-surface-subtle border border-border rounded-card p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-caption font-semibold text-content-primary uppercase tracking-wider">
          Travel Timeline
        </span>
        <span
          className={cn(
            "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
            hoursToControlling < 0
              ? "bg-red-50 text-red-700 border-red-200"
              : hoursToControlling <= 24
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-brand-50 text-brand-700 border-brand-200"
          )}
        >
          ⚡ Controlling: {controllingLabel} ({hoursToControlling > 0 ? `${hoursToControlling}h left` : "Overdue"})
        </span>
      </div>

      {/* 8px Track */}
      <div className="relative pt-6 pb-8 px-2">
        <div className="h-2 w-full bg-slate-200 rounded-full relative overflow-visible">
          {/* Past progress segment */}
          <div
            className="absolute left-0 top-0 h-full bg-slate-400 rounded-l-full"
            style={{ width: `${pctNow}%` }}
          />
          {/* Active travel window */}
          <div
            className="absolute top-0 h-full bg-brand-500/30"
            style={{ left: `${pctNow}%`, width: `${Math.max(0, pctCheckIn - pctNow)}%` }}
          />

          {/* Marker: NOW */}
          <div
            className="absolute -top-1.5 -translate-x-1/2 flex flex-col items-center z-10"
            style={{ left: `${pctNow}%` }}
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-blue-400 opacity-60" />
              <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
            </div>
            <span className="mt-1 text-[10px] font-semibold tracking-wider text-blue-700 uppercase bg-blue-50 px-1 rounded border border-blue-200 whitespace-nowrap">
              NOW
            </span>
          </div>

          {/* Marker: LCD (if exists) */}
          {pctLcd !== null && (
            <div
              className="absolute -top-1.5 -translate-x-1/2 flex flex-col items-center z-10"
              style={{ left: `${pctLcd}%` }}
            >
              <div
                className={cn(
                  "w-3.5 h-3.5 rotate-45 border-2 shadow-sm",
                  isLcdControlling
                    ? "bg-amber-500 border-amber-800 ring-2 ring-amber-200"
                    : "bg-slate-400 border-white"
                )}
              />
              <span
                className={cn(
                  "mt-2 text-[10px] font-mono-numbers px-1.5 py-0.5 rounded border whitespace-nowrap",
                  isLcdControlling
                    ? "bg-amber-50 text-amber-900 border-amber-300 font-semibold"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                )}
              >
                LCD {lcdDate ? new Date(lcdDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric" }) : ""}
              </span>
            </div>
          )}

          {/* Marker: Check-in */}
          <div
            className="absolute -top-1.5 -translate-x-1/2 flex flex-col items-center z-10"
            style={{ left: `${pctCheckIn}%` }}
          >
            <div
              className={cn(
                "w-3.5 h-3.5 rounded-full border-2 shadow-sm",
                !isLcdControlling
                  ? "bg-emerald-600 border-emerald-900 ring-2 ring-emerald-200"
                  : "bg-slate-400 border-white"
              )}
            />
            <span
              className={cn(
                "mt-2 text-[10px] font-mono-numbers px-1.5 py-0.5 rounded border whitespace-nowrap",
                !isLcdControlling
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              )}
            >
              Check-in {new Date(checkInDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const { currentUser, isStaff, isLead } = useUser();
  const { showToast } = useToast();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs & Forms
  const [conversationTab, setConversationTab] = useState<"public" | "internal" | "suppliers">("public");
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  // Supplier side thread states
  const [activeSideThread, setActiveSideThread] = useState<string | null>(null);
  const [sideReplyBody, setSideReplyBody] = useState("");
  const [sendingSideReply, setSendingSideReply] = useState(false);

  // Action Modals
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferAgentId, setTransferAgentId] = useState("USR-102");
  const [transferReason, setTransferReason] = useState("");
  const [transferring, setTransferring] = useState(false);

  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");
  const [escalating, setEscalating] = useState(false);

  const [bugModalOpen, setBugModalOpen] = useState(false);
  const [bugLink, setBugLink] = useState("");
  const [linkingBug, setLinkingBug] = useState(false);

  const [sideThreadModalOpen, setSideThreadModalOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newRecipients, setNewRecipients] = useState("");
  const [newInitialMsg, setNewInitialMsg] = useState("");
  const [creatingSideThread, setCreatingSideThread] = useState(false);

  const loadTicket = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTicketDetail(ticketId, currentUser.id);
      setTicket(data);
      if (data.side_conversations && data.side_conversations.length > 0 && !activeSideThread) {
        setActiveSideThread(data.side_conversations[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  }, [ticketId, currentUser.id, activeSideThread]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  // Valid Next Statuses calculation
  const validNextStatuses = useMemo((): string[] => {
    if (!ticket) return [];
    switch (ticket.status) {
      case "New":
        return ["Open", "Pending", "Escalated", "Closed"];
      case "Open":
        return ["Pending", "Escalated", "Resolved", "Closed"];
      case "Pending":
        return ["Open", "Escalated", "Resolved", "Closed"];
      case "Escalated":
        return ["Open", "Pending", "Resolved", "Closed"];
      case "Resolved":
        return ["Closed", "Open"];
      case "Closed":
        return isLead ? ["Open"] : [];
      default:
        return ["Open", "Pending", "Resolved", "Closed"];
    }
  }, [ticket, isLead]);

  // Post message handler (public or internal)
  const handlePostMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageContent.trim() || sendingMessage) return;

    setSendingMessage(true);
    setMessageError(null);
    const msgType = conversationTab === "internal" ? "InternalNote" : "PublicReply";

    try {
      await postMessage(ticketId, msgType, messageContent.trim(), currentUser.id);
      setMessageContent("");
      showToast(
        msgType === "PublicReply"
          ? "Customer reply dispatched to agency"
          : "Internal note recorded on case audit log",
        "success"
      );
      loadTicket();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to post message";
      setMessageError(msg);
      showToast(msg, "error");
    } finally {
      setSendingMessage(false);
    }
  };

  // Keyboard shortcut Cmd/Ctrl + Enter in composer
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handlePostMessage();
    }
  };

  const handlePostSideReply = async (sideId: string) => {
    if (!sideReplyBody.trim() || sendingSideReply) return;
    setSendingSideReply(true);
    try {
      await postSideThreadMessage(ticketId, sideId, sideReplyBody.trim(), currentUser.id);
      setSideReplyBody("");
      showToast("Supplier email dispatched", "success");
      loadTicket();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to post supplier reply", "error");
    } finally {
      setSendingSideReply(false);
    }
  };

  const handleCreateSideThread = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipientList = newRecipients
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    setCreatingSideThread(true);
    try {
      await createSideThread(
        ticketId,
        {
          supplier_name: newSupplierName.trim(),
          subject: newSubject.trim(),
          recipients: recipientList,
          initial_message: newInitialMsg.trim(),
        },
        currentUser.id
      );
      setSideThreadModalOpen(false);
      setNewSupplierName("");
      setNewSubject("");
      setNewRecipients("");
      setNewInitialMsg("");
      showToast(`Supplier side-thread initialized with ${newSupplierName}`, "success");
      loadTicket();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to create supplier thread", "error");
    } finally {
      setCreatingSideThread(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTicketStatus(ticketId, newStatus, currentUser.id);
      showToast(`Status updated to ${newStatus}`, "info");
      loadTicket();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Invalid status transition", "error");
    }
  };

  const handleTransfer = async () => {
    if (!transferReason.trim() || transferring) return;
    setTransferring(true);
    try {
      await transferTicket(ticketId, transferAgentId, transferReason.trim(), currentUser.id);
      setTransferModalOpen(false);
      setTransferReason("");
      showToast(`Ticket successfully transferred to ${transferAgentId} (supplier recipients preserved)`, "success");
      loadTicket();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Transfer failed", "error");
    } finally {
      setTransferring(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim() || escalating) return;
    setEscalating(true);
    try {
      await escalateTicket(ticketId, escalateReason.trim(), currentUser.id);
      setEscalateModalOpen(false);
      setEscalateReason("");
      showToast("Ticket escalated to Operations Escalation Manager", "warning");
      loadTicket();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Escalation failed", "error");
    } finally {
      setEscalating(false);
    }
  };

  const handleLinkBug = async () => {
    if (!bugLink.trim() || linkingBug) return;
    setLinkingBug(true);
    try {
      await linkSuggestedBug(ticketId, bugLink.trim(), currentUser.id);
      setBugModalOpen(false);
      setBugLink("");
      showToast("Internal product defect reference linked", "success");
      loadTicket();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Bug link failed", "error");
    } finally {
      setLinkingBug(false);
    }
  };

  const handleClaim = async () => {
    try {
      await assignTicket(ticketId, currentUser.id, currentUser.id);
      showToast("Ticket claimed and assigned to your queue", "success");
      loadTicket();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Assignment failed", "error");
    }
  };

  const handleUnassign = async () => {
    try {
      await unassignTicket(ticketId, currentUser.id);
      showToast("Ticket unassigned and returned to triage queue", "info");
      loadTicket();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Unassign failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto py-12 px-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
          <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
          <div className="w-28 h-4 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_320px] gap-6">
          <div className="h-96 bg-surface border border-border rounded-card animate-pulse" />
          <div className="h-[600px] bg-surface border border-border rounded-card animate-pulse" />
          <div className="h-96 bg-surface border border-border rounded-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6">
        <ErrorState
          title="Case Not Found or Access Restricted"
          message={error || "Unable to display this case. It may have been archived or restricted to internal staff."}
          onRetry={() => router.push("/")}
        />
      </div>
    );
  }

  const selectedSideThread = ticket.side_conversations?.find((s) => s.id === activeSideThread);

  // Filter messages based on role: Requester sees only PublicReply
  const visibleMessages = (ticket.messages || []).filter((m) => {
    if (!isStaff) return m.message_type === "PublicReply";
    return true;
  });

  return (
    <div className="max-w-[1440px] mx-auto py-6 px-4 sm:px-6">
      {/* 1. BREADCRUMB & HEADER */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-caption text-content-secondary mb-3">
          <Link
            href="/"
            className="hover:text-content-primary inline-flex items-center gap-1 transition-subtle"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Queue
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-content-tertiary" />
          <span className="font-mono-numbers font-semibold text-content-primary">
            {ticket.id}
          </span>
        </div>

        {/* Action Header Card */}
        <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono-numbers text-xs font-semibold px-2 py-0.5 rounded bg-surface-subtle text-content-primary border border-border">
                  {ticket.id}
                </span>
                <StatusChip status={ticket.status} />
                <PriorityChip priority={ticket.priority} />
                <SlaBadge
                  sla={ticket.sla}
                  size="lg"
                  isEscalated={ticket.status === "Escalated"}
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-content-primary tracking-tight">
                {ticket.title}
              </h1>
            </div>

            {/* Action Buttons (Staff Only) */}
            {isStaff && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {ticket.assigned_to ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<UserX className="w-3.5 h-3.5 text-content-secondary" />}
                    onClick={handleUnassign}
                  >
                    Unassign
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<UserCheck className="w-3.5 h-3.5" />}
                    onClick={handleClaim}
                  >
                    Claim Case
                  </Button>
                )}

                {/* Status Switcher Dropdown */}
                <div className="flex items-center">
                  {ticket.status === "Closed" && !isLead ? (
                    <Tooltip content="Only Operations Leads can reopen closed cases">
                      <Button variant="secondary" size="sm" disabled>
                        Closed (Terminal)
                      </Button>
                    </Tooltip>
                  ) : (
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="px-2.5 py-1.5 bg-surface border border-border rounded-input text-caption font-medium text-content-primary hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-500 transition-subtle cursor-pointer"
                      aria-label="Change ticket status"
                    >
                      <option value={ticket.status} disabled>
                        Status: {ticket.status}
                      </option>
                      {validNextStatuses.map((st) => (
                        <option key={st} value={st}>
                          Mark as {st}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Escalate button with violet styling */}
                <button
                  type="button"
                  onClick={() => setEscalateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-caption font-semibold rounded-input border border-purple-300 bg-purple-50/70 text-purple-700 hover:bg-purple-100 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-subtle cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                  Escalate
                </button>

                {/* Transfer button */}
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Shuffle className="w-3.5 h-3.5 text-content-secondary" />}
                  onClick={() => setTransferModalOpen(true)}
                >
                  Transfer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. THREE-COLUMN LAYOUT */}
      <div
        className={cn(
          "grid grid-cols-1 gap-6",
          isStaff ? "xl:grid-cols-[280px_1fr_320px]" : "xl:grid-cols-[300px_1fr]"
        )}
      >
        {/* LEFT COLUMN: Booking Context & Travel Timeline */}
        <div className="space-y-6">
          <Card padding="md">
            <CardHeader
              title="Booking Context"
              subtitle="Verified reservation record"
            />
            <div className="divide-y divide-border">
              <KeyValue
                label="TBOH ID"
                value={ticket.tboh_id}
                copyableText={ticket.tboh_id}
                isMono={true}
              />
              <KeyValue label="Agency" value={ticket.agency_id} />
              <KeyValue
                label="Check-in"
                value={formatDate(ticket.check_in_date)}
                isMono={true}
              />
              <KeyValue
                label="LCD Deadline"
                value={ticket.lcd_date ? formatDate(ticket.lcd_date) : "None"}
                isMono={true}
              />
              <KeyValue
                label="Intent"
                value={
                  ticket.intent ? (
                    <Chip variant="brand" size="sm">
                      {ticket.intent}
                    </Chip>
                  ) : (
                    "Unclassified"
                  )
                }
              />
              <KeyValue
                label="Created"
                value={formatDate(ticket.created_at)}
                isMono={true}
              />
              <KeyValue
                label="Assignee"
                value={
                  ticket.assigned_to ? (
                    <span className="font-semibold text-content-primary">
                      {ticket.assigned_to}
                    </span>
                  ) : (
                    <span className="text-content-tertiary italic">
                      Unassigned
                    </span>
                  )
                }
              />
            </div>
          </Card>

          {/* Travel Timeline Hero Graphic */}
          <TravelTimeline
            createdAt={ticket.created_at}
            checkInDate={ticket.check_in_date}
            lcdDate={ticket.lcd_date}
          />
        </div>

        {/* CENTRE COLUMN: Case Description & Conversation */}
        <div className="space-y-6">
          {/* Case Description */}
          <Card padding="md">
            <h2 className="text-caption font-semibold text-content-tertiary uppercase tracking-wider mb-2">
              Case Description
            </h2>
            <div className="text-body text-content-primary leading-relaxed bg-surface-subtle p-3.5 rounded-input border border-border whitespace-pre-wrap">
              {ticket.description}
            </div>
          </Card>

          {/* Conversation Streams */}
          <Card padding="none" className="overflow-hidden">
            {/* Conversation Header & Segmented Tabs */}
            <div className="p-4 border-b border-border bg-surface flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-600" />
                <h2 className="text-section font-semibold text-content-primary">
                  Activity Timeline
                </h2>
              </div>

              {isStaff ? (
                <Tabs
                  tabs={[
                    { id: "public", label: "Public Reply" },
                    { id: "internal", label: "Internal Note" },
                    {
                      id: "suppliers",
                      label: `Supplier Threads (${ticket.side_conversations?.length || 0})`,
                    },
                  ]}
                  activeTab={conversationTab}
                  onChange={(id) => setConversationTab(id as "public" | "internal" | "suppliers")}
                />
              ) : (
                <Chip variant="brand" size="sm">
                  Agency Thread
                </Chip>
              )}
            </div>

            {/* TAB CONTENT: Supplier Threads */}
            {conversationTab === "suppliers" && isStaff ? (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <h3 className="text-table font-semibold text-content-primary">
                      Vendor & Supplier Communications
                    </h3>
                    <p className="text-caption text-content-tertiary">
                      Preserved across transfers to prevent guest disruption
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setSideThreadModalOpen(true)}
                  >
                    New Supplier Thread
                  </Button>
                </div>

                {ticket.side_conversations && ticket.side_conversations.length > 0 ? (
                  <div className="space-y-4">
                    {/* Supplier Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {ticket.side_conversations.map((sc) => (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => setActiveSideThread(sc.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-input text-caption font-semibold transition-subtle shrink-0 border",
                            activeSideThread === sc.id
                              ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                              : "bg-surface text-content-secondary border-border hover:bg-surface-subtle"
                          )}
                        >
                          {sc.supplier_name}
                        </button>
                      ))}
                    </div>

                    {selectedSideThread && (
                      <div className="space-y-3 pt-2">
                        {/* Recipient Pill Row that stays visible */}
                        <div className="p-3 bg-surface-subtle rounded-input border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-caption">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-content-secondary">To:</span>
                            {selectedSideThread.recipients.map((email, idx) => (
                              <span
                                key={idx}
                                className="font-mono-numbers px-2 py-0.5 rounded bg-surface border border-border text-content-primary text-xs"
                              >
                                {email}
                              </span>
                            ))}
                          </div>
                          <span className="text-content-tertiary text-[11px]">
                            Created by {selectedSideThread.created_by}
                          </span>
                        </div>

                        {/* Supplier Message Stream */}
                        <div className="space-y-3 max-h-80 overflow-y-auto p-3 bg-surface-subtle/50 rounded-input border border-border">
                          {selectedSideThread.messages.map((m) => (
                            <div
                              key={m.id}
                              className="bg-surface p-3 rounded-card border border-border shadow-xs text-table"
                            >
                              <div className="flex items-center justify-between gap-2 text-caption text-content-secondary mb-1">
                                <span className="font-semibold text-content-primary">
                                  {m.sender_email}
                                </span>
                                <span className="text-[11px] text-content-tertiary">
                                  {formatRelativeTime(m.created_at)}
                                </span>
                              </div>
                              <p className="text-content-primary whitespace-pre-wrap leading-relaxed">
                                {m.body}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Reply box for supplier */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={sideReplyBody}
                            onChange={(e) => setSideReplyBody(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handlePostSideReply(selectedSideThread.id);
                              }
                            }}
                            placeholder={`Reply to ${selectedSideThread.supplier_name} via email...`}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-input text-table text-content-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <Button
                            variant="primary"
                            size="md"
                            loading={sendingSideReply}
                            disabled={!sideReplyBody.trim() || sendingSideReply}
                            onClick={() => handlePostSideReply(selectedSideThread.id)}
                          >
                            Send
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    title="No Supplier Threads"
                    description="No vendor conversations have been opened yet for this booking."
                    actionLabel="Start First Supplier Thread"
                    onAction={() => setSideThreadModalOpen(true)}
                  />
                )}
              </div>
            ) : (
              /* TAB CONTENT: Public or Internal Conversation Stream */
              <div className="p-5 space-y-6">
                {/* Messages List */}
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {visibleMessages.length > 0 ? (
                    visibleMessages.map((msg) => {
                      const isInternal = msg.message_type === "InternalNote";
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "rounded-card p-4 transition-subtle",
                            isInternal
                              ? "bg-amber-50/70 border border-amber-200 border-dashed"
                              : "bg-surface border border-border shadow-xs"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar name={msg.sender_name} size="sm" />
                              <span className="text-table font-semibold text-content-primary">
                                {msg.sender_name}
                              </span>
                              {isInternal ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                                  <Lock className="w-3 h-3 text-amber-700" />
                                  Internal Staff Note
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                                  <Globe className="w-3 h-3 text-brand-600" />
                                  Public Customer Reply
                                </span>
                              )}
                            </div>
                            <Tooltip content={formatDate(msg.created_at)}>
                              <span className="text-caption text-content-tertiary cursor-default">
                                {formatRelativeTime(msg.created_at)}
                              </span>
                            </Tooltip>
                          </div>
                          <div
                            className={cn(
                              "text-body whitespace-pre-wrap leading-relaxed pl-8",
                              isInternal ? "text-amber-950" : "text-content-primary"
                            )}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <EmptyState
                      title="No Messages Yet"
                      description="Start the conversation by posting an update or customer reply below."
                    />
                  )}
                </div>

                {/* Composer Section */}
                <form
                  onSubmit={handlePostMessage}
                  className={cn(
                    "rounded-card p-4 border transition-subtle space-y-3",
                    conversationTab === "internal"
                      ? "bg-amber-50/50 border-amber-300"
                      : "bg-surface border-border"
                  )}
                >
                  <div className="flex items-center justify-between text-caption">
                    <div className="flex items-center gap-1.5 font-semibold">
                      {conversationTab === "internal" ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-700" />
                          <span className="text-amber-900">
                            Only visible to internal operations staff
                          </span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5 text-brand-600" />
                          <span className="text-content-secondary">
                            Visible to travel agency portal
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-[11px] text-content-tertiary">
                      Cmd/Ctrl + Enter to send
                    </span>
                  </div>

                  <Textarea
                    rows={3}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      conversationTab === "internal"
                        ? "Record confidential shift handover notes, supplier dispute details, or investigation steps..."
                        : "Write a courteous, structured response to the travel agency..."
                    }
                    className={cn(
                      "w-full text-table",
                      conversationTab === "internal" && "bg-white/90 border-amber-300 focus:ring-amber-500"
                    )}
                  />

                  {messageError && (
                    <div className="flex items-center justify-between gap-2 p-2 rounded bg-red-50 text-red-700 text-caption border border-red-200">
                      <span>{messageError}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<RotateCcw className="w-3 h-3" />}
                        onClick={() => handlePostMessage()}
                      >
                        Retry
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="submit"
                      variant={conversationTab === "internal" ? "secondary" : "primary"}
                      size="md"
                      loading={sendingMessage}
                      disabled={!messageContent.trim() || sendingMessage}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      {conversationTab === "internal" ? "Record Internal Note" : "Send Agency Reply"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: Insight Rail (STAFF ONLY) */}
        {isStaff && (
          <div className="space-y-6">
            {/* SLA Target Card */}
            <Card padding="md">
              <CardHeader
                title="SLA Performance"
                subtitle="Target metrics & elapsed time"
              />
              <div className="space-y-4">
                {/* Resolution SLA Progress */}
                <div>
                  <div className="flex items-center justify-between text-caption mb-1">
                    <span className="font-semibold text-content-primary">
                      Resolution Target
                    </span>
                    <span className="font-mono-numbers font-medium text-content-secondary">
                      {ticket.sla.hours_remaining !== null
                        ? `${Math.max(0, ticket.sla.hours_remaining)}h remaining`
                        : "Paused"}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-border">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        ticket.sla.status === "BREACHED"
                          ? "bg-red-500 w-full"
                          : ticket.sla.status === "AT_RISK"
                          ? "bg-amber-500 w-3/4"
                          : "bg-emerald-500 w-1/3"
                      )}
                    />
                  </div>
                </div>

                {/* Response SLA Progress */}
                <div>
                  <div className="flex items-center justify-between text-caption mb-1">
                    <span className="font-semibold text-content-primary">
                      First Response SLA
                    </span>
                    <span className="font-mono-numbers font-medium text-emerald-700">
                      Met (14m)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-border">
                    <div className="h-full bg-emerald-500 rounded-full w-1/4" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Routing Reason */}
            {ticket.routing_reason && (
              <Card padding="md" className="bg-brand-50/30 border-brand-200">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-caption font-semibold text-brand-900 uppercase tracking-wider">
                      Routing Intelligence
                    </h3>
                    <p className="text-caption text-content-secondary mt-1 leading-relaxed">
                      {ticket.routing_reason}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Linked Cases (TBOH Linkage) */}
            <Card padding="md">
              <CardHeader
                title="Linked Cases"
                subtitle={`Cases sharing booking ${ticket.tboh_id}`}
              />
              {ticket.linked_ticket_ids && ticket.linked_ticket_ids.length > 0 ? (
                <div className="space-y-2">
                  {ticket.linked_ticket_ids.map((id) => (
                    <Link
                      key={id}
                      href={`/ticket/${id}`}
                      className="flex items-center justify-between p-2.5 rounded-input bg-surface-subtle hover:bg-brand-50/70 border border-border hover:border-brand-300 text-table font-mono-numbers font-medium text-brand-700 transition-subtle group"
                    >
                      <span>{id}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-content-tertiary group-hover:text-brand-600 transition-subtle" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-caption text-content-tertiary italic">
                  No prior cases linked to this booking reference.
                </p>
              )}
            </Card>

            {/* Queue Score Breakdown */}
            <Card padding="md">
              <CardHeader
                title="Queue Priority Score"
                subtitle="Calculated triage weight"
              />
              <div className="space-y-2 text-table">
                <div className="flex items-center justify-between py-1 text-content-secondary border-b border-border">
                  <span>Base Weight</span>
                  <span className="font-mono-numbers">40 pts</span>
                </div>
                <div className="flex items-center justify-between py-1 text-content-secondary border-b border-border">
                  <span>Check-in Urgency</span>
                  <span className="font-mono-numbers">30 pts</span>
                </div>
                <div className="flex items-center justify-between py-1 text-content-secondary border-b border-border">
                  <span>Agency Value Tier</span>
                  <span className="font-mono-numbers">15 pts</span>
                </div>
                <div className="flex items-center justify-between pt-1 font-semibold text-content-primary">
                  <span>Total Queue Score</span>
                  <span className="font-mono-numbers text-brand-700">
                    {ticket.queue_score ?? 85} / 100
                  </span>
                </div>
              </div>
            </Card>

            {/* Product Defect Link */}
            <Card padding="md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-caption font-semibold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-brand-600" />
                  Product Defect
                </span>
                <button
                  type="button"
                  onClick={() => setBugModalOpen(true)}
                  className="text-caption text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
                >
                  {ticket.suggested_bug_link ? "Edit Link" : "Attach Bug"}
                </button>
              </div>

              {ticket.suggested_bug_link ? (
                <a
                  href={ticket.suggested_bug_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-caption font-mono-numbers text-brand-700 hover:underline break-all bg-brand-50 p-2 rounded-input border border-brand-200 w-full"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  {ticket.suggested_bug_link}
                </a>
              ) : (
                <p className="text-caption text-content-tertiary italic">
                  No engineering bug or defect link associated.
                </p>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* 3. MODALS */}

      {/* Escalation Modal */}
      <Modal
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        title="Escalate Case to Operations Manager"
        subtitle="Reassigns ticket directly to Vikram Joshi (Escalation Manager) and activates accelerated resolution protocols."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-input text-caption text-purple-900 leading-relaxed">
            <strong>Notice:</strong> Escalating a ticket changes the SLA priority to Urgent and logs an outbox event for manager attention.
          </div>

          <Textarea
            label="Escalation Justification *"
            required
            rows={3}
            value={escalateReason}
            onChange={(e) => setEscalateReason(e.target.value)}
            placeholder="Critical supplier delay, high VIP customer disruption, or contract risk..."
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setEscalateModalOpen(false)}
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleEscalate}
              disabled={!escalateReason.trim() || escalating}
              className="px-4 py-2 text-table font-semibold text-white rounded-input bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-subtle cursor-pointer"
            >
              {escalating ? "Escalating..." : "Confirm Escalation"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Transfer Case Ownership"
        subtitle="Handoff ticket to another agent. All supplier side-thread recipient lists remain preserved."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <Select
            label="Target Agent *"
            value={transferAgentId}
            onChange={(e) => setTransferAgentId(e.target.value)}
            options={[
              { value: "USR-101", label: "Aisha Khan — Operations Agent (MEA)" },
              { value: "USR-102", label: "Rahul Verma — Operations Agent (APAC)" },
              { value: "USR-103", label: "Vikram Joshi — Escalation Manager (Global)" },
              { value: "USR-104", label: "Elena Rostova — Team Lead (Global)" },
            ]}
          />

          <Input
            label="Transfer Reason *"
            required
            value={transferReason}
            onChange={(e) => setTransferReason(e.target.value)}
            placeholder="e.g. Regional desk handoff / language match / shift change"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setTransferModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={transferring}
              disabled={!transferReason.trim() || transferring}
              onClick={handleTransfer}
            >
              Confirm Transfer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Link Product Defect Modal */}
      <Modal
        isOpen={bugModalOpen}
        onClose={() => setBugModalOpen(false)}
        title="Link Product Defect / Bug"
        subtitle="Associate an internal bug ticket (JIRA, GitHub issue, or engineering tracking ID)."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Defect Link / Reference *"
            required
            value={bugLink}
            onChange={(e) => setBugLink(e.target.value)}
            placeholder="https://jira.internal.example.com/browse/OPS-102"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setBugModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={linkingBug}
              disabled={!bugLink.trim() || linkingBug}
              onClick={handleLinkBug}
            >
              Save Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Supplier Side Thread Modal */}
      <Modal
        isOpen={sideThreadModalOpen}
        onClose={() => setSideThreadModalOpen(false)}
        title="Start Supplier Side Thread"
        subtitle="Communicate directly with hotel, airline, or local DMC suppliers without exposing discussion to the agency."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSideThread} className="space-y-4 pt-2">
          <Input
            label="Supplier / Vendor Organization *"
            required
            value={newSupplierName}
            onChange={(e) => setNewSupplierName(e.target.value)}
            placeholder="e.g. Kryos Heights Resort"
          />

          <Input
            label="Subject *"
            required
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Urgent voucher verification for check-in"
          />

          <Input
            label="Recipient Emails (comma-separated) *"
            required
            value={newRecipients}
            onChange={(e) => setNewRecipients(e.target.value)}
            placeholder="reservations@supplier.com, frontdesk@supplier.com"
          />

          <Textarea
            label="Initial Inquiry Message *"
            required
            rows={3}
            value={newInitialMsg}
            onChange={(e) => setNewInitialMsg(e.target.value)}
            placeholder="Hello, please verify booking voucher for guest arriving tomorrow..."
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setSideThreadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={creatingSideThread}
              disabled={
                !newSupplierName.trim() ||
                !newSubject.trim() ||
                !newRecipients.trim() ||
                !newInitialMsg.trim() ||
                creatingSideThread
              }
            >
              Launch Side Thread
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
