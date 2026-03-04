"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    TransactionStatus,
    useCreateSalesTransactionMutation,
    useGetMineCompaniesQuery,
    useGetSalesTransactionsQuery,
    useUpdateSalesTransactionStatusMutation,
} from "@/lib/redux/slices/MiningSlice";

const statusStyles: Record<TransactionStatus, string> = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

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
    const { data: transactions = [], isLoading } = useGetSalesTransactionsQuery({});
    const [createTransaction, { isLoading: creating }] = useCreateSalesTransactionMutation();
    const [updateStatus, { isLoading: updatingStatus }] = useUpdateSalesTransactionStatusMutation();

    const [form, setForm] = useState({
        mine: "",
        date: new Date().toISOString().split("T")[0],
        quantity: "",
        unit_price: "",
        payment_method: "Bank Transfer",
    });

    const mappedTransactions = useMemo(() => {
        const mineMap = new Map(mines.map((mine) => [mine.id, mine.name]));
        return transactions.map((tx) => ({
            ...tx,
            mineName: mineMap.get(tx.mine) || `Mine #${tx.mine}`,
        }));
    }, [transactions, mines]);

    async function onCreateTransaction() {
        const mineId = Number(form.mine);
        const quantity = Number(form.quantity);
        const unitPrice = Number(form.unit_price);

        if (!mineId || !form.date || quantity <= 0 || unitPrice <= 0) {
            toast.error("Fill all required fields with valid values.");
            return;
        }

        try {
            await createTransaction({
                mine: mineId,
                date: form.date,
                quantity,
                unit_price: unitPrice,
                payment_method: form.payment_method,
            }).unwrap();
            toast.success("Revenue transaction created.");
            setForm({
                mine: "",
                date: new Date().toISOString().split("T")[0],
                quantity: "",
                unit_price: "",
                payment_method: "Bank Transfer",
            });
        } catch {
            toast.error("Failed to create transaction.");
        }
    }

    async function onStatusChange(id: number, status: TransactionStatus) {
        try {
            await updateStatus({ id, status }).unwrap();
            toast.success(`Transaction marked as ${status}.`);
        } catch {
            toast.error("Failed to update status.");
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Revenue Management</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Capture transaction data and validate entries for financial transparency.
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
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Unit price"
                        value={form.unit_price}
                        onChange={(e) => setForm((prev) => ({ ...prev, unit_price: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
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
                                            <span
                                                className={`px-2.5 py-1 rounded-full border text-xs font-medium ${statusStyles[tx.status]}`}
                                            >
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right space-x-2">
                                            <button
                                                disabled={updatingStatus || tx.status === "Approved"}
                                                className="text-emerald-700 hover:underline disabled:text-slate-300"
                                                onClick={() => onStatusChange(tx.id, "Approved")}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                disabled={updatingStatus || tx.status === "Rejected"}
                                                className="text-rose-700 hover:underline disabled:text-slate-300"
                                                onClick={() => onStatusChange(tx.id, "Rejected")}
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
