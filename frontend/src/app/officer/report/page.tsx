"use client";

import React, { useMemo } from "react";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    useGetMineCompaniesQuery,
    useGetSalesTransactionsQuery,
} from "@/lib/redux/slices/MiningSlice";

function downloadPdf(filename: string, headers: string[], rows: string[][]) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Officer Revenue Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

    autoTable(doc, {
        startY: 32,
        head: [headers],
        body: rows,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(filename);
}

export default function OfficerReportPage() {
    const { data: mines = [] } = useGetMineCompaniesQuery({});
    const { data: transactions = [], isLoading } = useGetSalesTransactionsQuery({});

    const rows = useMemo(() => {
        const mineMap = new Map(mines.map((mine) => [mine.id, mine.name]));
        return transactions.map((tx) => [
            String(tx.id),
            String(tx.date),
            mineMap.get(tx.mine) || `Mine #${tx.mine}`,
            String(tx.quantity),
            String(tx.unit_price),
            String(tx.total_amount),
            String(tx.payment_method),
            String(tx.status),
            tx.is_flagged ? "Yes" : "No",
        ]);
    }, [transactions, mines]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Officer Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Export current transaction records for compliance and review.
                    </p>
                </div>
                <button
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                    onClick={() =>
                        downloadPdf(`officer-revenue-${new Date().toISOString().split("T")[0]}.pdf`, [
                            "ID",
                            "Date",
                            "Mine",
                            "Quantity",
                            "Unit Price",
                            "Total Amount",
                            "Payment Method",
                            "Status",
                            "Flagged",
                        ], rows)
                    }
                    disabled={rows.length === 0}
                >
                    <Download size={16} />
                    Export PDF
                </button>
            </div>

            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Latest Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="text-left px-5 py-3">Date</th>
                                <th className="text-left px-5 py-3">Mine</th>
                                <th className="text-right px-5 py-3">Amount</th>
                                <th className="text-left px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td className="px-5 py-8 text-center text-slate-500" colSpan={4}>
                                        Loading report data...
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td className="px-5 py-8 text-center text-slate-500" colSpan={4}>
                                        No records available.
                                    </td>
                                </tr>
                            ) : (
                                rows.slice(0, 20).map((row, idx) => (
                                    <tr key={`${row[0]}-${idx}`}>
                                        <td className="px-5 py-3">{row[1]}</td>
                                        <td className="px-5 py-3">{row[2]}</td>
                                        <td className="px-5 py-3 text-right">{Number(row[5]).toLocaleString()}</td>
                                        <td className="px-5 py-3">{row[7]}</td>
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
