'use client';
import React from 'react';

export default function RevenuePerformancePage() {
    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Revenue Performance
                </h1>
                <p className="text-sm text-gray-500">
                    High-level overview of mining revenue trends and allocation
                </p>
            </div>

            {/* ================= Total Revenue Summary ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Total Revenue Summary
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-800">$3,120,000</h3>
                        <span className="text-xs text-green-600">+10.4% YoY</span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">This Year</p>
                        <h3 className="text-2xl font-bold text-gray-800">$1,240,000</h3>
                        <span className="text-xs text-gray-400">
                            Current fiscal year
                        </span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Last Month</p>
                        <h3 className="text-2xl font-bold text-gray-800">$215,000</h3>
                        <span className="text-xs text-green-600">Stable growth</span>
                    </div>
                </div>
            </section>

            {/* ================= Monthly / Annual Revenue Trends ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Monthly / Annual Revenue Trends
                </h2>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="h-56 flex items-center justify-center text-gray-400 text-sm border border-dashed rounded-lg">
                        Revenue Trend Chart (Monthly / Annual)
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                        AI-generated trends showing revenue performance over time
                    </p>
                </div>
            </section>

            {/* ================= Revenue by Mining Site ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Revenue by Mining Site
                </h2>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="text-left px-6 py-3">Mining Site</th>
                                <th className="text-left px-6 py-3">Region</th>
                                <th className="text-right px-6 py-3">Revenue</th>
                                <th className="text-right px-6 py-3">Contribution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="px-6 py-4">Nyamabuye Mine</td>
                                <td className="px-6 py-4">Northern Zone</td>
                                <td className="px-6 py-4 text-right">$980,000</td>
                                <td className="px-6 py-4 text-right">31%</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">Kibungo Mine</td>
                                <td className="px-6 py-4">Eastern Zone</td>
                                <td className="px-6 py-4 text-right">$720,000</td>
                                <td className="px-6 py-4 text-right">23%</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">Rutsiro Mine</td>
                                <td className="px-6 py-4">Western Zone</td>
                                <td className="px-6 py-4 text-right">$640,000</td>
                                <td className="px-6 py-4 text-right">21%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ================= Allocation Overview ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Allocation Overview
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <p className="text-sm text-gray-500 mb-1">Community Development</p>
                        <h3 className="text-xl font-semibold text-gray-800">45%</h3>
                        <p className="text-xs text-gray-400">
                            Education, healthcare, infrastructure
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <p className="text-sm text-gray-500 mb-1">Operational & Compliance</p>
                        <h3 className="text-xl font-semibold text-gray-800">35%</h3>
                        <p className="text-xs text-gray-400">
                            Operations, audits, regulatory fees
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}