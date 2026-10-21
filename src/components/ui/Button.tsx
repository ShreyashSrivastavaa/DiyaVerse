import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-400 disabled:opacity-50 disabled:cursor-not-allowed select-none min-h-[44px]";

    const variantStyles = {
      primary:
        "bg-flame-500 text-night-950 font-semibold hover:bg-flame-400 active:bg-flame-600 shadow-md shadow-flame-500/20 active:scale-[0.98]",
      secondary:
        "border border-night-800 bg-night-900/60 text-ivory-50 hover:bg-night-800 hover:border-flame-400/40 active:scale-[0.98]",
      ghost:
        "text-ivory-300 hover:text-ivory-50 hover:bg-night-900 active:scale-[0.98]",
      danger:
        "bg-red-600 text-white font-semibold hover:bg-red-500 active:bg-red-700 shadow-md shadow-red-600/20 active:scale-[0.98]",
    };

    const sizeStyles = {
      sm: "px-3.5 py-1.5 text-xs min-h-[40px] sm:min-h-[44px]",
      md: "px-5 py-2.5 text-sm min-h-[44px]",
      lg: "px-6 py-3.5 text-base min-h-[50px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(
          clsx(
            baseStyles,
            variantStyles[variant],
            sizeStyles[size],
            isLoading && "cursor-wait",
            className,
          ),
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
