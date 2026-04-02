"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";
import {
    useCreateProductionRecordMutation,
    useCreateSalesTransactionMutation,
    useDeleteProductionRecordMutation,
    useDeleteSalesTransactionMutation,
    useGetMineCompaniesQuery,
    useGetProductionRecordsQuery,
    useGetSalesTransactionsQuery,
    useUpdateProductionRecordMutation,
    useUpdateSalesTransactionMutation,
} from "@/lib/redux/slices/MiningSlice";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

type SalesForm = { mine: string; date: string; quantity: string; payment_method: string };
type ProductionForm = { mine: string; date: string; quantity_produced: string; unit_price: string };

export default function OfficerRevenueManagementPage() {
    const { data: mines = [] } = useGetMineCompaniesQuery({});
    const { data: productionRecords = [], isLoading: loadingProduction } = useGetProductionRecordsQuery({});
    const { data: transactions = [], isLoading: loadingSales } = useGetSalesTransactionsQuery({});
    const [createProductionRecord, { isLoading: creatingProduction }] = useCreateProductionRecordMutation();
    const [updateProductionRecord] = useUpdateProductionRecordMutation();
    const [deleteProductionRecord] = useDeleteProductionRecordMutation();
    const [createTransaction, { isLoading: creatingSales }] = useCreateSalesTransactionMutation();
    const [updateTransaction] = useUpdateSalesTransactionMutation();
    const [deleteTransaction] = useDeleteSalesTransactionMutation();

    const todayISO = new Date().toISOString().split("T")[0];
    const emptySales = { mine: "", date: todayISO, quantity: "", payment_method: "Bank Transfer" };
    const emptyProduction = { mine: "", date: todayISO, quantity_produced: "", unit_price: "" };
    const [salesForm, setSalesForm] = useState<SalesForm>(emptySales);
    const [productionForm, setProductionForm] = useState<ProductionForm>(emptyProduction);
    const [editingSalesId, setEditingSalesId] = useState<number | null>(null);
    const [editingProductionId, setEditingProductionId] = useState<number | null>(null);
    const [editSalesForm, setEditSalesForm] = useState<SalesForm>(emptySales);
    const [editProductionForm, setEditProductionForm] = useState<ProductionForm>(emptyProduction);

    const mineNameById = useMemo(() => new Map(mines.map((mine) => [mine.id, mine.name])), [mines]);
    const mappedTransactions = useMemo(
        () => transactions.map((tx) => ({ ...tx, mineName: mineNameById.get(tx.mine) || `Mine #${tx.mine}` })),
        [transactions, mineNameById],
    );
    const mappedProduction = useMemo(
        () => productionRecords.map((record) => ({
            ...record,
            mineName: mineNameById.get(record.mine) || `Mine #${record.mine}`,
            totalRevenue: record.total_revenue || record.quantity_produced * record.unit_price,
        })),
        [productionRecords, mineNameById],
    );

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

    const submitProduction = async (form: ProductionForm, recordId?: number | null) => {
        const mineId = Number(form.mine);
        const quantity = Number(form.quantity_produced);
        const unitPrice = Number(form.unit_price);
        if (!mineId || !form.date || quantity <= 0 || unitPrice <= 0) return toast.error("Fill all production fields.");
        if (form.date > todayISO) return toast.error("Production date cannot be in the future.");
        try {
            const payload = { mine: mineId, date: form.date, quantity_produced: quantity, unit_price: unitPrice };
            if (recordId) {
                await updateProductionRecord({ id: recordId, ...payload }).unwrap();
                toast.success("Production updated and returned for admin validation.");
            } else {
                await createProductionRecord(payload).unwrap();
                toast.success("Production created and submitted for admin approval.");
                setProductionForm(emptyProduction);
            }
            setEditingProductionId(null);
        } catch {
            toast.error("Failed to save production.");
        }
    };

    const submitSales = async (form: SalesForm, recordId?: number | null) => {
        const mineId = Number(form.mine);
        const quantity = Number(form.quantity);
        if (!mineId || !form.date || quantity <= 0) return toast.error("Fill all sales fields.");
        if (form.date > todayISO) return toast.error("Sales date cannot be in the future.");
        if (!getUnitPriceForSale(mineId, form.date)) return toast.error("Add a production record first to set the unit price.");
        if (quantity > getAvailableQuantity(mineId, form.date, recordId)) return toast.error("Sales quantity exceeds available production.");
        try {
            const payload = { mine: mineId, date: form.date, quantity, payment_method: form.payment_method };
            if (recordId) {
                await updateTransaction({ id: recordId, ...payload }).unwrap();
                toast.success("Transaction updated and sent back for admin validation.");
            } else {
                await createTransaction(payload).unwrap();
                toast.success("Revenue transaction created. Status is pending admin approval.");
                setSalesForm(emptySales);
            }
            setEditingSalesId(null);
        } catch {
            toast.error("Failed to save transaction.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Revenue Management</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Officers can create and edit production and sales records, while admin keeps the final validation role.
                </p>
            </div>
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Add Production Entry</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select value={productionForm.mine} onChange={(e) => setProductionForm((prev) => ({ ...prev, mine: e.target.value }))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
                            <option value="">Select Mine</option>
                            {mines.map((mine) => <option key={mine.id} value={mine.id}>{mine.name}</option>)}
                        </select>
                        <input type="date" value={productionForm.date} max={todayISO} onChange={(e) => setProductionForm((prev) => ({ ...prev, date: e.target.value }))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        <input type="number" min="0" step="0.01" placeholder="Quantity Produced" value={productionForm.quantity_produced} onChange={(e) => setProductionForm((prev) => ({ ...prev, quantity_produced: e.target.value }))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        <input type="number" min="0" step="0.01" placeholder="Unit Price" value={productionForm.unit_price} onChange={(e) => setProductionForm((prev) => ({ ...prev, unit_price: e.target.value }))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <button onClick={() => submitProduction(productionForm)} disabled={creatingProduction} className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                        {creatingProduction ? "Saving..." : "Save Production"}
                    </button>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Add Revenue Entry</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select value={salesForm.mine} onChange={(e) => setSalesForm((prev) => ({ ...prev, mine: e.target.value }))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
                            <option value="">Select Mine</option>
                            {mines.map((mine) => <option key={mine.id} value={mine.id}>{mine.name}</option>)}
                        </select>
                        <input type="date" value={salesForm.date} max={todayISO} onChange={(e) => setSalesForm((prev) => ({ ...prev, date: e.target.value }))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        <input type="number" min="0" step="0.01" placeholder="Quantity" value={salesForm.quantity} onChange={(e) => setSalesForm((prev) => ({ ...prev, quantity: e.target.value }))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        <select value={salesForm.payment_method} onChange={(e) => setSalesForm((prev) => ({ ...prev, payment_method: e.target.value }))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cash">Cash</option>
                            <option value="Mobile Money">Mobile Money</option>
                            <option value="Check">Check</option>
                        </select>
                    </div>
                    <button onClick={() => submitSales(salesForm)} disabled={creatingSales} className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                        {creatingSales ? "Saving..." : "Save Revenue"}
                    </button>
                </div>
            </section>
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Production Records</h2>
                    <span className="text-sm text-slate-500">{mappedProduction.length} entries</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="text-left px-5 py-3">Date</th>
                                <th className="text-left px-5 py-3">Mine</th>
                                <th className="text-right px-5 py-3">Quantity</th>
                                <th className="text-right px-5 py-3">Revenue</th>
                                <th className="text-left px-5 py-3">Status</th>
                                <th className="text-right px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loadingProduction ? <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={6}>Loading production records...</td></tr> : mappedProduction.length === 0 ? <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={6}>No production records available.</td></tr> : mappedProduction.map((record) => (
                                <tr key={record.id}>
                                    <td className="px-5 py-3">{editingProductionId === record.id ? <input type="date" value={editProductionForm.date} max={todayISO} onChange={(e) => setEditProductionForm((prev) => ({ ...prev, date: e.target.value }))} className="border border-slate-200 rounded px-2 py-1" /> : record.date}</td>
                                    <td className="px-5 py-3">{editingProductionId === record.id ? <select value={editProductionForm.mine} onChange={(e) => setEditProductionForm((prev) => ({ ...prev, mine: e.target.value }))} className="border border-slate-200 rounded px-2 py-1"><option value="">Select Mine</option>{mines.map((mine) => <option key={mine.id} value={mine.id}>{mine.name}</option>)}</select> : record.mineName}</td>
                                    <td className="px-5 py-3 text-right">{editingProductionId === record.id ? <input type="number" min="0" step="0.01" value={editProductionForm.quantity_produced} onChange={(e) => setEditProductionForm((prev) => ({ ...prev, quantity_produced: e.target.value }))} className="border border-slate-200 rounded px-2 py-1 w-28 text-right" /> : record.quantity_produced.toLocaleString()}</td>
                                    <td className="px-5 py-3 text-right">{editingProductionId === record.id ? <input type="number" min="0" step="0.01" value={editProductionForm.unit_price} onChange={(e) => setEditProductionForm((prev) => ({ ...prev, unit_price: e.target.value }))} className="border border-slate-200 rounded px-2 py-1 w-28 text-right" /> : formatCurrency(record.totalRevenue)}</td>
                                    <td className="px-5 py-3">{record.status || "Pending"}</td>
                                    <td className="px-5 py-3 text-right space-x-2">
                                        {editingProductionId === record.id ? <button onClick={() => submitProduction(editProductionForm, record.id)} className="text-emerald-700 hover:text-emerald-800">Save</button> : <button onClick={() => { setEditingProductionId(record.id); setEditProductionForm({ mine: String(record.mine), date: record.date, quantity_produced: String(record.quantity_produced), unit_price: String(record.unit_price) }); }} className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800"><Edit size={14} />Edit</button>}
                                        <button onClick={() => deleteProductionRecord(record.id).unwrap().then(() => toast.success("Production deleted.")).catch(() => toast.error("Failed to delete production."))} className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700"><Trash2 size={14} />Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                            {loadingSales ? <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={5}>Loading transactions...</td></tr> : mappedTransactions.length === 0 ? <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={5}>No transactions available.</td></tr> : mappedTransactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td className="px-5 py-3">{editingSalesId === tx.id ? <input type="date" value={editSalesForm.date} max={todayISO} onChange={(e) => setEditSalesForm((prev) => ({ ...prev, date: e.target.value }))} className="border border-slate-200 rounded px-2 py-1" /> : tx.date}</td>
                                    <td className="px-5 py-3">{editingSalesId === tx.id ? <select value={editSalesForm.mine} onChange={(e) => setEditSalesForm((prev) => ({ ...prev, mine: e.target.value }))} className="border border-slate-200 rounded px-2 py-1"><option value="">Select Mine</option>{mines.map((mine) => <option key={mine.id} value={mine.id}>{mine.name}</option>)}</select> : tx.mineName}</td>
                                    <td className="px-5 py-3 text-right">{editingSalesId === tx.id ? <input type="number" min="0" step="0.01" value={editSalesForm.quantity} onChange={(e) => setEditSalesForm((prev) => ({ ...prev, quantity: e.target.value }))} className="border border-slate-200 rounded px-2 py-1 w-28 text-right" /> : formatCurrency(tx.total_amount)}</td>
                                    <td className="px-5 py-3">{tx.status}</td>
                                    <td className="px-5 py-3 text-right space-x-2">
                                        {editingSalesId === tx.id ? (
                                            <>
                                                <select value={editSalesForm.payment_method} onChange={(e) => setEditSalesForm((prev) => ({ ...prev, payment_method: e.target.value }))} className="border border-slate-200 rounded px-2 py-1 mr-2">
                                                    <option value="Bank Transfer">Bank Transfer</option>
                                                    <option value="Cash">Cash</option>
                                                    <option value="Mobile Money">Mobile Money</option>
                                                    <option value="Check">Check</option>
                                                </select>
                                                <button onClick={() => submitSales(editSalesForm, tx.id)} className="text-blue-700 hover:text-blue-800">Save</button>
                                            </>
                                        ) : <button onClick={() => { setEditingSalesId(tx.id); setEditSalesForm({ mine: String(tx.mine), date: tx.date, quantity: String(tx.quantity), payment_method: tx.payment_method }); }} className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800"><Edit size={14} />Edit</button>}
                                        <button onClick={() => deleteTransaction(tx.id).unwrap().then(() => toast.success("Transaction deleted.")).catch(() => toast.error("Failed to delete transaction."))} className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700"><Trash2 size={14} />Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
