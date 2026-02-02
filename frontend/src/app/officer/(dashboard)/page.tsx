'use client';
import React from 'react';

export default function FinanceOfficerDashboard() {
    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Finance Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                    Monitor daily operations, revenue flow, and financial performance
                </p>
            </div>

            {/* ================= Revenue Overview ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Revenue Overview
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Today’s Revenue</p>
                        <h3 className="text-xl font-bold text-gray-800">$12,450</h3>
                        <span className="text-xs text-green-600">+4.2%</span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">This Month</p>
                        <h3 className="text-xl font-bold text-gray-800">$215,000</h3>
                        <span className="text-xs text-gray-400">MTD</span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">This Year</p>
                        <h3 className="text-xl font-bold text-gray-800">$1,240,000</h3>
                        <span className="text-xs text-green-600">+9.1% YoY</span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Pending Entries</p>
                        <h3 className="text-xl font-bold text-orange-600">6</h3>
                        <span className="text-xs text-gray-400">Require review</span>
                    </div>
                </div>
            </section>

            {/* ================= Daily / Monthly Revenue Summary ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Daily / Monthly Revenue Summary
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Daily */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">
                            Daily Revenue Trend
                        </h3>
                        <div className="h-48 flex items-center justify-center border border-dashed rounded-lg text-sm text-gray-400">
                            Daily Revenue Chart
                        </div>
                    </div>

                    {/* Monthly */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">
                            Monthly Revenue Trend
                        </h3>
                        <div className="h-48 flex items-center justify-center border border-dashed rounded-lg text-sm text-gray-400">
                            Monthly Revenue Chart
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= Key Financial KPIs ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Key Financial KPIs
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Avg. Daily Revenue</p>
                        <h3 className="text-lg font-semibold text-gray-800">$10,800</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Revenue Variance</p>
                        <h3 className="text-lg font-semibold text-green-600">+3.4%</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Approved Reports</p>
                        <h3 className="text-lg font-semibold text-gray-800">18</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Pending Approvals</p>
                        <h3 className="text-lg font-semibold text-orange-600">4</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Anomaly Alerts</p>
                        <h3 className="text-lg font-semibold text-red-600">1</h3>
                    </div>
                </div>
            </section>
        </div>
    );
}
