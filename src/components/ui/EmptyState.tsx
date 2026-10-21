import React from "react";
import Link from "next/link";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "🪔",
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-night-800 rounded-2xl bg-night-900/30 max-w-md mx-auto my-8">
      <div className="text-4xl sm:text-5xl mb-4" role="img" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-bold text-ivory-50 mb-2">{title}</h3>
      <p className="text-sm text-ivory-300/80 mb-6 leading-relaxed">{description}</p>
      {actionText && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary">{actionText}</Button>
        </Link>
      )}
      {actionText && onAction && !actionHref && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
