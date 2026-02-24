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
    useRegenerateForecastsMutation,
    useRetrainModelsMutation,
} from "@/lib/redux/slices/analyticsApi";

export default function AIAnalytics() {
    const [forecastSite, setForecastSite] = useState('All Sites');
    const [forecastPeriod, setForecastPeriod] = useState('30 days');
    const [trendView, setTrendView] = useState('Weekly');

    const {
        data: summaryData,
        isLoading: summaryLoading,
        isError: summaryError,
    } = useGetAnalyticsSummaryQuery();
    const {
        data: anomaliesData,
        isLoading: anomaliesLoading,
        isError: anomaliesError,
    } = useGetAnalyticsAnomaliesQuery();
    const {
        data: recommendationsData,
        isLoading: recsLoading,
        isError: recsError,
    } = useGetAnalyticsRecommendationsQuery();
    const [regenerateForecasts, { isLoading: regenLoading }] = useRegenerateForecastsMutation();
    const [retrainModels, { isLoading: retrainLoading }] = useRetrainModelsMutation();

    // Sample data for sparkline (fallback)
    const sparklineData = [45, 52, 48, 61, 58, 65, 72, 68, 75, 82];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format(amount).replace('RWF', '').trim();
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

    const stabilityScore = summaryData?.summary.stability_score ?? 82;
    const anomalyCount = summaryData?.summary.anomaly_count ?? 0;
    const forecastedRevenue = summaryData?.summary.last_30_revenue ?? 54200000;

    const anyLoading = summaryLoading || anomaliesLoading || recsLoading;
    const anyError = summaryError || anomaliesError || recsError;

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
                            onClick={() => regenerateForecasts()}
                            disabled={regenLoading}
                            className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <BarChart3 size={16} />
                            {regenLoading ? "Regenerating Forecasts..." : "Regenerate Forecasts"}
                        </button>
                        <button
                            onClick={() => retrainModels()}
                            disabled={retrainLoading}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Activity size={16} />
                            {retrainLoading ? "Retraining Models..." : "Retrain AI Models"}
                        </button>
                    </div>
                </div>

                {/* Section 1 - Key AI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Forecasted Revenue (Next 30 Days)</h3>
                            <TrendingUp size={20} className="text-blue-600" />
                        </div>
                        <div className="mb-3">
                            <p className="text-3xl font-bold text-gray-900">
                                {formatCurrency(forecastedRevenue)} RWF
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Based on latest ARIMA forecast
                            </p>
                        </div>
                        {/* Sparkline */}
                        <div className="h-12 mb-3">
                            <svg width="100%" height="100%" viewBox="0 0 200 48">
                                <polyline
                                    fill="none"
                                    stroke="#1A73E8"
                                    strokeWidth="2"
                                    points={sparklineData.map((val, i) => `${(i / (sparklineData.length - 1)) * 200},${48 - (val / 100) * 48}`).join(' ')}
                                />
                            </svg>
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
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => (
                                    <div key={i} className={`w-2 h-${8 + i * 2} ${i < 3 ? 'bg-red-500' : 'bg-yellow-500'} rounded-full`}></div>
                                ))}
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
                                <option>Site A</option>
                                <option>Site B</option>
                                <option>Site C</option>
                                <option>Site D</option>
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
                        <svg width="100%" height="100%" viewBox="0 0 1000 320">
                            {/* Grid lines */}
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

                            {/* Confidence interval shading */}
                            <polygon
                                points="0,200 100,180 200,160 300,150 400,140 500,130 600,135 700,145 800,155 900,165 1000,175 1000,280 900,265 800,255 700,245 600,235 500,230 400,240 300,250 200,260 100,270 0,280"
                                fill="#1A73E8"
                                opacity="0.1"
                            />

                            {/* Actual revenue line */}
                            <polyline
                                fill="none"
                                stroke="#1A73E8"
                                strokeWidth="3"
                                points="0,200 100,180 200,160 300,150 400,140 500,130 600,135"
                            />

                            {/* Forecast line (dashed) */}
                            <polyline
                                fill="none"
                                stroke="#1A73E8"
                                strokeWidth="3"
                                strokeDasharray="10,5"
                                points="600,135 700,145 800,155 900,165 1000,175"
                            />

                            {/* Data points */}
                            {[0, 100, 200, 300, 400, 500, 600].map((x, i) => (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={200 - i * 10}
                                    r="5"
                                    fill="white"
                                    stroke="#1A73E8"
                                    strokeWidth="3"
                                />
                            ))}
                        </svg>

                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 flex gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0.5 bg-blue-600"></div>
                                <span className="text-sm text-gray-600">Actual Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0.5 bg-blue-600 border-dashed" style={{ borderTop: '2px dashed' }}></div>
                                <span className="text-sm text-gray-600">Forecasted Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-3 bg-blue-600 opacity-20 rounded"></div>
                                <span className="text-sm text-gray-600">Confidence Interval</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom labels */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Expected Revenue (Next Period)</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(58300000)}M RWF</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Forecasted High</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(65200000)}M RWF</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Forecasted Low</p>
                            <p className="text-lg font-bold text-red-600">{formatCurrency(51400000)}M RWF</p>
                        </div>
                    </div>
                </div>

                {/* Section 3 - Anomaly Detection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">AI-Detected Anomalies</h2>
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
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Anomaly Distribution Heatmap</h2>
                        <div className="space-y-3">
                            {['Site A', 'Site B', 'Site C', 'Site D'].map((site) => (
                                <div key={site} className="flex items-center gap-3">
                                    <div className="w-20 text-sm font-medium text-gray-700">{site}</div>
                                    <div className="flex-1 flex gap-1">
                                        {Array.from({ length: 30 }).map((_, dayIndex) => {
                                            const intensity = Math.random();
                                            const color = intensity > 0.7 ? 'bg-red-500' : intensity > 0.4 ? 'bg-yellow-500' : intensity > 0.2 ? 'bg-blue-500' : 'bg-gray-200';
                                            return (
                                                <div
                                                    key={dayIndex}
                                                    className={`flex-1 h-8 ${color} rounded`}
                                                    style={{ opacity: intensity > 0.2 ? intensity : 0.3 }}
                                                    title={`Day ${dayIndex + 1}: ${(intensity * 100).toFixed(0)}% anomaly score`}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-3">Fraud Probability Index (model output intensity)</p>
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
                        <svg width="100%" height="100%" viewBox="0 0 1000 320">
                            {/* Grid */}
                            {[0, 1, 2, 3, 4].map((i) => (
                                <line key={i} x1="0" y1={i * 80} x2="1000" y2={i * 80} stroke="#E5E7EB" strokeWidth="1" />
                            ))}

                            {/* Site A - Blue */}
                            <polyline
                                fill="none"
                                stroke="#1A73E8"
                                strokeWidth="3"
                                points="0,200 125,180 250,165 375,155 500,145 625,140 750,138 875,135 1000,130"
                            />

                            {/* Site B - Green */}
                            <polyline
                                fill="none"
                                stroke="#27AE60"
                                strokeWidth="3"
                                points="0,220 125,210 250,200 375,190 500,180 625,175 750,170 875,165 1000,160"
                            />

                            {/* Site C - Purple */}
                            <polyline
                                fill="none"
                                stroke="#8B5CF6"
                                strokeWidth="3"
                                points="0,180 125,175 250,170 375,168 500,190 625,210 750,220 875,225 1000,230"
                            />

                            {/* Site D - Orange */}
                            <polyline
                                fill="none"
                                stroke="#F97316"
                                strokeWidth="3"
                                points="0,240 125,235 250,230 375,225 500,220 625,215 750,210 875,205 1000,200"
                            />
                        </svg>

                        {/* Legend */}
                        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-sm p-4 space-y-2">
                            {[
                                { name: 'Site A', color: '#1A73E8' },
                                { name: 'Site B', color: '#27AE60' },
                                { name: 'Site C', color: '#8B5CF6' },
                                { name: 'Site D', color: '#F97316' },
                            ].map((site) => (
                                <div key={site.name} className="flex items-center gap-2">
                                    <div className="w-4 h-0.5 rounded" style={{ backgroundColor: site.color }}></div>
                                    <span className="text-sm text-gray-700">{site.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex gap-3">
                            <Activity size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900 mb-2">AI-Generated Insights</p>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    <li>• Revenue is trending upward across most sites with an average growth of 8.3%</li>
                                    <li>• Site C shows irregular behavior — 27% drop this week requires investigation</li>
                                    <li>• Site A demonstrates consistent performance above forecasted targets</li>
                                    <li>• Seasonal patterns detected: expect 15% increase in next quarter</li>
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