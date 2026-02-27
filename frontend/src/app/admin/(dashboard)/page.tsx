"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    TrendingUp, AlertTriangle, DollarSign, Activity,
    Bell, Clock, MapPin, Package, PieChart, RefreshCw,
    Filter, Download, Eye, Shield, Users, Database
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, BarChart, Bar, AreaChart, Area,
} from 'recharts';
import { useGetAuditLogsQuery } from "@/lib/redux/slices/AuditLogSlice";
import {
    useGetMineCompaniesQuery,
    useGetProductionRecordsQuery,
    useGetSalesTransactionsQuery,
    useGetForecastQuery
} from "@/lib/redux/slices/MiningSlice";

// ==================== Type Definitions ====================

// API Response Types
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

// Component Types
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    gradient: string;
    change?: {
        value: string;
        positive: boolean;
    };
    subtitle?: string;
}

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'success' | 'info';
    icon: string;
    message: string;
    time: string;
    category: string;
    read: boolean;
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

interface RevenueChartPoint {
    date: string;
    revenue: number;
    transactions: number;
}

interface ProductionChartPoint {
    date: string;
    quantity: number;
}

interface PaymentMethodData {
    name: string;
    value: number;
}

interface DashboardData {
    totalRevenue: number;
    totalProduction: number;
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

// ==================== Component ====================

export default function AdminDashboard() {
    // API Queries
    const { data: auditLogsData, isLoading: auditLoading, refetch: refetchAudit } =
        useGetAuditLogsQuery({});
    const { data: companiesData, isLoading: companiesLoading, refetch: refetchCompanies } =
        useGetMineCompaniesQuery({});
    const { data: productionRecordsData, isLoading: productionLoading, refetch: refetchProduction } =
        useGetProductionRecordsQuery({});
    const { data: salesTransactionsData, isLoading: salesLoading, refetch: refetchSales } =
        useGetSalesTransactionsQuery({});
    const { data: forecastsData, isLoading: forecastLoading, refetch: refetchForecast } =
        useGetForecastQuery({});

    // Typed query data
    const auditLogs = (auditLogsData ?? EMPTY_ARRAY) as AuditLog[];
    const companies = (companiesData ?? EMPTY_ARRAY) as MiningCompany[];
    const productionRecords = (productionRecordsData ?? EMPTY_ARRAY) as ProductionRecord[];
    const salesTransactions = (salesTransactionsData ?? EMPTY_ARRAY) as SalesTransaction[];
    const forecasts = (forecastsData ?? EMPTY_ARRAY) as Forecast[];

    // State with proper typing
    const [dateFilter, setDateFilter] = useState<DateFilter>('week');
    const [selectedSite, setSelectedSite] = useState<string>('all');
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    useEffect(() => {
        setLastUpdated(new Date());
    }, []);

    // Process data for dashboard
    const dashboardData: DashboardData = useMemo(() => {
        // Calculate total revenue from sales
        const totalRevenue = salesTransactions.reduce(
            (sum: number, sale: SalesTransaction) => sum + sale.total_amount,
            0
        );

        // Calculate total production
        const totalProduction = productionRecords.reduce(
            (sum: number, prod: ProductionRecord) => sum + prod.quantity_produced,
            0
        );

        // Calculate average unit price
        const avgUnitPrice = salesTransactions.length > 0
            ? salesTransactions.reduce((sum: number, sale: SalesTransaction) => sum + sale.unit_price, 0) / salesTransactions.length
            : 0;

        // Count active mines
        const activeMines = companies.filter((c: MiningCompany) => c.status === 'Active').length;

        // Count flagged transactions
        const flaggedTransactions = salesTransactions.filter((s: SalesTransaction) => s.is_flagged).length;

        // Calculate forecast accuracy (simulated for demo)
        const forecastAccuracy = 94.5;

        // Process site performance
        const sitePerformance: SitePerformance[] = companies.map((company: MiningCompany) => {
            const companySales = salesTransactions.filter((s: SalesTransaction) => s.mine === company.id);
            const companyProduction = productionRecords.filter((p: ProductionRecord) => p.mine === company.id);

            return {
                id: company.id,
                name: company.name.split(' ')[0], // Short name
                revenue: companySales.reduce((sum: number, s: SalesTransaction) => sum + s.total_amount, 0),
                production: companyProduction.reduce((sum: number, p: ProductionRecord) => sum + p.quantity_produced, 0),
                sales: companySales.length,
                color: COLORS[company.id % COLORS.length]
            };
        });

        // Process revenue by payment method
        const paymentMethods = salesTransactions.reduce<Record<string, number>>((acc: Record<string, number>, sale: SalesTransaction) => {
            acc[sale.payment_method] = (acc[sale.payment_method] || 0) + sale.total_amount;
            return acc;
        }, {});

        const paymentMethodData: PaymentMethodData[] = Object.entries(paymentMethods).map(([name, value]) => ({
            name,
            value
        }));

        // Process daily revenue for chart
        const dailyRevenue = salesTransactions.reduce<Record<string, { date: string; total: number; count: number }>>(
            (acc, sale) => {
                const date = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (!acc[date]) {
                    acc[date] = { date, total: 0, count: 0 };
                }
                acc[date].total += sale.total_amount;
                acc[date].count += 1;
                return acc;
            }, {}
        );

        const revenueChartData: RevenueChartPoint[] = Object.values(dailyRevenue)
            .map((item) => ({
                date: item.date,
                revenue: item.total / 1000, // Convert to thousands
                transactions: item.count
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Process production trend
        const productionTrend = productionRecords.reduce<Record<string, number>>((acc, prod) => {
            const date = new Date(prod.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            acc[date] = (acc[date] || 0) + prod.quantity_produced;
            return acc;
        }, {});

        const productionChartData: ProductionChartPoint[] = Object.entries(productionTrend)
            .map(([date, quantity]) => ({
                date,
                quantity
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            totalRevenue,
            totalProduction,
            avgUnitPrice,
            activeMines,
            flaggedTransactions,
            forecastAccuracy,
            sitePerformance,
            paymentMethodData,
            revenueChartData,
            productionChartData,
            totalSales: salesTransactions.length,
            totalForecasts: forecasts.length,
            totalAuditLogs: auditLogs.length
        };
    }, [salesTransactions, productionRecords, companies, forecasts, auditLogs]);

    // Generate alerts from data
    useEffect(() => {
        const newAlerts: Alert[] = [];

        // Check for flagged transactions
        if (dashboardData.flaggedTransactions > 0) {
            newAlerts.push({
                id: '1',
                type: 'critical',
                icon: '🚨',
                message: `${dashboardData.flaggedTransactions} flagged transaction(s) require immediate attention`,
                time: new Date().toLocaleTimeString(),
                category: 'Compliance',
                read: false
            });
        }

        // Check for low performing sites
        const lowPerformingSites = dashboardData.sitePerformance.filter(site => site.revenue < 100000);
        if (lowPerformingSites.length > 0) {
            newAlerts.push({
                id: '2',
                type: 'warning',
                icon: '⚠️',
                message: `${lowPerformingSites.length} site(s) showing below-average revenue`,
                time: new Date().toLocaleTimeString(),
                category: 'Performance',
                read: false
            });
        }

        // Add forecast alert
        newAlerts.push({
            id: '3',
            type: 'success',
            icon: '📈',
            message: `AI forecast predicts ${dashboardData.forecastAccuracy}% accuracy for next quarter`,
            time: new Date().toLocaleTimeString(),
            category: 'AI Insights',
            read: false
        });

        // Check production vs sales
        if (dashboardData.totalProduction > 0 && dashboardData.totalSales > 0) {
            const ratio = dashboardData.totalSales / dashboardData.totalProduction;
            if (ratio < 0.5) {
                newAlerts.push({
                    id: '4',
                    type: 'warning',
                    icon: '🏭',
                    message: 'Production exceeds sales by significant margin',
                    time: new Date().toLocaleTimeString(),
                    category: 'Inventory',
                    read: false
                });
            }
        }

        setAlerts(newAlerts);
    }, [dashboardData]);

    // Generate activities from audit logs
    useEffect(() => {
        const newActivities: ActivityItem[] = auditLogs.slice(0, 10).map((log: AuditLog, index: number) => ({
            id: log.id?.toString() || index.toString(),
            activity: `${log.action} ${log.target_user ? `by ${log.target_user}` : ''}`,
            user: log.target_user || 'System',
            time: new Date(log.timestamp).toLocaleTimeString(),
            status: log.action.includes('LOGIN') ? 'completed' :
                log.action.includes('ERROR') ? 'review' : 'success',
            type: 'audit'
        }));

        setActivities(newActivities);
    }, [auditLogs]);

    // Refresh all data
    const refreshData = async (): Promise<void> => {
        setIsRefreshing(true);
        await Promise.all([
            refetchAudit(),
            refetchCompanies(),
            refetchProduction(),
            refetchSales(),
            refetchForecast()
        ]);
        setLastUpdated(new Date());
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    // Custom Tooltip formatter
    const revenueTooltipFormatter = (value: number | string | Array<number | string>): [string, string] => {
        const numValue = typeof value === 'number' ? value : Number(value);
        return [`$${numValue.toFixed(1)}K`, 'Revenue'];
    };

    // Stat Card Component
    const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, gradient, change, subtitle }) => (
        <div className={`rounded-2xl p-6 shadow-lg ${gradient} text-white relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
            <div className="absolute top-0 right-0 opacity-10 group-hover:scale-110 transition-transform duration-300">
                <Icon size={120} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <Icon size={32} className="opacity-90" />
                    {change && (
                        <span className={`text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1
                            ${change.positive ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                            {change.positive ? '↑' : '↓'} {change.value}
                        </span>
                    )}
                </div>
                <h3 className="text-3xl font-bold mb-1">
                    {typeof value === 'number' && title.includes('Revenue')
                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
                        : value}
                </h3>
                <p className="text-sm opacity-90 font-medium">{title}</p>
                {subtitle && <p className="text-xs opacity-75 mt-2">{subtitle}</p>}
            </div>
        </div>
    );

    const getStatusBadge = (status: ActivityItem['status']): React.ReactElement => {
        const badges = {
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: '✅ Completed', icon: '✓' },
            review: { bg: 'bg-amber-100', text: 'text-amber-700', label: '⚠️ Review', icon: '⚠️' },
            done: { bg: 'bg-blue-100', text: 'text-blue-700', label: '📊 Done', icon: '📊' },
            success: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '✨ Success', icon: '✨' },
            pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: '⏳ Pending', icon: '⏳' }
        };
        const badge = badges[status] || badges.completed;
        return (
            <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-[1800px] mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mining Operations Dashboard</h1>
                        <p className="text-lg text-gray-600 flex items-center gap-2">
                            <Database size={18} className="text-blue-500" />
                            Real-time insights from {dashboardData.activeMines} active mines •
                            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                            <Activity size={18} className="text-green-500 animate-pulse" />
                            <span className="text-sm font-medium text-gray-700">Live Data Feed</span>
                        </div>

                        <select
                            value={selectedSite}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSite(e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm text-sm font-medium cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="all">All Sites</option>
                            {companies.map((company: MiningCompany) => (
                                <option key={company.id} value={company.id}>{company.name}</option>
                            ))}
                        </select>

                        <select
                            value={dateFilter}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDateFilter(e.target.value as DateFilter)}
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm text-sm font-medium cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>

                        <button
                            onClick={refreshData}
                            disabled={isRefreshing}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <StatCard
                        title="Total Revenue"
                        value={dashboardData.totalRevenue}
                        icon={DollarSign}
                        gradient="bg-gradient-to-br from-amber-500 to-yellow-600"
                        change={{ value: '+12.3%', positive: true }}
                        subtitle="Last 30 days"
                    />
                    <StatCard
                        title="Total Production"
                        value={`${dashboardData.totalProduction.toFixed(1)} tons`}
                        icon={Package}
                        gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                        change={{ value: '+8.1%', positive: true }}
                    />
                    <StatCard
                        title="Active Mines"
                        value={dashboardData.activeMines}
                        icon={MapPin}
                        gradient="bg-gradient-to-br from-green-500 to-emerald-600"
                        subtitle={`${companies.length} total registered`}
                    />
                    <StatCard
                        title="AI Forecast"
                        value={`${dashboardData.forecastAccuracy}%`}
                        icon={TrendingUp}
                        gradient="bg-gradient-to-br from-purple-500 to-pink-600"
                        change={{ value: '+2.4%', positive: true }}
                        subtitle="Next quarter prediction"
                    />
                    <StatCard
                        title="Avg Unit Price"
                        value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(dashboardData.avgUnitPrice)}
                        icon={Activity}
                        gradient="bg-gradient-to-br from-red-500 to-rose-600"
                        subtitle="Per ton"
                    />
                    <StatCard
                        title="Flagged Txns"
                        value={dashboardData.flaggedTransactions}
                        icon={AlertTriangle}
                        gradient="bg-gradient-to-br from-orange-500 to-red-600"
                        change={{ value: dashboardData.flaggedTransactions > 0 ? '+2' : '0', positive: false }}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trend Chart */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Revenue Trend (Last 7 Days)</h2>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                    <Download size={18} className="text-gray-600" />
                                </button>
                                <Filter size={18} className="text-gray-400" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={dashboardData.revenueChartData.slice(-7)}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F6B500" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#F6B500" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" tickFormatter={(value: number) => `$${value}K`} />
                                <Tooltip
                                    formatter={revenueTooltipFormatter}
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#F6B500"
                                    strokeWidth={3}
                                    fill="url(#revenueGradient)"
                                    dot={{ fill: '#F6B500', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Production Trend Chart */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Production Output (Tons)</h2>
                            <div className="flex items-center gap-2">
                                <Eye size={18} className="text-gray-400" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dashboardData.productionChartData.slice(-7)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                                <Bar dataKey="quantity" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                                    {dashboardData.productionChartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* AI Alerts */}
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Bell className="text-amber-500" size={24} />
                                AI Alerts
                            </h2>
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                                {alerts.filter(a => a.type === 'critical').length} Critical
                            </span>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-4 rounded-xl border-l-4 transition-all hover:shadow-md cursor-pointer
                                        ${alert.type === 'critical' ? 'bg-red-50 border-red-500 hover:bg-red-100' :
                                            alert.type === 'warning' ? 'bg-amber-50 border-amber-500 hover:bg-amber-100' :
                                                alert.type === 'success' ? 'bg-green-50 border-green-500 hover:bg-green-100' :
                                                    'bg-blue-50 border-blue-500 hover:bg-blue-100'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{alert.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900 mb-1">{alert.message}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">{alert.time}</span>
                                                <span className="text-xs font-medium px-2 py-1 rounded bg-white/50">
                                                    {alert.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                            <Bell size={18} />
                            View All Alerts
                        </button>
                    </div>

                    {/* Site Performance */}
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <PieChart className="text-blue-500" size={24} />
                            Site Performance
                        </h2>

                        <div className="space-y-4">
                            {dashboardData.sitePerformance.map((site) => {
                                const maxRevenue = Math.max(...dashboardData.sitePerformance.map(s => s.revenue));
                                return (
                                    <div key={site.id} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: site.color }} />
                                                <span className="text-sm font-medium text-gray-700">{site.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(site.revenue)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                                                style={{
                                                    width: `${(site.revenue / maxRevenue) * 100}%`,
                                                    backgroundColor: site.color
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-xs text-gray-500">Production: {site.production.toFixed(1)}t</span>
                                            <span className="text-xs text-gray-500">Sales: {site.sales}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Payment Methods */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Methods</h3>
                            <div className="space-y-2">
                                {dashboardData.paymentMethodData.map((method) => (
                                    <div key={method.name} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{method.name}</span>
                                        <span className="font-medium text-gray-900">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(method.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="text-blue-500" size={24} />
                                Recent Activities
                            </h2>
                            <select className="bg-gray-100 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm">
                                <option>All Types</option>
                                <option>Audit Logs</option>
                                <option>Transactions</option>
                                <option>System Events</option>
                            </select>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        {activity.type === 'audit' ? <Shield size={16} className="text-blue-500" /> :
                                            activity.type === 'user' ? <Users size={16} className="text-green-500" /> :
                                                <Activity size={16} className="text-amber-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">{activity.user}</span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">{activity.time}</span>
                                        </div>
                                    </div>
                                    {getStatusBadge(activity.status)}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <button className="w-full text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center justify-center gap-2">
                                View All Activities
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Forecast Preview */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="text-purple-500" size={24} />
                        AI Revenue Forecast
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {forecasts.slice(0, 6).map((forecast: Forecast) => (
                            <div key={forecast.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                                <p className="text-xs text-gray-600 mb-1">Forecast Date</p>
                                <p className="text-sm font-bold text-gray-900 mb-2">
                                    {new Date(forecast.forecast_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                                <p className="text-lg font-bold text-purple-600">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(forecast.predicted_revenue)}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">v{forecast.model_version}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Loading Indicator */}
                {(auditLoading || companiesLoading || productionLoading || salesLoading || forecastLoading) && (
                    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Loading real-time data...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
