"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, Check, Tag } from "lucide-react";
import { Modal, Input, Select, Textarea, Button } from "@/components/ui";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { createTicket, suggestIntent } from "@/lib/api";

export interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTicketModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTicketModalProps) {
  const { currentUser, isStaff } = useUser();
  const { showToast } = useToast();
  const router = useRouter();

  // Form Fields
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tboh, setTboh] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [checkin, setCheckin] = useState("");
  const [lcd, setLcd] = useState("");
  const [intent, setIntent] = useState("");
  const [agency, setAgency] = useState("AGY-001");

  // Suggest Intent State
  const [suggestedIntents, setSuggestedIntents] = useState<
    { name: string; confidence: number }[]
  >([]);
  const [suggesting, setSuggesting] = useState(false);

  // Submission State
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Touched state for inline validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation rules
  const isTitleValid = title.trim().length >= 3;
  const isDescValid = desc.trim().length >= 5;
  const isTbohValid = tboh.trim().length >= 3;
  const isCheckinValid = Boolean(checkin);

  const isFormValid = isTitleValid && isDescValid && isTbohValid && isCheckinValid;

  // Common quick intent chips
  const quickIntents = [
    "Emergency Check-in Assist",
    "Refund Request",
    "Cancellation Inconvenience",
    "Date Amendment",
    "Bedding / Room Preference",
    "Voucher Resend",
  ];

  // Auto-Suggest Intent
  const handleSuggest = async () => {
    if (!title.trim() && !desc.trim()) {
      showToast("Please enter a title or description first to auto-suggest intent.", "info");
      return;
    }
    setSuggesting(true);
    try {
      const res = await suggestIntent(title, desc, currentUser.id);
      if (res && res.intent) {
        setSuggestedIntents([
          { name: res.intent, confidence: Math.round((res.confidence || 0.95) * 100) },
        ]);
        showToast(`AI suggested: ${res.intent}`, "info");
      }
    } catch {
      showToast("Unable to auto-suggest intent at this moment.", "warning");
    } finally {
      setSuggesting(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setTitle("");
    setDesc("");
    setTboh("");
    setCheckin("");
    setLcd("");
    setIntent("");
    setPriority("Medium");
    setSuggestedIntents([]);
    setError(null);
    setTouched({});
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || creating) return;

    setCreating(true);
    setError(null);

    try {
      const newTicket = await createTicket(
        {
          title: title.trim(),
          description: desc.trim(),
          tboh_id: tboh.trim().toUpperCase(),
          priority,
          check_in_date: new Date(checkin).toISOString(),
          lcd_date: lcd ? new Date(lcd).toISOString() : null,
          intent: intent || undefined,
          agency_id: isStaff ? agency : undefined,
        },
        currentUser.id
      );

      showToast(`Ticket ${newTicket.id} created successfully!`, "success");
      resetForm();
      onClose();
      onSuccess();
      router.push(`/ticket/${newTicket.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to dispatch ticket.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Operations Ticket"
      subtitle="Dispatch an operations incident with atomic tenant verification and travel SLA computation."
      className="max-w-[640px] rounded-[14px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-caption rounded-input border border-red-200">
            {error}
          </div>
        )}

        {/* Section 1: Booking & Itinerary */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-micro-label uppercase text-content-tertiary font-bold tracking-wider">
            1. Booking &amp; Itinerary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="TBOH Booking ID *"
              value={tboh}
              onChange={(e) => setTboh(e.target.value.toUpperCase())}
              onBlur={() => markTouched("tboh")}
              placeholder="e.g. TBOH-1042"
              required
              helperText="External supplier booking identifier"
              error={
                touched.tboh && !isTbohValid
                  ? "At least 3 characters required"
                  : undefined
              }
            />

            {isStaff ? (
              <Select
                label="Agency Tenant *"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
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
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              onBlur={() => markTouched("checkin")}
              required
              helperText="Controlling deadline for Emergency Assist"
              error={
                touched.checkin && !isCheckinValid
                  ? "Check-in date is mandatory"
                  : undefined
              }
            />

            <Input
              type="datetime-local"
              label="Last Cancellation Date (LCD)"
              value={lcd}
              onChange={(e) => setLcd(e.target.value)}
              helperText="Controlling deadline for Refund &amp; Cancellation"
            />
          </div>
        </div>

        {/* Section 2: Operations Issue */}
        <div className="flex flex-col gap-2.5 pt-3 border-t border-border">
          <h4 className="text-micro-label uppercase text-content-tertiary font-bold tracking-wider">
            2. Operations Issue
          </h4>

          <Input
            label="Subject / Ticket Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => markTouched("title")}
            placeholder="e.g. Supplier failed to confirm room allocation"
            required
            error={
              touched.title && !isTitleValid
                ? "Title must be at least 3 characters"
                : undefined
            }
          />

          <Textarea
            label="Issue Description *"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onBlur={() => markTouched("desc")}
            placeholder="Detailed description of guest status, supplier communication, and required resolution..."
            rows={3}
            required
            error={
              touched.desc && !isDescValid
                ? "Description must be at least 5 characters"
                : undefined
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <div className="flex flex-col gap-1.5">
              <Select
                label="Category / Intent"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
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

              {/* Auto-suggest button & suggested chips */}
              <div className="flex flex-col gap-1.5 mt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  loading={suggesting}
                  icon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
                  onClick={handleSuggest}
                  className="text-brand-600 hover:text-brand-700 p-0 text-caption font-medium self-start"
                >
                  Auto-suggest intent from text
                </Button>

                {/* Suggested Intent Chip */}
                {suggestedIntents.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {suggestedIntents.map((sug) => (
                      <div
                        key={sug.name}
                        className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-chip text-[11px] text-brand-700 shadow-2xs"
                      >
                        <Tag className="w-3 h-3 text-brand-600" />
                        <span>
                          {sug.name} ({sug.confidence}%)
                        </span>
                        <button
                          type="button"
                          onClick={() => setIntent(sug.name)}
                          className="font-bold text-brand-800 hover:text-brand-900 ml-1 cursor-pointer inline-flex items-center gap-0.5"
                          title="Apply suggested intent"
                        >
                          <Check className="w-3 h-3 text-brand-700" />
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={() => setSuggestedIntents([])}
                          className="cursor-pointer text-content-tertiary hover:text-content-primary ml-0.5"
                          title="Dismiss"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick select chips */}
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {quickIntents.slice(0, 3).map((qi) => (
                    <button
                      key={qi}
                      type="button"
                      onClick={() => setIntent(qi)}
                      className="text-[10px] px-1.5 py-0.5 rounded-input bg-surface-subtle hover:bg-surface border border-border text-content-secondary transition-colors cursor-pointer"
                    >
                      {qi}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Select
              label="Priority Level *"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "Low" | "Medium" | "High" | "Urgent")
              }
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
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-1">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!isFormValid || creating}
            loading={creating}
            className="bg-brand-600 hover:bg-brand-700 text-white font-medium"
          >
            Dispatch Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}
