"use client";

import React, { useEffect, useState, useCallback } from "react";

interface WishItem {
  id: string;
  text: string;
  category: string;
  language: string;
  tone?: string;
  tags: string[];
  active: boolean;
  version: number;
}

export default function AdminWishesPage() {
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [languageFilter, setLanguageFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const getCsrfToken = () => {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/(?:^|; )admin_csrf_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : "";
  };

  const fetchWishes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
        category: categoryFilter,
        language: languageFilter,
        active: activeFilter === "ALL" ? "ALL" : activeFilter === "ACTIVE" ? "true" : "false",
      });
      if (debouncedQuery) params.set("q", debouncedQuery);

      const res = await fetch(`/api/admin/wishes?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.items || []);
        setTotalPages(json.pagination?.totalPages || 1);
        setTotalCount(json.pagination?.total || 0);
      }
    } catch (e) {
      console.error("Failed to load wishes", e);
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, languageFilter, activeFilter, debouncedQuery]);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const toggleWish = async (wish: WishItem) => {
    try {
      setActionInProgress(wish.id);
      const csrfToken = getCsrfToken();
      const res = await fetch(`/api/admin/wishes/${wish.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ active: !wish.active }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((w) => (w.id === wish.id ? { ...w, active: !w.active } : w))
        );
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update wish");
      }
    } catch (e) {
      console.error("Error toggling wish", e);
      alert("Network error toggling wish");
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
            <span>📜 Wish Library Browser</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {totalCount.toLocaleString()} curated wishes across 3 languages & 6 categories
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wish text or ID..."
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-flame-400 w-52"
          />

          {/* Language filter */}
          <select
            value={languageFilter}
            onChange={(e) => {
              setLanguageFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-flame-400"
          >
            <option value="ALL">All Languages</option>
            <option value="en">English</option>
            <option value="hi">Hindi (हिंदी)</option>
            <option value="hinglish">Hinglish</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-flame-400"
          >
            <option value="ALL">All Categories</option>
            <option value="FAMILY">Family</option>
            <option value="FRIENDS">Friends</option>
            <option value="PROSPERITY">Prosperity</option>
            <option value="ELDERS">Elders</option>
            <option value="COLLEAGUES">Colleagues</option>
            <option value="REFLECTIVE">Reflective</option>
          </select>

          {/* Active status filter */}
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-flame-400"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Wishes Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/90">
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Wish Text</th>
                <th className="py-3 px-4 font-semibold">Language</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Tone</th>
                <th className="py-3 px-4 font-semibold text-right">Status / Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-flame-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading library wishes...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No wishes found matching current filters
                  </td>
                </tr>
              ) : (
                items.map((wish) => (
                  <tr key={wish.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 font-semibold">{wish.id}</td>
                    <td className="py-3 px-4 max-w-md">
                      <p className="text-slate-200 leading-relaxed font-sans">{wish.text}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {wish.language}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {wish.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 capitalize">
                      {wish.tone || "General"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        disabled={actionInProgress === wish.id}
                        onClick={() => toggleWish(wish)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                          wish.active
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750"
                        }`}
                      >
                        {wish.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <span className="font-semibold text-slate-200">{page}</span> of{" "}
            <span className="font-semibold text-slate-200">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
