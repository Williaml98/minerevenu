'use client';
import React from "react";

export default function RevenueManagementPage() {
    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Revenue Management
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage revenue entries, validate data, and track allocations
                    </p>
                </div>

                <button className="px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    + Add Revenue Entry
                </button>
            </div>

            {/* ================= Add Revenue Entry ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Add Revenue Entry
                </h2>

                <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="date"
                        className="border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Mining Site"
                        className="border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        className="border rounded-lg px-3 py-2 text-sm"
                    />
                    <button className="bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                        Save Entry
                    </button>
                </div>
            </section>

            {/* ================= View Revenue Records ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Revenue Records
                </h2>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="text-left px-6 py-3">Date</th>
                                <th className="text-left px-6 py-3">Mining Site</th>
                                <th className="text-right px-6 py-3">Amount</th>
                                <th className="text-left px-6 py-3">Status</th>
                                <th className="text-right px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="px-6 py-4">2026-01-12</td>
                                <td className="px-6 py-4">Nyamabuye Mine</td>
                                <td className="px-6 py-4 text-right">$12,450</td>
                                <td className="px-6 py-4 text-green-600">Validated</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button className="text-blue-600 hover:underline">
                                        Edit
                                    </button>
                                    <button className="text-gray-600 hover:underline">
                                        View
                                    </button>
                                </td>
                            </tr>

                            <tr>
                                <td className="px-6 py-4">2026-01-13</td>
                                <td className="px-6 py-4">Kibungo Mine</td>
                                <td className="px-6 py-4 text-right">$9,800</td>
                                <td className="px-6 py-4 text-orange-600">Pending</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button className="text-blue-600 hover:underline">
                                        Edit
                                    </button>
                                    <button className="text-green-600 hover:underline">
                                        Validate
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ================= Edit / Validate Revenue Data ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Edit & Validate Revenue Data
                </h2>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-sm text-gray-600">
                        Review pending revenue entries and validate them after
                        verification. All validation actions are logged for auditing.
                    </p>
                </div>
            </section>

            {/* ================= Revenue Allocation Tracking ================= */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Revenue Allocation Tracking
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Community Development</p>
                        <h3 className="text-xl font-semibold text-gray-800">45%</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Operational Costs</p>
                        <h3 className="text-xl font-semibold text-gray-800">35%</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Reserves & Sustainability</p>
                        <h3 className="text-xl font-semibold text-gray-800">20%</h3>
                    </div>
                </div>
            </section>
        </div>
    );
}
