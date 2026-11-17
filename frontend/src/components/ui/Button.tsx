"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "./Tooltip";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabledTooltip?: string;
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
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium rounded-input transition-subtle cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

    const sizeStyles = {
      sm: "h-8 px-3 text-caption gap-1.5",
      md: "h-9 px-4 text-body gap-2",
    };

    const variantStyles = {
      primary:
        "btn-shine-sweep bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700 border border-transparent shadow-xs",
      secondary:
        "bg-surface text-content-primary hover:bg-surface-subtle border border-border hover:border-border-strong shadow-xs",
      outline:
        "bg-transparent text-content-primary hover:bg-surface-subtle border border-border hover:border-border-strong shadow-xs",
      ghost:
        "bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-subtle",
      danger:
        "btn-danger-wipe bg-red-600 text-white hover:bg-purple-700 active:bg-purple-800 border border-transparent shadow-xs",
    };

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
      sm: "w-8 h-8 text-caption",
      md: "w-9 h-9 text-body",
    };

    const variantStyles = {
      primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-xs",
      secondary:
        "bg-surface text-content-secondary hover:text-content-primary border border-border hover:border-border-strong shadow-xs hover:bg-surface-subtle",
      outline:
        "bg-transparent text-content-secondary hover:text-content-primary border border-border hover:border-border-strong shadow-xs hover:bg-surface-subtle",
      ghost: "bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-subtle",
      danger: "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "group inline-flex items-center justify-center rounded-input transition-subtle cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          <span className="shrink-0 transition-transform duration-120 group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5 flex items-center justify-center">
            {children}
          </span>
        )}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
