'use client';
import React from 'react';
import { useGetPublicStatsQuery } from '@/lib/redux/slices/MiningSlice';

function fmtRevenue(n: number): string {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    return `$${n.toLocaleString()}`;
}

const DashboardPreview: React.FC = () => {
    const { data: stats } = useGetPublicStatsQuery();

    return (
        <section className="py-20 bg-gradient-to-r from-slate-900 to-blue-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        See Your Mining Revenue at a Glance
                    </h2>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        Intuitive dashboards that transform complex mining data into
                        actionable insights for better decision-making.
                    </p>
                </div>

                {/* Dashboard Mockup */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Revenue Stats */}
                        <div className="lg:col-span-2">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Revenue Overview</h3>
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-6 text-white">
                                    <div className="text-3xl font-bold">
                                        {stats ? fmtRevenue(stats.total_revenue) : '—'}
                                    </div>
                                    <div className="text-green-100">Total Revenue</div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-6 text-white">
                                    <div className="text-3xl font-bold">
                                        {stats ? `${stats.active_sites}` : '—'}
                                    </div>
                                    <div className="text-blue-100">Active Mining Sites</div>
                                </div>
                            </div>

                            {/* Chart Placeholder */}
                            <div className="bg-slate-100 rounded-lg h-48 flex items-center justify-center">
                                <div className="text-slate-500 text-lg font-medium">
                                    📈 Revenue Trend Chart
                                </div>
                            </div>
                        </div>

                        {/* Side Stats */}
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-amber-800">
                                        {stats ? `${stats.compliance_rate.toFixed(1)}%` : '—'}
                                    </div>
                                    <div className="text-amber-700">Compliance Rate</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-800">24/7</div>
                                    <div className="text-blue-700">Real-time Monitoring</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-800">
                                        {stats ? `${stats.active_sites}` : '—'}
                                    </div>
                                    <div className="text-green-700">Sites Monitored</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DashboardPreview;
