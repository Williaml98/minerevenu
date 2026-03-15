'use client';
import React, { useState, useMemo } from 'react';
import {
    TrendingUp, AlertTriangle, Target, BarChart3,
    FileText, Activity
} from 'lucide-react';
import {
    useGetAnalyticsSummaryQuery,
    useGetAnalyticsAnomaliesQuery,
    useGetAnalyticsRecommendationsQuery,
    useGetForecastsQuery,
    useRegenerateForecastsMutation,
    useRetrainModelsMutation,
} from "@/lib/redux/slices/analyticsApi";
import { useGetMineCompaniesQuery, useGetSalesTransactionsQuery } from "@/lib/redux/slices/MiningSlice";

export default function AIAnalytics() {
    const [forecastSite, setForecastSite] = useState('All Sites');
    const [forecastPeriod, setForecastPeriod] = useState('30 days');
    const [trendView, setTrendView] = useState('Weekly');

    const { data: minesData = [] } = useGetMineCompaniesQuery({});
    const { data: salesData = [] } = useGetSalesTransactionsQuery({});
    const selectedMineId = useMemo(() => {
        if (forecastSite === 'All Sites') return undefined;
        const found = minesData.find((m) => m.name === forecastSite);
        return found?.id;
    }, [forecastSite, minesData]);

    const {
        data: summaryData,
        isLoading: summaryLoading,
        isError: summaryError,
    } = useGetAnalyticsSummaryQuery(
        selectedMineId ? { mine_id: selectedMineId } : undefined
    );
    const {
        data: anomaliesData,
        isLoading: anomaliesLoading,
        isError: anomaliesError,
    } = useGetAnalyticsAnomaliesQuery(
        selectedMineId ? { mine_id: selectedMineId, limit: 50 } : { limit: 50 }
    );
    const {
        data: recommendationsData,
        isLoading: recsLoading,
        isError: recsError,
    } = useGetAnalyticsRecommendationsQuery(
        selectedMineId ? { mine_id: selectedMineId } : undefined
    );
    const {
        data: forecastsData,
        isLoading: forecastsLoading,
        isError: forecastsError,
    } = useGetForecastsQuery();
    const [regenerateForecasts, { isLoading: regenLoading }] = useRegenerateForecastsMutation();
    const [retrainModels, { isLoading: retrainLoading }] = useRetrainModelsMutation();
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const anomalies = useMemo(() => {
        if (!anomaliesData?.anomalies) return [];
        return anomaliesData.anomalies.map((a) => ({
            id: a.transaction_id,
            severity: "high" as const,
            title: `Anomaly at ${a.mine_name}`,
            detail: `${formatCurrency(a.amount)} total on ${new Date(a.date).toLocaleDateString()}`,
            time: a.reason,
        }));
    }, [anomaliesData]);

    const reports = [
        {
            icon: <FileText size={24} />,
            title: 'Quarterly Revenue Projection',
            description: 'AI-generated forecast for next quarter with confidence intervals and risk factors',
            lastGenerated: 'From latest ARIMA run'
        },
        {
            icon: <AlertTriangle size={24} />,
            title: 'Potential Revenue Leak Points',
            description: 'Identified discrepancies and potential fraud indicators across all mining sites',
            lastGenerated: 'Updated daily from anomaly engine'
        },
        {
            icon: <BarChart3 size={24} />,
            title: 'Site Performance Forecast',
            description: 'Comparative analysis and predictive insights for each mining site',
            lastGenerated: 'Based on last 30 days of data'
        },
        {
            icon: <TrendingUp size={24} />,
            title: 'Revenue Optimization Report',
            description: 'ML-powered recommendations to maximize revenue collection efficiency',
            lastGenerated: 'Generated from current recommendations'
        },
    ];

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const formattedGrowth = useMemo(() => {
        const g = summaryData?.summary.growth_rate ?? 0;
        return (g * 100).toFixed(1);
    }, [summaryData]);

    const formattedForecastAccuracy = useMemo(() => {
        const acc = summaryData?.summary.forecast_accuracy;
        if (acc == null) return "—";
        return acc.toFixed(1);
    }, [summaryData]);

    const stabilityScore = summaryData?.summary.stability_score ?? 0;
    const anomalyCount = summaryData?.summary.anomaly_count ?? 0;

    const forecastSeries = useMemo(() => {
        if (!forecastsData || !forecastsData.length) return [];
        const today = new Date();
        const sorted = [...forecastsData]
            .filter((f) => new Date(f.forecast_date) >= today)
            .sort((a, b) => new Date(a.forecast_date).getTime() - new Date(b.forecast_date).getTime());
        return sorted.map((f) => ({
            date: new Date(f.forecast_date),
            value: f.predicted_revenue,
            label: new Date(f.forecast_date).toLocaleDateString(),
        }));
    }, [forecastsData]);

    const periodDays = useMemo(() => {
        switch (forecastPeriod) {
            case '3 months':
                return 90;
            case '6 months':
                return 180;
            case '1 year':
                return 365;
            default:
                return 30;
        }
    }, [forecastPeriod]);

    const forecastStats = useMemo(() => {
        const forecastCount = Math.max(1, Math.round(periodDays / 30));
        const windowSeries = forecastSeries.slice(0, forecastCount);
        if (!windowSeries.length) return null;
        const values = windowSeries.map((f) => f.value);
        return {
            expected: windowSeries[0].value,
            expectedLabel: windowSeries[0].label,
            high: Math.max(...values),
            low: Math.min(...values),
        };
    }, [forecastSeries, periodDays]);

    const forecastedRevenue = forecastSeries.at(0)?.value ?? summaryData?.summary.last_30_revenue ?? 0;

    const actualSeries = useMemo(() => {
        const today = new Date();
        const start = new Date();
        start.setDate(today.getDate() - periodDays);

        const filtered = salesData.filter((s) => {
            const d = new Date(s.date);
            if (selectedMineId && s.mine !== selectedMineId) return false;
            return d >= start && d <= today;
        });

        const dailyMap = new Map<string, number>();
        filtered.forEach((s) => {
            const key = new Date(s.date).toISOString().slice(0, 10);
            dailyMap.set(key, (dailyMap.get(key) || 0) + s.total_amount);
        });

        const days: Array<{ date: Date; value: number; label: string }> = [];
        for (let i = periodDays; i >= 0; i -= 1) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            days.push({
                date: d,
                value: dailyMap.get(key) || 0,
                label: d.toLocaleDateString(),
            });
        }
        return days;
    }, [salesData, selectedMineId, periodDays]);

    const bucketKey = (date: Date, view: string) => {
        if (view === 'Monthly') return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (view === 'Weekly') {
            const d = new Date(date);
            const day = d.getDay();
            const diff = (day + 6) % 7;
            d.setDate(d.getDate() - diff);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        return date.toISOString().slice(0, 10);
    };

    const trendSeriesBySite = useMemo(() => {
        const siteMap = new Map<number, string>();
        minesData.forEach((m) => siteMap.set(m.id, m.name));

        const seriesMap = new Map<string, Map<string, number>>();
        salesData.forEach((s) => {
            if (selectedMineId && s.mine !== selectedMineId) return;
            const siteName = siteMap.get(s.mine) || `Mine #${s.mine}`;
            const key = bucketKey(new Date(s.date), trendView);
            if (!seriesMap.has(siteName)) seriesMap.set(siteName, new Map());
            const series = seriesMap.get(siteName)!;
            series.set(key, (series.get(key) || 0) + s.total_amount);
        });

        const seriesList = Array.from(seriesMap.entries()).map(([site, map]) => {
            const points = Array.from(map.entries())
                .map(([label, value]) => ({ label, value }))
                .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
            return { site, points };
        });

        seriesList.sort((a, b) => {
            const aTotal = a.points.reduce((sum, p) => sum + p.value, 0);
            const bTotal = b.points.reduce((sum, p) => sum + p.value, 0);
            return bTotal - aTotal;
        });

        return seriesList.slice(0, 4);
    }, [salesData, minesData, selectedMineId, trendView]);

    const heatmap = useMemo(() => {
        if (!anomaliesData?.anomalies?.length) return [];

        const days = Array.from({ length: 14 }).map((_, idx) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - idx));
            return d;
        });

        const bySite: Record<string, Record<string, number>> = {};
        anomaliesData.anomalies.forEach((a) => {
            const site = a.mine_name || 'Unknown';
            const dayKey = new Date(a.date).toISOString().slice(0, 10);
            bySite[site] = bySite[site] || {};
            bySite[site][dayKey] = (bySite[site][dayKey] || 0) + 1;
        });

        const maxCount = Math.max(
            1,
            ...Object.values(bySite).flatMap((m) => Object.values(m))
        );

        return Object.entries(bySite).map(([site, dayMap]) => ({
            site,
            cells: days.map((d) => {
                const key = d.toISOString().slice(0, 10);
                const count = dayMap[key] || 0;
                const intensity = count / maxCount;
                return { date: key, count, intensity };
            }),
        }));
    }, [anomaliesData]);

    const sparklineData = useMemo(() => {
        if (forecastSeries.length) return forecastSeries.map((f) => f.value);
        if (summaryData?.summary?.last_30_revenue) return [summaryData.summary.last_30_revenue];
        return [];
    }, [forecastSeries, summaryData]);

    const anyLoading = summaryLoading || anomaliesLoading || recsLoading || forecastsLoading;
    const anyError = summaryError || anomaliesError || recsError || forecastsError;

    const handleAction = async (fn: () => Promise<unknown>, successText: string) => {
        setActionMessage(null);
        try {
            await fn();
            setActionMessage({ type: 'success', text: successText });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: unknown) {
            setActionMessage({ type: 'error', text: 'Action failed. Please check your permissions or try again.' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-[1600px] mx-auto">
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AI Analytics & Insights</h1>
                        <p className="text-gray-600 mt-2">
                            Intelligent financial forecasts, anomaly detection, and revenue analysis powered by AI.
                        </p>
                        {anyLoading && (
                            <p className="text-sm text-gray-500 mt-1">
                                Loading live analytics from the AI engine...
                            </p>
                        )}
                        {anyError && (
                            <p className="text-sm text-red-500 mt-1">
                                Some analytics failed to load. Please verify the backend analytics endpoints.
                            </p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => handleAction(() => regenerateForecasts({ steps: 6, replace: true }).unwrap(), "Forecasts regenerated")}
                            disabled={regenLoading}
                            className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <BarChart3 size={16} />
                            {regenLoading ? "Regenerating Forecasts..." : "Regenerate Forecasts"}
                        </button>
                        <button
                            onClick={() => handleAction(() => retrainModels().unwrap(), "Models retrained")}
                            disabled={retrainLoading}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Activity size={16} />
                            {retrainLoading ? "Retraining Models..." : "Retrain AI Models"}
                        </button>
                    </div>
                </div>
                {actionMessage && (
                    <div
                        className={`mb-4 rounded-lg px-4 py-3 text-sm ${actionMessage.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                    >
                        {actionMessage.text}
                    </div>
                )}

                {/* Section 1 - Key AI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Forecasted Revenue (Next 30 Days)</h3>
                            <TrendingUp size={20} className="text-blue-600" />
                        </div>
                        <div className="mb-3">
                            <p className="text-3xl font-bold text-gray-900">
                                {forecastedRevenue ? formatCurrency(forecastedRevenue) : '—'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Based on latest forecast model output
                            </p>
                        </div>
                        {/* Sparkline */}
                        <div className="h-12 mb-3">
                            {sparklineData.length > 1 ? (
                                <svg width="100%" height="100%" viewBox="0 0 200 48">
                                    <polyline
                                        fill="none"
                                        stroke="#1A73E8"
                                        strokeWidth="2"
                                        points={sparklineData.map((val, i) => {
                                            const x = (i / (sparklineData.length - 1)) * 200;
                                            const max = Math.max(...sparklineData, 1);
                                            const y = 48 - (val / max) * 48;
                                            return `${x},${y}`;
                                        }).join(' ')}
                                    />
                                </svg>
                            ) : (
                                <p className="text-xs text-gray-400">Waiting for forecast data...</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`${(summaryData?.summary.growth_rate ?? 0) >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                    } text-sm font-semibold`}
                            >
                                {Number.isFinite(summaryData?.summary.growth_rate ?? 0)
                                    ? `${formattedGrowth}%`
                                    : "—"}
                            </span>
                            <span className="text-xs text-gray-500">Month‑over‑month growth</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Detected Anomalies</h3>
                            <AlertTriangle size={20} className="text-yellow-600" />
                        </div>
                        <div className="mb-3">
                            <p className="text-3xl font-bold text-gray-900">{anomalyCount}</p>
                            <p className="text-xs text-gray-500 mt-1">Anomalous transactions (last 30 days)</p>
                        </div>
                        <div className="h-12 flex items-center justify-center mb-3">
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => {
                                    const isHigh = i < Math.min(anomalyCount, 3);
                                    return (
                                        <div
                                            key={i}
                                            className={`${isHigh ? 'bg-red-500' : 'bg-yellow-500'} w-2 rounded-full`}
                                            style={{ height: `${8 + i * 2}px` }}
                                        ></div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-red-600 text-sm font-semibold">3</span>
                            <span className="text-xs text-gray-500">High Severity</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Revenue Stability Score</h3>
                            <Target size={20} className="text-purple-600" />
                        </div>
                        <div className="flex items-center justify-center mb-3">
                            <div className="relative w-32 h-32">
                                <svg className="transform -rotate-90" width="128" height="128">
                                    <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#8B5CF6"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 56}`}
                                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - stabilityScore / 100)}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {Math.round(stabilityScore)}
                                    </span>
                                    <span className="text-xs text-gray-500">/ 100</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Stable</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Forecast Accuracy</h3>
                            <Activity size={20} className="text-green-600" />
                        </div>
                        <div className="mb-3">
                            <p className="text-3xl font-bold text-gray-900">
                                {formattedForecastAccuracy}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Model Performance</p>
                        </div>
                        <div className="h-12 mb-3">
                            <div className="flex items-end justify-between h-full gap-1">
                                {[85, 88, 90, 89, 91, 92, 93, 92].map((val, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                                        style={{ height: `${val}%` }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                                Accuracy compares recent forecasts to realized revenue.
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Revenue Forecasting</h2>
                        <div className="flex gap-3">
                            <select
                                value={forecastSite}
                                onChange={(e) => setForecastSite(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option>All Sites</option>
                                {minesData.map((mine) => (
                                    <option key={mine.id}>{mine.name}</option>
                                ))}
                            </select>
                            <div className="flex bg-gray-100 rounded-xl p-1">
                                {['30 days', '3 months', '6 months', '1 year'].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setForecastPeriod(period)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${forecastPeriod === period
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="h-80 relative">
                        {!forecastSeries.length && !actualSeries.length && !forecastsLoading && (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                                No forecast or revenue data available for this period.
                            </div>
                        )}
                        <svg width="100%" height="100%" viewBox="0 0 1000 320">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <line
                                    key={i}
                                    x1="0"
                                    y1={i * 80}
                                    x2="1000"
                                    y2={i * 80}
                                    stroke="#E5E7EB"
                                    strokeWidth="1"
                                />
                            ))}

                            {(() => {
                                const forecastCount = Math.max(1, Math.round(periodDays / 30));
                                const forecastPoints = forecastSeries.slice(0, forecastCount);
                                const actualPoints = actualSeries.slice(-periodDays);
                                const allValues = [
                                    ...forecastPoints.map((p) => p.value),
                                    ...actualPoints.map((p) => p.value),
                                ];
                                const maxValue = Math.max(...allValues, 1);

                                const toPoints = (points: Array<{ value: number }>) =>
                                    points.map((p, i) => {
                                        const x = (i / Math.max(points.length - 1, 1)) * 1000;
                                        const y = 300 - (p.value / maxValue) * 260;
                                        return `${x},${y}`;
                                    }).join(' ');

                                const actualPolyline = toPoints(actualPoints);
                                const forecastPolyline = toPoints(forecastPoints);

                                return (
                                    <>
                                        {actualPoints.length > 1 && (
                                            <polyline
                                                fill="none"
                                                stroke="#1A73E8"
                                                strokeWidth="3"
                                                points={actualPolyline}
                                            />
                                        )}
                                        {forecastPoints.length > 1 && (
                                            <polyline
                                                fill="none"
                                                stroke="#1A73E8"
                                                strokeWidth="3"
                                                strokeDasharray="8,6"
                                                points={forecastPolyline}
                                            />
                                        )}
                                    </>
                                );
                            })()}
                        </svg>

                        <div className="absolute bottom-4 left-4 flex gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0.5 bg-blue-600"></div>
                                <span className="text-sm text-gray-600">Actual Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0.5 bg-blue-600 border-dashed" style={{ borderTop: '2px dashed' }}></div>
                                <span className="text-sm text-gray-600">Forecasted Revenue</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom labels */}
                    <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">
                                Expected Revenue {forecastStats?.expectedLabel ? `(${forecastStats.expectedLabel})` : ''}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                                {forecastStats ? formatCurrency(forecastStats.expected) : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Forecasted High</p>
                            <p className="text-lg font-bold text-green-600">
                                {forecastStats ? formatCurrency(forecastStats.high) : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Forecasted Low</p>
                            <p className="text-lg font-bold text-red-600">
                                {forecastStats ? formatCurrency(forecastStats.low) : '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 3 - Anomaly Detection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">AI-Detected Anomalies</h2>
                        {anomaliesData?.model_ready === false && (
                            <p className="text-sm text-amber-600 mb-3">
                                Anomaly model is not trained yet. Results may be incomplete.
                            </p>
                        )}
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {anomalies.length === 0 && !anomaliesLoading && (
                                <p className="text-sm text-gray-500">
                                    No significant anomalies detected in the last 30 days.
                                </p>
                            )}
                            {anomalies.map((anomaly) => (
                                <div key={anomaly.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                    <div className="flex-shrink-0">
                                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(anomaly.severity)} mt-1`}></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm mb-1">{anomaly.title}</p>
                                                <p className="text-xs text-gray-600 mb-2">{anomaly.detail}</p>
                                                <p className="text-xs text-gray-400 max-w-[220px]">
                                                    {anomaly.time}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Anomaly Distribution Heatmap (last 14 days)</h2>
                        {!heatmap.length && !anomaliesLoading && (
                            <p className="text-sm text-gray-500">No anomalies detected in the last 14 days.</p>
                        )}
                        <div className="space-y-3">
                            {heatmap.map((row) => (
                                <div key={row.site} className="flex items-center gap-3">
                                    <div className="w-28 text-sm font-medium text-gray-700 truncate" title={row.site}>{row.site}</div>
                                    <div className="flex-1 grid grid-cols-14 gap-1">
                                        {row.cells.map((cell) => {
                                            const color =
                                                cell.intensity > 0.7
                                                    ? 'bg-red-500'
                                                    : cell.intensity > 0.4
                                                        ? 'bg-yellow-500'
                                                        : cell.intensity > 0.1
                                                            ? 'bg-blue-500'
                                                            : 'bg-gray-200';
                                            return (
                                                <div
                                                    key={`${row.site}-${cell.date}`}
                                                    className={`h-8 rounded ${color}`}
                                                    style={{ opacity: Math.max(0.25, cell.intensity || 0.25) }}
                                                    title={`${cell.date}: ${cell.count} anomaly${cell.count === 1 ? '' : 'ies'}`}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-3">Fraud probability index by site/day (normalized counts)</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">Low</span>
                                <div className="flex-1 h-2 bg-gradient-to-r from-gray-200 via-yellow-500 to-red-500 rounded-full"></div>
                                <span className="text-xs text-gray-600">High</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Revenue Trend Analysis</h2>
                        <div className="flex bg-gray-100 rounded-xl p-1">
                            {['Daily', 'Weekly', 'Monthly'].map((view) => (
                                <button
                                    key={view}
                                    onClick={() => setTrendView(view)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${trendView === view
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {view}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-80 relative mb-6">
                        {!trendSeriesBySite.length && (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                                Not enough data to build a trend view.
                            </div>
                        )}
                        <svg width="100%" height="100%" viewBox="0 0 1000 320">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <line key={i} x1="0" y1={i * 80} x2="1000" y2={i * 80} stroke="#E5E7EB" strokeWidth="1" />
                            ))}

                            {(() => {
                                const palette = ['#1A73E8', '#27AE60', '#8B5CF6', '#F97316'];
                                const allValues = trendSeriesBySite.flatMap((s) => s.points.map((p) => p.value));
                                const maxValue = Math.max(...allValues, 1);

                                return trendSeriesBySite.map((series, index) => {
                                    const points = series.points;
                                    if (points.length < 2) return null;
                                    const polyline = points.map((p, i) => {
                                        const x = (i / Math.max(points.length - 1, 1)) * 1000;
                                        const y = 300 - (p.value / maxValue) * 260;
                                        return `${x},${y}`;
                                    }).join(' ');
                                    return (
                                        <polyline
                                            key={series.site}
                                            fill="none"
                                            stroke={palette[index % palette.length]}
                                            strokeWidth="3"
                                            points={polyline}
                                        />
                                    );
                                });
                            })()}
                        </svg>

                        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-sm p-4 space-y-2">
                            {trendSeriesBySite.map((series, index) => {
                                const palette = ['#1A73E8', '#27AE60', '#8B5CF6', '#F97316'];
                                return (
                                    <div key={series.site} className="flex items-center gap-2">
                                        <div className="w-4 h-0.5 rounded" style={{ backgroundColor: palette[index % palette.length] }}></div>
                                        <span className="text-sm text-gray-700">{series.site}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex gap-3">
                            <Activity size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900 mb-2">AI-Generated Insights</p>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    <li>Revenue growth rate: {formattedGrowth}% month-over-month</li>
                                    <li>Forecast accuracy: {formattedForecastAccuracy}%</li>
                                    <li>Detected anomalies in last 30 days: {anomalyCount}</li>
                                    <li>Stability score: {Math.round(stabilityScore)} / 100</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 5 - Predictive Reports & Recommendations */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Predictive Reports & AI Recommendations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reports.map((report, index) => (
                            <div key={index} className="border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                        {report.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 mb-2">{report.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                                        <span className="text-xs text-gray-400">
                                            Last generated: {report.lastGenerated}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="border border-gray-200 rounded-xl p-6">
                            <h3 className="font-bold text-gray-900 mb-3">AI-Generated Operational Recommendations</h3>
                            <div className="space-y-3">
                                {recommendationsData?.recommendations?.map((rec, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-start gap-2">
                                            <div className="mt-1">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${rec.impact === "high"
                                                        ? "bg-red-500"
                                                        : rec.impact === "medium"
                                                            ? "bg-yellow-500"
                                                            : "bg-blue-500"
                                                        }`}
                                                ></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {rec.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {rec.detail}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!recsLoading && !recommendationsData?.recommendations?.length && (
                                    <p className="text-xs text-gray-500">
                                        No active AI recommendations at this time. The system will
                                        generate guidance as new data arrives.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


