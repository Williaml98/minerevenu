"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Edit, Trash2, X } from "lucide-react";
import {
    useCreateSalesTransactionMutation,
    useUpdateSalesTransactionMutation,
    useDeleteSalesTransactionMutation,
    useGetMineCompaniesQuery,
    useGetProductionRecordsQuery,
    useGetSalesTransactionsQuery,
} from "@/lib/redux/slices/MiningSlice";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export default function OfficerRevenueManagementPage() {
    const { data: mines = [] } = useGetMineCompaniesQuery({});
    const { data: productionRecords = [] } = useGetProductionRecordsQuery({});
    const { data: transactions = [], isLoading } = useGetSalesTransactionsQuery({});
    const [createTransaction, { isLoading: creating }] = useCreateSalesTransactionMutation();
    const [updateTransaction, { isLoading: updating }] = useUpdateSalesTransactionMutation();
    const [deleteTransaction, { isLoading: deleting }] = useDeleteSalesTransactionMutation();

    const todayISO = new Date().toISOString().split("T")[0];

    const [form, setForm] = useState({
        mine: "",
        date: todayISO,
        quantity: "",
        payment_method: "Bank Transfer",
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        mine: "",
        date: todayISO,
        quantity: "",
        payment_method: "Bank Transfer",
    });

    const mappedTransactions = useMemo(() => {
        const mineMap = new Map(mines.map((mine) => [mine.id, mine.name]));
        return transactions.map((tx) => ({
            ...tx,
            mineName: mineMap.get(tx.mine) || `Mine #${tx.mine}`,
        }));
    }, [transactions, mines]);

    const getAvailableQuantity = (mineId: number, dateValue: string, excludeId?: number | null) => {
        const cutoff = new Date(dateValue);
        const produced = productionRecords
            .filter((record) => record.mine === mineId && new Date(record.date) <= cutoff)
            .reduce((sum, record) => sum + (record.quantity_produced || 0), 0);
        const sold = transactions
            .filter((sale) => sale.mine === mineId && new Date(sale.date) <= cutoff)
            .filter((sale) => (excludeId ? sale.id !== excludeId : true))
            .reduce((sum, sale) => sum + (sale.quantity || 0), 0);
        return Math.max(0, produced - sold);
    };

    const getUnitPriceForSale = (mineId: number, dateValue: string) => {
        const cutoff = new Date(dateValue);
        const matching = productionRecords
            .filter((record) => record.mine === mineId && new Date(record.date) <= cutoff)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return matching.length > 0 ? matching[0].unit_price : null;
    };

    async function onCreateTransaction() {
        const mineId = Number(form.mine);
        const quantity = Number(form.quantity);

        if (!mineId || !form.date || quantity <= 0) {
            toast.error("Fill all required fields with valid values.");
            return;
        }
        if (form.date > todayISO) {
            toast.error("Sales date cannot be in the future.");
            return;
        }

        const unitPrice = getUnitPriceForSale(mineId, form.date);
        if (!unitPrice) {
            toast.error("Add a production record first to set the unit price.");
            return;
        }

        const availableQty = getAvailableQuantity(mineId, form.date);
        if (quantity > availableQty) {
            toast.error("Sales quantity exceeds available production.");
            return;
        }

        try {
            await createTransaction({
                mine: mineId,
                date: form.date,
                quantity,
                payment_method: form.payment_method,
            }).unwrap();
            toast.success("Revenue transaction created. Status is pending admin approval.");
            setForm({
                mine: "",
                date: todayISO,
                quantity: "",
                payment_method: "Bank Transfer",
            });
        } catch {
            toast.error("Failed to create transaction.");
        }
    }

    const openEdit = (txId: number) => {
        const tx = transactions.find((item) => item.id === txId);
        if (!tx) return;
        setEditingId(txId);
        setEditForm({
            mine: String(tx.mine),
            date: tx.date,
            quantity: String(tx.quantity),
            payment_method: tx.payment_method,
        });
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        if (editingId === null) return;
        const mineId = Number(editForm.mine);
        const quantity = Number(editForm.quantity);

        if (!mineId || !editForm.date || quantity <= 0) {
            toast.error("Fill all required fields with valid values.");
            return;
        }
        if (editForm.date > todayISO) {
            toast.error("Sales date cannot be in the future.");
            return;
        }

        const unitPrice = getUnitPriceForSale(mineId, editForm.date);
        if (!unitPrice) {
            toast.error("Add a production record first to set the unit price.");
            return;
        }

        const availableQty = getAvailableQuantity(mineId, editForm.date, editingId);
        if (quantity > availableQty) {
            toast.error("Sales quantity exceeds available production.");
            return;
        }

        try {
            await updateTransaction({
                id: editingId,
                mine: mineId,
                date: editForm.date,
                quantity,
                payment_method: editForm.payment_method,
            }).unwrap();
            toast.success("Transaction updated. Status remains pending admin approval.");
            setShowEditModal(false);
            setEditingId(null);
        } catch {
            toast.error("Failed to update transaction.");
        }
    };

    const handleDelete = async (txId: number) => {
        try {
            await deleteTransaction(txId).unwrap();
            toast.success("Transaction deleted.");
        } catch {
            toast.error("Failed to delete transaction.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Revenue Management</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Capture transaction data. All new and edited records are submitted as Pending for admin approval.
                </p>
            </div>

            <section className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Revenue Entry</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <select
                        value={form.mine}
                        onChange={(e) => setForm((prev) => ({ ...prev, mine: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">Select Mine</option>
                        {mines.map((mine) => (
                            <option key={mine.id} value={mine.id}>
                                {mine.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                        max={todayISO}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Quantity"
                        value={form.quantity}
                        onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <select
                        value={form.payment_method}
                        onChange={(e) => setForm((prev) => ({ ...prev, payment_method: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Check">Check</option>
                    </select>
                    <button
                        onClick={onCreateTransaction}
                        disabled={creating}
                        className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {creating ? "Saving..." : "Save Entry"}
                    </button>
                </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Revenue Records</h2>
                    <span className="text-sm text-slate-500">{mappedTransactions.length} entries</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="text-left px-5 py-3">Date</th>
                                <th className="text-left px-5 py-3">Mine</th>
                                <th className="text-right px-5 py-3">Amount</th>
                                <th className="text-left px-5 py-3">Status</th>
                                <th className="text-right px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : mappedTransactions.length === 0 ? (
                                <tr>
                                    <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>
                                        No transactions available.
                                    </td>
                                </tr>
                            ) : (
                                mappedTransactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="px-5 py-3">{tx.date}</td>
                                        <td className="px-5 py-3">{tx.mineName}</td>
                                        <td className="px-5 py-3 text-right">{formatCurrency(tx.total_amount)}</td>
                                        <td className="px-5 py-3">
                                            <span className="px-2.5 py-1 rounded-full border text-xs font-medium bg-amber-100 text-amber-700 border-amber-200">
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right space-x-2">
                                            <button
                                                onClick={() => openEdit(tx.id)}
                                                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800"
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tx.id)}
                                                disabled={deleting}
                                                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 disabled:opacity-50"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-900">Edit Revenue Entry</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 rounded-lg hover:bg-slate-100"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-600">Mine</label>
                                <select
                                    value={editForm.mine}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, mine: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">Select Mine</option>
                                    {mines.map((mine) => (
                                        <option key={mine.id} value={mine.id}>
                                            {mine.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">Date</label>
                                <input
                                    type="date"
                                    value={editForm.date}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                                    max={todayISO}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">Quantity</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.quantity}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, quantity: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">Payment Method</label>
                                <select
                                    value={editForm.payment_method}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, payment_method: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Mobile Money">Mobile Money</option>
                                    <option value="Check">Check</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={updating}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {updating ? "Updating..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
