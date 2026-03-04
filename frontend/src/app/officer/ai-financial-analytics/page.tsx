"use client";

import React from "react";
import { AlertTriangle, Brain, ShieldCheck, TrendingUp } from "lucide-react";
import {
    useGetAnalyticsAnomaliesQuery,
    useGetAnalyticsRecommendationsQuery,
    useGetAnalyticsSummaryQuery,
} from "@/lib/redux/slices/analyticsApi";

function percent(value: number) {
    return `${value.toFixed(1)}%`;
}

export default function OfficerAIFinancialAnalyticsPage() {
    const { data: summaryData, isLoading: summaryLoading } = useGetAnalyticsSummaryQuery();
    const { data: anomaliesData, isLoading: anomaliesLoading } = useGetAnalyticsAnomaliesQuery();
    const { data: recommendationsData, isLoading: recLoading } = useGetAnalyticsRecommendationsQuery();

    const summary = summaryData?.summary;
    const anomalies = anomaliesData?.anomalies || [];
    const recommendations = recommendationsData?.recommendations || [];

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">AI Financial Analytics</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Forecast trends, detect anomalies, and guide officer-level decisions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">30-Day Revenue</span>
                        <TrendingUp className="text-blue-600" size={18} />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                        {summaryLoading ? "..." : new Intl.NumberFormat("en-US").format(summary?.last_30_revenue || 0)}
                    </h2>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Growth Rate</span>
                        <Brain className="text-violet-600" size={18} />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                        {summaryLoading ? "..." : percent((summary?.growth_rate || 0) * 100)}
                    </h2>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Stability Score</span>
                        <ShieldCheck className="text-emerald-600" size={18} />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                        {summaryLoading ? "..." : percent(summary?.stability_score || 0)}
                    </h2>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Anomaly Count</span>
                        <AlertTriangle className="text-rose-600" size={18} />
                    </div>
                    <h2 className="text-2xl font-semibold text-rose-600 mt-2">
                        {summaryLoading ? "..." : summary?.anomaly_count || 0}
                    </h2>
                </div>
            </div>

            <section className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Detected Anomalies</h2>
                {anomaliesLoading ? (
                    <p className="text-sm text-slate-500">Loading anomalies...</p>
                ) : anomalies.length === 0 ? (
                    <p className="text-sm text-slate-500">No anomalies detected in the recent window.</p>
                ) : (
                    <div className="space-y-3">
                        {anomalies.slice(0, 8).map((a) => (
                            <div key={a.transaction_id} className="border border-slate-200 rounded-lg px-4 py-3">
                                <p className="text-sm font-medium text-slate-900">
                                    Tx #{a.transaction_id} - {a.mine_name}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {new Date(a.date).toLocaleDateString()} | Amount {a.amount.toLocaleString()} | {a.reason}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">AI Recommendations</h2>
                {recLoading ? (
                    <p className="text-sm text-slate-500">Loading recommendations...</p>
                ) : recommendations.length === 0 ? (
                    <p className="text-sm text-slate-500">No recommendations available.</p>
                ) : (
                    <div className="space-y-3">
                        {recommendations.map((rec, idx) => (
                            <div key={`${rec.title}-${idx}`} className="border border-slate-200 rounded-lg px-4 py-3">
                                <p className="text-sm font-semibold text-slate-900">{rec.title}</p>
                                <p className="text-xs text-slate-500 mt-1">{rec.detail}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
