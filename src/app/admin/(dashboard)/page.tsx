"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface OverviewData {
  range: string;
  cards: {
    uniqueVisitors: number;
    sessions: number;
    diyasLit: number;
    wishesAttached: number;
    customWishes: number;
    creationAttempts: number;
    successfulCreations: number;
    shareMenuOpens: number;
    whatsappInitiated: number;
    nativeShareCompleted: number;
    linkCopies: number;
    cardDownloads: number;
    returningVisitors: number;
  };
  snapshot: {
    visitorsToday: number;
    diyasToday: number;
    completionRate: string;
    avgCreationsPerVisitor: string;
    shareActionRate: string;
    returningRate: string;
  };
  topPages: Array<{ path: string; views: number }>;
  trafficSources: Array<{ source: string; count: number }>;
}

interface ActivityItem {
  id: string;
  name: string;
  occurredAt: string;
  path: string;
  device: string;
  browser: string;
  source: string;
}

export default function AdminOverviewPage() {
  const [range, setRange] = useState<"today" | "7d" | "30d" | "90d">("7d");
  const [data, setData] = useState<OverviewData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [showHelp, setShowHelp] = useState(false);

  // Fetch overview metrics
  const fetchOverview = useCallback(async (selectedRange: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/stats/overview?range=${selectedRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Error loading overview stats", e);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  }, []);

  // Fetch live activity
  const fetchLiveActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/live");
      if (res.ok) {
        const json = await res.json();
        setActivities(json.items || []);
      }
    } catch (e) {
      console.error("Error loading live activity", e);
    }
  }, []);

  useEffect(() => {
    fetchOverview(range);
  }, [range, fetchOverview]);

  // 15-second polling for live activity
  useEffect(() => {
    fetchLiveActivity();
    const timer = setInterval(() => {
      fetchLiveActivity();
    }, 15000);
    return () => clearInterval(timer);
  }, [fetchLiveActivity]);

  const cards = data?.cards;
  const snapshot = data?.snapshot;

  const metricCards = [
    {
      title: "Unique Visitors",
      value: cards ? cards.uniqueVisitors.toLocaleString() : "-",
      tooltip: "Distinct client IDs with analytics consent active in this period",
      subtext: `${snapshot?.returningRate || "0%"} returning rate`,
      icon: "👥",
    },
    {
      title: "Total Sessions",
      value: cards ? cards.sessions.toLocaleString() : "-",
      tooltip: "Non-bot browsing sessions (30-min idle window)",
      subtext: `${snapshot?.visitorsToday || 0} active today`,
      icon: "⏱️",
    },
    {
      title: "Diyas Lit",
      value: cards ? cards.diyasLit.toLocaleString() : "-",
      tooltip: "Total active virtual diyas placed in the database in this period",
      subtext: `${snapshot?.diyasToday || 0} lit today`,
      icon: "🪔",
      highlight: true,
    },
    {
      title: "Wishes Attached",
      value: cards ? cards.wishesAttached.toLocaleString() : "-",
      tooltip: "Every diya is paired with a curated or custom wish",
      subtext: "100% attachment",
      icon: "📜",
    },
    {
      title: "Custom Wishes",
      value: cards ? cards.customWishes.toLocaleString() : "-",
      tooltip: "Wishes personally typed by creators rather than selected from the 2,000 library",
      subtext: cards && cards.diyasLit > 0
        ? `${((cards.customWishes / cards.diyasLit) * 100).toFixed(1)}% of total`
        : "0%",
      icon: "✍️",
    },
    {
      title: "Creation Completion Rate",
      value: snapshot?.completionRate || "0%",
      tooltip: "Successful diyas created divided by creation attempts initiated",
      subtext: `${cards?.creationAttempts || 0} attempts`,
      icon: "🎯",
    },
    {
      title: "Avg Diyas / Visitor",
      value: snapshot?.avgCreationsPerVisitor || "0.00",
      tooltip: "Average number of diyas lit per unique visitor",
      subtext: "Engagement depth",
      icon: "📊",
    },
    {
      title: "Share Actions Rate",
      value: snapshot?.shareActionRate || "0%",
      tooltip: "Total shares (WhatsApp + Copy + Card) divided by total diyas lit",
      subtext: `${cards?.whatsappInitiated || 0} WhatsApp shares`,
      icon: "🔗",
    },
    {
      title: "Card Downloads",
      value: cards ? cards.cardDownloads.toLocaleString() : "-",
      tooltip: "High-resolution 1080x1350 Diwali blessing cards generated and downloaded",
      subtext: "PNG downloads",
      icon: "🖼️",
    },
    {
      title: "Returning Visitors",
      value: cards ? cards.returningVisitors.toLocaleString() : "-",
      tooltip: "Visitors seen across multiple distinct calendar days",
      subtext: `${snapshot?.returningRate || "0%"} loyalty`,
      icon: "🔄",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Diwali Overview Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Truthful first-party analytics • Updated {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>

        {/* Range Buttons & Actions */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
            {(
              [
                { id: "today", label: "Today" },
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setRange(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  range === opt.id
                    ? "bg-flame-400 text-maroon-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              fetchOverview(range);
              fetchLiveActivity();
            }}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh now"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Snapshot Alert Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-flame-400/10 to-transparent border border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg">
            ✨
          </div>
          <div>
            <div className="text-sm font-semibold text-amber-200">
              Live Diwali Pulse: {snapshot?.diyasToday || 0} Diyas Lit Today
            </div>
            <div className="text-xs text-slate-400">
              {snapshot?.visitorsToday || 0} visitors active today • {snapshot?.completionRate || "0%"} creation completion rate
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/analytics"
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium border border-amber-500/30 transition-colors"
          >
            View Trend Charts →
          </Link>
        </div>
      </div>

      {/* 10 Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border transition-all ${
              card.highlight
                ? "bg-slate-900/90 border-flame-400/40 shadow-lg shadow-flame-500/5 ring-1 ring-flame-400/20"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="truncate pr-1">{card.title}</span>
              <span title={card.tooltip} className="cursor-help text-sm">
                {card.icon}
              </span>
            </div>
            <div
              className={`text-2xl font-black tracking-tight ${
                card.highlight ? "text-flame-300" : "text-slate-100"
              }`}
            >
              {loading ? (
                <div className="h-8 w-16 bg-slate-800 animate-pulse rounded my-0.5" />
              ) : (
                card.value
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{card.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2-Column: Live Activity & Traffic/Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Aggregate Activity Panel (1 col) */}
        <div className="lg:col-span-1 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live Activity</h2>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">15s poll • Privacy Safe</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
            {activities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <span>No live events recorded yet</span>
              </div>
            ) : (
              activities.map((act) => {
                const time = new Date(act.occurredAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });
                return (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800/80 text-xs flex flex-col gap-1 hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        {act.name.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{time}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[150px] font-mono">{act.path}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {act.device} • {act.browser}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Traffic Sources & Top Pages (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Pages */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Top Page Views
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 pb-2">
                    <th className="pb-2 font-medium">Path</th>
                    <th className="pb-2 font-medium text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data?.topPages && data.topPages.length > 0 ? (
                    data.topPages.map((page, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-mono text-slate-200">{page.path}</td>
                        <td className="py-2.5 font-mono text-right text-flame-300 font-bold">
                          {page.views.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-slate-500">
                        No page views recorded in this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Traffic Sources (Referrers)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 pb-2">
                    <th className="pb-2 font-medium">Source / Host</th>
                    <th className="pb-2 font-medium text-right">Sessions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data?.trafficSources && data.trafficSources.length > 0 ? (
                    data.trafficSources.map((src, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-mono text-slate-200">{src.source}</td>
                        <td className="py-2.5 font-mono text-right text-emerald-400 font-bold">
                          {src.count.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-slate-500">
                        No traffic sources recorded in this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Help & Methodological Transparency Panel */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-5">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between text-left text-sm font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>🛡️</span>
            <span>Analytics Transparency & Methodology Disclosure</span>
          </span>
          <span className="text-xs text-slate-500">{showHelp ? "Hide ▲" : "Explain ▼"}</span>
        </button>

        {showHelp && (
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-3 leading-relaxed">
            <p>
              <strong className="text-slate-200">1. Zero Phantom Numbers:</strong> DiyaVerse never generates fake counters, simulated visitors, or synthetic diyas. What you see in the console is 100% genuine database state.
            </p>
            <p>
              <strong className="text-slate-200">2. Privacy Guarantees:</strong> No raw IP addresses are ever stored. Rate limiting uses a salted hash that is securely rotated every 24 hours. No names, emails, or biometric fingerprints are collected from public users.
            </p>
            <p>
              <strong className="text-slate-200">3. Bot & Spider Filtering:</strong> Automated scrapers and search spiders are flagged during ingestion and excluded from session counts and conversion calculations to keep metrics clean.
            </p>
            <p>
              <strong className="text-slate-200">4. 90-Day Retention:</strong> Raw analytics events and non-active sessions are automatically pruned after 90 days via scheduled nightly jobs, respecting data minimization principles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
