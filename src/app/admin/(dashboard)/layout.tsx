import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getAdminSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "DiyaVerse Console • Administration",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const navItems = [
    { href: "/admin", label: "Overview", icon: "📊" },
    { href: "/admin/analytics", label: "Analytics", icon: "📈" },
    { href: "/admin/diyas", label: "Diyas", icon: "🪔" },
    { href: "/admin/moderation", label: "Moderation", icon: "🛡️" },
    { href: "/admin/wishes", label: "Wish Library", icon: "📜" },
    { href: "/admin/health", label: "Health", icon: "🩺" },
    { href: "/admin/audit", label: "Audit Log", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Admin Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-slate-100 text-base">
              <span className="text-flame-400">🪔</span>
              <span>DiyaVerse Console</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-flame-400/20 text-flame-300 border border-flame-400/30">
                {session.admin.role}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-slate-400 font-mono">
              {session.admin.email}
            </span>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Nav strip */}
        <div className="md:hidden border-t border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/60 whitespace-nowrap flex items-center gap-1"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
