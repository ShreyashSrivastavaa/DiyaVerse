"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface ReportItem {
  id: string;
  reason: string;
  note?: string;
  status: "OPEN" | "DISMISSED" | "ACTIONED";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  diya: {
    id: string;
    publicId: string;
    seq: number;
    status: "PUBLISHED" | "HIDDEN" | "DELETED";
    style: string;
    dedicationText?: string;
    wishText: string;
    totalReportsForDiya: number;
  };
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const getCsrfToken = () => {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/(?:^|; )admin_csrf_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : "";
  };

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reports?status=${statusFilter}`);
      if (res.ok) {
        const json = await res.json();
        setReports(json.items || []);
      }
    } catch (e) {
      console.error("Failed to load reports", e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleAction = async (reportId: string, action: "DISMISS" | "HIDE_DIYA" | "DELETE_DIYA") => {
    try {
      setActionInProgress(reportId);
      const csrfToken = getCsrfToken();
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchReports();
      } else {
        const err = await res.json();
        alert(err.error || "Action failed");
      }
    } catch (e) {
      console.error("Error executing report action", e);
      alert("Network error executing action");
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>🛡️ Community Reports Queue</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review community flags • Diyas with 3+ reports are auto-hidden pending review
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto">
          {["OPEN", "ACTIONED", "DISMISSED", "ALL"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? "bg-flame-400 text-maroon-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-flame-400 border-t-transparent rounded-full animate-spin" />
              <span>Loading reports...</span>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-2xl mb-2">🎉</div>
            <div className="text-sm font-semibold text-slate-300">Clean Queue</div>
            <p className="text-xs text-slate-500 mt-1">No reports matching {statusFilter} status</p>
          </div>
        ) : (
          reports.map((r) => (
            <div
              key={r.id}
              className={`p-5 rounded-2xl border transition-all ${
                r.diya.totalReportsForDiya >= 3 && r.status === "OPEN"
                  ? "bg-slate-900/90 border-red-500/40 shadow-lg shadow-red-500/5 ring-1 ring-red-500/20"
                  : "bg-slate-900/70 border-slate-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                      {r.reason}
                    </span>
                    <span className="text-xs text-slate-400">
                      Reported {new Date(r.createdAt).toLocaleString()}
                    </span>
                    {r.diya.totalReportsForDiya >= 3 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Auto-Hidden (3+ Flags)
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        r.status === "OPEN"
                          ? "bg-sky-500/20 text-sky-300"
                          : r.status === "ACTIONED"
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  {r.note && (
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                      <span className="text-slate-400 font-semibold">Reporter note: </span>
                      {r.note}
                    </div>
                  )}

                  {/* Diya Target Info */}
                  <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">#{r.diya.seq}</span>
                        <Link
                          href={`/d/${r.diya.publicId}`}
                          target="_blank"
                          className="font-mono font-semibold text-flame-300 hover:underline flex items-center gap-1"
                        >
                          <span>{r.diya.publicId}</span>
                          <span className="text-[10px]">↗</span>
                        </Link>
                        <span className="text-[10px] capitalize text-slate-500">
                          ({r.diya.style} Diya)
                        </span>
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          r.diya.status === "PUBLISHED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : r.diya.status === "HIDDEN"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {r.diya.status}
                      </span>
                    </div>

                    {r.diya.dedicationText && (
                      <div className="text-xs text-slate-200 font-medium">
                        <span className="text-slate-400">Dedication: </span>
                        {r.diya.dedicationText}
                      </div>
                    )}

                    <div className="text-xs text-slate-300 italic">
                      &ldquo;{r.diya.wishText}&rdquo;
                    </div>
                  </div>
                </div>

                {/* Moderation Actions */}
                {r.status === "OPEN" && (
                  <div className="flex sm:flex-col items-center gap-2 self-end sm:self-start">
                    <button
                      disabled={actionInProgress === r.id}
                      onClick={() => handleAction(r.id, "DISMISS")}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                    {r.diya.status === "PUBLISHED" && (
                      <button
                        disabled={actionInProgress === r.id}
                        onClick={() => handleAction(r.id, "HIDE_DIYA")}
                        className="w-full px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors disabled:opacity-50"
                      >
                        Hide Diya
                      </button>
                    )}
                    {r.diya.status !== "DELETED" && (
                      <button
                        disabled={actionInProgress === r.id}
                        onClick={() => handleAction(r.id, "DELETE_DIYA")}
                        className="w-full px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold transition-colors shadow-lg shadow-red-600/10 disabled:opacity-50"
                      >
                        Soft Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
