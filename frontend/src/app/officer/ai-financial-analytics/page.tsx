'use client';
import React from 'react';

export default function AIFinancialAnalyticsPage() {
    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    AI Financial Analytics
                </h1>
                <p className="text-sm text-gray-500">
                    Advanced analytics for revenue trends, forecasts, and financial risks
                </p>
            </div>

            {/* ================= Revenue Trend Analysis ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Revenue Trend Analysis
                </h2>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="h-56 flex items-center justify-center border border-dashed rounded-lg text-sm text-gray-400">
                        Line Chart – Historical Revenue Trends
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                        AI analyzes historical revenue to identify growth patterns and seasonality
                    </p>
                </div>
            </section>

            {/* ================= Forecasted Income Reports ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Forecasted Income Reports
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Next Month Forecast</p>
                        <h3 className="text-xl font-semibold text-gray-800">$225,000</h3>
                        <span className="text-xs text-green-600">+5.2% expected</span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Next Quarter Forecast</p>
                        <h3 className="text-xl font-semibold text-gray-800">$690,000</h3>
                        <span className="text-xs text-gray-400">Stable trend</span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Forecast Confidence</p>
                        <h3 className="text-xl font-semibold text-green-700">94%</h3>
                        <span className="text-xs text-gray-400">
                            Based on historical accuracy
                        </span>
                    </div>
                </div>
            </section>

            {/* ================= Anomaly Detection ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Anomaly Detection (Irregular Transactions)
                </h2>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-600">
                            AI flags transactions that deviate from normal financial patterns
                        </p>
                        <span className="text-sm font-semibold text-red-600">
                            2 Alerts Detected
                        </span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm border rounded-lg px-4 py-3">
                            <span>Transaction #TX-90821</span>
                            <span className="text-red-600">Unusual Amount</span>
                        </div>

                        <div className="flex items-center justify-between text-sm border rounded-lg px-4 py-3">
                            <span>Transaction #TX-90845</span>
                            <span className="text-orange-600">Timing Irregularity</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= Budget Planning & Projections ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Budget Planning & Projections
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Proposed Budget</p>
                        <h3 className="text-xl font-semibold text-gray-800">$1.5M</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Projected Revenue</p>
                        <h3 className="text-xl font-semibold text-green-600">$1.62M</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Budget Variance</p>
                        <h3 className="text-xl font-semibold text-green-600">+8%</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Risk Level</p>
                        <h3 className="text-xl font-semibold text-gray-800">Low</h3>
                    </div>
                </div>
            </section>
        </div>
    );
}
