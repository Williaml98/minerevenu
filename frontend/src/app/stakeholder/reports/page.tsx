"use client";

import React, { useMemo } from "react";
import { Download } from "lucide-react";
import { useGetSalesTransactionsQuery, useGetStakeholderInsightsQuery } from "@/lib/redux/slices/MiningSlice";

function toCsv(rows: Array<Array<string | number>>) {
    return rows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
}

function triggerDownload(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export default function StakeholderReportsPage() {
    const { data: insights, isLoading } = useGetStakeholderInsightsQuery({});
    const { data: transactions = [] } = useGetSalesTransactionsQuery({});

    const monthlyRows = useMemo(
        () =>
            (insights?.monthly_revenue || []).map((row) => [
                row.month,
                row.total_revenue.toFixed(2),
            ]),
        [insights]
    );

    const annualSummary = useMemo(() => {
        const map = new Map<number, number>();
        transactions.forEach((tx) => {
            const year = Number(tx.date.slice(0, 4));
            map.set(year, (map.get(year) || 0) + tx.total_amount);
        });
        return Array.from(map.entries())
            .sort(([a], [b]) => b - a)
            .map(([year, total]) => ({ year, total }));
    }, [transactions]);

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                    <p className="text-sm text-slate-500">
                        Dynamic monthly and annual stakeholder reporting with export.
                    </p>
                </div>
                <button
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                    onClick={() =>
                        triggerDownload(
                            `stakeholder-monthly-report-${new Date().toISOString().slice(0, 10)}.csv`,
                            toCsv([["Month", "Total Revenue"], ...monthlyRows])
                        )
                    }
                    disabled={monthlyRows.length === 0}
                >
                    <Download size={16} />
                    Export Monthly CSV
                </button>
            </div>

            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Monthly Performance Reports</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="text-left px-5 py-3">Month</th>
                            <th className="text-right px-5 py-3">Total Revenue</th>
                            <th className="text-left px-5 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="px-5 py-8 text-center text-slate-500">
                                    Loading monthly report...
                                </td>
                            </tr>
                        ) : monthlyRows.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-5 py-8 text-center text-slate-500">
                                    No monthly report data available.
                                </td>
                            </tr>
                        ) : (
                            monthlyRows.slice(-12).reverse().map(([month, revenue]) => (
                                <tr key={String(month)}>
                                    <td className="px-5 py-3">{month}</td>
                                    <td className="px-5 py-3 text-right">{revenue}</td>
                                    <td className="px-5 py-3 text-emerald-600">Published</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {annualSummary.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 text-sm text-slate-500">
                        No annual revenue summaries available yet.
                    </div>
                ) : (
                    annualSummary.slice(0, 3).map((item) => (
                        <div key={item.year} className="bg-white rounded-xl border border-slate-200 p-5">
                            <p className="text-sm text-slate-500">Fiscal Year</p>
                            <h3 className="text-xl font-semibold text-slate-900 mt-1">{item.year}</h3>
                            <p className="text-xs text-slate-500 mt-2">
                                Total: {item.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}
