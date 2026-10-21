"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface TimeseriesData {
  range: string;
  timeseries: Array<{
    date: string;
    visitors: number;
    sessions: number;
    diyas: number;
    shares: number;
  }>;
  categories: Array<{ name: string; value: number }>;
  styles: Array<{ name: string; value: number }>;
}

const PALETTE = ["#f59e0b", "#ec4899", "#8b5cf6", "#10b981", "#3b82f6", "#ef4444", "#6366f1"];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("7d");
  const [data, setData] = useState<TimeseriesData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTimeseries = useCallback(async (r: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/stats/timeseries?range=${r}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load timeseries", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeseries(range);
  }, [range, fetchTimeseries]);

  const series = data?.timeseries || [];

  return (
    <div className="space-y-8">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>📈 Analytics & Trends</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual trends across traffic, diya lighting, and community sharing
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto">
          {(
            [
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
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
          <div className="h-80 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
          <div className="h-80 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
          <div className="h-80 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Visitors & Sessions */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Visitors & Sessions (Daily IST)
            </h2>
            <p className="text-xs text-slate-400 mb-4">Traffic volume and engagement</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="sessionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area type="monotone" dataKey="visitors" name="Unique Visitors" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#visitorGrad)" />
                  <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#sessionGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Diyas Lit Daily */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Diyas Lit vs Share Actions
            </h2>
            <p className="text-xs text-slate-400 mb-4">Community participation and virality</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="diyas" name="Diyas Lit" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shares" name="Share Actions" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Diya Styles Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Diya Styles Chosen
            </h2>
            <p className="text-xs text-slate-400 mb-4">Aesthetic preferences (Clay, Brass, Silver, Floral, Royal)</p>
            <div className="h-64 w-full flex items-center justify-center">
              {data?.styles && data.styles.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.styles}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
                      }
                      fontSize={11}
                    >
                      {data.styles.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-500">No diya style data recorded yet</div>
              )}
            </div>
          </div>

          {/* Chart 4: Wish Categories */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Wish Categories
            </h2>
            <p className="text-xs text-slate-400 mb-4">Themes selected from the 2,000 library vs custom</p>
            <div className="h-64 w-full flex items-center justify-center">
              {data?.categories && data.categories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
                      }
                      fontSize={11}
                    >
                      {data.categories.map((_, index) => (
                        <Cell key={`cell-cat-${index}`} fill={PALETTE[(index + 2) % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-500">No wish category data recorded yet</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
