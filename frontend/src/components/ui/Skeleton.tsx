"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: "h-4 rounded-sm",
    circular: "rounded-full",
    rectangular: "rounded-input",
  };

  return (
    <div
      aria-hidden="true"
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      className={cn(
        "bg-surface-subtle animate-pulse select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="border-b border-border animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton variant="text" className="w-3/4 h-3.5 bg-slate-200" />
        </td>
      ))}
    </tr>
  );
}
