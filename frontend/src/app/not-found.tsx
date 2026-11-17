"use client";

import React from "react";
import Link from "next/link";
import { Plane, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-surface border border-border shadow-xs flex items-center justify-center mx-auto text-brand-600">
        <Plane className="w-8 h-8 rotate-45" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold text-content-primary tracking-tight">
          Page not found
        </h1>
        <p className="text-body text-content-secondary leading-relaxed">
          The requested dispatch route or operational screen could not be located.
        </p>
      </div>

      <div className="pt-2">
        <Link href="/">
          <Button
            variant="primary"
            size="md"
            icon={<ArrowLeft className="w-4 h-4" />}
            className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Return to operations queue
          </Button>
        </Link>
      </div>
    </div>
  );
}
