"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password.");
      }

      // Login successful, navigate with fresh session cookie
      window.location.href = redirectPath;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-6 text-left">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border border-flame-400/40 text-flame-400 mb-2">
          🪔
        </div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">DiyaVerse Console</h1>
        <p className="text-xs text-slate-400">Authenticated administrator access only</p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-300">
            Email Address
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@diyaverse.in"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-flame-400 focus:ring-1 focus:ring-flame-400"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="admin-pass" className="block text-xs font-semibold text-slate-300">
            Password
          </label>
          <input
            id="admin-pass"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••••"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-flame-400 focus:ring-1 focus:ring-flame-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-sm text-night-950 bg-flame-400 hover:bg-flame-300 transition-colors shadow cursor-pointer disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Sign In to Console"}
        </button>
      </form>

      <div className="text-center text-[11px] text-slate-500">
        Rate limited: 5 failed attempts locks IP for 15 minutes.
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-400">Loading console authentication...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
