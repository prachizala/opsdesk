"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";

export interface QueuePaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
}

export function QueuePagination({
  page,
  pageSize,
  totalCount,
  loading,
  onPageChange,
}: QueuePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = Math.min((page + 1) * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-surface-subtle/40 text-caption text-content-secondary select-none">
      <span className="font-mono-numbers text-[12px]">
        Showing {startItem}–{endItem} of {totalCount.toLocaleString()} cases
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page === 0 || loading}
          icon={<ChevronLeft className="w-3.5 h-3.5" />}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          aria-label="Previous page"
        >
          Previous
        </Button>
        <span className="font-mono-numbers text-[12px] px-2 text-content-primary font-medium">
          Page {page + 1} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page + 1 >= totalPages || loading}
          icon={<ChevronRight className="w-3.5 h-3.5" />}
          iconPosition="right"
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
