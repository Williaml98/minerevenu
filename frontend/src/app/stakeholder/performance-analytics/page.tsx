'use client';
import React from 'react';

export default function PerformanceAnalyticsPage() {
    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Performance Analytics
                </h1>
                <p className="text-sm text-gray-500">
                    AI-powered financial insights and sustainability performance overview
                </p>
            </div>

            {/* ================= Financial Performance Charts ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Financial Performance Charts
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">
                            Revenue Growth Trend
                        </h3>
                        <div className="h-52 flex items-center justify-center border border-dashed rounded-lg text-sm text-gray-400">
                            Line Chart – Revenue Over Time
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">
                            Revenue Allocation Breakdown
                        </h3>
                        <div className="h-52 flex items-center justify-center border border-dashed rounded-lg text-sm text-gray-400">
                            Pie Chart – Allocation Distribution
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= AI-Generated Insights ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    AI-Generated Insights
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <p className="text-xs font-semibold text-blue-600 mb-2">
                            Revenue Insight
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            AI analysis indicates a steady increase in revenue driven by
                            improved operational efficiency across major mining sites.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <p className="text-xs font-semibold text-green-600 mb-2">
                            Sustainability Insight
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Revenue allocation towards community development has remained
                            above recommended thresholds, supporting long-term impact goals.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <p className="text-xs font-semibold text-orange-600 mb-2">
                            Risk & Anomaly Insight
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            No significant financial anomalies detected in the current
                            reporting period.
                        </p>
                    </div>
                </div>
            </section>

            {/* ================= Growth & Sustainability Indicators ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Growth & Sustainability Indicators
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Annual Growth Rate</p>
                        <h3 className="text-xl font-semibold text-green-600">+9.2%</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Community Investment</p>
                        <h3 className="text-xl font-semibold text-gray-800">48%</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Compliance Score</p>
                        <h3 className="text-xl font-semibold text-green-700">98%</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Sustainability Index</p>
                        <h3 className="text-xl font-semibold text-gray-800">High</h3>
                    </div>
                </div>
            </section>
        </div>
    );
}
