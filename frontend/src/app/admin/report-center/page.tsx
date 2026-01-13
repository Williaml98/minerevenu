'use client';
import React, { useState } from 'react';
import {
    Calendar, FileText, Settings, Upload, Eye, Download,
    Trash2, Search, Filter, RefreshCw, FileSpreadsheet, File
} from 'lucide-react';

// Types
interface Report {
    id: string;
    name: string;
    type: 'Monthly' | 'Annual';
    period: string;
    generatedOn: string;
    createdBy: string;
}

interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    module: string;
    details: string;
}

// Sample Data
const sampleReports: Report[] = [
    { id: '1', name: 'January 2025 Revenue Report', type: 'Monthly', period: 'Jan 2025', generatedOn: '2025-02-01', createdBy: 'Admin' },
    { id: '2', name: '2024 Annual Mining Summary', type: 'Annual', period: '2024', generatedOn: '2025-01-15', createdBy: 'Finance Officer' },
    { id: '3', name: 'December 2024 Revenue Report', type: 'Monthly', period: 'Dec 2024', generatedOn: '2025-01-05', createdBy: 'Admin' },
    { id: '4', name: 'November 2024 Revenue Report', type: 'Monthly', period: 'Nov 2024', generatedOn: '2024-12-03', createdBy: 'Auditor' },
    { id: '5', name: 'Q4 2024 Quarterly Summary', type: 'Annual', period: 'Q4 2024', generatedOn: '2024-12-28', createdBy: 'Admin' },
];

const sampleAuditLogs: AuditLog[] = [
    { id: '1', timestamp: '2025-01-15 14:32', user: 'Admin', action: 'Approved revenue entry', module: 'Revenue Management', details: 'Entry #1234 from Site A' },
    { id: '2', timestamp: '2025-01-15 11:10', user: 'Finance Officer', action: 'Modified revenue record', module: 'Revenue Management', details: 'Updated amount for Site B' },
    { id: '3', timestamp: '2025-01-15 09:02', user: 'Auditor', action: 'Downloaded annual report', module: 'Reports', details: '2024 Annual Summary.pdf' },
    { id: '4', timestamp: '2025-01-14 16:45', user: 'Admin', action: 'Created new user', module: 'User Management', details: 'Added Finance Officer role' },
    { id: '5', timestamp: '2025-01-14 13:20', user: 'Finance Officer', action: 'Exported revenue data', module: 'Reports', details: 'January 2025 data in Excel' },
    { id: '6', timestamp: '2025-01-14 10:15', user: 'Admin', action: 'Generated monthly report', module: 'Reports', details: 'December 2024 Report' },
];

export default function ReportCenter() {
    const [reports, setReports] = useState<Report[]>(sampleReports);
    const [auditLogs] = useState<AuditLog[]>(sampleAuditLogs);
    const [searchQuery, setSearchQuery] = useState('');
    const [logFilter, setLogFilter] = useState({ user: 'All', module: 'All' });

    // Custom Report Builder State
    const [customReport, setCustomReport] = useState({
        dateRange: { from: '', to: '' },
        site: 'All Sites',
        revenueSource: 'All Sources',
        reportType: 'Revenue Trend',
        fields: {
            revenueAmount: true,
            siteName: true,
            aiForecast: false,
            variance: false,
            anomalies: false,
            submittedBy: false,
            approvalStatus: true
        }
    });

    // Export State
    const [exportConfig, setExportConfig] = useState({
        reportType: 'Monthly Revenue',
        format: 'PDF',
        dateRange: { from: '', to: '' },
        sites: [] as string[],
        includeAttachments: false
    });

    const handleDeleteReport = (id: string) => {
        if (confirm('Are you sure you want to delete this report?')) {
            setReports(reports.filter(r => r.id !== id));
        }
    };

    const getTypeBadgeColor = (type: string) => {
        return type === 'Monthly' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
    };

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.module.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUser = logFilter.user === 'All' || log.user === logFilter.user;
        const matchesModule = logFilter.module === 'All' || log.module === logFilter.module;
        return matchesSearch && matchesUser && matchesModule;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-[1600px] mx-auto">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Report Center</h1>
                    <p className="text-gray-600 mt-2">Generate, customize, and manage reports for internal and external stakeholders.</p>
                </div>

                {/* Section 1 - Quick Report Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Card 1 - Monthly Reports */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                            <Calendar size={24} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Monthly Reports</h3>
                        <p className="text-sm text-gray-600 mb-4">Generate and view system monthly revenue reports.</p>
                        <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm">
                            View Reports
                        </button>
                    </div>

                    {/* Card 2 - Annual Reports */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                            <FileText size={24} className="text-purple-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Annual Reports</h3>
                        <p className="text-sm text-gray-600 mb-4">Access yearly performance and revenue summaries.</p>
                        <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm">
                            View Reports
                        </button>
                    </div>

                    {/* Card 3 - Custom Report Builder */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                            <Settings size={24} className="text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Custom Report Builder</h3>
                        <p className="text-sm text-gray-600 mb-4">Create custom reports using filters and data fields.</p>
                        <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm">
                            Build Report
                        </button>
                    </div>

                    {/* Card 4 - Export Center */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                            <Upload size={24} className="text-orange-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Export Center</h3>
                        <p className="text-sm text-gray-600 mb-4">Export files in PDF or Excel formats.</p>
                        <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm">
                            Export
                        </button>
                    </div>
                </div>

                {/* Section 2 - Monthly & Annual Reports Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Monthly & Annual Reports</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Report Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Period</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Generated On</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created By</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{report.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(report.type)}`}>
                                                {report.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{report.period}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(report.generatedOn).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{report.createdBy}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                    title="View"
                                                >
                                                    <Eye size={18} className="text-blue-600" />
                                                </button>
                                                <button
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                    title="Download PDF"
                                                >
                                                    <File size={18} className="text-red-600" />
                                                </button>
                                                <button
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                    title="Download Excel"
                                                >
                                                    <FileSpreadsheet size={18} className="text-green-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReport(report.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} className="text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Rows per page:</span>
                            <select className="px-3 py-1 border border-gray-200 rounded-lg text-sm">
                                <option>10</option>
                                <option>25</option>
                                <option>50</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm">Previous</button>
                            <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm">1</button>
                            <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm">2</button>
                            <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm">3</button>
                            <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm">Next</button>
                        </div>
                    </div>
                </div>

                {/* Section 3 - Custom Report Builder */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Custom Report Builder</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Filters Panel */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={customReport.dateRange.from}
                                        onChange={(e) => setCustomReport({
                                            ...customReport,
                                            dateRange: { ...customReport.dateRange, from: e.target.value }
                                        })}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    <span className="text-gray-400 self-center">to</span>
                                    <input
                                        type="date"
                                        value={customReport.dateRange.to}
                                        onChange={(e) => setCustomReport({
                                            ...customReport,
                                            dateRange: { ...customReport.dateRange, to: e.target.value }
                                        })}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mining Site</label>
                                <select
                                    value={customReport.site}
                                    onChange={(e) => setCustomReport({ ...customReport, site: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option>All Sites</option>
                                    <option>Site A</option>
                                    <option>Site B</option>
                                    <option>Site C</option>
                                    <option>Site D</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Source</label>
                                <select
                                    value={customReport.revenueSource}
                                    onChange={(e) => setCustomReport({ ...customReport, revenueSource: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option>All Sources</option>
                                    <option>Tin Export</option>
                                    <option>Coltan Sales</option>
                                    <option>Tungsten Export</option>
                                    <option>Processing Fees</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                                <select
                                    value={customReport.reportType}
                                    onChange={(e) => setCustomReport({ ...customReport, reportType: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option>Revenue Trend</option>
                                    <option>Site Comparison</option>
                                    <option>Forecast Summary</option>
                                    <option>Anomaly Report</option>
                                </select>
                            </div>
                        </div>

                        {/* Right: Field Selection Panel */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Select Fields to Include</h3>
                            <div className="space-y-3">
                                {[
                                    { key: 'revenueAmount', label: 'Revenue Amount' },
                                    { key: 'siteName', label: 'Site Name' },
                                    { key: 'aiForecast', label: 'AI Forecast' },
                                    { key: 'variance', label: 'Variance' },
                                    { key: 'anomalies', label: 'Anomalies Detected' },
                                    { key: 'submittedBy', label: 'User Who Submitted' },
                                    { key: 'approvalStatus', label: 'Approval Status' },
                                ].map((field) => (
                                    <label key={field.key} className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition">
                                        <input
                                            type="checkbox"
                                            checked={customReport.fields[field.key as keyof typeof customReport.fields]}
                                            onChange={(e) => setCustomReport({
                                                ...customReport,
                                                fields: { ...customReport.fields, [field.key]: e.target.checked }
                                            })}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{field.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            onClick={() => alert('Generating custom report...')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium flex items-center gap-2"
                        >
                            <FileText size={20} />
                            Generate Report
                        </button>
                        <button
                            onClick={() => setCustomReport({
                                dateRange: { from: '', to: '' },
                                site: 'All Sites',
                                revenueSource: 'All Sources',
                                reportType: 'Revenue Trend',
                                fields: {
                                    revenueAmount: true,
                                    siteName: true,
                                    aiForecast: false,
                                    variance: false,
                                    anomalies: false,
                                    submittedBy: false,
                                    approvalStatus: true
                                }
                            })}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium flex items-center gap-2"
                        >
                            <RefreshCw size={20} />
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Section 4 - Export Reports */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Export Reports (PDF / Excel)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                            <select
                                value={exportConfig.reportType}
                                onChange={(e) => setExportConfig({ ...exportConfig, reportType: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option>Monthly Revenue</option>
                                <option>Annual Summary</option>
                                <option>Custom Report</option>
                                <option>Audit Logs</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">File Format</label>
                            <div className="flex gap-3">
                                {['PDF', 'Excel'].map((format) => (
                                    <button
                                        key={format}
                                        onClick={() => setExportConfig({ ...exportConfig, format })}
                                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition ${exportConfig.format === format
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {format}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Data Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <span className="text-gray-400 self-center">to</span>
                                <input
                                    type="date"
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Sites</label>
                            <div className="space-y-2">
                                {['Site A', 'Site B', 'Site C', 'Site D'].map((site) => (
                                    <label key={site} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{site}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                                <span className="text-sm text-gray-700">Include Attachments</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={exportConfig.includeAttachments}
                                        onChange={(e) => setExportConfig({ ...exportConfig, includeAttachments: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={() => alert(`Exporting ${exportConfig.reportType} as ${exportConfig.format}...`)}
                        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium flex items-center gap-2"
                    >
                        <Download size={20} />
                        Export Report
                    </button>
                </div>

                {/* Section 5 - Audit Logs */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Audit Logs</h2>

                        {/* Search and Filters */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex-1 min-w-[300px] relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by user, action, or module..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <select
                                value={logFilter.user}
                                onChange={(e) => setLogFilter({ ...logFilter, user: e.target.value })}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option>All</option>
                                <option>Admin</option>
                                <option>Finance Officer</option>
                                <option>Auditor</option>
                            </select>
                            <select
                                value={logFilter.module}
                                onChange={(e) => setLogFilter({ ...logFilter, module: e.target.value })}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option>All</option>
                                <option>Reports</option>
                                <option>Revenue Management</option>
                                <option>User Management</option>
                                <option>AI Analytics</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Timestamp</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Module</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm text-gray-600">{log.timestamp}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{log.user}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{log.action}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                {log.module}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Showing {filteredLogs.length} of {auditLogs.length} logs
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm">Previous</button>
                            <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm">1</button>
                            <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm">2</button>
                            <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm">3</button>
                            <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}