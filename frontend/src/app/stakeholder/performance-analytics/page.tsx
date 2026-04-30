"use client";

import React, { useState, useMemo } from "react";
import {
    AlertTriangle, LineChart as LineChartIcon, ShieldCheck, Sparkles,
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
    ChevronUp, ChevronDown, ChevronsUpDown,
} from "lucide-react";
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
    useGetAnalyticsAnomaliesQuery,
    useGetAnalyticsRecommendationsQuery,
    useGetAnalyticsSummaryQuery,
    useGetForecastsQuery,
} from "@/lib/redux/slices/analyticsApi";
import { useGetStakeholderInsightsQuery } from "@/lib/redux/slices/MiningSlice";

type SortKey = "name" | "revenue" | "contribution";
type SortDir = "asc" | "desc";

const periods = ["Last 7 Days", "Last 30 Days", "Last Quarter", "This Year"];

const statusConfig = {
    "on-track":     { label: "On Track",     color: "#10b981", bg: "rgba(16,185,129,0.12)",  icon: TrendingUp },
    "at-risk":      { label: "At Risk",      color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: AlertTriangle },
    "below-target": { label: "Below Target", color: "#e11d48", bg: "rgba(225,29,72,0.12)",  icon: TrendingDown },
};

function fmt(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0, notation: "compact" }).format(n);
}

export default function PerformanceAnalyticsPage() {
    const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsSummaryQuery();
    const { data: anomaliesData } = useGetAnalyticsAnomaliesQuery();
    const { data: recommendationsData } = useGetAnalyticsRecommendationsQuery();
    const { data: stakeholderData, isLoading: stakeholderLoading } = useGetStakeholderInsightsQuery({});
    const { data: forecastsRaw = [] } = useGetForecastsQuery();

    const summary       = analytics?.summary;
    const annualGrowth  = stakeholderData?.overview?.annual_growth_rate || 0;
    const complianceRate = stakeholderData?.overview?.compliance_rate || 0;
    const anomalies     = anomaliesData?.anomalies || [];
    const recommendations = recommendationsData?.recommendations || [];

    const [period, setPeriod] = useState("Last 30 Days");
    const [sortKey, setSortKey] = useState<SortKey>("revenue");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    // Period-filtered monthly revenue data
    const periodMonths = useMemo(() => {
        switch (period) {
            case "Last 7 Days":   return 0.25;
            case "Last 30 Days":  return 1;
            case "Last Quarter":  return 3;
            case "This Year":     return 12;
            default:              return 1;
        }
    }, [period]);

    const monthlyRevenue = stakeholderData?.monthly_revenue || [];

    // Build bar chart from real monthly_revenue (last N months based on period)
    const barData = useMemo(() => {
        const months = Math.ceil(periodMonths);
        const slice = monthlyRevenue.slice(-Math.max(months, 2));
        return slice.map((m, i) => ({
            period: m.month,
            current:  m.total_revenue,
            previous: i > 0 ? slice[i - 1].total_revenue : 0,
        }));
    }, [monthlyRevenue, periodMonths]);

    // Build line chart from monthly_revenue (actual) + forecasts
    const lineData = useMemo(() => {
        const forecastMap = new Map<string, number>();
        forecastsRaw.forEach((f) => {
            const key = new Date(f.forecast_date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            forecastMap.set(key, f.predicted_revenue);
        });

        return monthlyRevenue.slice(-6).map((m) => {
            const label = new Date(m.month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" });
            return {
                month:    label,
                revenue:  m.total_revenue,
                forecast: forecastMap.get(label) ?? null,
            };
        });
    }, [monthlyRevenue, forecastsRaw]);

    // Site breakdown table from real data
    const siteBreakdown = stakeholderData?.site_breakdown || [];

    const sortedSites = useMemo(() => {
        return [...siteBreakdown].sort((a, b) => {
            let aVal: number, bVal: number;
            if (sortKey === "name")         { return sortDir === "asc" ? a.mine_name.localeCompare(b.mine_name) : b.mine_name.localeCompare(a.mine_name); }
            if (sortKey === "contribution") { aVal = a.contribution_percent; bVal = b.contribution_percent; }
            else                            { aVal = a.total_revenue;        bVal = b.total_revenue; }
            return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        });
    }, [siteBreakdown, sortKey, sortDir]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("desc"); }
    };

    const SortIcon = ({ k }: { k: SortKey }) => {
        if (sortKey !== k) return <ChevronsUpDown size={12} style={{ color: "var(--text-secondary)", opacity: 0.5 }} />;
        return sortDir === "asc" ? <ChevronUp size={12} style={{ color: "#7c3aed" }} /> : <ChevronDown size={12} style={{ color: "#7c3aed" }} />;
    };

    const isLoading = analyticsLoading || stakeholderLoading;

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

            {/* Period Filter */}
            <div
                className="rounded-2xl p-4 flex flex-wrap gap-3 items-center"
                style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
            >
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Period:</span>
                <div className="flex gap-2 flex-wrap">
                    {periods.map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className="text-sm px-4 py-1.5 rounded-xl transition-all"
                            style={period === p
                                ? { background: "rgba(124,58,237,0.15)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.3)" }
                                : { background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--card-border)" }
                            }
                        >
                            {p}
                        </button>
                    ))}
                </div>
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
                        status: annualGrowth >= 0 ? "on-track" as const : "at-risk" as const,
                        trend: annualGrowth,
                    },
                    {
                        label: "Revenue Stability",
                        value: summary?.stability_score != null ? `${summary.stability_score.toFixed(1)}` : "N/A",
                        icon: ShieldCheck,
                        color: "#2563eb",
                        bg: "rgba(37,99,235,0.1)",
                        status: (summary?.stability_score || 0) >= 70 ? "on-track" as const : "at-risk" as const,
                        trend: 0,
                    },
                    {
                        label: "Compliance Score",
                        value: `${complianceRate.toFixed(1)}%`,
                        icon: Sparkles,
                        color: "#7c3aed",
                        bg: "rgba(124,58,237,0.1)",
                        status: complianceRate >= 80 ? "on-track" as const : complianceRate >= 60 ? "at-risk" as const : "below-target" as const,
                        trend: 0,
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
                                {isLoading ? "—" : card.value}
                            </p>
                            {card.trend !== 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                    {card.trend >= 0
                                        ? <ArrowUpRight size={13} style={{ color: "#10b981" }} />
                                        : <ArrowDownRight size={13} style={{ color: "#e11d48" }} />}
                                    <span className="text-xs font-medium" style={{ color: card.trend >= 0 ? "#10b981" : "#e11d48" }}>
                                        {Math.abs(card.trend).toFixed(1)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Bar Chart: period comparison */}
                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="mb-4">
                        <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                            Revenue Comparison
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Current vs previous period · {period}</p>
                    </div>
                    {barData.length === 0 ? (
                        <div className="h-60 flex items-center justify-center">
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No revenue data available.</p>
                        </div>
                    ) : (
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} barGap={4}>
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
                    )}
                </div>

                {/* Line Chart: Forecast vs Actual (from real data) */}
                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="mb-4">
                        <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                            Forecast vs Actual
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Revenue accuracy tracking · last 6 months</p>
                    </div>
                    {lineData.length === 0 ? (
                        <div className="h-60 flex items-center justify-center">
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No data available.</p>
                        </div>
                    ) : (
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v: number) => fmt(v)} />
                                    <Tooltip
                                        formatter={(v: number) => [fmt(v)]}
                                        contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--text-primary)" }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
                                    <Line type="monotone" dataKey="revenue"  name="Actual Revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                    <Line type="monotone" dataKey="forecast" name="AI Forecast"    stroke="#7c3aed" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* Site Revenue Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                <div className="p-5 border-b" style={{ borderColor: "var(--card-border)" }}>
                    <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                        Site Revenue Breakdown
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Click column headers to sort · {siteBreakdown.length} sites</p>
                </div>

                {siteBreakdown.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No site data available.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[480px]">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--card-border)", background: "var(--bg-surface)" }}>
                                    {[
                                        { key: "name" as SortKey,         label: "Site Name" },
                                        { key: "revenue" as SortKey,      label: "Total Revenue" },
                                        { key: "contribution" as SortKey, label: "Contribution" },
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
                                {sortedSites.map((row, i) => {
                                    const status = row.contribution_percent >= 25 ? "on-track" as const : row.contribution_percent >= 10 ? "at-risk" as const : "below-target" as const;
                                    const stCfg = statusConfig[status];
                                    return (
                                        <tr
                                            key={row.mine_id}
                                            style={{ borderBottom: i < sortedSites.length - 1 ? "1px solid var(--card-border)" : "none" }}
                                            onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-surface)"}
                                            onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stCfg.color }} />
                                                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{row.mine_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(row.total_revenue)}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 rounded-full max-w-24 overflow-hidden" style={{ background: "var(--bg-surface)" }}>
                                                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, row.contribution_percent)}%`, background: stCfg.color }} />
                                                    </div>
                                                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                                        {row.contribution_percent.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
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
