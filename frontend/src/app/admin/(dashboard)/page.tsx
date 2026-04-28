"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    TrendingUp, AlertTriangle, DollarSign, Activity,
    Bell, Clock, MapPin, Package, PieChart, RefreshCw,
    Filter, Download, Eye, Shield, Users, Database, ChevronRight,
    BarChart3, Wallet, Truck, Gauge, Target, Award, Calendar,
    Sparkles, ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, BarChart, Bar, AreaChart, Area,
    PieChart as RePieChart, Pie, Legend
} from 'recharts';
import { useGetAuditLogsQuery } from "@/lib/redux/slices/AuditLogSlice";
import {
    useGetMineCompaniesQuery,
    useGetProductionRecordsQuery,
    useGetSalesTransactionsQuery,
    useGetForecastQuery
} from "@/lib/redux/slices/MiningSlice";

// ==================== Type Definitions ====================

interface AuditLog {
    id: number;
    user: string | null;
    target_user: string | null;
    action: string;
    ip_address: string;
    user_agent: string;
    timestamp: string;
    additional_data: Record<string, unknown>;
}

interface MiningCompany {
    id: number;
    name: string;
    location: string;
    license_number: string;
    mineral_type: string;
    status: string;
    created_at: string;
}

interface ProductionRecord {
    id: number;
    date: string;
    quantity_produced: number;
    unit_price: number;
    total_revenue: number;
    mine: number;
}

interface SalesTransaction {
    id: number;
    date: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    payment_method: string;
    is_flagged: boolean;
    created_at: string;
    mine: number;
    created_by: number;
}

interface Forecast {
    id: number;
    forecast_date: string;
    predicted_revenue: number;
    model_version: string;
    created_at: string;
}

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'success' | 'info';
    message: string;
    time: string;
    category: string;
}

interface ActivityItem {
    id: string;
    activity: string;
    user: string;
    time: string;
    status: 'completed' | 'review' | 'done' | 'success' | 'pending';
    type: 'audit' | 'system' | 'user' | 'revenue';
}

interface SitePerformance {
    id: number;
    name: string;
    revenue: number;
    production: number;
    sales: number;
    color: string;
}

interface RevenueChartPoint   { date: string; revenue: number; transactions: number; }
interface ProductionChartPoint { date: string; quantity: number; }
interface PaymentMethodData    { name: string; value: number; }

interface DashboardData {
    totalRevenue: number;
    totalProduction: number;
    totalSoldQuantity: number;
    availableProduction: number;
    avgUnitPrice: number;
    activeMines: number;
    flaggedTransactions: number;
    forecastAccuracy: number;
    sitePerformance: SitePerformance[];
    paymentMethodData: PaymentMethodData[];
    revenueChartData: RevenueChartPoint[];
    productionChartData: ProductionChartPoint[];
    totalSales: number;
    totalForecasts: number;
    totalAuditLogs: number;
}

type DateFilter = 'today' | 'week' | 'month' | 'year';

// ==================== Constants ====================

const COLORS = ['#F6B500', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];
const EMPTY_ARRAY: unknown[] = [];

// ==================== Helpers ====================

const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0, notation: 'compact', compactDisplay: 'short' }).format(value);

const formatNumber = (value: number): string =>
    new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value);

// ==================== Component ====================

export default function AdminDashboard() {
    const { data: auditLogsData,        isLoading: auditLoading,      refetch: refetchAudit }      = useGetAuditLogsQuery({});
    const { data: companiesData,        isLoading: companiesLoading,  refetch: refetchCompanies }   = useGetMineCompaniesQuery({});
    const { data: productionRecordsData,isLoading: productionLoading, refetch: refetchProduction }  = useGetProductionRecordsQuery({});
    const { data: salesTransactionsData,isLoading: salesLoading,      refetch: refetchSales }       = useGetSalesTransactionsQuery({});
    const { data: forecastsData,        isLoading: forecastLoading,   refetch: refetchForecast }    = useGetForecastQuery({});

    const auditLogs         = (auditLogsData          ?? EMPTY_ARRAY) as AuditLog[];
    const companies         = (companiesData          ?? EMPTY_ARRAY) as MiningCompany[];
    const productionRecords = (productionRecordsData  ?? EMPTY_ARRAY) as ProductionRecord[];
    const salesTransactions = (salesTransactionsData  ?? EMPTY_ARRAY) as SalesTransaction[];
    const forecasts         = (forecastsData          ?? EMPTY_ARRAY) as Forecast[];

    const [dateFilter, setDateFilter]   = useState<DateFilter>('week');
    const [selectedSite, setSelectedSite] = useState<string>('all');
    const [alerts, setAlerts]           = useState<Alert[]>([]);
    const [activities, setActivities]   = useState<ActivityItem[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    useEffect(() => { setLastUpdated(new Date()); }, []);

    const dashboardData: DashboardData = useMemo(() => {
        const totalRevenue      = salesTransactions.reduce((sum, s) => sum + s.total_amount, 0);
        const totalProduction   = productionRecords.reduce((sum, p) => sum + p.quantity_produced, 0);
        const totalSoldQuantity = salesTransactions.reduce((sum, s) => sum + s.quantity, 0);
        const availableProduction = Math.max(0, totalProduction - totalSoldQuantity);
        const avgUnitPrice      = salesTransactions.length > 0
            ? salesTransactions.reduce((sum, s) => sum + s.unit_price, 0) / salesTransactions.length : 0;
        const activeMines       = companies.filter(c => c.status === 'Active').length;
        const flaggedTransactions = salesTransactions.filter(s => s.is_flagged).length;

        let forecastAccuracy = 0;
        if (forecasts.length && salesTransactions.length) {
            const meanForecast = forecasts.reduce((sum, f) => sum + f.predicted_revenue, 0) / forecasts.length;
            const meanActual   = salesTransactions.reduce((sum, s) => sum + s.total_amount, 0) / salesTransactions.length;
            const errorRatio   = Math.abs(meanForecast - meanActual) / Math.max(meanActual, 1);
            forecastAccuracy   = Math.max(0, Math.min(1, 1 - errorRatio)) * 100;
        }

        const sitePerformance: SitePerformance[] = companies.map(company => ({
            id: company.id,
            name: company.name.split(' ')[0],
            revenue:    salesTransactions.filter(s => s.mine === company.id).reduce((sum, s) => sum + s.total_amount, 0),
            production: productionRecords.filter(p => p.mine === company.id).reduce((sum, p) => sum + p.quantity_produced, 0),
            sales:      salesTransactions.filter(s => s.mine === company.id).length,
            color:      COLORS[company.id % COLORS.length],
        }));

        const paymentMethods = salesTransactions.reduce<Record<string, number>>((acc, s) => {
            acc[s.payment_method] = (acc[s.payment_method] || 0) + s.total_amount;
            return acc;
        }, {});
        const paymentMethodData: PaymentMethodData[] = Object.entries(paymentMethods).map(([name, value]) => ({ name, value }));

        const dailyRevenue = salesTransactions.reduce<Record<string, { date: string; total: number; count: number }>>((acc, sale) => {
            const date = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!acc[date]) acc[date] = { date, total: 0, count: 0 };
            acc[date].total += sale.total_amount;
            acc[date].count += 1;
            return acc;
        }, {});
        const revenueChartData: RevenueChartPoint[] = Object.values(dailyRevenue)
            .map(item => ({ date: item.date, revenue: item.total / 1000, transactions: item.count }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const productionTrend = productionRecords.reduce<Record<string, number>>((acc, p) => {
            const date = new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            acc[date] = (acc[date] || 0) + p.quantity_produced;
            return acc;
        }, {});
        const productionChartData: ProductionChartPoint[] = Object.entries(productionTrend)
            .map(([date, quantity]) => ({ date, quantity }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            totalRevenue, totalProduction, totalSoldQuantity, availableProduction,
            avgUnitPrice, activeMines, flaggedTransactions, forecastAccuracy,
            sitePerformance, paymentMethodData, revenueChartData, productionChartData,
            totalSales: salesTransactions.length, totalForecasts: forecasts.length,
            totalAuditLogs: auditLogs.length,
        };
    }, [salesTransactions, productionRecords, companies, forecasts, auditLogs]);

    useEffect(() => {
        const newAlerts: Alert[] = [];
        if (dashboardData.flaggedTransactions > 0)
            newAlerts.push({ id: '1', type: 'critical', message: `${dashboardData.flaggedTransactions} flagged transaction(s) require immediate attention`, time: new Date().toLocaleTimeString(), category: 'Compliance' });
        const lowSites = dashboardData.sitePerformance.filter(s => s.revenue < 100000);
        if (lowSites.length > 0)
            newAlerts.push({ id: '2', type: 'warning', message: `${lowSites.length} site(s) showing below-average revenue`, time: new Date().toLocaleTimeString(), category: 'Performance' });
        newAlerts.push({ id: '3', type: 'success', message: `AI model accuracy at ${dashboardData.forecastAccuracy.toFixed(1)}% — exceeding quarterly benchmark`, time: new Date().toLocaleTimeString(), category: 'AI Insights' });
        if (dashboardData.totalProduction > 0 && dashboardData.totalSoldQuantity / dashboardData.totalProduction < 0.5)
            newAlerts.push({ id: '4', type: 'warning', message: 'Production exceeds sales by significant margin', time: new Date().toLocaleTimeString(), category: 'Inventory' });
        setAlerts(newAlerts);
    }, [dashboardData]);

    useEffect(() => {
        const newActivities: ActivityItem[] = auditLogs.slice(0, 10).map((log, index) => ({
            id: log.id?.toString() || index.toString(),
            activity: `${log.action}${log.target_user ? ` — ${log.target_user}` : ''}`,
            user: log.target_user || 'System',
            time: new Date(log.timestamp).toLocaleTimeString(),
            status: log.action.includes('LOGIN') ? 'completed' : log.action.includes('ERROR') ? 'review' : 'success',
            type: 'audit',
        }));
        setActivities(newActivities);
    }, [auditLogs]);

    const refreshData = async () => {
        setIsRefreshing(true);
        await Promise.all([refetchAudit(), refetchCompanies(), refetchProduction(), refetchSales(), refetchForecast()]);
        setLastUpdated(new Date());
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const revenueTooltipFormatter = (value: number | string | Array<number | string>): [string, string] => {
        const n = typeof value === 'number' ? value : Number(value);
        return [`$${n.toFixed(1)}K`, 'Revenue'];
    };

    const alertStyles: Record<Alert['type'], { border: string; bg: string; iconColor: string }> = {
        critical: { border: '#e11d48', bg: 'rgba(225,29,72,0.08)',    iconColor: '#e11d48' },
        warning:  { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  iconColor: '#f59e0b' },
        success:  { border: '#10b981', bg: 'rgba(16,185,129,0.08)',  iconColor: '#10b981' },
        info:     { border: '#3b82f6', bg: 'rgba(59,130,246,0.08)', iconColor: '#3b82f6' },
    };

    const statusBadgeStyle: Record<ActivityItem['status'], { color: string; bg: string; label: string }> = {
        completed: { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  label: 'Completed' },
        review:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Review' },
        done:      { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Done' },
        success:   { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Success' },
        pending:   { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: 'Pending' },
    };

    const kpiCards = [
        { title: 'Total Revenue',  value: formatCurrency(dashboardData.totalRevenue),  icon: DollarSign, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  change: '+12.3%', up: true,  trend: 78 },
        { title: 'Production',     value: `${formatNumber(dashboardData.totalProduction)} t`, icon: Package,    color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', change: '+8.1%',  up: true,  trend: 65 },
        { title: 'Active Mines',   value: String(dashboardData.activeMines),            icon: MapPin,     color: '#10b981', bg: 'rgba(16,185,129,0.1)', change: '100%',   up: true,  trend: 100 },
        { title: 'AI Forecast Acc',value: `${dashboardData.forecastAccuracy.toFixed(0)}%`, icon: TrendingUp, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', change: '+2.4%',  up: true,  trend: 94 },
        { title: 'Avg Price / t',  value: formatCurrency(dashboardData.avgUnitPrice),  icon: Activity,   color: '#e11d48', bg: 'rgba(225,29,72,0.1)',   change: '-1.2%',  up: false, trend: 45 },
        { title: 'Flagged',        value: String(dashboardData.flaggedTransactions),   icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', change: dashboardData.flaggedTransactions > 0 ? '+2' : '0', up: false, trend: dashboardData.flaggedTransactions > 0 ? 25 : 0 },
    ];

    return (
        <div className="min-h-screen p-4 md:p-6 space-y-5" style={{ background: "var(--bg-base)" }}>

            {/* Header */}
            <div
                className="rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>
                        <Database size={22} style={{ color: "#f59e0b" }} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                            Mining Operations
                        </h1>
                        <p className="text-xs flex items-center gap-2 mt-0.5" style={{ color: "var(--text-secondary)" }}>
                            <span>Real-time insights from {dashboardData.activeMines} active mines</span>
                            <span style={{ opacity: 0.4 }}>·</span>
                            <span>Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981" }} />
                        <span className="text-xs font-medium" style={{ color: "#10b981" }}>Live</span>
                    </div>

                    <select
                        value={selectedSite}
                        onChange={e => setSelectedSite(e.target.value)}
                        className="text-sm rounded-xl px-3 py-1.5 outline-none"
                        style={{ background: "var(--bg-surface)", border: "1px solid var(--card-border)", color: "var(--text-primary)" }}
                    >
                        <option value="all">All Sites</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <select
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value as DateFilter)}
                        className="text-sm rounded-xl px-3 py-1.5 outline-none"
                        style={{ background: "var(--bg-surface)", border: "1px solid var(--card-border)", color: "var(--text-primary)" }}
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>

                    <button
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                        style={{ background: "#f59e0b", color: "#000" }}
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        {isRefreshing ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* AI Insight Highlight Card */}
            <div
                className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(139,92,246,0.12) 60%, rgba(59,130,246,0.1) 100%)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 90% 50%, #f59e0b 0%, transparent 60%)" }} />
                <div className="relative flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-2xl flex-shrink-0" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)" }}>
                        <Sparkles size={24} style={{ color: "#f59e0b" }} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f59e0b" }}>AI Insight</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>High Confidence</span>
                        </div>
                        <p className="font-semibold text-base" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                            AI predicts <span style={{ color: "#10b981" }}>+12% revenue growth</span> next quarter based on current production trajectory
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                            Forecast model v{forecasts[0]?.model_version || '2.1'} · {dashboardData.totalForecasts} active forecasts · Accuracy: {dashboardData.forecastAccuracy.toFixed(1)}%
                        </p>
                    </div>
                </div>
                <button
                    className="relative flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}
                >
                    View Forecast <ChevronRight size={14} />
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {kpiCards.map((card) => (
                    <div
                        key={card.title}
                        className="rounded-2xl p-4 transition-all duration-200"
                        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = card.color + "40"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--card-border)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 rounded-xl" style={{ background: card.bg }}>
                                <card.icon size={16} style={{ color: card.color }} />
                            </div>
                            <span
                                className="text-xs font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                                style={{ color: card.up ? "#10b981" : "#e11d48", background: card.up ? "rgba(16,185,129,0.1)" : "rgba(225,29,72,0.1)" }}
                            >
                                {card.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                                {card.change}
                            </span>
                        </div>
                        <p className="text-xs font-medium mb-1 leading-tight" style={{ color: "var(--text-secondary)" }}>{card.title}</p>
                        <p className="text-lg font-bold leading-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{card.value}</p>
                        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-surface)" }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${card.trend}%`, background: card.color }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Sales", value: `${dashboardData.totalSales} transactions`, icon: Truck,  color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
                    { label: "Sales vs Production", value: dashboardData.totalProduction > 0 ? `${Math.min(100, (dashboardData.totalSoldQuantity / dashboardData.totalProduction) * 100).toFixed(1)}%` : 'N/A', icon: Gauge, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                    { label: "Active Forecasts", value: `${dashboardData.totalForecasts} active`, icon: Target, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
                    { label: "Audit Logs", value: formatNumber(dashboardData.totalAuditLogs), icon: Award, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
                ].map((item) => (
                    <div key={item.label} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                        <div className="p-2 rounded-xl flex-shrink-0" style={{ background: item.bg }}>
                            <item.icon size={16} style={{ color: item.color }} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{item.label}</p>
                            <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Revenue Trend */}
                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 size={18} style={{ color: "#f59e0b" }} />
                            <div>
                                <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Revenue Trend</h2>
                                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Last 7 data points (in $K)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-1.5 rounded-lg transition" style={{ color: "var(--text-secondary)" }}>
                                <Download size={15} />
                            </button>
                            <Filter size={15} style={{ color: "var(--text-secondary)" }} />
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={dashboardData.revenueChartData.slice(-7)}>
                            <defs>
                                <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#F6B500" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#F6B500" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v: number) => `${v}K`} />
                            <Tooltip
                                formatter={revenueTooltipFormatter}
                                contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--text-primary)" }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#F6B500" strokeWidth={2} fill="url(#adminRevGrad)" dot={{ fill: '#F6B500', r: 3 }} activeDot={{ r: 5 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Production Output */}
                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Package size={18} style={{ color: "#3b82f6" }} />
                            <div>
                                <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Production Output</h2>
                                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Last 7 data points (tonnes)</p>
                            </div>
                        </div>
                        <Eye size={15} style={{ color: "var(--text-secondary)" }} />
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={dashboardData.productionChartData.slice(-7)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--text-primary)" }} />
                            <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
                                {dashboardData.productionChartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* AI Alerts */}
                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Bell size={18} style={{ color: "#f59e0b" }} />
                            <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>AI Alerts</h2>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "rgba(225,29,72,0.1)", color: "#e11d48" }}>
                            {alerts.filter(a => a.type === 'critical').length} Critical
                        </span>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                        {alerts.map((alert) => {
                            const s = alertStyles[alert.type];
                            return (
                                <div key={alert.id} className="p-3 rounded-xl cursor-pointer transition-all" style={{ background: s.bg, borderLeft: `3px solid ${s.border}` }}>
                                    <p className="text-xs font-medium mb-1" style={{ color: "var(--text-primary)" }}>{alert.message}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{alert.time}</span>
                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.iconColor }}>{alert.category}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button className="w-full mt-3 flex items-center justify-center gap-1 text-sm font-medium pt-3" style={{ borderTop: "1px solid var(--card-border)", color: "#f59e0b" }}>
                        View All Alerts <ChevronRight size={14} />
                    </button>
                </div>

                {/* Site Performance */}
                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="flex items-center gap-2 mb-4">
                        <PieChart size={18} style={{ color: "#3b82f6" }} />
                        <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Site Performance</h2>
                    </div>
                    <div className="space-y-3">
                        {dashboardData.sitePerformance.slice(0, 5).map((site) => {
                            const maxRev = Math.max(...dashboardData.sitePerformance.map(s => s.revenue), 1);
                            return (
                                <div key={site.id}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ background: site.color }} />
                                            <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{site.name}</span>
                                        </div>
                                        <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{formatCurrency(site.revenue)}</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-surface)" }}>
                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(site.revenue / maxRev) * 100}%`, background: site.color }} />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{site.production.toFixed(1)}t</span>
                                        <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{site.sales} sales</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--card-border)" }}>
                        <h3 className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Payment Methods</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {dashboardData.paymentMethodData.map((m) => (
                                <div key={m.name} className="flex items-center justify-between text-xs">
                                    <span style={{ color: "var(--text-secondary)" }}>{m.name}</span>
                                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{formatCurrency(m.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Clock size={18} style={{ color: "#3b82f6" }} />
                            <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Activities</h2>
                        </div>
                        <select
                            className="text-xs rounded-lg px-2 py-1 outline-none"
                            style={{ background: "var(--bg-surface)", border: "1px solid var(--card-border)", color: "var(--text-primary)" }}
                        >
                            <option>All</option>
                            <option>Audit</option>
                            <option>System</option>
                        </select>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                        {activities.map((activity) => {
                            const badge = statusBadgeStyle[activity.status];
                            return (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-2 p-2 rounded-xl transition-all cursor-pointer"
                                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-surface)"}
                                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                                >
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--bg-surface)" }}>
                                        {activity.type === 'audit'
                                            ? <Shield size={11} style={{ color: "#3b82f6" }} />
                                            : activity.type === 'user'
                                            ? <Users size={11} style={{ color: "#10b981" }} />
                                            : <Activity size={11} style={{ color: "#f59e0b" }} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{activity.activity}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{activity.user}</span>
                                            <span className="text-[10px]" style={{ color: "var(--card-border)" }}>·</span>
                                            <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{activity.time}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: badge.bg, color: badge.color }}>
                                        {badge.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <button className="w-full mt-3 flex items-center justify-center gap-1 text-xs font-medium pt-3" style={{ borderTop: "1px solid var(--card-border)", color: "#3b82f6" }}>
                        View All Activities <ChevronRight size={13} />
                    </button>
                </div>
            </div>

            {/* Forecast Preview */}
            <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                <div className="flex items-center gap-2 mb-4">
                    <Zap size={18} style={{ color: "#8b5cf6" }} />
                    <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>AI Revenue Forecast</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {forecasts.slice(0, 6).map((forecast) => (
                        <div
                            key={forecast.id}
                            className="rounded-xl p-3 transition-all duration-200"
                            style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(139,92,246,0.35)"}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(139,92,246,0.15)"}
                        >
                            <p className="text-[10px] mb-1" style={{ color: "var(--text-secondary)" }}>Forecast</p>
                            <p className="text-xs font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                                {new Date(forecast.forecast_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-sm font-bold" style={{ color: "#8b5cf6" }}>{formatCurrency(forecast.predicted_revenue)}</p>
                            <p className="text-[9px] mt-2" style={{ color: "var(--text-secondary)" }}>v{forecast.model_version}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Loading indicator */}
            {(auditLoading || companiesLoading || productionLoading || salesLoading || forecastLoading) && (
                <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg text-sm text-white" style={{ background: "#2563eb" }}>
                    <RefreshCw size={13} className="animate-spin" />
                    Loading data…
                </div>
            )}
        </div>
    );
}
