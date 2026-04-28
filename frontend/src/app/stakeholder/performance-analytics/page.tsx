"use client";

import React, { useState, useMemo } from "react";
import {
    AlertTriangle, LineChart as LineChartIcon, ShieldCheck, Sparkles,
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
    Filter, ChevronUp, ChevronDown, ChevronsUpDown,
} from "lucide-react";
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";
import {
    useGetAnalyticsAnomaliesQuery,
    useGetAnalyticsRecommendationsQuery,
    useGetAnalyticsSummaryQuery,
} from "@/lib/redux/slices/analyticsApi";
import { useGetStakeholderInsightsQuery } from "@/lib/redux/slices/MiningSlice";

type SortKey = "name" | "target" | "actual" | "variance" | "status";
type SortDir = "asc" | "desc";

const departments = ["All Departments", "Northern Zone", "Southern Zone", "Eastern Zone", "Central"];
const groups = ["All Groups", "Government", "Private", "NGO", "International"];
const periods = ["Last 7 Days", "Last 30 Days", "Last Quarter", "This Year"];

const mockComparison = [
    { name: "Northern Zone", target: 850000, actual: 921000, status: "on-track" as const },
    { name: "Southern Zone", target: 620000, actual: 545000, status: "at-risk" as const },
    { name: "Eastern Zone",  target: 490000, actual: 384000, status: "below-target" as const },
    { name: "Central",       target: 710000, actual: 748000, status: "on-track" as const },
    { name: "Western Zone",  target: 380000, actual: 352000, status: "at-risk" as const },
];

const mockBarData = [
    { period: "Jan", current: 480000, previous: 420000 },
    { period: "Feb", current: 520000, previous: 465000 },
    { period: "Mar", current: 610000, previous: 510000 },
    { period: "Apr", current: 578000, previous: 540000 },
    { period: "May", current: 695000, previous: 582000 },
    { period: "Jun", current: 720000, previous: 620000 },
];

const mockLineData = [
    { month: "Jan", revenue: 480000, forecast: 500000 },
    { month: "Feb", revenue: 520000, forecast: 510000 },
    { month: "Mar", revenue: 610000, forecast: 590000 },
    { month: "Apr", revenue: 578000, forecast: 615000 },
    { month: "May", revenue: 695000, forecast: 650000 },
    { month: "Jun", revenue: 720000, forecast: 700000 },
];

const statusConfig = {
    "on-track":     { label: "On Track",     color: "#10b981", bg: "rgba(16,185,129,0.12)",  icon: TrendingUp },
    "at-risk":      { label: "At Risk",      color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: AlertTriangle },
    "below-target": { label: "Below Target", color: "#e11d48", bg: "rgba(225,29,72,0.12)",  icon: TrendingDown },
};

function fmt(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0, notation: "compact" }).format(n);
}

function pct(val: number, ref: number) {
    if (!ref) return 0;
    return ((val - ref) / ref) * 100;
}

export default function PerformanceAnalyticsPage() {
    const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsSummaryQuery();
    const { data: anomaliesData } = useGetAnalyticsAnomaliesQuery();
    const { data: recommendationsData } = useGetAnalyticsRecommendationsQuery();
    const { data: stakeholderData } = useGetStakeholderInsightsQuery({});

    const summary       = analytics?.summary;
    const annualGrowth  = stakeholderData?.overview?.annual_growth_rate || 0;
    const complianceRate = stakeholderData?.overview?.compliance_rate || 0;
    const anomalies     = anomaliesData?.anomalies || [];
    const recommendations = recommendationsData?.recommendations || [];

    const [department, setDepartment] = useState("All Departments");
    const [group, setGroup] = useState("All Groups");
    const [period, setPeriod] = useState("Last 30 Days");
    const [sortKey, setSortKey] = useState<SortKey>("actual");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("desc"); }
    };

    const sortedData = useMemo(() => {
        return [...mockComparison].sort((a, b) => {
            let aVal: string | number, bVal: string | number;
            if (sortKey === "name")     { aVal = a.name;                       bVal = b.name; }
            else if (sortKey === "target")  { aVal = a.target;                 bVal = b.target; }
            else if (sortKey === "actual")  { aVal = a.actual;                 bVal = b.actual; }
            else if (sortKey === "variance"){ aVal = pct(a.actual, a.target);  bVal = pct(b.actual, b.target); }
            else                           { aVal = a.status;                  bVal = b.status; }
            if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [sortKey, sortDir]);

    const SortIcon = ({ k }: { k: SortKey }) => {
        if (sortKey !== k) return <ChevronsUpDown size={12} style={{ color: "var(--text-secondary)", opacity: 0.5 }} />;
        return sortDir === "asc" ? <ChevronUp size={12} style={{ color: "#7c3aed" }} /> : <ChevronDown size={12} style={{ color: "#7c3aed" }} />;
    };

    return (
        <div className="min-h-screen p-4 md:p-6 space-y-5" style={{ background: "var(--bg-base)" }}>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                    Performance Analytics
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                    AI-powered analytics for growth trends, anomalies, and governance insights.
                </p>
            </div>

            {/* Filter Bar */}
            <div
                className="rounded-2xl p-4 flex flex-wrap gap-3 items-center"
                style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
            >
                <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Filter size={15} />
                    <span className="text-sm font-medium">Filters:</span>
                </div>

                {[
                    { label: "Period", value: period, options: periods, onChange: setPeriod },
                    { label: "Department", value: department, options: departments, onChange: setDepartment },
                    { label: "Group", value: group, options: groups, onChange: setGroup },
                ].map((f) => (
                    <select
                        key={f.label}
                        value={f.value}
                        onChange={e => f.onChange(e.target.value)}
                        className="text-sm rounded-xl px-3 py-2 outline-none transition-all"
                        style={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--card-border)",
                            color: "var(--text-primary)",
                        }}
                    >
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                ))}

                <button
                    className="ml-auto text-sm font-medium px-4 py-2 rounded-xl transition-all"
                    style={{ background: "rgba(124,58,237,0.12)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.25)" }}
                >
                    Apply Filters
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    {
                        label: "Annual Growth Rate",
                        value: `${annualGrowth.toFixed(1)}%`,
                        icon: LineChartIcon,
                        color: "#10b981",
                        bg: "rgba(16,185,129,0.1)",
                        status: "on-track" as const,
                        trend: +annualGrowth,
                    },
                    {
                        label: "Revenue Stability",
                        value: `${(summary?.stability_score || 0).toFixed(1)}%`,
                        icon: ShieldCheck,
                        color: "#2563eb",
                        bg: "rgba(37,99,235,0.1)",
                        status: (summary?.stability_score || 0) >= 70 ? "on-track" as const : "at-risk" as const,
                        trend: +2.4,
                    },
                    {
                        label: "Compliance Score",
                        value: `${complianceRate.toFixed(1)}%`,
                        icon: Sparkles,
                        color: "#7c3aed",
                        bg: "rgba(124,58,237,0.1)",
                        status: complianceRate >= 80 ? "on-track" as const : complianceRate >= 60 ? "at-risk" as const : "below-target" as const,
                        trend: +1.8,
                    },
                    {
                        label: "Detected Anomalies",
                        value: String(summary?.anomaly_count || 0),
                        icon: AlertTriangle,
                        color: "#e11d48",
                        bg: "rgba(225,29,72,0.1)",
                        status: (summary?.anomaly_count || 0) === 0 ? "on-track" as const : (summary?.anomaly_count || 0) <= 3 ? "at-risk" as const : "below-target" as const,
                        trend: -(summary?.anomaly_count || 0),
                    },
                ].map((card) => {
                    const stCfg = statusConfig[card.status];
                    return (
                        <div
                            key={card.label}
                            className="rounded-2xl p-5 transition-all duration-200"
                            style={{ background: "var(--card-bg)", border: `1px solid var(--card-border)` }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = card.color + "40"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--card-border)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-xl" style={{ background: card.bg }}>
                                    <card.icon size={18} style={{ color: card.color }} />
                                </div>
                                <span
                                    className="text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"
                                    style={{ background: stCfg.bg, color: stCfg.color }}
                                >
                                    <stCfg.icon size={11} />
                                    {stCfg.label}
                                </span>
                            </div>
                            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{card.label}</p>
                            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                                {analyticsLoading ? "—" : card.value}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                                {card.trend >= 0
                                    ? <ArrowUpRight size={13} style={{ color: "#10b981" }} />
                                    : <ArrowDownRight size={13} style={{ color: "#e11d48" }} />}
                                <span className="text-xs font-medium" style={{ color: card.trend >= 0 ? "#10b981" : "#e11d48" }}>
                                    {Math.abs(card.trend).toFixed(1)}% vs last period
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Bar Chart: Period Comparison */}
                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="mb-4">
                        <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                            Revenue Comparison
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Current vs previous period</p>
                    </div>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockBarData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                                <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v: number) => fmt(v)} />
                                <Tooltip
                                    formatter={(v: number) => [fmt(v)]}
                                    contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--text-primary)" }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
                                <Bar dataKey="current"  name="Current Period"  fill="#7c3aed" radius={[4,4,0,0]} />
                                <Bar dataKey="previous" name="Previous Period" fill="rgba(124,58,237,0.3)" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Line Chart: Forecast vs Actual */}
                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="mb-4">
                        <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                            Forecast vs Actual
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Revenue accuracy tracking</p>
                    </div>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockLineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v: number) => fmt(v)} />
                                <Tooltip
                                    formatter={(v: number) => [fmt(v)]}
                                    contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--text-primary)" }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
                                <Line type="monotone" dataKey="revenue"  name="Actual Revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="forecast" name="AI Forecast"    stroke="#7c3aed" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                <div className="p-5 border-b" style={{ borderColor: "var(--card-border)" }}>
                    <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                        Stakeholder Comparison Table
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Click column headers to sort</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--card-border)", background: "var(--bg-surface)" }}>
                                {[
                                    { key: "name" as SortKey,     label: "Stakeholder / Zone" },
                                    { key: "target" as SortKey,   label: "Target" },
                                    { key: "actual" as SortKey,   label: "Actual" },
                                    { key: "variance" as SortKey, label: "Variance" },
                                    { key: "status" as SortKey,   label: "Status" },
                                ].map((col) => (
                                    <th
                                        key={col.key}
                                        className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none"
                                        style={{ color: "var(--text-secondary)" }}
                                        onClick={() => handleSort(col.key)}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {col.label}
                                            <SortIcon k={col.key} />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((row, i) => {
                                const variance = pct(row.actual, row.target);
                                const stCfg = statusConfig[row.status];
                                return (
                                    <tr
                                        key={row.name}
                                        style={{
                                            borderBottom: i < sortedData.length - 1 ? "1px solid var(--card-border)" : "none",
                                        }}
                                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-surface)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stCfg.color }} />
                                                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>{fmt(row.target)}</td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(row.actual)}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full"
                                                style={{
                                                    color: variance >= 0 ? "#10b981" : "#e11d48",
                                                    background: variance >= 0 ? "rgba(16,185,129,0.1)" : "rgba(225,29,72,0.1)",
                                                }}
                                            >
                                                {variance >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                                                {Math.abs(variance).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                                                style={{ background: stCfg.bg, color: stCfg.color }}
                                            >
                                                <stCfg.icon size={11} />
                                                {stCfg.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Anomalies + Recommendations */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={16} style={{ color: "#e11d48" }} />
                        <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                            Recent Anomalies
                        </h2>
                    </div>
                    {analyticsLoading ? (
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading insights...</p>
                    ) : anomalies.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No significant anomalies detected.</p>
                    ) : (
                        <div className="space-y-2">
                            {anomalies.slice(0, 6).map((item) => (
                                <div
                                    key={item.transaction_id}
                                    className="p-3 rounded-xl"
                                    style={{ border: "1px solid var(--card-border)", borderLeft: "3px solid #e11d48" }}
                                >
                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                        Transaction #{item.transaction_id} — {item.mine_name}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{item.reason}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={16} style={{ color: "#7c3aed" }} />
                        <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                            AI Recommendations
                        </h2>
                    </div>
                    {recommendations.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No recommendations available.</p>
                    ) : (
                        <div className="space-y-2">
                            {recommendations.map((rec, index) => (
                                <div
                                    key={`${rec.title}-${index}`}
                                    className="p-3 rounded-xl"
                                    style={{ border: "1px solid var(--card-border)", borderLeft: "3px solid #7c3aed" }}
                                >
                                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{rec.title}</p>
                                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{rec.detail}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
