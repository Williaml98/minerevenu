"use client";

import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, FileText, DollarSign, Activity, Bell, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Alert {
    type: 'critical' | 'warning' | 'success';
    icon: string;
    message: string;
    time: string;
    category: string;
}

interface ActivityItem {
    activity: string;
    user: string;
    time: string;
    status: 'completed' | 'review' | 'done' | 'success';
}

interface RevenueData {
    date: string;
    gisenyi: number;
    nyamagabe: number;
    rubavu: number;
}

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    gradient: string;
    change?: string;
}

export default function AdminDashboard() {
    const [dateFilter, setDateFilter] = useState<string>('Week');

    // Sample data for the chart
    const revenueData: RevenueData[] = [
        { date: 'Jan 15', gisenyi: 850000, nyamagabe: 420000, rubavu: 680000 },
        { date: 'Jan 16', gisenyi: 920000, nyamagabe: 380000, rubavu: 720000 },
        { date: 'Jan 17', gisenyi: 1100000, nyamagabe: 450000, rubavu: 650000 },
        { date: 'Jan 18', gisenyi: 980000, nyamagabe: 320000, rubavu: 590000 },
        { date: 'Jan 19', gisenyi: 1050000, nyamagabe: 410000, rubavu: 700000 },
        { date: 'Jan 20', gisenyi: 1150000, nyamagabe: 440000, rubavu: 680000 },
        { date: 'Jan 21', gisenyi: 1100000, nyamagabe: 460000, rubavu: 720000 },
    ];

    const alerts: Alert[] = [
        { type: 'critical', icon: '🔴', message: 'Unusual revenue drop detected at Rubavu Mine (−32%)', time: '10:20 AM', category: 'Anomaly' },
        { type: 'warning', icon: '🟡', message: 'New revenue record submitted by Gatsibo Site', time: '9:55 AM', category: 'Update' },
        { type: 'success', icon: '🟢', message: 'AI model retrained successfully (Accuracy: 97%)', time: '9:30 AM', category: 'System' },
        { type: 'warning', icon: '🟡', message: 'High fluctuation in Nyamagabe revenue patterns', time: '9:15 AM', category: 'Anomaly' },
    ];

    const activities: ActivityItem[] = [
        { activity: 'Revenue data uploaded', user: 'Finance Officer', time: '10:22 AM', status: 'completed' },
        { activity: 'AI detected anomaly', user: 'System', time: '10:05 AM', status: 'review' },
        { activity: 'Report generated', user: 'Auditor', time: '9:45 AM', status: 'done' },
        { activity: 'New user added', user: 'Admin', time: '9:20 AM', status: 'success' },
        { activity: 'Data export completed', user: 'Data Analyst', time: '9:00 AM', status: 'completed' },
    ];

    const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, gradient, change }) => (
        <div className={`rounded-2xl p-6 shadow-lg ${gradient} text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 opacity-10">
                <Icon size={120} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <Icon size={32} className="opacity-90" />
                    {change && (
                        <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                            {change}
                        </span>
                    )}
                </div>
                <h3 className="text-3xl font-bold mb-1">{value}</h3>
                <p className="text-sm opacity-90 font-medium">{title}</p>
            </div>
        </div>
    );

    const getStatusBadge = (status: ActivityItem['status']) => {
        const badges = {
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: '✅ Completed' },
            review: { bg: 'bg-amber-100', text: 'text-amber-700', label: '⚠️ Needs Review' },
            done: { bg: 'bg-blue-100', text: 'text-blue-700', label: '📊 Done' },
            success: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '👤 Success' },
        };
        const badge = badges[status];
        return (
            <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold`}>
                {badge.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-[1800px] mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">System Overview</h1>
                        <p className="text-lg text-gray-600">Real-time mining revenue insights and AI-powered performance analytics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                            <Activity size={18} className="text-green-500 animate-pulse" />
                            <span className="text-sm font-medium text-gray-700">Live Feed Active</span>
                        </div>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg shadow-sm font-semibold cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option>Today</option>
                            <option>Week</option>
                            <option>Month</option>
                            <option>Year</option>
                        </select>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Revenue Collected"
                        value="$4.25M"
                        icon={DollarSign}
                        gradient="bg-gradient-to-br from-amber-500 to-yellow-600"
                    />
                    <StatCard
                        title="AI Alerts"
                        value="3 Active"
                        icon={AlertTriangle}
                        gradient="bg-gradient-to-br from-red-500 to-rose-600"
                    />
                    <StatCard
                        title="Forecasted Growth"
                        value="+12.4%"
                        icon={TrendingUp}
                        gradient="bg-gradient-to-br from-green-500 to-emerald-600"
                        change="Next Quarter"
                    />
                    <StatCard
                        title="Reports Generated"
                        value="27"
                        icon={FileText}
                        gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                    />
                </div>

                {/* Chart Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Real-Time Mining Revenue Summary</h2>
                            <p className="text-sm text-gray-500">Revenue trends across all mining sites</p>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorGisenyi" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F6B500" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#F6B500" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorNyamagabe" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorRubavu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '14px' }} />
                            <YAxis stroke="#6B7280" style={{ fontSize: '14px' }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px' }}
                                formatter={(value: number) => [`$${(value / 1000).toFixed(1)}K`, '']}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line type="monotone" dataKey="gisenyi" stroke="#F6B500" strokeWidth={3} name="Gisenyi Mine" dot={{ fill: '#F6B500', r: 5 }} activeDot={{ r: 7 }} />
                            <Line type="monotone" dataKey="nyamagabe" stroke="#3B82F6" strokeWidth={3} name="Nyamagabe Mine" dot={{ fill: '#3B82F6', r: 5 }} activeDot={{ r: 7 }} />
                            <Line type="monotone" dataKey="rubavu" stroke="#10B981" strokeWidth={3} name="Rubavu Mine" dot={{ fill: '#10B981', r: 5 }} activeDot={{ r: 7 }} />
                        </LineChart>
                    </ResponsiveContainer>

                    {/* Quick Stats Below Chart */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">🥇 Top Performing Site</p>
                            <p className="text-lg font-bold text-gray-900">Gisenyi Mine</p>
                            <p className="text-sm text-amber-600 font-semibold">$1.1M</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">🪨 Lowest Performing Site</p>
                            <p className="text-lg font-bold text-gray-900">Nyamagabe Mine</p>
                            <p className="text-sm text-blue-600 font-semibold">$320K</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">⚙️ Average Daily Revenue</p>
                            <p className="text-lg font-bold text-gray-900">$142K</p>
                            <p className="text-sm text-green-600 font-semibold">+8.3% vs yesterday</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">⏱️ Last Update</p>
                            <p className="text-lg font-bold text-gray-900">10:35 AM</p>
                            <p className="text-sm text-gray-500">2 minutes ago</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Alerts and Activities */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* AI Alerts */}
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Bell className="text-amber-500" size={24} />
                                AI Alerts & Notifications
                            </h2>
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                                {alerts.filter(a => a.type === 'critical').length} Critical
                            </span>
                        </div>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {alerts.map((alert, index) => (
                                <div key={index} className={`p-4 rounded-xl border-l-4 ${alert.type === 'critical' ? 'bg-red-50 border-red-500' :
                                        alert.type === 'warning' ? 'bg-amber-50 border-amber-500' :
                                            'bg-green-50 border-green-500'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{alert.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900 mb-1">{alert.message}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">{alert.time}</span>
                                                <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded">
                                                    {alert.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors">
                            View All Alerts
                        </button>
                    </div>

                    {/* Recent Activities */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="text-blue-500" size={24} />
                                Recent Activities
                            </h2>
                            <select className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                                <option>All Types</option>
                                <option>Revenue Updates</option>
                                <option>System Events</option>
                                <option>User Actions</option>
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Activity</th>
                                        <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">User</th>
                                        <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Time</th>
                                        <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activities.map((activity, index) => (
                                        <tr key={index} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{activity.activity}</td>
                                            <td className="py-4 px-4 text-sm text-gray-700">{activity.user}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{activity.time}</td>
                                            <td className="py-4 px-4">{getStatusBadge(activity.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">Showing 5 of 127 activities</p>
                            <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
                                View All Activities →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}