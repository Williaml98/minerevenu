"use client";

import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

export default function OfficerDashboardPage() {
    const { data: summary, isLoading: summaryLoading } = useGetRevenueSummaryQuery({});
    const { data: sales = [], isLoading: salesLoading } = useGetSalesTransactionsQuery({});

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

    const isLoading = summaryLoading || salesLoading;

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Officer Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Real-time overview of revenue collections and validation workload.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">Today&apos;s Revenue</p>
                    <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                        {formatCurrency(summary?.today_revenue || 0)}
                    </h2>
                    <Wallet className="text-blue-600 mt-4" size={20} />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">This Month</p>
                    <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                        {formatCurrency(summary?.month_revenue || 0)}
                    </h2>
                    <CheckCircle2 className="text-emerald-600 mt-4" size={20} />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">Pending Validation</p>
                    <h2 className="text-2xl font-semibold text-amber-600 mt-2">
                        {summary?.pending_entries || 0}
                    </h2>
                    <Clock3 className="text-amber-600 mt-4" size={20} />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">Flagged Entries</p>
                    <h2 className="text-2xl font-semibold text-rose-600 mt-2">
                        {summary?.flagged_entries || 0}
                    </h2>
                    <AlertTriangle className="text-rose-600 mt-4" size={20} />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Daily Revenue Trend</h2>
                    <span className="text-xs text-slate-500">Last 14 days</span>
                </div>
                {isLoading ? (
                    <p className="text-sm text-slate-500 py-10 text-center">Loading revenue trend...</p>
                ) : dailyTrend.length === 0 ? (
                    <p className="text-sm text-slate-500 py-10 text-center">No revenue records available yet.</p>
                ) : (
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyTrend}>
                                <defs>
                                    <linearGradient id="officerRevenueFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="date" stroke="#64748B" />
                                <YAxis stroke="#64748B" />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#2563EB"
                                    fill="url(#officerRevenueFill)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
