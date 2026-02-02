'use client';
import React from 'react';
export default function StakeholderDashboard() {
    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Stakeholder Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                    Executive overview of mining revenue performance and social impact
                </p>
            </div>

            {/* ================= Executive Overview ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Executive Overview
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-800">$2,450,000</h3>
                        <span className="text-xs text-green-600">+12% from last year</span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Active Mining Sites</p>
                        <h3 className="text-2xl font-bold text-gray-800">8 Sites</h3>
                        <span className="text-xs text-gray-400">Across regions</span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Compliance Status</p>
                        <h3 className="text-2xl font-bold text-green-700">Compliant</h3>
                        <span className="text-xs text-gray-400">
                            All reports submitted
                        </span>
                    </div>
                </div>
            </section>

            {/* ================= Key Revenue Indicators ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Key Revenue Indicators
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Monthly Revenue</p>
                        <h3 className="text-xl font-semibold text-gray-800">$210,000</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Annual Growth Rate</p>
                        <h3 className="text-xl font-semibold text-green-600">+8.5%</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Revenue Allocation</p>
                        <h3 className="text-xl font-semibold text-gray-800">92% Distributed</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Flagged Anomalies</p>
                        <h3 className="text-xl font-semibold text-red-600">0 Issues</h3>
                    </div>
                </div>
            </section>

            {/* ================= Impact Summary ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Impact Summary
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-md font-semibold text-gray-800 mb-2">
                            Community Development Impact
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Mining revenues have supported community projects including
                            healthcare, education, and infrastructure development. Funds are
                            allocated transparently and tracked in real time.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-md font-semibold text-gray-800 mb-2">
                            NGO Sustainability Performance
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            AI-powered financial monitoring ensures sustainable revenue
                            utilization while maintaining compliance with mining regulations
                            and donor expectations.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
