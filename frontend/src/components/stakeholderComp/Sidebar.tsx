"use client";

import {
    Home, BarChart3, FileText, MessageSquare, LogOut, Settings, Menu, X, TrendingUp, PieChart,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
    { title: "Dashboard", url: "/stakeholder", icon: Home },
    { title: "Revenue Performance", url: "/stakeholder/revenue-performance", icon: BarChart3 },
    { title: "Performance Analytics", url: "/stakeholder/performance-analytics", icon: PieChart },
    { title: "Reports", url: "/stakeholder/reports", icon: FileText },
    { title: "Communications", url: "/stakeholder/collaboration_hub", icon: MessageSquare },
    { title: "Profile & Settings", url: "/stakeholder/settings", icon: Settings },
];

export default function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (url: string) =>
        url === "/stakeholder" ? pathname === url : pathname === url || pathname?.startsWith(`${url}/`);

    const logout = () => { localStorage.clear(); router.push("/auth"); };

    return (
        <>
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden fixed top-4 left-4 z-[1002] flex items-center justify-center w-9 h-9 rounded-xl shadow-lg"
                style={{ background: "#7c3aed", color: "#fff" }}
                aria-label="Toggle sidebar"
            >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[999] backdrop-blur-sm"
                    style={{ background: "rgba(0,0,0,0.65)" }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <nav
                className={`
                    fixed top-0 left-0 h-full w-[260px] flex flex-col z-[1001]
                    transition-transform duration-300 ease-in-out
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
                style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
            >
                <div
                    className="flex items-center gap-3 px-5 py-5 flex-shrink-0"
                    style={{ borderBottom: "1px solid var(--sidebar-border)" }}
                >
                    <div
                        className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                        style={{
                            background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                            boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
                        }}
                    >
                        <TrendingUp size={17} color="#fff" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[14px] font-bold text-white leading-tight tracking-tight truncate" style={{ fontFamily: "var(--font-display)" }}>
                            MineRevenue
                        </p>
                        <p className="text-[10px] uppercase tracking-widest" style={{ color: "#a78bfa" }}>
                            Stakeholder Portal
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                    <p className="text-[10px] uppercase tracking-widest px-3 mb-3 font-semibold" style={{ color: "var(--sidebar-text)" }}>
                        Navigation
                    </p>
                    <ul className="space-y-0.5">
                        {items.map((item, i) => {
                            const active = isActive(item.url);
                            return (
                                <li key={item.url} className={`animate-slide-in-left stagger-${Math.min(i + 1, 6)}`}>
                                    <Link
                                        href={item.url}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
                                        style={{
                                            backgroundColor: active ? "var(--sidebar-active-bg)" : "transparent",
                                            color: active ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!active) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--sidebar-hover-bg)";
                                            if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "#c8d8f0";
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!active) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                                            if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "var(--sidebar-text)";
                                        }}
                                    >
                                        <span
                                            className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all"
                                            style={{
                                                backgroundColor: active ? "#7c3aed" : "rgba(255,255,255,0.06)",
                                                color: active ? "#fff" : "inherit",
                                            }}
                                        >
                                            <item.icon size={14} />
                                        </span>
                                        <span className="truncate">{item.title}</span>
                                        {active && (
                                            <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#a78bfa" }} />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="p-3 flex-shrink-0" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
                    <button
                        onClick={() => setConfirmOpen(true)}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[13px] font-medium transition-all duration-150"
                        style={{ color: "var(--sidebar-text)" }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(239,68,68,0.12)";
                            (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                            (e.currentTarget as HTMLButtonElement).style.color = "var(--sidebar-text)";
                        }}
                    >
                        <span className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                            <LogOut size={14} />
                        </span>
                        <span>Sign Out</span>
                    </button>
                </div>
            </nav>

            {confirmOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-[2000] animate-fade-in"
                    style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
                >
                    <div
                        className="rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-scale-in"
                        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
                    >
                        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                            Sign out?
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            You will need to sign in again to access the stakeholder portal.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={() => setConfirmOpen(false)}
                                className="px-4 py-2 rounded-xl text-sm font-medium"
                                style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "transparent" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { logout(); setConfirmOpen(false); }}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                                style={{ background: "#ef4444" }}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
