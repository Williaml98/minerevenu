'use client';
import React, { useState } from 'react';
import {
    Filter, Download, Upload, Plus, Eye, Check, X,
    AlertTriangle, FileText, Calendar, ChevronRight
} from 'lucide-react';

// Types
interface RevenueEntry {
    id: string;
    siteName: string;
    revenueSource: string;
    amount: number;
    dateSubmitted: string;
    status: 'Pending Review' | 'Approved' | 'Rejected';
    submittedBy: string;
    evidenceDoc?: string;
    description?: string;
}

interface Alert {
    id: string;
    message: string;
    type: 'warning' | 'error' | 'info';
}

// Sample Data
const sampleEntries: RevenueEntry[] = [
    { id: '1', siteName: 'Site A', revenueSource: 'Tin Export', amount: 54500000, dateSubmitted: '2024-11-15', status: 'Pending Review', submittedBy: 'John Doe', evidenceDoc: 'export_receipt.pdf' },
    { id: '2', siteName: 'Site B', revenueSource: 'Coltan Sales', amount: 87300000, dateSubmitted: '2024-11-14', status: 'Approved', submittedBy: 'Sarah Evans', evidenceDoc: 'sales_invoice.pdf' },
    { id: '3', siteName: 'Site C', revenueSource: 'Tungsten Export', amount: 42100000, dateSubmitted: '2024-11-13', status: 'Rejected', submittedBy: 'Michael Johnson', evidenceDoc: 'export_doc.pdf' },
    { id: '4', siteName: 'Site A', revenueSource: 'Processing Fees', amount: 12500000, dateSubmitted: '2024-11-12', status: 'Approved', submittedBy: 'Lisa Brown', evidenceDoc: 'fee_receipt.pdf' },
    { id: '5', siteName: 'Site D', revenueSource: 'Tin Export', amount: 65800000, dateSubmitted: '2024-11-11', status: 'Pending Review', submittedBy: 'David Wilson', evidenceDoc: 'export_proof.pdf' },
];

const sampleAlerts: Alert[] = [
    { id: '1', message: 'Unusual spike detected in Site B revenue', type: 'warning' },
    { id: '2', message: 'Missing submission from Site D for 3 days', type: 'error' },
    { id: '3', message: 'Revenue source mismatch detected in Site A', type: 'warning' },
];

export default function RevenueManagement() {
    const [entries, setEntries] = useState<RevenueEntry[]>(sampleEntries);
    const [siteFilter, setSiteFilter] = useState('All Sites');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [showAddSourceModal, setShowAddSourceModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<RevenueEntry | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

    const [sourceForm, setSourceForm] = useState({
        name: '',
        category: '',
        expectedRange: '',
        description: ''
    });

    const [exportForm, setExportForm] = useState({
        sites: [] as string[],
        dateRange: '',
        format: 'CSV'
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending Review': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleApprove = (entry: RevenueEntry) => {
        setSelectedEntry(entry);
        setActionType('approve');
        setShowApproveModal(true);
    };

    const handleReject = (entry: RevenueEntry) => {
        setSelectedEntry(entry);
        setActionType('reject');
        setShowRejectModal(true);
    };

    const confirmAction = () => {
        if (selectedEntry) {
            const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
            setEntries(entries.map(e =>
                e.id === selectedEntry.id ? { ...e, status: newStatus as RevenueEntry['status'] } : e
            ));
            setShowApproveModal(false);
            setShowRejectModal(false);
            setSelectedEntry(null);
        }
    };

    const filteredEntries = entries.filter(entry => {
        const matchesSite = siteFilter === 'All Sites' || entry.siteName === siteFilter;
        const matchesStatus = statusFilter === 'All' || entry.status === statusFilter;
        const matchesDateFrom = !dateFrom || entry.dateSubmitted >= dateFrom;
        const matchesDateTo = !dateTo || entry.dateSubmitted <= dateTo;
        return matchesSite && matchesStatus && matchesDateFrom && matchesDateTo;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Page Title */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Revenue Management</h1>
                            <p className="text-gray-600 mt-2">Oversee, validate, and manage mining revenue submissions from all sites.</p>
                        </div>

                        {/* Filters & Actions Bar */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                            <div className="flex flex-wrap gap-4 items-center">
                                {/* Left Section - Filters */}
                                <div className="flex flex-wrap gap-3 flex-1">
                                    <select
                                        value={siteFilter}
                                        onChange={(e) => setSiteFilter(e.target.value)}
                                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option>All Sites</option>
                                        <option>Site A</option>
                                        <option>Site B</option>
                                        <option>Site C</option>
                                        <option>Site D</option>
                                    </select>

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option>All</option>
                                        <option>Pending Review</option>
                                        <option>Approved</option>
                                        <option>Rejected</option>
                                    </select>

                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="From"
                                        />
                                        <span className="text-gray-400">→</span>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="To"
                                        />
                                    </div>
                                </div>

                                {/* Right Section - Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        className="px-5 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition flex items-center gap-2 font-medium text-sm"
                                    >
                                        <Upload size={18} />
                                        Import Data
                                    </button>
                                    <button
                                        onClick={() => setShowExportModal(true)}
                                        className="px-5 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition flex items-center gap-2 font-medium text-sm"
                                    >
                                        <Download size={18} />
                                        Export Data
                                    </button>
                                    <button
                                        onClick={() => setShowAddSourceModal(true)}
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-medium text-sm"
                                    >
                                        <Plus size={18} />
                                        Add Revenue Source
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Entries Table */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Site Name</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Revenue Source</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount (RWF)</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date Submitted</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Submitted By</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredEntries.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-900">{entry.siteName}</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{entry.revenueSource}</td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-900">{formatCurrency(entry.amount)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {new Date(entry.dateSubmitted).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
                                                        {entry.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{entry.submittedBy}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedEntry(entry);
                                                                setShowViewModal(true);
                                                            }}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                            title="View"
                                                        >
                                                            <Eye size={18} className="text-blue-600" />
                                                        </button>
                                                        {entry.status === 'Pending Review' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(entry)}
                                                                    className="p-2 hover:bg-green-50 rounded-lg transition"
                                                                    title="Approve"
                                                                >
                                                                    <Check size={18} className="text-green-600" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(entry)}
                                                                    className="p-2 hover:bg-red-50 rounded-lg transition"
                                                                    title="Reject"
                                                                >
                                                                    <X size={18} className="text-red-600" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Showing {filteredEntries.length} of {entries.length} entries
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

                    {/* AI Revenue Alerts Panel */}
                    <div className="w-80">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertTriangle size={20} className="text-yellow-600" />
                                AI Revenue Alerts
                            </h3>
                            <div className="space-y-3 mb-4">
                                {sampleAlerts.map((alert) => (
                                    <div key={alert.id} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                                        <AlertTriangle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">{alert.message}</p>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition font-medium text-sm flex items-center justify-center gap-2">
                                View All Alerts
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Revenue Source Modal */}
            {showAddSourceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Add Revenue Source</h2>
                            <button onClick={() => setShowAddSourceModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Source Name</label>
                                <input
                                    type="text"
                                    value={sourceForm.name}
                                    onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Tin Export"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Category</label>
                                <select
                                    value={sourceForm.category}
                                    onChange={(e) => setSourceForm({ ...sourceForm, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    <option>Mineral Export</option>
                                    <option>Processing Fees</option>
                                    <option>Licensing Fees</option>
                                    <option>Royalties</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Default Expected Range</label>
                                <input
                                    type="text"
                                    value={sourceForm.expectedRange}
                                    onChange={(e) => setSourceForm({ ...sourceForm, expectedRange: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 10M - 50M RWF"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={sourceForm.description}
                                    onChange={(e) => setSourceForm({ ...sourceForm, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                    placeholder="Brief description of the revenue source..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddSourceModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert('Revenue source added!');
                                    setShowAddSourceModal(false);
                                    setSourceForm({ name: '', category: '', expectedRange: '', description: '' });
                                }}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                            >
                                Save Source
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Revenue Entry Modal */}
            {showViewModal && selectedEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Revenue Entry Details</h2>
                            <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 mb-1">Site</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedEntry.siteName}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 mb-1">Revenue Source</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedEntry.revenueSource}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedEntry.amount)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 mb-1">Date Submitted</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date(selectedEntry.dateSubmitted).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 mb-1">Submitted By</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedEntry.submittedBy}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 mb-1">Status</p>
                                    <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(selectedEntry.status)}`}>
                                        {selectedEntry.status}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <p className="text-sm text-gray-600 mb-2">Evidence Document</p>
                                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                                    <FileText size={18} />
                                    {selectedEntry.evidenceDoc}
                                    <Download size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            {selectedEntry.status === 'Pending Review' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowViewModal(false);
                                            handleApprove(selectedEntry);
                                        }}
                                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                                    >
                                        <Check size={20} />
                                        Approve Revenue
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowViewModal(false);
                                            handleReject(selectedEntry);
                                        }}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                                    >
                                        <X size={20} />
                                        Reject Revenue
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve/Reject Confirmation Modal */}
            {(showApproveModal || showRejectModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 ${actionType === 'approve' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                {actionType === 'approve' ? (
                                    <Check size={32} className="text-green-600" />
                                ) : (
                                    <X size={32} className="text-red-600" />
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {actionType === 'approve' ? 'Approve Revenue' : 'Reject Revenue'}
                            </h2>
                            <p className="text-gray-600">
                                Are you sure you want to {actionType} this revenue entry?
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setShowRejectModal(false);
                                }}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`flex-1 px-4 py-3 ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-xl transition font-medium`}
                            >
                                {actionType === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Revenue Data Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Import Revenue Data</h2>
                            <button onClick={() => setShowImportModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition cursor-pointer">
                                <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-700 font-medium mb-1">Click to upload or drag and drop</p>
                                <p className="text-sm text-gray-500">CSV or Excel files (max 10MB)</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <p className="text-sm text-gray-700 mb-2">Need a template?</p>
                                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2">
                                    <Download size={16} />
                                    Download Import Template
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert('Data imported successfully!');
                                    setShowImportModal(false);
                                }}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                            >
                                Import Data
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Data Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Export Data</h2>
                            <button onClick={() => setShowExportModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Sites</label>
                                <div className="space-y-2">
                                    {['Site A', 'Site B', 'Site C', 'Site D'].map((site) => (
                                        <label key={site} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setExportForm({ ...exportForm, sites: [...exportForm.sites, site] });
                                                    } else {
                                                        setExportForm({ ...exportForm, sites: exportForm.sites.filter(s => s !== site) });
                                                    }
                                                }}
                                            />
                                            <span className="text-sm text-gray-700">{site}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date Range</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="date"
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-400">to</span>
                                    <input
                                        type="date"
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Choose Format</label>
                                <div className="flex gap-3">
                                    {['CSV', 'PDF', 'Excel'].map((format) => (
                                        <button
                                            key={format}
                                            onClick={() => setExportForm({ ...exportForm, format })}
                                            className={`flex-1 px-4 py-3 rounded-xl font-medium transition ${exportForm.format === format
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {format}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert(`Exporting data as ${exportForm.format}...`);
                                    setShowExportModal(false);
                                }}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                            >
                                <Download size={20} />
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}