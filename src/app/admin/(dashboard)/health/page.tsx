"use client";

import React, { useEffect, useState, useCallback } from "react";

interface HealthData {
  ok: boolean;
  timestamp: string;
  db: {
    status: string;
    latencyMs: number;
  };
  counter: {
    key: string;
    stored: number;
    actual: number;
    discrepancy: number;
    inSync: boolean;
    lastReconciled?: {
      at: string;
      corrected: boolean;
      stored: number;
      actual: number;
    } | null;
  };
  recentErrors: Array<{
    id: string;
    scope: string;
    message: string;
    createdAt: string;
  }>;
}

export default function AdminHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<string | null>(null);

  const getCsrfToken = () => {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/(?:^|; )admin_csrf_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : "";
  };

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/health");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load health status", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const triggerReconcile = async () => {
    try {
      setReconciling(true);
      setReconcileResult(null);
      const csrfToken = getCsrfToken();
      const res = await fetch("/api/cron/reconcile", {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken,
        },
      });

      if (res.ok) {
        const json = await res.json();
        setReconcileResult(
          `Reconciliation complete: stored was ${json.stored}, actual ${json.actual}. Corrected: ${json.corrected}`
        );
        fetchHealth();
      } else {
        const err = await res.json();
        setReconcileResult(`Reconcile failed: ${err.error || "Unknown error"}`);
      }
    } catch (e) {
      console.error("Error triggering reconcile", e);
      setReconcileResult("Network error triggering reconcile");
    } finally {
      setReconciling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>🩺 System Health & Data Integrity</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time diagnostics, PostgreSQL connection latency, and honest counter integrity
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors self-start sm:self-auto"
        >
          🔄 Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-flame-400 border-t-transparent rounded-full animate-spin" />
            <span>Running system diagnostics...</span>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Diagnostic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Database Card */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Database Status</span>
                <span className="text-base">🐘</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                <span>{data.db.status}</span>
                <span className="text-xs font-mono font-normal text-slate-400">
                  ({data.db.latencyMs}ms ping)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                PostgreSQL pool connection via Neon serverless
              </p>
            </div>

            {/* Counter Sync Card */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Atomic Counter</span>
                <span className="text-base">🪔</span>
              </div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <span>{data.counter.stored.toLocaleString()}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    data.counter.inSync
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  {data.counter.inSync ? "IN SYNC" : "DESYNC"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                DB Actual: {data.counter.actual.toLocaleString()} • Discrepancy:{" "}
                <span className={data.counter.discrepancy === 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                  {data.counter.discrepancy}
                </span>
              </p>
            </div>

            {/* Reconciliation Status Card */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Last Reconciliation</span>
                <span className="text-base">⚖️</span>
              </div>
              <div className="text-sm font-semibold text-slate-200">
                {data.counter.lastReconciled ? (
                  new Date(data.counter.lastReconciled.at).toLocaleString()
                ) : (
                  <span className="text-slate-500 italic">Never run yet</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Nightly cron reconciles atomic counter against `COUNT(*)` to ensure truthful counters.
              </p>
            </div>
          </div>

          {/* Reconciliation Trigger Box */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Manual Counter Reconciliation</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Execute immediate audit check between `Counter.diyas_total` and non-deleted `Diya` records.
              </p>
              {reconcileResult && (
                <div className="mt-2 text-xs font-mono text-flame-300 bg-flame-400/10 border border-flame-400/20 p-2 rounded-lg">
                  {reconcileResult}
                </div>
              )}
            </div>

            <button
              disabled={reconciling}
              onClick={triggerReconcile}
              className="px-4 py-2 rounded-xl bg-flame-500 hover:bg-flame-400 text-maroon-950 font-bold text-xs transition-colors shadow-lg shadow-flame-500/10 disabled:opacity-50 cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              {reconciling ? "Reconciling..." : "Run Reconcile Now"}
            </button>
          </div>

          {/* Error Log Section */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Application Error Logs
            </h2>
            {data.recentErrors.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No recent errors recorded. All systems operational.
              </div>
            ) : (
              <div className="space-y-2">
                {data.recentErrors.map((err) => (
                  <div
                    key={err.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-red-400 font-bold uppercase">[{err.scope}]</span>
                      <span>{new Date(err.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-200">{err.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-red-400 text-xs">Failed to load system diagnostics</div>
      )}
    </div>
  );
}
