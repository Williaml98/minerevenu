"use client";

import React from "react";
import { Building2, CircleCheckBig, DollarSign, TrendingUp } from "lucide-react";
import { useGetStakeholderInsightsQuery } from "@/lib/redux/slices/MiningSlice";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export default function StakeholderDashboard() {
    const { data, isLoading } = useGetStakeholderInsightsQuery({});
    const overview = data?.overview;

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Stakeholder Dashboard</h1>
                <p className="text-sm text-slate-500">
                    Executive overview of mining revenue performance and governance health.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">Total Revenue</p>
                    <h3 className="text-2xl font-semibold text-slate-900 mt-2">
                        {isLoading ? "..." : formatCurrency(overview?.total_revenue || 0)}
                    </h3>
                    <DollarSign size={18} className="text-blue-600 mt-3" />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">Current Year Revenue</p>
                    <h3 className="text-2xl font-semibold text-slate-900 mt-2">
                        {isLoading ? "..." : formatCurrency(overview?.current_year_revenue || 0)}
                    </h3>
                    <TrendingUp size={18} className="text-emerald-600 mt-3" />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">Active Mining Sites</p>
                    <h3 className="text-2xl font-semibold text-slate-900 mt-2">
                        {isLoading ? "..." : overview?.active_sites || 0}
                    </h3>
                    <Building2 size={18} className="text-amber-600 mt-3" />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">Compliance Rate</p>
                    <h3 className="text-2xl font-semibold text-emerald-700 mt-2">
                        {isLoading ? "..." : `${(overview?.compliance_rate || 0).toFixed(1)}%`}
                    </h3>
                    <CircleCheckBig size={18} className="text-emerald-600 mt-3" />
                </div>
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h2 className="text-base font-semibold text-slate-900 mb-2">Impact Summary</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Revenue growth and compliance trends are monitored in near real-time. Stakeholders can
                        verify performance indicators against site-level contributions and published reports.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h2 className="text-base font-semibold text-slate-900 mb-2">Governance Insight</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        The compliance rate reflects approved transactions over total submissions, supporting
                        transparent auditing and strong allocation confidence.
                    </p>
                </div>
            </section>
        </div>
    );
}
