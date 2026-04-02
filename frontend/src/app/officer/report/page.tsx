"use client";

import React, { useMemo, useState } from "react";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    useGetMineCompaniesQuery,
    useGetSalesTransactionsQuery,
} from "@/lib/redux/slices/MiningSlice";

type ReportRow = {
    id: number;
    date: string;
    siteName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    flagged: string;
};

function downloadRevenuePdf(
    filename: string,
    periodLabel: string,
    siteLabel: string,
    rows: ReportRow[],
) {
    const doc = new jsPDF();
    const isAllSites = siteLabel === "All Sites";
    const headers = isAllSites
        ? ["ID", "Date", "Site Name", "Quantity", "Unit Price", "Total Amount", "Payment Method", "Status", "Flagged"]
        : ["ID", "Date", "Quantity", "Unit Price", "Total Amount", "Payment Method", "Status", "Flagged"];
    const body = rows.map((row) =>
        isAllSites
            ? [
                String(row.id),
                row.date,
                row.siteName,
                String(row.quantity),
                String(row.unitPrice),
                String(row.totalAmount),
                row.paymentMethod,
                row.status,
                row.flagged,
            ]
            : [
                String(row.id),
                row.date,
                String(row.quantity),
                String(row.unitPrice),
                String(row.totalAmount),
                row.paymentMethod,
                row.status,
                row.flagged,
            ],
    );

    doc.setFontSize(16);
    doc.text("Officer Revenue Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Period: ${periodLabel}`, 14, 26);
    let startY = 32;
    if (!isAllSites) {
        doc.text(`Site Name: ${siteLabel}`, 14, 32);
        startY = 38;
    }
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, startY);

    autoTable(doc, {
        startY: startY + 6,
        head: [headers],
        body,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(filename);
}

function downloadSitesPdf(filename: string, rows: string[][]) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Site Status Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

    autoTable(doc, {
        startY: 32,
        head: [["Site Name", "Location", "Mineral", "Status", "License"]],
        body: rows,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 118, 110], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(filename);
}

export default function OfficerReportPage() {
    const { data: mines = [] } = useGetMineCompaniesQuery({});
    const { data: transactions = [], isLoading } = useGetSalesTransactionsQuery({});

    const todayISO = new Date().toISOString().split("T")[0];
    const defaultFrom = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0];
    const [selectedSite, setSelectedSite] = useState("All Sites");
    const [dateFrom, setDateFrom] = useState(defaultFrom);
    const [dateTo, setDateTo] = useState(todayISO);

    const rows = useMemo(() => {
        const mineMap = new Map(mines.map((mine) => [mine.id, mine.name]));
        return transactions
            .filter((tx) => selectedSite === "All Sites" || mineMap.get(tx.mine) === selectedSite)
            .filter((tx) => (!dateFrom || tx.date >= dateFrom) && (!dateTo || tx.date <= dateTo))
            .map((tx) => ({
                id: tx.id,
                date: tx.date,
                siteName: mineMap.get(tx.mine) || `Mine #${tx.mine}`,
                quantity: tx.quantity,
                unitPrice: tx.unit_price,
                totalAmount: tx.total_amount,
                paymentMethod: tx.payment_method,
                status: tx.status,
                flagged: tx.is_flagged ? "Yes" : "No",
            }));
    }, [transactions, mines, selectedSite, dateFrom, dateTo]);

    const siteRows = useMemo(
        () =>
            mines.map((mine) => [
                mine.name,
                mine.location,
                mine.mineral_type,
                mine.status,
                mine.license_number,
            ]),
        [mines],
    );

    const periodLabel = `${dateFrom || "Start"} to ${dateTo || "Today"}`;

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Officer Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Export site-aware revenue reports and track which mining sites are still active.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                        onClick={() =>
                            downloadRevenuePdf(
                                `officer-revenue-${todayISO}.pdf`,
                                periodLabel,
                                selectedSite,
                                rows,
                            )
                        }
                        disabled={rows.length === 0}
                    >
                        <Download size={16} />
                        Export Revenue PDF
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50"
                        onClick={() => downloadSitesPdf(`officer-sites-${todayISO}.pdf`, siteRows)}
                        disabled={siteRows.length === 0}
                    >
                        <Download size={16} />
                        Export Sites PDF
                    </button>
                </div>
            </div>

            <section className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                        value={selectedSite}
                        onChange={(e) => setSelectedSite(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    >
                        <option>All Sites</option>
                        {mines.map((mine) => (
                            <option key={mine.id}>{mine.name}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        max={todayISO}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Revenue Transactions</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Period: {periodLabel}
                        {selectedSite !== "All Sites" ? ` | Site Name: ${selectedSite}` : ""}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="text-left px-5 py-3">Date</th>
                                <th className="text-left px-5 py-3">Site Name</th>
                                <th className="text-right px-5 py-3">Quantity</th>
                                <th className="text-right px-5 py-3">Amount</th>
                                <th className="text-left px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>
                                        Loading report data...
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>
                                        No records available for the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-5 py-3">{row.date}</td>
                                        <td className="px-5 py-3">{row.siteName}</td>
                                        <td className="px-5 py-3 text-right">{row.quantity.toLocaleString()}</td>
                                        <td className="px-5 py-3 text-right">{row.totalAmount.toLocaleString()}</td>
                                        <td className="px-5 py-3">{row.status}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Site Status Report</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Track active, inactive, and other site states directly from the reporting page.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="text-left px-5 py-3">Site Name</th>
                                <th className="text-left px-5 py-3">Location</th>
                                <th className="text-left px-5 py-3">Mineral</th>
                                <th className="text-left px-5 py-3">Status</th>
                                <th className="text-left px-5 py-3">License</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {siteRows.length === 0 ? (
                                <tr>
                                    <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>
                                        No site records available.
                                    </td>
                                </tr>
                            ) : (
                                siteRows.map((row) => (
                                    <tr key={row[4]}>
                                        {row.map((value) => (
                                            <td key={`${row[4]}-${value}`} className="px-5 py-3">
                                                {value}
                                            </td>
                                        ))}
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
