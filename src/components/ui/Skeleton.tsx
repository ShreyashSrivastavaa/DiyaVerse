import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={twMerge(
        clsx(
          "animate-pulse rounded-lg bg-night-900/80 border border-night-800/50",
          className,
        ),
      )}
      {...props}
    />
  );
}
