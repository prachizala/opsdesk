"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KeyValueProps {
  label: string;
  value: React.ReactNode;
  copyableText?: string;
  isMono?: boolean;
  className?: string;
}

export function KeyValue({
  label,
  value,
  copyableText,
  isMono = false,
  className,
}: KeyValueProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!copyableText) return;
    navigator.clipboard.writeText(copyableText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex items-start justify-between py-2 text-table gap-3", className)}>
      <span className="text-content-tertiary font-medium shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 text-right font-medium text-content-primary">
        <span className={cn(isMono && "font-mono-numbers")}>{value}</span>
        {copyableText && (
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied to clipboard" : "Copy to clipboard"}
            aria-label={`Copy ${label}`}
            className="flex items-center gap-1 text-content-tertiary hover:text-content-primary p-0.5 rounded-input transition-subtle cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[10px] text-emerald-600 font-semibold">Copied</span>
              </>
            ) : (
              <Copy className="w-3.5 h-3.5 shrink-0" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
