"use client";

import React from "react";
import { AlertTriangle, LineChart, ShieldCheck, Sparkles } from "lucide-react";
import {
    useGetAnalyticsAnomaliesQuery,
    useGetAnalyticsRecommendationsQuery,
    useGetAnalyticsSummaryQuery,
} from "@/lib/redux/slices/analyticsApi";
import { useGetStakeholderInsightsQuery } from "@/lib/redux/slices/MiningSlice";

export default function PerformanceAnalyticsPage() {
    const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsSummaryQuery();
    const { data: anomaliesData } = useGetAnalyticsAnomaliesQuery();
    const { data: recommendationsData } = useGetAnalyticsRecommendationsQuery();
    const { data: stakeholderData } = useGetStakeholderInsightsQuery({});

    const summary = analytics?.summary;
    const annualGrowth = stakeholderData?.overview.annual_growth_rate || 0;
    const complianceRate = stakeholderData?.overview.compliance_rate || 0;
    const anomalies = anomaliesData?.anomalies || [];
    const recommendations = recommendationsData?.recommendations || [];

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Performance Analytics</h1>
                <p className="text-sm text-slate-500">
                    AI-powered analytics for growth trends, anomalies, and governance insights.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <p className="text-sm text-slate-500">Annual Growth Rate</p>
                    <h2 className="text-2xl font-semibold text-emerald-600 mt-2">{annualGrowth.toFixed(1)}%</h2>
                    <LineChart size={18} className="text-emerald-600 mt-3" />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <p className="text-sm text-slate-500">Revenue Stability</p>
                    <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                        {(summary?.stability_score || 0).toFixed(1)}%
                    </h2>
                    <ShieldCheck size={18} className="text-blue-600 mt-3" />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <p className="text-sm text-slate-500">Compliance Score</p>
                    <h2 className="text-2xl font-semibold text-slate-900 mt-2">{complianceRate.toFixed(1)}%</h2>
                    <Sparkles size={18} className="text-violet-600 mt-3" />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <p className="text-sm text-slate-500">Detected Anomalies</p>
                    <h2 className="text-2xl font-semibold text-rose-600 mt-2">{summary?.anomaly_count || 0}</h2>
                    <AlertTriangle size={18} className="text-rose-600 mt-3" />
                </div>
            </div>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Anomalies</h2>
                    {analyticsLoading ? (
                        <p className="text-sm text-slate-500">Loading insights...</p>
                    ) : anomalies.length === 0 ? (
                        <p className="text-sm text-slate-500">No significant anomalies for the active period.</p>
                    ) : (
                        <div className="space-y-3">
                            {anomalies.slice(0, 6).map((item) => (
                                <div key={item.transaction_id} className="border border-slate-200 rounded-lg p-3">
                                    <p className="text-sm font-medium text-slate-900">
                                        Transaction #{item.transaction_id} - {item.mine_name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">{item.reason}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">AI Recommendations</h2>
                    {recommendations.length === 0 ? (
                        <p className="text-sm text-slate-500">No recommendations available.</p>
                    ) : (
                        <div className="space-y-3">
                            {recommendations.map((rec, index) => (
                                <div key={`${rec.title}-${index}`} className="border border-slate-200 rounded-lg p-3">
                                    <p className="text-sm font-semibold text-slate-900">{rec.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{rec.detail}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
