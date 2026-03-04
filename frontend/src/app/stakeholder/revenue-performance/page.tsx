"use client";

import React, { useMemo } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useGetStakeholderInsightsQuery } from "@/lib/redux/slices/MiningSlice";

const COLORS = ["#2563EB", "#0EA5E9", "#10B981", "#F59E0B", "#6366F1", "#EF4444"];

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export default function RevenuePerformancePage() {
    const { data, isLoading } = useGetStakeholderInsightsQuery({});

    const trendData = useMemo(
        () =>
            (data?.monthly_revenue || []).map((item) => ({
                month: item.month,
                revenue: Number((item.total_revenue || 0).toFixed(2)),
            })),
        [data]
    );

    const siteData = useMemo(
        () =>
            (data?.site_breakdown || []).map((site) => ({
                name: site.mine_name,
                revenue: site.total_revenue,
                contribution: Number(site.contribution_percent.toFixed(2)),
            })),
        [data]
    );

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Revenue Performance</h1>
                <p className="text-sm text-slate-500">
                    Dynamic trends, site contribution analysis, and revenue distribution health.
                </p>
            </div>

            <section className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Revenue Trend</h2>
                {isLoading ? (
                    <p className="text-sm text-slate-500 py-10 text-center">Loading monthly trend...</p>
                ) : trendData.length === 0 ? (
                    <p className="text-sm text-slate-500 py-10 text-center">No monthly data available.</p>
                ) : (
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="month" stroke="#64748B" />
                                <YAxis stroke="#64748B" />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                                    {trendData.map((_, idx) => (
                                        <Cell key={`trend-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Site</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={siteData}
                                    dataKey="revenue"
                                    nameKey="name"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                >
                                    {siteData.map((_, idx) => (
                                        <Cell key={`site-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900">Site Contribution Table</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="text-left px-5 py-3">Mining Site</th>
                                <th className="text-right px-5 py-3">Revenue</th>
                                <th className="text-right px-5 py-3">Contribution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {siteData.length === 0 ? (
                                <tr>
                                    <td className="px-5 py-8 text-center text-slate-500" colSpan={3}>
                                        No site breakdown available.
                                    </td>
                                </tr>
                            ) : (
                                siteData.map((row) => (
                                    <tr key={row.name}>
                                        <td className="px-5 py-3">{row.name}</td>
                                        <td className="px-5 py-3 text-right">{formatCurrency(row.revenue)}</td>
                                        <td className="px-5 py-3 text-right">{row.contribution.toFixed(1)}%</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
