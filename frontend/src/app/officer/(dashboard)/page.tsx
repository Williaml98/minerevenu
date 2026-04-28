"use client";

import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
import {
    AlertTriangle, CheckCircle2, Clock3, Wallet, TrendingUp, Zap,
    FileText, ClipboardList, MessageSquare, ArrowUpRight, ArrowDownRight,
    CalendarDays, Target, Bell, ChevronRight, Sparkles
} from "lucide-react";
import {
    Area, AreaChart, CartesianGrid, ResponsiveContainer,
    Tooltip, XAxis, YAxis, BarChart, Bar, Cell
} from "recharts";
import {
    useGetRevenueSummaryQuery,
    useGetSalesTransactionsQuery,
} from "@/lib/redux/slices/MiningSlice";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

const tasks = [
    { id: 1, title: "Submit Q2 Revenue Report", due: "Due today", status: "pending" as const, priority: "high" },
    { id: 2, title: "Validate 14 pending transactions", due: "Due tomorrow", status: "in-progress" as const, priority: "high" },
    { id: 3, title: "Review Kigali Site production data", due: "Due Apr 29", status: "in-progress" as const, priority: "medium" },
    { id: 4, title: "Reconcile March payment records", due: "Completed Apr 24", status: "completed" as const, priority: "low" },
    { id: 5, title: "Update mineral extraction logs", due: "Completed Apr 22", status: "completed" as const, priority: "low" },
];

const alerts = [
    { id: 1, message: "3 transactions flagged for review", type: "warning" as const, time: "2h ago" },
    { id: 2, message: "Revenue target 87% achieved this month", type: "success" as const, time: "5h ago" },
    { id: 3, message: "New assignment: Northern Zone audit", type: "info" as const, time: "1d ago" },
];

const taskStatusConfig = {
    pending:     { label: "Pending",     color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock3 },
    "in-progress": { label: "In Progress", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: TrendingUp },
    completed:   { label: "Completed",   color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: CheckCircle2 },
};

const alertConfig = {
    warning: { border: "#f59e0b", bg: "rgba(245,158,11,0.08)", icon: AlertTriangle, iconColor: "#f59e0b" },
    success: { border: "#10b981", bg: "rgba(16,185,129,0.08)", icon: CheckCircle2,   iconColor: "#10b981" },
    info:    { border: "#3b82f6", bg: "rgba(59,130,246,0.08)",  icon: Bell,           iconColor: "#3b82f6" },
};

const CHART_COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"];

export default function OfficerDashboardPage() {
    const { data: session } = useSession();
    const { data: summary, isLoading: summaryLoading } = useGetRevenueSummaryQuery({});
    const { data: sales = [], isLoading: salesLoading } = useGetSalesTransactionsQuery({});

    const officerName = (session?.user?.name || "Officer").split(" ")[0];
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const dailyTrend = useMemo(() => {
        const map = new Map<string, number>();
        sales.forEach((tx) => {
            const current = map.get(tx.date) || 0;
            map.set(tx.date, current + tx.total_amount);
        });
        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-14)
            .map(([date, total]) => ({
                date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                revenue: Number(total.toFixed(2)),
            }));
    }, [sales]);

    const weeklyBarData = useMemo(() => {
        return dailyTrend.slice(-7).map((d, i) => ({ ...d, fill: CHART_COLORS[i % CHART_COLORS.length] }));
    }, [dailyTrend]);

    const isLoading = summaryLoading || salesLoading;
    const taskCounts = { pending: tasks.filter(t => t.status === "pending").length, inProgress: tasks.filter(t => t.status === "in-progress").length, completed: tasks.filter(t => t.status === "completed").length };

    return (
        <div className="min-h-screen p-4 md:p-6 space-y-5" style={{ background: "var(--bg-base)" }}>

            {/* Greeting */}
            <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #10b981 0%, transparent 50%)" }} />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-emerald-300 text-sm font-medium mb-1 flex items-center gap-2">
                            <CalendarDays size={14} />
                            {today}
                        </p>
                        <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                            Welcome back, {officerName}
                        </h1>
                        <p className="text-emerald-200 text-sm mt-1">Revenue Officer · Mining Operations Division</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="text-center px-4 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                            <p className="text-2xl font-bold text-white">{taskCounts.inProgress}</p>
                            <p className="text-xs text-emerald-300">In Progress</p>
                        </div>
                        <div className="text-center px-4 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                            <p className="text-2xl font-bold text-white">{taskCounts.pending}</p>
                            <p className="text-xs text-emerald-300">Pending</p>
                        </div>
                        <div className="text-center px-4 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                            <p className="text-2xl font-bold text-white">{taskCounts.completed}</p>
                            <p className="text-xs text-emerald-300">Done</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    {
                        label: "Today's Revenue",
                        value: formatCurrency(summary?.today_revenue || 0),
                        icon: Wallet,
                        color: "#2563eb",
                        bg: "rgba(37,99,235,0.1)",
                        trend: +5.2,
                    },
                    {
                        label: "This Month",
                        value: formatCurrency(summary?.month_revenue || 0),
                        icon: TrendingUp,
                        color: "#059669",
                        bg: "rgba(5,150,105,0.1)",
                        trend: +12.1,
                    },
                    {
                        label: "Pending Validation",
                        value: summary?.pending_entries || 0,
                        icon: Clock3,
                        color: "#f59e0b",
                        bg: "rgba(245,158,11,0.1)",
                        trend: -3,
                    },
                    {
                        label: "Flagged Entries",
                        value: summary?.flagged_entries || 0,
                        icon: AlertTriangle,
                        color: "#e11d48",
                        bg: "rgba(225,29,72,0.1)",
                        trend: -1,
                    },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="rounded-2xl p-5 transition-all duration-200"
                        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = card.color + "40"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--card-border)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 rounded-xl" style={{ background: card.bg }}>
                                <card.icon size={18} style={{ color: card.color }} />
                            </div>
                            <span
                                className="text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-full"
                                style={{
                                    color: card.trend >= 0 ? "#10b981" : "#e11d48",
                                    background: card.trend >= 0 ? "rgba(16,185,129,0.1)" : "rgba(225,29,72,0.1)",
                                }}
                            >
                                {card.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {Math.abs(card.trend)}%
                            </span>
                        </div>
                        <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{card.label}</p>
                        <p className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                            {isLoading ? "—" : card.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* AI Insight Card */}
            <div
                className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(59,130,246,0.1) 100%)", border: "1px solid rgba(124,58,237,0.25)" }}
            >
                <div className="p-3 rounded-2xl flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.2)" }}>
                    <Sparkles size={22} style={{ color: "#a78bfa" }} />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#a78bfa" }}>AI Insight</p>
                    <p className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                        Your revenue contribution is trending <span style={{ color: "#10b981" }}>+12% above target</span> — forecast confidence: 94%
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                        Based on 14-day trend analysis and current validation queue. 3 flagged entries may impact final figures.
                    </p>
                </div>
                <button
                    className="text-xs font-semibold px-4 py-2 rounded-xl flex-shrink-0 flex items-center gap-1 transition-all"
                    style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}
                >
                    View Forecast <ChevronRight size={14} />
                </button>
            </div>

            {/* Tasks + Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Tasks */}
                <div className="xl:col-span-2 rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ClipboardList size={18} style={{ color: "#059669" }} />
                            <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                                Assigned Tasks & Targets
                            </h2>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>
                            {tasks.length} total
                        </span>
                    </div>

                    <div className="space-y-2">
                        {tasks.map((task) => {
                            const cfg = taskStatusConfig[task.status];
                            return (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                                    style={{ border: "1px solid var(--card-border)" }}
                                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-surface)"}
                                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                                >
                                    <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: cfg.bg }}>
                                        <cfg.icon size={14} style={{ color: cfg.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-sm font-medium truncate"
                                            style={{
                                                color: "var(--text-primary)",
                                                textDecoration: task.status === "completed" ? "line-through" : "none",
                                                opacity: task.status === "completed" ? 0.6 : 1,
                                            }}
                                        >
                                            {task.title}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{task.due}</p>
                                    </div>
                                    <span
                                        className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
                                        style={{ background: cfg.bg, color: cfg.color }}
                                    >
                                        {cfg.label}
                                    </span>
                                    {task.priority === "high" && (
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0"
                                            style={{ background: "rgba(225,29,72,0.1)", color: "#e11d48" }}>
                                            High
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Alerts */}
                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Bell size={18} style={{ color: "#f59e0b" }} />
                        <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                            Recent Alerts
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {alerts.map((alert) => {
                            const cfg = alertConfig[alert.type];
                            return (
                                <div
                                    key={alert.id}
                                    className="p-3 rounded-xl"
                                    style={{ background: cfg.bg, borderLeft: `3px solid ${cfg.border}` }}
                                >
                                    <div className="flex items-start gap-2">
                                        <cfg.icon size={14} style={{ color: cfg.iconColor, flexShrink: 0, marginTop: 2 }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm" style={{ color: "var(--text-primary)" }}>{alert.message}</p>
                                            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{alert.time}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                <div className="flex items-center gap-2 mb-4">
                    <Zap size={18} style={{ color: "#f59e0b" }} />
                    <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                        Quick Actions
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { label: "Submit Report", desc: "File your daily revenue summary", icon: FileText, color: "#2563eb", bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.2)" },
                        { label: "View Assignments", desc: "See all assigned tasks and targets", icon: ClipboardList, color: "#059669", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.2)" },
                        { label: "Request Review", desc: "Escalate flagged entries for review", icon: MessageSquare, color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)" },
                    ].map((action) => (
                        <button
                            key={action.label}
                            className="flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-200 w-full"
                            style={{ background: action.bg, border: `1px solid ${action.border}` }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                        >
                            <div className="p-2 rounded-xl flex-shrink-0" style={{ background: `${action.color}22` }}>
                                <action.icon size={18} style={{ color: action.color }} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: action.color, fontFamily: "var(--font-display)" }}>
                                    {action.label}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{action.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Revenue Trend */}
                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                                Revenue Trend
                            </h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Last 14 days</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>Live</span>
                    </div>
                    {isLoading ? (
                        <div className="h-56 flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
                            <p className="text-sm">Loading...</p>
                        </div>
                    ) : dailyTrend.length === 0 ? (
                        <div className="h-56 flex items-center justify-center">
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No revenue records yet.</p>
                        </div>
                    ) : (
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyTrend}>
                                    <defs>
                                        <linearGradient id="officerGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                                        contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--text-primary)" }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#059669" fill="url(#officerGradient)" strokeWidth={2} dot={{ fill: "#059669", r: 3 }} activeDot={{ r: 5 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Weekly Contribution Bar */}
                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                                Weekly Contribution
                            </h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Last 7 days</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Target size={14} style={{ color: "#059669" }} />
                            <span className="text-xs font-medium" style={{ color: "#059669" }}>On Track</span>
                        </div>
                    </div>
                    {weeklyBarData.length === 0 ? (
                        <div className="h-56 flex items-center justify-center">
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No data available.</p>
                        </div>
                    ) : (
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyBarData} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                                        contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--text-primary)" }}
                                    />
                                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                        {weeklyBarData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
