"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    TrendingUp, AlertTriangle, DollarSign, Activity,
    Bell, Clock, MapPin, Package, PieChart, RefreshCw,
    Filter, Download, Eye, Shield, Users, Database, ChevronRight,
    BarChart3, Wallet, Truck, Gauge, Target, Zap, Award, Calendar
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
    trend?: number;
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

// ==================== Helper Functions ====================

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'RWF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: 'compact',
        compactDisplay: 'short'
    }).format(value);
};

const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
    }).format(value);
};

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

    // Professional Stat Card Component
    const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, gradient, change, subtitle, trend }) => (
        <div className={`rounded-xl p-4 shadow-lg ${gradient} text-white relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20"></div>
                <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-white/20"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Icon size={20} className="text-white" />
                    </div>
                    {change && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1
                            ${change.positive ? 'bg-green-500/30 text-green-50' : 'bg-red-500/30 text-red-50'}`}>
                            {change.positive ? '↑' : '↓'} {change.value}
                        </span>
                    )}
                </div>
                
                <div className="mt-2">
                    <h3 className="text-lg font-bold mb-0.5 truncate">
                        {typeof value === 'number' && title.includes('Revenue')
                            ? formatCurrency(value)
                            : typeof value === 'number' && (title.includes('Production') || title.includes('Avg'))
                            ? formatNumber(value) + (title.includes('Avg') ? '' : ' t')
                            : value}
                    </h3>
                    <p className="text-xs font-medium text-white/80 truncate">{title}</p>
                    {subtitle && (
                        <p className="text-[10px] text-white/60 mt-1 truncate flex items-center gap-1">
                            <Calendar size={10} />
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Trend Indicator */}
                {trend !== undefined && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                        <div className="flex items-center gap-1">
                            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-white rounded-full" 
                                    style={{ width: `${Math.min(trend, 100)}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-medium text-white/80">{trend}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const getStatusBadge = (status: ActivityItem['status']): React.ReactElement => {
        const badges = {
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: '✓' },
            review: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Review', icon: '⚠️' },
            done: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Done', icon: '📊' },
            success: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Success', icon: '✨' },
            pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending', icon: '⏳' }
        };
        const badge = badges[status] || badges.completed;
        return (
            <span className={`${badge.bg} ${badge.text} px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1`}>
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
            <div className="max-w-[1600px] mx-auto space-y-5">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white rounded-xl shadow-sm p-4 border border-slate-200">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Database size={24} className="text-amber-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Mining Operations</h1>
                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                    <span>Real-time insights from {dashboardData.activeMines} active mines</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span>Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-green-700">Live</span>
                        </div>

                        <select
                            value={selectedSite}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSite(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:border-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        >
                            <option value="all">All Sites</option>
                            {companies.map((company: MiningCompany) => (
                                <option key={company.id} value={company.id}>{company.name}</option>
                            ))}
                        </select>

                        <select
                            value={dateFilter}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDateFilter(e.target.value as DateFilter)}
                            className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:border-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>

                        <button
                            onClick={refreshData}
                            disabled={isRefreshing}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                        >
                            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Stats Cards - Optimized Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <StatCard
                        title="Total Revenue"
                        value={dashboardData.totalRevenue}
                        icon={DollarSign}
                        gradient="bg-gradient-to-br from-amber-500 to-amber-600"
                        change={{ value: '+12.3%', positive: true }}
                        subtitle="Last 30 days"
                        trend={78}
                    />
                    <StatCard
                        title="Production"
                        value={dashboardData.totalProduction}
                        icon={Package}
                        gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                        change={{ value: '+8.1%', positive: true }}
                        subtitle="Total tons"
                        trend={65}
                    />
                    <StatCard
                        title="Active Mines"
                        value={dashboardData.activeMines}
                        icon={MapPin}
                        gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
                        subtitle={`${companies.length} registered`}
                        trend={100}
                    />
                    <StatCard
                        title="AI Forecast"
                        value={`${dashboardData.forecastAccuracy}%`}
                        icon={TrendingUp}
                        gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                        change={{ value: '+2.4%', positive: true }}
                        subtitle="Next quarter"
                        trend={94}
                    />
                    <StatCard
                        title="Avg Price"
                        value={dashboardData.avgUnitPrice}
                        icon={Activity}
                        gradient="bg-gradient-to-br from-rose-500 to-rose-600"
                        subtitle="Per ton"
                        trend={45}
                    />
                    <StatCard
                        title="Flagged"
                        value={dashboardData.flaggedTransactions}
                        icon={AlertTriangle}
                        gradient="bg-gradient-to-br from-red-500 to-red-600"
                        change={{ value: dashboardData.flaggedTransactions > 0 ? '+2' : '0', positive: false }}
                        subtitle="Need review"
                        trend={dashboardData.flaggedTransactions > 0 ? 25 : 0}
                    />
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Truck size={18} className="text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Sales</p>
                            <p className="text-sm font-bold text-slate-900">{dashboardData.totalSales} transactions</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <Gauge size={18} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Efficiency</p>
                            <p className="text-sm font-bold text-slate-900">87.5%</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Target size={18} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Forecasts</p>
                            <p className="text-sm font-bold text-slate-900">{dashboardData.totalForecasts} active</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Award size={18} className="text-purple-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Audit Logs</p>
                            <p className="text-sm font-bold text-slate-900">{formatNumber(dashboardData.totalAuditLogs)}</p>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Revenue Trend Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={20} className="text-amber-500" />
                                <h2 className="text-lg font-semibold text-slate-900">Revenue Trend</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                                    <Download size={16} className="text-slate-400" />
                                </button>
                                <Filter size={16} className="text-slate-400" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={dashboardData.revenueChartData.slice(-7)}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F6B500" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F6B500" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value: number) => `${value}K`} />
                                <Tooltip
                                    formatter={revenueTooltipFormatter}
                                    contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        borderRadius: '8px', 
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#F6B500"
                                    strokeWidth={2}
                                    fill="url(#revenueGradient)"
                                    dot={{ fill: '#F6B500', r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Production Trend Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Package size={20} className="text-blue-500" />
                                <h2 className="text-lg font-semibold text-slate-900">Production Output</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye size={16} className="text-slate-400" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={dashboardData.productionChartData.slice(-7)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        borderRadius: '8px', 
                                        border: '1px solid #e2e8f0' 
                                    }}
                                />
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
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Bell size={20} className="text-amber-500" />
                                <h2 className="text-lg font-semibold text-slate-900">AI Alerts</h2>
                            </div>
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                                {alerts.filter(a => a.type === 'critical').length} Critical
                            </span>
                        </div>

                        <div className="space-y-2 max-h-[380px] overflow-y-auto">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-3 rounded-lg border-l-4 transition-all hover:shadow-md cursor-pointer
                                        ${alert.type === 'critical' ? 'bg-red-50 border-red-500 hover:bg-red-100' :
                                            alert.type === 'warning' ? 'bg-amber-50 border-amber-500 hover:bg-amber-100' :
                                                alert.type === 'success' ? 'bg-green-50 border-green-500 hover:bg-green-100' :
                                                    'bg-blue-50 border-blue-500 hover:bg-blue-100'}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="text-lg">{alert.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-900 mb-1 line-clamp-2">{alert.message}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-slate-500">{alert.time}</span>
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/70">
                                                    {alert.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium py-2 flex items-center justify-center gap-1 border-t border-slate-200 pt-3">
                            View All Alerts
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Site Performance */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <PieChart size={20} className="text-blue-500" />
                            <h2 className="text-lg font-semibold text-slate-900">Site Performance</h2>
                        </div>

                        <div className="space-y-3">
                            {dashboardData.sitePerformance.slice(0, 5).map((site) => {
                                const maxRevenue = Math.max(...dashboardData.sitePerformance.map(s => s.revenue));
                                return (
                                    <div key={site.id} className="group">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: site.color }} />
                                                <span className="text-xs font-medium text-slate-700">{site.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-900">
                                                {formatCurrency(site.revenue)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${(site.revenue / maxRevenue) * 100}%`,
                                                    backgroundColor: site.color
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[10px] text-slate-500">{site.production.toFixed(1)}t</span>
                                            <span className="text-[10px] text-slate-500">{site.sales} sales</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Payment Methods */}
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <h3 className="text-xs font-semibold text-slate-700 mb-3">Payment Methods</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {dashboardData.paymentMethodData.map((method) => (
                                    <div key={method.name} className="flex items-center justify-between text-xs">
                                        <span className="text-slate-600">{method.name}</span>
                                        <span className="font-medium text-slate-900">
                                            {formatCurrency(method.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Clock size={20} className="text-blue-500" />
                                <h2 className="text-lg font-semibold text-slate-900">Activities</h2>
                            </div>
                            <select className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-lg text-xs">
                                <option>All</option>
                                <option>Audit</option>
                                <option>System</option>
                            </select>
                        </div>

                        <div className="space-y-2 max-h-[380px] overflow-y-auto">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        {activity.type === 'audit' ? <Shield size={12} className="text-blue-500" /> :
                                            activity.type === 'user' ? <Users size={12} className="text-green-500" /> :
                                                <Activity size={12} className="text-amber-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-900 truncate">{activity.activity}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className="text-[10px] text-slate-500">{activity.user}</span>
                                            <span className="text-[10px] text-slate-300">•</span>
                                            <span className="text-[10px] text-slate-500">{activity.time}</span>
                                        </div>
                                    </div>
                                    {getStatusBadge(activity.status)}
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <button className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1">
                                View All Activities
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Forecast Preview */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} className="text-purple-500" />
                        <h2 className="text-lg font-semibold text-slate-900">AI Revenue Forecast</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {forecasts.slice(0, 6).map((forecast: Forecast) => (
                            <div key={forecast.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100">
                                <p className="text-[10px] text-slate-600 mb-1">Forecast</p>
                                <p className="text-xs font-bold text-slate-900 mb-2">
                                    {new Date(forecast.forecast_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                                <p className="text-sm font-bold text-purple-600">
                                    {formatCurrency(forecast.predicted_revenue)}
                                </p>
                                <p className="text-[8px] text-slate-500 mt-2">v{forecast.model_version}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Loading Indicator */}
                {(auditLoading || companiesLoading || productionLoading || salesLoading || forecastLoading) && (
                    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Loading data...</span>
                    </div>
                )}
            </div>
        </div>
    );
}