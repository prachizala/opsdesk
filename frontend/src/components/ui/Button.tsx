"use client";

import React from "react";
import { Loader2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "./Tooltip";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabledTooltip?: string;
  showSignatureArrow?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      icon,
      iconPosition = "left",
      disabledTooltip,
      showSignatureArrow,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "group relative inline-flex items-center justify-center font-medium rounded-full transition-subtle cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2";

    const sizeStyles = {
      sm: "h-8 px-3.5 text-caption gap-1.5",
      md: "h-9 px-4 text-body gap-2",
      lg: "h-10 px-5 text-body gap-2.5 font-semibold",
    };

    const variantStyles = {
      primary:
        "btn-signature-primary shadow-xs border border-transparent",
      secondary:
        "bg-surface text-content-primary hover:text-content-primary hover:border-brand-500 border border-border hover:border-brand shadow-xs",
      outline:
        "bg-transparent text-content-primary hover:bg-surface-subtle border border-border hover:border-brand-500 shadow-xs",
      ghost:
        "bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-subtle",
      danger:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent shadow-xs",
    };

    // Show signature arrow on primary button if not explicitly disabled and no other right icon given
    const shouldShowSignatureArrow =
      variant === "primary" && (showSignatureArrow ?? true) && !iconPosition && !icon;

    const buttonContent = (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && icon && iconPosition === "right" && (
          <span className="shrink-0">{icon}</span>
        )}
        {!loading && shouldShowSignatureArrow && (
          <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
      </button>
    );

    if (disabled && disabledTooltip) {
      return (
        <Tooltip content={disabledTooltip} position="top">
          <span className="inline-block cursor-not-allowed">{buttonContent}</span>
        </Tooltip>
      );
    }

    return buttonContent;
  }
);
Button.displayName = "Button";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md";
  loading?: boolean;
  "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "ghost",
      size = "md",
      loading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: "w-8 h-8",
      md: "w-9 h-9",
    };

    const variantStyles = {
      primary: "btn-signature-primary text-white shadow-xs",
      secondary: "bg-surface text-content-primary hover:border-brand-500 border border-border shadow-xs",
      outline: "bg-transparent text-content-primary hover:bg-surface-subtle border border-border hover:border-brand-500 shadow-xs",
      ghost: "bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-subtle",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-subtle cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
