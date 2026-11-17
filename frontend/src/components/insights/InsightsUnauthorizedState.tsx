"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

export interface InsightsUnauthorizedStateProps {
  currentRole: string;
}

export function InsightsUnauthorizedState({
  currentRole,
}: InsightsUnauthorizedStateProps) {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-xs">
        <ShieldAlert className="w-6 h-6" />
      </div>

      <h2 className="text-xl font-semibold text-content-primary mb-2 tracking-tight">
        Restricted Operational Console
      </h2>

      <p className="text-body text-content-secondary mb-3 leading-relaxed">
        The <strong>Operational Insights &amp; Recurring Themes</strong> dashboard is restricted to{" "}
        <strong>Team Lead</strong> and <strong>Escalation Manager</strong> roles.
      </p>

      <p className="text-caption text-content-tertiary mb-6">
        Current active role: <span className="font-semibold text-content-secondary font-mono">{currentRole}</span>
      </p>

      <Link href="/">
        <Button
          variant="primary"
          size="md"
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Return to Operations Queue
        </Button>
      </Link>
    </div>
  );
}
