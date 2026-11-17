"use client";

import React, { useState } from "react";
import { TicketDetail, DEMO_USERS } from "@/lib/types";
import { Button, EmptyState } from "@/components/ui";
import { Plus, Send, Mail, CheckCircle2 } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

export interface TicketSupplierThreadsProps {
  ticket: TicketDetail;
  activeSideThreadId: string | null;
  onSelectSideThread: (id: string) => void;
  onOpenNewThreadModal: () => void;
  onPostReply: (threadId: string, message: string) => Promise<void>;
  sendingReply: boolean;
}

export function TicketSupplierThreads({
  ticket,
  activeSideThreadId,
  onSelectSideThread,
  onOpenNewThreadModal,
  onPostReply,
  sendingReply,
}: TicketSupplierThreadsProps) {
  const [replyText, setReplyText] = useState("");

  const threads = ticket.side_conversations || [];
  const selectedThread = threads.find((t) => t.id === activeSideThreadId) || threads[0] || null;

  // Resolve current assignee name for transfer notification line
  const assigneeUser = DEMO_USERS.find((u) => u.id === ticket.assigned_to);
  const assigneeName = assigneeUser ? assigneeUser.name : ticket.assigned_to || "Operations Agent";

  const handleSend = async () => {
    if (!replyText.trim() || !selectedThread || sendingReply) return;
    await onPostReply(selectedThread.id, replyText.trim());
    setReplyText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h3 className="text-table font-semibold text-content-primary flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-600" />
            <span>Supplier & Vendor Communications</span>
          </h3>
          <p className="text-caption text-content-tertiary">
            Confidential supplier outreach; never exposed to agency or traveler
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={onOpenNewThreadModal}
        >
          New Supplier Thread
        </Button>
      </div>

      {threads.length > 0 ? (
        <div className="space-y-4">
          {/* Thread Switcher Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {threads.map((thread) => {
              const isSelected = selectedThread?.id === thread.id;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => onSelectSideThread(thread.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-input text-caption font-semibold transition-subtle shrink-0 border cursor-pointer",
                    isSelected
                      ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                      : "bg-surface text-content-secondary border-border hover:bg-surface-subtle hover:text-content-primary"
                  )}
                >
                  {thread.supplier_name} ({thread.messages?.length || 0})
                </button>
              );
            })}
          </div>

          {selectedThread && (
            <div className="space-y-3 pt-1">
              {/* Recipient Pill Row ALWAYS visible at top of thread */}
              <div className="p-3 bg-surface-subtle rounded-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-caption">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-content-secondary uppercase text-[11px] tracking-wider">
                    To:
                  </span>
                  {selectedThread.recipients.map((email, idx) => (
                    <span
                      key={idx}
                      className="font-mono-numbers px-2 py-0.5 rounded bg-surface border border-border text-content-primary text-xs shadow-xs"
                    >
                      {email}
                    </span>
                  ))}
                </div>
                <div className="text-content-tertiary text-[11px] shrink-0 font-medium">
                  Subject: <span className="text-content-primary">{selectedThread.subject}</span>
                </div>
              </div>

              {/* Subtle line after transfer: "Agent changed to <name> - supplier recipients unchanged" */}
              <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-input text-[12px] text-content-secondary">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  Agent changed to <strong className="text-content-primary">{assigneeName}</strong> — supplier recipients unchanged
                </span>
              </div>

              {/* Supplier Message Stream */}
              <div className="space-y-3 max-h-80 overflow-y-auto p-3.5 bg-surface-subtle/50 rounded-card border border-border">
                {selectedThread.messages?.map((m) => (
                  <div
                    key={m.id}
                    className="bg-surface p-3.5 rounded-card border border-border shadow-xs text-table"
                  >
                    <div className="flex items-center justify-between gap-2 text-caption text-content-secondary mb-1.5">
                      <span className="font-semibold font-mono-numbers text-content-primary">
                        {m.sender_email}
                      </span>
                      <span className="text-[11px] text-content-tertiary">
                        {formatRelativeTime(m.created_at)}
                      </span>
                    </div>
                    <p className="text-content-primary whitespace-pre-wrap leading-relaxed text-body">
                      {m.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Reply to ${selectedThread.supplier_name} via email (Enter to send)...`}
                  className="w-full px-3.5 py-2 bg-surface border border-border rounded-input text-table text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 transition-subtle"
                />
                <Button
                  variant="primary"
                  size="md"
                  loading={sendingReply}
                  disabled={!replyText.trim() || sendingReply}
                  icon={<Send className="w-3.5 h-3.5" />}
                  onClick={handleSend}
                >
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No Supplier Threads Initiated"
          description="Direct communications with vendors, hotels, or DMCs remain preserved across ownership transfers."
          actionLabel="Start First Supplier Thread"
          onAction={onOpenNewThreadModal}
        />
      )}
    </div>
  );
}
