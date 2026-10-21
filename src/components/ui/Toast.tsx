"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

interface ToastContextType {
  toast: (text: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    const id = crypto.randomUUID();
    setMessages((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <aside
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl text-sm font-medium border transition-all animate-in fade-in slide-in-from-bottom-2 ${
              m.type === "success"
                ? "bg-night-900 text-flame-400 border-flame-500/40"
                : m.type === "error"
                  ? "bg-red-950 text-red-200 border-red-800"
                  : "bg-night-900 text-ivory-50 border-night-800"
            }`}
          >
            <span>{m.text}</span>
            <button
              type="button"
              onClick={() => removeToast(m.id)}
              className="ml-3 text-ivory-300 hover:text-ivory-50 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center rounded"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
