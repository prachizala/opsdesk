"use client";

import React, { useState } from "react";
import { Modal, Button, Input, Textarea, Select } from "@/components/ui";
import { DEMO_USERS } from "@/lib/types";
import { ShieldAlert, Users, Bug, Mail } from "lucide-react";

export interface EscalateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  loading?: boolean;
}

export function EscalateModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: EscalateModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    if (!reason.trim() || loading) return;
    await onConfirm(reason.trim());
    setReason("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-violet-900 dark:text-violet-100">
          <ShieldAlert className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <span>Escalate Case to Escalation Manager</span>
        </div>
      }
      subtitle="Reassigns ticket directly to Vikram Joshi (Global Escalation Manager) queue and activates accelerated resolution protocols."
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        <div className="p-3 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/80 rounded-input text-caption text-violet-900 dark:text-violet-200 leading-relaxed">
          <p className="font-semibold mb-1">Escalation Protocol Notice:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[12px] text-violet-800 dark:text-violet-300">
            <li>Moves ticket priority to <strong>Urgent</strong>.</li>
            <li>Reassigns directly to <strong>Vikram Joshi</strong> (Escalation Manager queue).</li>
            <li>Logs an escalation event in the case audit trail and outbox stream.</li>
          </ul>
        </div>

        <Textarea
          label="Escalation Justification *"
          required
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe critical supplier blockage, imminent guest check-in failure, or contract risk..."
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!reason.trim() || loading}
            className="px-4 py-2 text-table font-semibold text-white rounded-input bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 transition-subtle cursor-pointer shadow-xs"
          >
            {loading ? "Escalating..." : "Confirm Escalation"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetAgentId: string, reason: string) => Promise<void>;
  loading?: boolean;
  currentAssigneeId?: string | null;
}

export function TransferModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  currentAssigneeId,
}: TransferModalProps) {
  const staffUsers = DEMO_USERS.filter((u) => u.role !== "Requester");
  const defaultTarget = staffUsers.find((u) => u.id !== currentAssigneeId)?.id || staffUsers[0]?.id || "USR-102";

  const [targetAgentId, setTargetAgentId] = useState(defaultTarget);
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    if (!reason.trim() || loading) return;
    await onConfirm(targetAgentId, reason.trim());
    setReason("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-600" />
          <span>Transfer Case Ownership</span>
        </div>
      }
      subtitle="Handoff ticket to another operations specialist. All supplier thread recipient lists remain preserved."
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        <Select
          label="Target Specialist *"
          value={targetAgentId}
          onChange={(e) => setTargetAgentId(e.target.value)}
          options={staffUsers.map((u) => ({
            value: u.id,
            label: `${u.name} — ${u.description}${u.id === currentAssigneeId ? " (Current)" : ""}`,
          }))}
        />

        <div className="p-2.5 bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-input text-caption text-brand-900 dark:text-brand-200 leading-snug">
          ℹ️ <strong>Supplier thread preservation:</strong> Active vendor and hotel conversation threads will remain active and intact under the new owner.
        </div>

        <Input
          label="Transfer Reason *"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Shift handover, language expertise, or regional desk transfer"
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={loading}
            disabled={!reason.trim() || loading}
            onClick={handleConfirm}
          >
            Confirm Transfer
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export interface BugLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bugLink: string) => Promise<void>;
  currentBugLink?: string | null;
  loading?: boolean;
}

export function BugLinkModal({
  isOpen,
  onClose,
  onConfirm,
  currentBugLink,
  loading = false,
}: BugLinkModalProps) {
  const [bugLink, setBugLink] = useState(currentBugLink || "");

  const handleConfirm = async () => {
    if (!bugLink.trim() || loading) return;
    await onConfirm(bugLink.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-brand-600" />
          <span>{currentBugLink ? "Edit Product Defect Link" : "Attach Product Defect"}</span>
        </div>
      }
      subtitle="Associate an internal engineering defect ticket (Jira, GitHub issue, or Linear URL)."
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        <Input
          label="Defect URL / Tracking Reference *"
          required
          value={bugLink}
          onChange={(e) => setBugLink(e.target.value)}
          placeholder="https://jira.internal.example.com/browse/OPS-204"
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={loading}
            disabled={!bugLink.trim() || loading}
            onClick={handleConfirm}
          >
            Save Defect Link
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export interface SupplierThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    supplier_name: string;
    subject: string;
    recipients: string[];
    initial_message: string;
  }) => Promise<void>;
  loading?: boolean;
}

export function SupplierThreadModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: SupplierThreadModalProps) {
  const [supplierName, setSupplierName] = useState("");
  const [subject, setSubject] = useState("");
  const [recipients, setRecipients] = useState("");
  const [initialMessage, setInitialMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipientList = recipients
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    if (!supplierName.trim() || !subject.trim() || recipientList.length === 0 || !initialMessage.trim() || loading) {
      return;
    }

    await onConfirm({
      supplier_name: supplierName.trim(),
      subject: subject.trim(),
      recipients: recipientList,
      initial_message: initialMessage.trim(),
    });

    setSupplierName("");
    setSubject("");
    setRecipients("");
    setInitialMessage("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-brand-600" />
          <span>Start Supplier Thread</span>
        </div>
      }
      subtitle="Communicate directly with hotel, airline, or local DMC suppliers without exposing discussion to the agency."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Supplier / Vendor Organization *"
          required
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          placeholder="e.g. Kryos Heights Resort & Spa"
        />

        <Input
          label="Subject *"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Urgent check-in verification for guest arriving today"
        />

        <Input
          label="Recipient Emails (comma-separated) *"
          required
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder="reservations@kryosheights.com, frontdesk@kryosheights.com"
        />

        <Textarea
          label="Initial Inquiry Message *"
          required
          rows={3}
          value={initialMessage}
          onChange={(e) => setInitialMessage(e.target.value)}
          placeholder="Please confirm the booking voucher and check-in readiness for our mutual guest..."
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            disabled={
              !supplierName.trim() ||
              !subject.trim() ||
              !recipients.trim() ||
              !initialMessage.trim() ||
              loading
            }
          >
            Launch Supplier Thread
          </Button>
        </div>
      </form>
    </Modal>
  );
}
