"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Couldn't load information. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-card border border-red-200 bg-red-50/50",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3 shrink-0">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-section font-semibold text-content-primary">{title}</h3>
      <p className="text-body text-content-secondary max-w-sm mt-1 mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}
