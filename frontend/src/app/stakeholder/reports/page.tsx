'use client';
import React from 'react';

export default function ReportsPage() {
    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Reports
                </h1>
                <p className="text-sm text-gray-500">
                    Access summarized, monthly, and annual mining revenue reports
                </p>
            </div>

            {/* ================= Summary Reports ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Summary Reports
                </h2>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        High-level reports designed for quick review of revenue performance,
                        transparency, and social impact.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                            View Summary
                        </button>
                        <button className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
                            Download PDF
                        </button>
                    </div>
                </div>
            </section>

            {/* ================= Monthly Performance Reports ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Monthly Performance Reports
                </h2>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="text-left px-6 py-3">Month</th>
                                <th className="text-left px-6 py-3">Total Revenue</th>
                                <th className="text-left px-6 py-3">Status</th>
                                <th className="text-right px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="px-6 py-4">January 2026</td>
                                <td className="px-6 py-4">$210,000</td>
                                <td className="px-6 py-4 text-green-600">Published</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button className="text-blue-600 hover:underline">
                                        View
                                    </button>
                                    <button className="text-gray-600 hover:underline">
                                        PDF
                                    </button>
                                    <button className="text-gray-600 hover:underline">
                                        Excel
                                    </button>
                                </td>
                            </tr>

                            <tr>
                                <td className="px-6 py-4">December 2025</td>
                                <td className="px-6 py-4">$198,000</td>
                                <td className="px-6 py-4 text-green-600">Published</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button className="text-blue-600 hover:underline">
                                        View
                                    </button>
                                    <button className="text-gray-600 hover:underline">
                                        PDF
                                    </button>
                                    <button className="text-gray-600 hover:underline">
                                        Excel
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ================= Annual Revenue Reports ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Annual Revenue Reports
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <p className="text-sm text-gray-500">Fiscal Year</p>
                        <h3 className="text-xl font-semibold text-gray-800">2025</h3>
                        <p className="text-xs text-gray-400 mb-4">
                            Complete annual financial summary
                        </p>
                        <div className="flex gap-3">
                            <button className="text-sm text-blue-600 hover:underline">
                                View
                            </button>
                            <button className="text-sm text-gray-600 hover:underline">
                                PDF
                            </button>
                            <button className="text-sm text-gray-600 hover:underline">
                                Excel
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <p className="text-sm text-gray-500">Fiscal Year</p>
                        <h3 className="text-xl font-semibold text-gray-800">2024</h3>
                        <p className="text-xs text-gray-400 mb-4">
                            Historical revenue report
                        </p>
                        <div className="flex gap-3">
                            <button className="text-sm text-blue-600 hover:underline">
                                View
                            </button>
                            <button className="text-sm text-gray-600 hover:underline">
                                PDF
                            </button>
                            <button className="text-sm text-gray-600 hover:underline">
                                Excel
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= Download Reports ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Download Reports
                </h2>

                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <p className="text-sm text-gray-600">
                        Download reports in PDF or Excel format for offline review and
                        sharing with partners.
                    </p>

                    <div className="flex gap-3">
                        <button className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-white hover:bg-gray-900">
                            Download PDF
                        </button>
                        <button className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
                            Download Excel
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
