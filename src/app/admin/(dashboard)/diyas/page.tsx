"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface DiyaItem {
  id: string;
  publicId: string;
  seq: number;
  style: string;
  locale: string;
  wishSource: string;
  wishText: string;
  dedication?: string;
  dedicationText?: string;
  status: "PUBLISHED" | "HIDDEN" | "DELETED";
  reportsCount: number;
  createdAt: string;
}

export default function AdminDiyasPage() {
  const [items, setItems] = useState<DiyaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DiyaItem | null>(null);

  // Debounce search
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

  const fetchDiyas = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status: statusFilter,
      });
      if (debouncedQuery) params.set("q", debouncedQuery);

      const res = await fetch(`/api/admin/diyas?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.items || []);
        setTotalPages(json.pagination?.totalPages || 1);
        setTotalCount(json.pagination?.total || 0);
      }
    } catch (e) {
      console.error("Failed to load diyas", e);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedQuery]);

  useEffect(() => {
    fetchDiyas();
  }, [fetchDiyas]);

  const updateDiyaStatus = async (id: string, newStatus: "PUBLISHED" | "HIDDEN" | "DELETED") => {
    try {
      setActionInProgress(id);
      const csrfToken = getCsrfToken();
      const res = await fetch(`/api/admin/diyas/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchDiyas();
        if (confirmDelete?.id === id) setConfirmDelete(null);
      } else {
        const err = await res.json();
        alert(err.error || "Action failed");
      }
    } catch (e) {
      console.error("Failed to update status", e);
      alert("Network error updating status");
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
            <span>🪔 Diya Moderation & Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {totalCount.toLocaleString()} total diyas lit in the community
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID, dedication, wish..."
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-flame-400 w-56"
          />

          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
            {["ALL", "PUBLISHED", "HIDDEN", "DELETED"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? "bg-flame-400 text-maroon-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Diyas Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/90">
                <th className="py-3 px-4 font-semibold">#Seq</th>
                <th className="py-3 px-4 font-semibold">Public ID</th>
                <th className="py-3 px-4 font-semibold">Dedication</th>
                <th className="py-3 px-4 font-semibold">Wish Content</th>
                <th className="py-3 px-4 font-semibold">Style</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-flame-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading diyas...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No diyas found matching current criteria
                  </td>
                </tr>
              ) : (
                items.map((diya) => (
                  <tr key={diya.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{diya.seq}</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/d/${diya.publicId}`}
                        target="_blank"
                        className="font-mono text-flame-300 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>{diya.publicId}</span>
                        <span className="text-[10px]">↗</span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {diya.dedicationText ? (
                        <div>
                          <div className="font-semibold text-slate-100">{diya.dedicationText}</div>
                          {diya.dedication && (
                            <div className="text-[10px] text-slate-500 uppercase">{diya.dedication}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-300 text-[11px] leading-snug">
                        {diya.wishText}
                      </p>
                      <span className="text-[9px] uppercase font-bold text-slate-500 mt-0.5 inline-block">
                        {diya.wishSource}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-400 font-medium">
                      {diya.style}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            diya.status === "PUBLISHED"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : diya.status === "HIDDEN"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {diya.status}
                        </span>
                        {diya.reportsCount > 0 && (
                          <span
                            title={`${diya.reportsCount} user reports filed`}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white"
                          >
                            ⚠️ {diya.reportsCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {diya.status === "PUBLISHED" ? (
                          <button
                            disabled={actionInProgress === diya.id}
                            onClick={() => updateDiyaStatus(diya.id, "HIDDEN")}
                            className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Hide
                          </button>
                        ) : (
                          <button
                            disabled={actionInProgress === diya.id}
                            onClick={() => updateDiyaStatus(diya.id, "PUBLISHED")}
                            className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Restore
                          </button>
                        )}

                        {diya.status !== "DELETED" && (
                          <button
                            disabled={actionInProgress === diya.id}
                            onClick={() => setConfirmDelete(diya)}
                            className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
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

      {/* Confirmation Modal for Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 text-lg">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Soft-Delete Diya #{confirmDelete.seq}?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This marks the diya as DELETED. It will be removed from the public wall, direct link will return a removed notice, and an immutable entry will be recorded in the audit log.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-slate-400">Wish: </span>
              {confirmDelete.wishText}
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={actionInProgress === confirmDelete.id}
                onClick={() => updateDiyaStatus(confirmDelete.id, "DELETED")}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-red-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
