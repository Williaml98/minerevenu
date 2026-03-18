'use client';
import React, { useState, useEffect } from 'react';
import {
    useCreateProductionRecordMutation,
    useCreateSalesTransactionMutation,
    useGetProductionRecordsQuery,
    useGetSalesTransactionsQuery,
    useGetMineCompaniesQuery,
    useUpdateProductionRecordMutation,
    useDeleteProductionRecordMutation,
    useUpdateProductionStatusMutation,
    useUpdateSalesTransactionMutation,
    useDeleteSalesTransactionMutation,
    useUpdateSalesTransactionStatusMutation
} from "@/lib/redux/slices/MiningSlice";
import { useGetAnalyticsAnomaliesQuery, useSyncModelsMutation } from "@/lib/redux/slices/analyticsApi";
import {
    Download, Plus, Eye, Check, X,
    AlertTriangle, FileText, ChevronRight, Edit, Trash2
} from 'lucide-react';
import { toast } from "sonner";

// Types
interface RevenueEntry {
    id: string | number;
    siteName: string;
    siteId: number;
    revenueSource: string;
    amount: number;
    dateSubmitted: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    submittedBy: string;
    evidenceDoc?: string;
    description?: string;
    type: 'production' | 'sales';
    recordId: number;
}

// Removed unused Alert interface

interface ProductionFormData {
    mineId: number | null;
    mineName: string;
    date: string;
    quantity_produced: number;
    unit_price: number;
}

interface SalesFormData {
    mineId: number | null;
    mineName: string;
    date: string;
    quantity: number;
    payment_method: string;
}

// Define proper types for API responses
interface ProductionRecord {
    id: number;
    date: string;
    quantity_produced: number;
    unit_price: number;
    total_revenue: number;
    status?: 'Pending' | 'Approved' | 'Rejected';
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
    status?: 'Pending' | 'Approved' | 'Rejected';
    created_at: string;
    mine: number;
    created_by: number;
}

interface MineCompany {
    id: number;
    name: string;
    location: string;
    license_number: string;
    mineral_type: string;
    status: string;
    created_at: string;
}

export default function RevenueManagement() {
    // RTK Query hooks with proper types
    const { data: productionRecords = [], isLoading: loadingProduction } = useGetProductionRecordsQuery({}) as { data: ProductionRecord[], isLoading: boolean };
    const { data: salesTransactions = [], isLoading: loadingSales, refetch: refetchSales } = useGetSalesTransactionsQuery({}) as { data: SalesTransaction[], isLoading: boolean; refetch: () => void };
    const { data: mineCompanies = [], isLoading: loadingMines } = useGetMineCompaniesQuery({}) as { data: MineCompany[], isLoading: boolean };
    const { data: anomaliesData, isLoading: loadingAnomalies } = useGetAnalyticsAnomaliesQuery({ limit: 3 });

    const [createProductionRecord, { isLoading: creatingProduction }] = useCreateProductionRecordMutation();
    const [updateProductionRecord, { isLoading: updatingProduction }] = useUpdateProductionRecordMutation();
    const [deleteProductionRecord, { isLoading: deletingProduction }] = useDeleteProductionRecordMutation();
    const [updateProductionStatus, { isLoading: updatingProductionStatus }] = useUpdateProductionStatusMutation();
    const [createSalesTransaction, { isLoading: creatingSales }] = useCreateSalesTransactionMutation();
    const [updateSalesTransaction, { isLoading: updatingSales }] = useUpdateSalesTransactionMutation();
    const [deleteSalesTransaction, { isLoading: deletingSales }] = useDeleteSalesTransactionMutation();
    const [updateSalesTransactionStatus, { isLoading: updatingStatus }] = useUpdateSalesTransactionStatusMutation();
    const [syncModels, { isLoading: syncingModels }] = useSyncModelsMutation();

    // Local state
    const [entries, setEntries] = useState<RevenueEntry[]>([]);
    const [siteFilter, setSiteFilter] = useState('All Sites');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [revenueSourceFilter, setRevenueSourceFilter] = useState('All Sources');

    // Modal states
    const [showAddProductionModal, setShowAddProductionModal] = useState(false);
    const [showAddSalesModal, setShowAddSalesModal] = useState(false);
    const [showEditProductionModal, setShowEditProductionModal] = useState(false);
    const [showEditSalesModal, setShowEditSalesModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<RevenueEntry | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form states
    const todayISO = new Date().toISOString().split('T')[0];
    const [productionForm, setProductionForm] = useState<ProductionFormData>({
        mineId: null,
        mineName: '',
        date: todayISO,
        quantity_produced: 0,
        unit_price: 0
    });

    const [salesForm, setSalesForm] = useState<SalesFormData>({
        mineId: null,
        mineName: '',
        date: todayISO,
        quantity: 0,
        payment_method: 'Bank Transfer'
    });

    const [editProductionForm, setEditProductionForm] = useState<ProductionFormData>({
        mineId: null,
        mineName: '',
        date: todayISO,
        quantity_produced: 0,
        unit_price: 0
    });

    const [editSalesForm, setEditSalesForm] = useState<SalesFormData>({
        mineId: null,
        mineName: '',
        date: todayISO,
        quantity: 0,
        payment_method: 'Bank Transfer'
    });

    const [exportForm, setExportForm] = useState({
        sites: [] as string[],
        dateRange: '',
        format: 'CSV'
    });

    // Combine and transform API data into RevenueEntry format
    useEffect(() => {
        // Avoid updating state while queries are still loading to prevent render loops
        if (loadingProduction || loadingSales || loadingMines) return;

        const hasData = (productionRecords?.length ?? 0) + (salesTransactions?.length ?? 0) > 0;
        if (!hasData) {
            if (entries.length) setEntries([]); // clear once
            return;
        }

        const combined: RevenueEntry[] = [];

        productionRecords.forEach((record: ProductionRecord) => {
            const mine = mineCompanies.find((m: MineCompany) => m.id === record.mine);
            combined.push({
                id: `prod-${record.id}`,
                siteName: mine?.name || `Mine #${record.mine}`,
                siteId: record.mine,
                revenueSource: 'Production',
                amount: record.total_revenue || (record.quantity_produced * record.unit_price),
                dateSubmitted: record.date,
                status: record.status || 'Pending',
                submittedBy: 'System',
                type: 'production',
                recordId: record.id
            });
        });

        salesTransactions.forEach((sale: SalesTransaction) => {
            const mine = mineCompanies.find((m: MineCompany) => m.id === sale.mine);
                combined.push({
                    id: `sales-${sale.id}`,
                    siteName: mine?.name || `Mine #${sale.mine}`,
                    siteId: sale.mine,
                    revenueSource: 'Sales',
                    amount: sale.total_amount || (sale.quantity * sale.unit_price),
                    dateSubmitted: sale.date,
                    status: sale.status || (sale.is_flagged ? 'Rejected' : 'Pending'),
                    submittedBy: `User #${sale.created_by}`,
                    type: 'sales',
                    recordId: sale.id,
                    description: `Payment: ${sale.payment_method}`
                });
            });

        combined.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());

        // Prevent unnecessary state updates that can trigger re-render loops
        const sameLength = combined.length === entries.length;
        const unchanged =
            sameLength &&
            combined.every((c, idx) => {
                const prev = entries[idx];
                return prev &&
                    prev.id === c.id &&
                    prev.status === c.status &&
                    prev.amount === c.amount &&
                    prev.dateSubmitted === c.dateSubmitted;
            });

        if (!unchanged) {
            setEntries(combined);
        }
    }, [productionRecords, salesTransactions, mineCompanies, loadingProduction, loadingSales, loadingMines, entries]);

    // Get unique revenue sources for filter
    const revenueSources = ['All Sources', ...new Set(entries.map(e => e.revenueSource))];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatStatusLabel = (status: RevenueEntry['status']) => {
        if (status === 'Pending') return 'Pending Review';
        return status;
    };

    const currencyCode = process.env.NEXT_PUBLIC_CURRENCY ?? 'USD';
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getAvailableQuantity = (mineId: number | null, dateValue: string, excludeSalesId?: number) => {
        if (!mineId || !dateValue) return null;
        const cutoff = new Date(dateValue);
        const produced = productionRecords
            .filter((record) => record.mine === mineId && new Date(record.date) <= cutoff)
            .reduce((sum, record) => sum + (record.quantity_produced || 0), 0);
        const sold = salesTransactions
            .filter((sale) => sale.mine === mineId && new Date(sale.date) <= cutoff)
            .filter((sale) => (excludeSalesId ? sale.id !== excludeSalesId : true))
            .reduce((sum, sale) => sum + (sale.quantity || 0), 0);
        return Math.max(0, produced - sold);
    };

    const getUnitPriceForSale = (mineId: number | null, dateValue: string) => {
        if (!mineId || !dateValue) return null;
        const cutoff = new Date(dateValue);
        const matching = productionRecords
            .filter((record) => record.mine === mineId && new Date(record.date) <= cutoff)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return matching.length > 0 ? matching[0].unit_price : null;
    };

    const handleCreateProduction = async () => {
        if (!productionForm.mineId || !productionForm.date || productionForm.quantity_produced <= 0 || productionForm.unit_price <= 0) {
            toast.error('Please fill all fields correctly');
            return;
        }
        if (productionForm.date > todayISO) {
            toast.error('Production date cannot be in the future');
            return;
        }

        try {
            await createProductionRecord({
                mine: productionForm.mineId,
                date: productionForm.date,
                quantity_produced: productionForm.quantity_produced,
                unit_price: productionForm.unit_price
            }).unwrap();

            // Reset form and close modal
            setProductionForm({
                mineId: null,
                mineName: '',
                date: todayISO,
                quantity_produced: 0,
                unit_price: 0
            });
            setShowAddProductionModal(false);
            toast.success('Production record created successfully!');
            try {
                await syncModels().unwrap();
                setSyncMessage({ type: 'success', text: 'AI models synced and forecasts refreshed.' });
            } catch (err) {
                const apiErr = err as { data?: { detail?: string } };
                setSyncMessage({ type: 'error', text: apiErr?.data?.detail || 'AI sync failed. Try again later.' });
            }
        } catch (error) {
            console.error('Failed to create production record:', error);
            const err = error as { data?: { detail?: string } };
            toast.error(err?.data?.detail || 'Failed to create production record');
        }
    };

    const handleCreateSales = async () => {
        if (!salesForm.mineId || !salesForm.date || salesForm.quantity <= 0 || !salesForm.payment_method) {
            toast.error('Please fill all fields correctly');
            return;
        }
        if (salesForm.date > todayISO) {
            toast.error('Sales date cannot be in the future');
            return;
        }
        const unitPrice = getUnitPriceForSale(salesForm.mineId, salesForm.date);
        if (!unitPrice) {
            toast.error('Add a production record first to set the unit price.');
            return;
        }
        const availableQty = getAvailableQuantity(salesForm.mineId, salesForm.date);
        if (availableQty !== null && salesForm.quantity > availableQty) {
            toast.error('Sales quantity exceeds available produced quantity for this mine and date.');
            return;
        }

        try {
            await createSalesTransaction({
                mine: salesForm.mineId,
                date: salesForm.date,
                quantity: salesForm.quantity,
                payment_method: salesForm.payment_method
            }).unwrap();

            // Reset form and close modal
            setSalesForm({
                mineId: null,
                mineName: '',
                date: todayISO,
                quantity: 0,
                payment_method: 'Bank Transfer'
            });
            setShowAddSalesModal(false);
            toast.success('Sales transaction created successfully!');
            try {
                await syncModels().unwrap();
                setSyncMessage({ type: 'success', text: 'AI models synced and forecasts refreshed.' });
            } catch (err) {
                const apiErr = err as { data?: { detail?: string } };
                setSyncMessage({ type: 'error', text: apiErr?.data?.detail || 'AI sync failed. Try again later.' });
            }
        } catch (error) {
            console.error('Failed to create sales transaction:', error);
            const err = error as { data?: { detail?: string } };
            toast.error(err?.data?.detail || 'Failed to create sales transaction');
        }
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

    const handleEdit = (entry: RevenueEntry) => {
        setSelectedEntry(entry);
        if (entry.type === 'production') {
            const record = productionRecords.find((r) => r.id === entry.recordId);
            setEditProductionForm({
                mineId: record?.mine ?? null,
                mineName: entry.siteName,
                date: record?.date || todayISO,
                quantity_produced: record?.quantity_produced || 0,
                unit_price: record?.unit_price || 0
            });
            setShowEditProductionModal(true);
        } else {
            const record = salesTransactions.find((r) => r.id === entry.recordId);
            setEditSalesForm({
                mineId: record?.mine ?? null,
                mineName: entry.siteName,
                date: record?.date || todayISO,
                quantity: record?.quantity || 0,
                payment_method: record?.payment_method || 'Bank Transfer'
            });
            setShowEditSalesModal(true);
        }
    };

    const handleDelete = (entry: RevenueEntry) => {
        setSelectedEntry(entry);
        setShowDeleteModal(true);
    };

    const confirmAction = async () => {
        if (selectedEntry) {
            const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
            try {
                if (selectedEntry.type === 'production') {
                    await updateProductionStatus({
                        id: selectedEntry.recordId,
                        status: newStatus
                    }).unwrap();
                    toast.success(`Production marked as ${newStatus}.`);
                } else {
                    await updateSalesTransactionStatus({
                        id: selectedEntry.recordId,
                        status: newStatus
                    }).unwrap();
                    await refetchSales();
                    toast.success(`Revenue marked as ${newStatus}.`);
                }
            } catch (error) {
                console.error('Failed to update status:', error);
                toast.error('Failed to update status. Please try again.');
            }
            setShowApproveModal(false);
            setShowRejectModal(false);
            setSelectedEntry(null);
        }
    };

    const handleUpdateProduction = async () => {
        if (!selectedEntry || selectedEntry.type !== 'production') return;
        if (!editProductionForm.mineId || !editProductionForm.date || editProductionForm.quantity_produced <= 0 || editProductionForm.unit_price <= 0) {
            toast.error('Please fill all fields correctly');
            return;
        }
        if (editProductionForm.date > todayISO) {
            toast.error('Production date cannot be in the future');
            return;
        }
        try {
            await updateProductionRecord({
                id: selectedEntry.recordId,
                mine: editProductionForm.mineId,
                date: editProductionForm.date,
                quantity_produced: editProductionForm.quantity_produced,
                unit_price: editProductionForm.unit_price
            }).unwrap();
            setShowEditProductionModal(false);
            setSelectedEntry(null);
            toast.success('Production record updated.');
            try {
                await syncModels().unwrap();
                setSyncMessage({ type: 'success', text: 'AI models synced and forecasts refreshed.' });
            } catch (err) {
                const apiErr = err as { data?: { detail?: string } };
                setSyncMessage({ type: 'error', text: apiErr?.data?.detail || 'AI sync failed. Try again later.' });
            }
        } catch (error) {
            console.error('Failed to update production record:', error);
            toast.error('Failed to update production record');
        }
    };

    const handleUpdateSales = async () => {
        if (!selectedEntry || selectedEntry.type !== 'sales') return;
        if (!editSalesForm.mineId || !editSalesForm.date || editSalesForm.quantity <= 0 || !editSalesForm.payment_method) {
            toast.error('Please fill all fields correctly');
            return;
        }
        if (editSalesForm.date > todayISO) {
            toast.error('Sales date cannot be in the future');
            return;
        }
        const unitPrice = getUnitPriceForSale(editSalesForm.mineId, editSalesForm.date);
        if (!unitPrice) {
            toast.error('Add a production record first to set the unit price.');
            return;
        }
        const availableQty = getAvailableQuantity(editSalesForm.mineId, editSalesForm.date, selectedEntry.recordId);
        if (availableQty !== null && editSalesForm.quantity > availableQty) {
            toast.error('Sales quantity exceeds available produced quantity for this mine and date.');
            return;
        }
        try {
            await updateSalesTransaction({
                id: selectedEntry.recordId,
                mine: editSalesForm.mineId,
                date: editSalesForm.date,
                quantity: editSalesForm.quantity,
                payment_method: editSalesForm.payment_method
            }).unwrap();
            setShowEditSalesModal(false);
            setSelectedEntry(null);
            toast.success('Sales transaction updated.');
            try {
                await syncModels().unwrap();
                setSyncMessage({ type: 'success', text: 'AI models synced and forecasts refreshed.' });
            } catch (err) {
                const apiErr = err as { data?: { detail?: string } };
                setSyncMessage({ type: 'error', text: apiErr?.data?.detail || 'AI sync failed. Try again later.' });
            }
        } catch (error) {
            console.error('Failed to update sales transaction:', error);
            toast.error('Failed to update sales transaction');
        }
    };

    const confirmDelete = async () => {
        if (!selectedEntry) return;
        try {
            if (selectedEntry.type === 'production') {
                await deleteProductionRecord(selectedEntry.recordId).unwrap();
                toast.success('Production record deleted.');
            } else {
                await deleteSalesTransaction(selectedEntry.recordId).unwrap();
                toast.success('Sales transaction deleted.');
            }
            setShowDeleteModal(false);
            setSelectedEntry(null);
            try {
                await syncModels().unwrap();
                setSyncMessage({ type: 'success', text: 'AI models synced and forecasts refreshed.' });
            } catch (err) {
                const apiErr = err as { data?: { detail?: string } };
                setSyncMessage({ type: 'error', text: apiErr?.data?.detail || 'AI sync failed. Try again later.' });
            }
        } catch (error) {
            console.error('Failed to delete record:', error);
            toast.error('Failed to delete record');
        }
    };

    const filteredEntries = entries.filter(entry => {
        const matchesSite = siteFilter === 'All Sites' || entry.siteName === siteFilter;
        const matchesStatus = statusFilter === 'All' || entry.status === statusFilter;
        const matchesRevenueSource = revenueSourceFilter === 'All Sources' || entry.revenueSource === revenueSourceFilter;
        const matchesDateFrom = !dateFrom || entry.dateSubmitted >= dateFrom;
        const matchesDateTo = !dateTo || entry.dateSubmitted <= dateTo;
        return matchesSite && matchesStatus && matchesRevenueSource && matchesDateFrom && matchesDateTo;
    });

    // Get unique site names for filter
    const siteNames = ['All Sites', ...new Set(entries.map(e => e.siteName))];

    const isLoading = loadingProduction || loadingSales || loadingMines;
    const aiAlerts = anomaliesData?.anomalies ?? [];
    const aiModelReady = anomaliesData?.model_ready !== false;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading revenue data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Page Title */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Revenue Management</h1>
                            <p className="text-gray-600 mt-2">Oversee, validate, and manage mining revenue from all sites.</p>
                            {syncMessage && (
                                <div className={`mt-3 rounded-xl px-4 py-2 text-sm ${syncMessage.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    {syncMessage.text}
                                </div>
                            )}
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
                                        {siteNames.map(site => (
                                            <option key={site}>{site}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={revenueSourceFilter}
                                        onChange={(e) => setRevenueSourceFilter(e.target.value)}
                                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        {revenueSources.map(source => (
                                            <option key={source}>{source}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option>All</option>
                                        <option>Pending</option>
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
                                        <span className="text-gray-400">-&gt;</span>
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
                                        onClick={() => setShowAddProductionModal(true)}
                                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 font-medium text-sm"
                                    >
                                        <Plus size={18} />
                                        Add Production
                                    </button>
                                    <button
                                        onClick={() => setShowAddSalesModal(true)}
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-medium text-sm"
                                    >
                                        <Plus size={18} />
                                        Add Sales
                                    </button>
                                    <button
                                        onClick={() => setShowExportModal(true)}
                                        className="px-5 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition flex items-center gap-2 font-medium text-sm"
                                    >
                                        <Download size={18} />
                                        Export
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
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount ({currencyCode})</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Submitted By</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredEntries.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                    No revenue entries found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredEntries.map((entry) => (
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
                                                            {formatStatusLabel(entry.status)}
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
                                                            <button
                                                                onClick={() => handleEdit(entry)}
                                                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                                                                title="Edit"
                                                            >
                                                                <Edit size={18} className="text-slate-600" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(entry)}
                                                                className="p-2 hover:bg-red-50 rounded-lg transition"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} className="text-red-600" />
                                                            </button>
                                                            {entry.status === 'Pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApprove(entry)}
                                                                        disabled={updatingStatus || updatingProductionStatus}
                                                                        className="p-2 hover:bg-green-50 rounded-lg transition"
                                                                        title="Approve"
                                                                    >
                                                                        <Check size={18} className="text-green-600" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(entry)}
                                                                        disabled={updatingStatus || updatingProductionStatus}
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
                                            ))
                                        )}
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
                                {loadingAnomalies && (
                                    <div className="text-center text-gray-500 text-sm py-4">
                                        Loading AI alerts...
                                    </div>
                                )}
                                {!loadingAnomalies && !aiModelReady && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800">
                                        AI anomaly model is not trained yet. Retrain models in AI Analytics to enable alerts.
                                    </div>
                                )}
                                {!loadingAnomalies && aiModelReady && aiAlerts.length > 0 && (
                                    aiAlerts.map((alert) => (
                                        <div key={alert.transaction_id} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                                            <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm text-gray-700">
                                                <p className="font-medium">Anomaly at {alert.mine_name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(alert.date).toLocaleDateString()} - {formatCurrency(alert.amount)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {!loadingAnomalies && aiModelReady && aiAlerts.length === 0 && (
                                    <div className="text-center text-gray-500 text-sm py-4">
                                        No AI alerts at this time
                                    </div>
                                )}
                            </div>
                            <button className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition font-medium text-sm flex items-center justify-center gap-2">
                                View All Alerts
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Production Modal */}
            {showAddProductionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Add Production Record</h2>
                            <button onClick={() => setShowAddProductionModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                Sales can only be recorded after production. The system will reject sales that exceed total produced quantity.
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mine Site</label>
                                <select
                                    value={productionForm.mineId || ''}
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);
                                        const selectedMine = mineCompanies.find((m: MineCompany) => m.id === selectedId);
                                        setProductionForm({
                                            ...productionForm,
                                            mineId: selectedId,
                                            mineName: selectedMine?.name || ''
                                        });
                                    }}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Mine Site</option>
                                    {mineCompanies.map((mine: MineCompany) => (
                                        <option key={mine.id} value={mine.id}>
                                            {mine.name} - {mine.location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Production Date</label>
                                <input
                                    type="date"
                                    value={productionForm.date}
                                    onChange={(e) => setProductionForm({ ...productionForm, date: e.target.value })}
                                    max={todayISO}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Produced</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={productionForm.quantity_produced}
                                    onChange={(e) => setProductionForm({ ...productionForm, quantity_produced: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price ({currencyCode})</label>
                                <input
                                    type="number"
                                    step="1000"
                                    value={productionForm.unit_price}
                                    onChange={(e) => setProductionForm({ ...productionForm, unit_price: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                />
                            </div>
                            {productionForm.quantity_produced > 0 && productionForm.unit_price > 0 && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <p className="text-sm text-gray-600">Estimated Revenue:</p>
                                    <p className="text-xl font-bold text-blue-700">
                                        {formatCurrency(productionForm.quantity_produced * productionForm.unit_price)}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddProductionModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateProduction}
                                disabled={creatingProduction || syncingModels}
                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creatingProduction ? 'Creating...' : syncingModels ? 'Updating AI...' : 'Save Production'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Sales Modal */}
            {showAddSalesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Add Sales Transaction</h2>
                            <button onClick={() => setShowAddSalesModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mine Site</label>
                                <select
                                    value={salesForm.mineId || ''}
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);
                                        const selectedMine = mineCompanies.find((m: MineCompany) => m.id === selectedId);
                                        setSalesForm({
                                            ...salesForm,
                                            mineId: selectedId,
                                            mineName: selectedMine?.name || ''
                                        });
                                    }}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Mine Site</option>
                                    {mineCompanies.map((mine: MineCompany) => (
                                        <option key={mine.id} value={mine.id}>
                                            {mine.name} - {mine.location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sale Date</label>
                                <input
                                    type="date"
                                    value={salesForm.date}
                                    onChange={(e) => setSalesForm({ ...salesForm, date: e.target.value })}
                                    max={todayISO}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Sold</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={salesForm.quantity}
                                    onChange={(e) => setSalesForm({ ...salesForm, quantity: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Unit Price ({currencyCode})</p>
                                <p className="mt-1 text-base font-semibold text-slate-900">
                                    {getUnitPriceForSale(salesForm.mineId, salesForm.date) !== null
                                        ? formatCurrency(getUnitPriceForSale(salesForm.mineId, salesForm.date) || 0)
                                        : 'Add production to set price'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                <select
                                    value={salesForm.payment_method}
                                    onChange={(e) => setSalesForm({ ...salesForm, payment_method: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Mobile Money">Mobile Money</option>
                                    <option value="Check">Check</option>
                                </select>
                            </div>
                            {salesForm.mineId && salesForm.date && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                    Available production up to {salesForm.date}:{" "}
                                    <span className="font-semibold">
                                        {getAvailableQuantity(salesForm.mineId, salesForm.date) ?? 0} tons
                                    </span>
                                    {getAvailableQuantity(salesForm.mineId, salesForm.date) === 0 && (
                                        <div className="text-xs text-amber-700 mt-1">
                                            No production recorded yet. Add production before sales.
                                        </div>
                                    )}
                                </div>
                            )}
                            {salesForm.quantity > 0 && (getUnitPriceForSale(salesForm.mineId, salesForm.date) || 0) > 0 && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <p className="text-sm text-gray-600">Total Amount:</p>
                                    <p className="text-xl font-bold text-blue-700">
                                        {formatCurrency(salesForm.quantity * (getUnitPriceForSale(salesForm.mineId, salesForm.date) || 0))}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddSalesModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateSales}
                                disabled={creatingSales || syncingModels}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creatingSales ? 'Creating...' : syncingModels ? 'Updating AI...' : 'Save Sales'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Production Modal */}
            {showEditProductionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Edit Production</h2>
                            <button onClick={() => setShowEditProductionModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mine Site</label>
                                <select
                                    value={editProductionForm.mineId || ''}
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);
                                        const selectedMine = mineCompanies.find((m: MineCompany) => m.id === selectedId);
                                        setEditProductionForm({
                                            ...editProductionForm,
                                            mineId: selectedId,
                                            mineName: selectedMine?.name || ''
                                        });
                                    }}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Mine Site</option>
                                    {mineCompanies.map((mine: MineCompany) => (
                                        <option key={mine.id} value={mine.id}>
                                            {mine.name} - {mine.location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Production Date</label>
                                <input
                                    type="date"
                                    value={editProductionForm.date}
                                    onChange={(e) => setEditProductionForm({ ...editProductionForm, date: e.target.value })}
                                    max={todayISO}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Produced (Tons)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editProductionForm.quantity_produced}
                                    onChange={(e) => setEditProductionForm({ ...editProductionForm, quantity_produced: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price ({currencyCode})</label>
                                <input
                                    type="number"
                                    step="1000"
                                    value={editProductionForm.unit_price}
                                    onChange={(e) => setEditProductionForm({ ...editProductionForm, unit_price: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                />
                            </div>
                            {editProductionForm.quantity_produced > 0 && editProductionForm.unit_price > 0 && (
                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                    <p className="text-sm text-gray-600">Total Revenue:</p>
                                    <p className="text-xl font-bold text-emerald-700">
                                        {formatCurrency(editProductionForm.quantity_produced * editProductionForm.unit_price)}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEditProductionModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateProduction}
                                disabled={updatingProduction || syncingModels}
                                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updatingProduction ? 'Updating...' : syncingModels ? 'Updating AI...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Sales Modal */}
            {showEditSalesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Edit Sales</h2>
                            <button onClick={() => setShowEditSalesModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mine Site</label>
                                <select
                                    value={editSalesForm.mineId || ''}
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);
                                        const selectedMine = mineCompanies.find((m: MineCompany) => m.id === selectedId);
                                        setEditSalesForm({
                                            ...editSalesForm,
                                            mineId: selectedId,
                                            mineName: selectedMine?.name || ''
                                        });
                                    }}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Mine Site</option>
                                    {mineCompanies.map((mine: MineCompany) => (
                                        <option key={mine.id} value={mine.id}>
                                            {mine.name} - {mine.location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sale Date</label>
                                <input
                                    type="date"
                                    value={editSalesForm.date}
                                    onChange={(e) => setEditSalesForm({ ...editSalesForm, date: e.target.value })}
                                    max={todayISO}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Sold</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editSalesForm.quantity}
                                    onChange={(e) => setEditSalesForm({ ...editSalesForm, quantity: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Unit Price ({currencyCode})</p>
                                <p className="mt-1 text-base font-semibold text-slate-900">
                                    {getUnitPriceForSale(editSalesForm.mineId, editSalesForm.date) !== null
                                        ? formatCurrency(getUnitPriceForSale(editSalesForm.mineId, editSalesForm.date) || 0)
                                        : 'Add production to set price'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                <select
                                    value={editSalesForm.payment_method}
                                    onChange={(e) => setEditSalesForm({ ...editSalesForm, payment_method: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Mobile Money">Mobile Money</option>
                                    <option value="Check">Check</option>
                                </select>
                            </div>
                            {editSalesForm.mineId && editSalesForm.date && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                    Available production up to {editSalesForm.date}:{" "}
                                    <span className="font-semibold">
                                    {getAvailableQuantity(editSalesForm.mineId, editSalesForm.date, selectedEntry?.recordId) ?? 0} tons
                                    </span>
                                    {getAvailableQuantity(editSalesForm.mineId, editSalesForm.date, selectedEntry?.recordId) === 0 && (
                                        <div className="text-xs text-amber-700 mt-1">
                                            No production recorded yet. Add production before sales.
                                        </div>
                                    )}
                                </div>
                            )}
                            {editSalesForm.quantity > 0 && (getUnitPriceForSale(editSalesForm.mineId, editSalesForm.date) || 0) > 0 && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <p className="text-sm text-gray-600">Total Amount:</p>
                                    <p className="text-xl font-bold text-blue-700">
                                        {formatCurrency(editSalesForm.quantity * (getUnitPriceForSale(editSalesForm.mineId, editSalesForm.date) || 0))}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEditSalesModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateSales}
                                disabled={updatingSales || syncingModels}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updatingSales ? 'Updating...' : syncingModels ? 'Updating AI...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={30} className="text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete {selectedEntry.revenueSource}</h2>
                            <p className="text-gray-600">
                                Are you sure you want to delete this {selectedEntry.type === 'production' ? 'production' : 'sales'} record?
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
                            >
                                Delete
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
                                    <p className="text-sm text-gray-600 mb-1">Date</p>
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
                                        {formatStatusLabel(selectedEntry.status)}
                                    </span>
                                </div>
                            </div>
                            {selectedEntry.description && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <p className="text-sm text-gray-600 mb-1">Additional Info</p>
                                    <p className="text-gray-900">{selectedEntry.description}</p>
                                </div>
                            )}
                            {selectedEntry.evidenceDoc && (
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Evidence Document</p>
                                    <button className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
                                        <FileText size={18} />
                                        {selectedEntry.evidenceDoc}
                                        <Download size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            {selectedEntry.status === 'Pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowViewModal(false);
                                            handleApprove(selectedEntry);
                                        }}
                                        disabled={updatingStatus || updatingProductionStatus}
                                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                                    >
                                        <Check size={20} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowViewModal(false);
                                            handleReject(selectedEntry);
                                        }}
                                        disabled={updatingStatus || updatingProductionStatus}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                                    >
                                        <X size={20} />
                                        Reject
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
                                {actionType === 'approve' ? 'Approve Entry' : 'Reject Entry'}
                            </h2>
                            <p className="text-gray-600">
                                Are you sure you want to {actionType} this {selectedEntry?.type === 'production' ? 'production' : 'sales'} entry?
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
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {siteNames.filter(s => s !== 'All Sites').map((site) => (
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
                                        onChange={(e) => setDateFrom(e.target.value)}
                                    />
                                    <span className="text-gray-400">to</span>
                                    <input
                                        type="date"
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => setDateTo(e.target.value)}
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
                                    // Filter entries based on selected criteria
                                    const dataToExport = filteredEntries.filter(entry =>
                                        exportForm.sites.length === 0 || exportForm.sites.includes(entry.siteName)
                                    );

                                    // Create CSV content
                                    const csvContent = [
                                        ['Site Name', 'Revenue Source', 'Amount', 'Date', 'Status', 'Submitted By'],
                                        ...dataToExport.map(entry => [
                                            entry.siteName,
                                            entry.revenueSource,
                                            entry.amount.toString(),
                                            entry.dateSubmitted,
                                            entry.status,
                                            entry.submittedBy
                                        ])
                                    ].map(row => row.join(',')).join('\n');

                                    // Download file
                                    const blob = new Blob([csvContent], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `revenue-export-${new Date().toISOString().split('T')[0]}.csv`;
                                    a.click();

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

