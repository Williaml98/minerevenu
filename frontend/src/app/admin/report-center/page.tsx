'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
    FileText,
    Trash2, RefreshCw, FileSpreadsheet, File,
    PieChart, TrendingUp, AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { useGetAuditLogsQuery } from "@/lib/redux/slices/AuditLogSlice";
import { useGetMyDetailsMutation } from "@/lib/redux/slices/AuthSlice";
import {
    useGetMineCompaniesQuery,
    useGetProductionRecordsQuery,
    useGetSalesTransactionsQuery,
    useGetForecastQuery
} from "@/lib/redux/slices/MiningSlice";

// Types
interface Report {
    id: string;
    name: string;
    type: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
    period: string;
    generatedOn: string;
    createdBy: string;
    dataType: 'audit' | 'companies' | 'production' | 'sales' | 'forecast' | 'availability' | 'sites';
    selectedSite: string;
    dateRange: DateRange;
}

interface DateRange {
    from: string;
    to: string;
}

type ReportType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
type DataType = 'audit' | 'companies' | 'production' | 'sales' | 'forecast' | 'availability' | 'sites';
type DataRecord = Record<string, unknown>;
type ReportColumn = { header: string; dataKey: string };
type SalesRow = { total_amount: number; unit_price: number; quantity: number };
type ProductionRow = { quantity_produced: number };
type CompanyRow = { id: number | string; name: string };

const toDateInput = (value: unknown): string | number | Date | null => {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') return value;
    return null;
};

export default function ReportCenter() {
    // API Queries
    const { data: auditLogs = [], isLoading: auditLoading } = useGetAuditLogsQuery({});
    const { data: companies = [], isLoading: companiesLoading } = useGetMineCompaniesQuery({});
    const { data: productionRecords = [], isLoading: productionLoading } = useGetProductionRecordsQuery({});
    const { data: salesTransactions = [], isLoading: salesLoading } = useGetSalesTransactionsQuery({});
    const { data: forecasts = [], isLoading: forecastLoading } = useGetForecastQuery({});
    const [getMyDetails] = useGetMyDetailsMutation();
    const [exportedBy, setExportedBy] = useState<string>("Unknown user");
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

    // State Management
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReportType, setSelectedReportType] = useState<ReportType>('Monthly');
    const [selectedDataType, setSelectedDataType] = useState<DataType>('sales');
    const [dateRange, setDateRange] = useState<DateRange>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [selectedSite, setSelectedSite] = useState<string>('all');
    const [isGenerating, setIsGenerating] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await getMyDetails({}).unwrap();
                const name = res?.username || res?.email || "Unknown user";
                setExportedBy(name);
            } catch {
                setExportedBy("Unknown user");
            }
        };
        loadUser();
    }, [getMyDetails]);

    useEffect(() => {
        const loadLogo = async () => {
            try {
                const res = await fetch("/logo.png");
                const blob = await res.blob();
                const reader = new FileReader();
                reader.onload = () => setLogoDataUrl(String(reader.result));
                reader.readAsDataURL(blob);
            } catch {
                setLogoDataUrl(null);
            }
        };
        loadLogo();
    }, []);

    const availabilityData = useMemo(() => {
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        const siteFilterId = selectedSite === 'all' ? null : parseInt(selectedSite);
        const companyNameById = new Map((companies as CompanyRow[]).map((c) => [Number(c.id), c.name]));

        const producedByMine = new Map<number, number>();
        (productionRecords as DataRecord[]).forEach((record) => {
            const recordDate = new Date(record["date"] as string);
            if (Number.isNaN(recordDate.getTime())) return;
            if (recordDate < fromDate || recordDate > toDate) return;
            const mineId = Number(record["mine"]);
            if (siteFilterId !== null && mineId !== siteFilterId) return;
            const qty = Number(record["quantity_produced"] || 0);
            producedByMine.set(mineId, (producedByMine.get(mineId) || 0) + qty);
        });

        const soldByMine = new Map<number, number>();
        (salesTransactions as DataRecord[]).forEach((sale) => {
            const saleDate = new Date(sale["date"] as string);
            if (Number.isNaN(saleDate.getTime())) return;
            if (saleDate < fromDate || saleDate > toDate) return;
            const mineId = Number(sale["mine"]);
            if (siteFilterId !== null && mineId !== siteFilterId) return;
            const qty = Number(sale["quantity"] || 0);
            soldByMine.set(mineId, (soldByMine.get(mineId) || 0) + qty);
        });

        const mineIds = new Set<number>([...producedByMine.keys(), ...soldByMine.keys()]);
        return Array.from(mineIds).map((mineId) => {
            const produced = producedByMine.get(mineId) || 0;
            const sold = soldByMine.get(mineId) || 0;
            return {
                mine_id: mineId,
                mine_name: companyNameById.get(mineId) || `Mine #${mineId}`,
                produced_quantity: produced,
                sold_quantity: sold,
                available_quantity: Math.max(0, produced - sold),
                as_of: dateRange.to,
            };
        });
    }, [productionRecords, salesTransactions, companies, dateRange, selectedSite]);

    const getSiteLabel = (siteValue: string) => {
        if (siteValue === 'all') return 'All Sites';
        const site = (companies as CompanyRow[]).find((company) => String(company.id) === siteValue);
        return site?.name || `Mine #${siteValue}`;
    };

    const siteStatusData = useMemo(() => {
        return (companies as DataRecord[]).map((company) => ({
            site_name: company["name"],
            location: company["location"],
            mineral_type: company["mineral_type"],
            status: company["status"],
            license_number: company["license_number"],
            created_at: company["created_at"],
        }));
    }, [companies]);

    // Filter data based on date range and site
    const filteredData = useMemo(() => {
        const filterByDate = <T extends DataRecord>(items: T[], dateField: string): T[] => {
            return items.filter(item => {
                const rawDateValue = item[dateField] ?? item['timestamp'] ?? item['date'] ?? item['forecast_date'];
                const dateInput = toDateInput(rawDateValue);
                if (dateInput === null) return false;
                const itemDate = new Date(dateInput);
                if (Number.isNaN(itemDate.getTime())) return false;
                return itemDate >= new Date(dateRange.from) && itemDate <= new Date(dateRange.to);
            });
        };

        const filterBySite = <T extends DataRecord>(items: T[]): T[] => {
            if (selectedSite === 'all') return items;
            return items.filter(item => item.mine === parseInt(selectedSite) || item.id === parseInt(selectedSite));
        };

        switch (selectedDataType) {
            case 'audit':
                return filterByDate(auditLogs as DataRecord[], 'timestamp');
            case 'companies':
                return companies as DataRecord[];
            case 'production':
                return filterBySite(filterByDate(productionRecords as DataRecord[], 'date'));
            case 'sales':
                return filterBySite(filterByDate(salesTransactions as DataRecord[], 'date'));
            case 'forecast':
                return filterByDate(forecasts as DataRecord[], 'forecast_date');
            case 'availability':
                return availabilityData as DataRecord[];
            case 'sites':
                return siteStatusData as DataRecord[];
            default:
                return [];
        }
    }, [selectedDataType, dateRange, selectedSite, auditLogs, companies, productionRecords, salesTransactions, forecasts, availabilityData, siteStatusData]);

    // Generate report
    const generateReport = () => {
        setIsGenerating(true);

        const newReport: Report = {
            id: Date.now().toString(),
            name: `${selectedDataType.charAt(0).toUpperCase() + selectedDataType.slice(1)} Report - ${selectedReportType} - ${new Date().toLocaleDateString()}`,
            type: selectedReportType,
            period: `${dateRange.from} to ${dateRange.to}`,
            generatedOn: new Date().toISOString(),
            createdBy: exportedBy,
            dataType: selectedDataType,
            selectedSite,
            dateRange: { ...dateRange },
        };

        setReports([newReport, ...reports]);
        setIsGenerating(false);
    };

    const getReportData = (report: Report): DataRecord[] => {
        const siteValue = report.selectedSite;
        const from = report.dateRange.from;
        const to = report.dateRange.to;
        const filterByDate = (items: DataRecord[], dateField: string) =>
            items.filter((item) => {
                const rawDateValue = item[dateField] ?? item['timestamp'] ?? item['date'] ?? item['forecast_date'];
                const dateInput = toDateInput(rawDateValue);
                if (dateInput === null) return false;
                const itemDate = new Date(dateInput);
                if (Number.isNaN(itemDate.getTime())) return false;
                return itemDate >= new Date(from) && itemDate <= new Date(to);
            });
        const filterBySite = (items: DataRecord[]) => {
            if (siteValue === 'all') return items;
            return items.filter((item) => String(item.mine ?? item.id) === siteValue);
        };

        switch (report.dataType) {
            case 'audit':
                return filterByDate(auditLogs as DataRecord[], 'timestamp');
            case 'companies':
                return companies as DataRecord[];
            case 'production':
                return filterBySite(filterByDate(productionRecords as DataRecord[], 'date'));
            case 'sales':
                return filterBySite(
                    filterByDate(salesTransactions as DataRecord[], 'date').map((sale) => ({
                        ...sale,
                        site_name: getSiteLabel(String(sale.mine)),
                    })),
                );
            case 'forecast':
                return filterByDate(forecasts as DataRecord[], 'forecast_date');
            case 'availability':
                return (availabilityData as DataRecord[]).filter((row) => siteValue === 'all' || String(row.mine_id) === siteValue);
            case 'sites':
                return siteStatusData as DataRecord[];
            default:
                return [];
        }
    };

    // Export to PDF
    const exportToPDF = (report: Report) => {
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Header with logo
        if (logoDataUrl) {
            doc.addImage(logoDataUrl, "PNG", 14, 10, 26, 26);
        }
        doc.setFontSize(18);
        doc.text(report.name, 46, 22);
        doc.setDrawColor(200);
        doc.line(14, 38, pageWidth - 14, 38);

        // Metadata
        doc.setFontSize(10);
        doc.text(`Period: ${report.period}`, 14, 46);
        const reportSiteLabel = getSiteLabel(report.selectedSite);
        if (report.dataType === 'sales' && report.selectedSite !== 'all') {
            doc.text(`Site Name: ${reportSiteLabel}`, 14, 52);
            doc.text(`Generated: ${new Date(report.generatedOn).toLocaleString()}`, 14, 58);
        } else {
            doc.text(`Generated: ${new Date(report.generatedOn).toLocaleString()}`, 14, 52);
        }

        const data: DataRecord[] = getReportData(report);
        let columns: ReportColumn[] = [];

        switch (report.dataType) {
            case 'audit':
                columns = [
                    { header: 'Timestamp', dataKey: 'timestamp' },
                    { header: 'User', dataKey: 'target_user' },
                    { header: 'Action', dataKey: 'action' },
                    { header: 'IP Address', dataKey: 'ip_address' },
                    { header: 'User Agent', dataKey: 'user_agent' }
                ];
                break;
            case 'companies':
                columns = [
                    { header: 'Name', dataKey: 'name' },
                    { header: 'Location', dataKey: 'location' },
                    { header: 'License', dataKey: 'license_number' },
                    { header: 'Mineral Type', dataKey: 'mineral_type' },
                    { header: 'Status', dataKey: 'status' },
                    { header: 'Created', dataKey: 'created_at' }
                ];
                break;
            case 'production':
                columns = [
                    { header: 'Date', dataKey: 'date' },
                    { header: 'Quantity Produced', dataKey: 'quantity_produced' },
                    { header: 'Unit Price', dataKey: 'unit_price' },
                    { header: 'Total Revenue', dataKey: 'total_revenue' },
                    { header: 'Mine ID', dataKey: 'mine' }
                ];
                break;
            case 'sales':
                columns = report.selectedSite === 'all' ? [
                    { header: 'Site Name', dataKey: 'site_name' },
                    { header: 'Date', dataKey: 'date' },
                    { header: 'Quantity', dataKey: 'quantity' },
                    { header: 'Unit Price', dataKey: 'unit_price' },
                    { header: 'Total Amount', dataKey: 'total_amount' },
                    { header: 'Payment Method', dataKey: 'payment_method' },
                    { header: 'Flagged', dataKey: 'is_flagged' }
                ] : [
                    { header: 'Date', dataKey: 'date' },
                    { header: 'Quantity', dataKey: 'quantity' },
                    { header: 'Unit Price', dataKey: 'unit_price' },
                    { header: 'Total Amount', dataKey: 'total_amount' },
                    { header: 'Payment Method', dataKey: 'payment_method' },
                    { header: 'Flagged', dataKey: 'is_flagged' }
                ];
                break;
            case 'forecast':
                columns = [
                    { header: 'Forecast Date', dataKey: 'forecast_date' },
                    { header: 'Predicted Revenue', dataKey: 'predicted_revenue' },
                    { header: 'Model Version', dataKey: 'model_version' },
                    { header: 'Created', dataKey: 'created_at' }
                ];
                break;
            case 'availability':
                columns = [
                    { header: 'Mine ID', dataKey: 'mine_id' },
                    { header: 'Mine Name', dataKey: 'mine_name' },
                    { header: 'Produced Quantity', dataKey: 'produced_quantity' },
                    { header: 'Sold Quantity', dataKey: 'sold_quantity' },
                    { header: 'Available Quantity', dataKey: 'available_quantity' },
                    { header: 'As Of', dataKey: 'as_of' }
                ];
                break;
            case 'sites':
                columns = [
                    { header: 'Site Name', dataKey: 'site_name' },
                    { header: 'Location', dataKey: 'location' },
                    { header: 'Mineral Type', dataKey: 'mineral_type' },
                    { header: 'Status', dataKey: 'status' },
                    { header: 'License Number', dataKey: 'license_number' },
                    { header: 'Created', dataKey: 'created_at' }
                ];
                break;
        }

        // Add table
        autoTable(doc, {
            startY: report.dataType === 'sales' && report.selectedSite !== 'all' ? 66 : 60,
            head: [columns.map(col => col.header)],
            body: data.map(item => columns.map(col => {
                const value = item[col.dataKey];
                if (typeof value === 'object') return JSON.stringify(value);
                if (col.dataKey.includes('revenue') || col.dataKey.includes('amount') || col.dataKey.includes('price')) {
                    const numericValue = typeof value === 'number'
                        ? value
                        : typeof value === 'string'
                            ? Number(value)
                            : NaN;
                    if (Number.isFinite(numericValue)) {
                        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericValue);
                    }
                    return '';
                }
                return value?.toString() || '';
            })),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`Exported by: ${report.createdBy}`, 14, pageHeight - 12);
        doc.text(`Page 1`, pageWidth - 30, pageHeight - 12);

        // Save PDF
        doc.save(`${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    };

    // Export to Excel
    const exportToExcel = (report: Report) => {
        const data: DataRecord[] = getReportData(report);
        let sheetName = '';

        switch (report.dataType) {
            case 'audit':
                sheetName = 'Audit Logs';
                break;
            case 'companies':
                sheetName = 'Mining Companies';
                break;
            case 'production':
                sheetName = 'Production Records';
                break;
            case 'sales':
                sheetName = 'Sales Transactions';
                break;
            case 'forecast':
                sheetName = 'Forecasts';
                break;
            case 'availability':
                sheetName = 'Availability';
                break;
            case 'sites':
                sheetName = 'Site Status';
                break;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, `${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`);
    };

    const handleDeleteReport = (id: string) => {
        if (confirm('Are you sure you want to delete this report?')) {
            setReports(reports.filter(r => r.id !== id));
        }
    };

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'Daily': return 'bg-green-100 text-green-700';
            case 'Weekly': return 'bg-yellow-100 text-yellow-700';
            case 'Monthly': return 'bg-blue-100 text-blue-700';
            case 'Yearly': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getDataTypeIcon = (type: DataType) => {
        switch (type) {
            case 'audit': return <FileText size={16} className="text-gray-600" />;
            case 'companies': return <FileText size={16} className="text-blue-600" />;
            case 'production': return <TrendingUp size={16} className="text-green-600" />;
            case 'sales': return <PieChart size={16} className="text-orange-600" />;
            case 'forecast': return <AlertCircle size={16} className="text-purple-600" />;
            case 'availability': return <TrendingUp size={16} className="text-indigo-600" />;
            case 'sites': return <FileText size={16} className="text-teal-600" />;
        }
    };

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        const totalRevenue = (salesTransactions as SalesRow[]).reduce((sum: number, sale: SalesRow) => sum + sale.total_amount, 0);
        const totalProduction = (productionRecords as ProductionRow[]).reduce((sum: number, prod: ProductionRow) => sum + prod.quantity_produced, 0);
        const totalSoldQuantity = (salesTransactions as SalesRow[]).reduce((sum: number, sale: SalesRow) => sum + (sale.quantity || 0), 0);
        const avgUnitPrice = salesTransactions.length > 0
            ? (salesTransactions as SalesRow[]).reduce((sum: number, sale: SalesRow) => sum + sale.unit_price, 0) / salesTransactions.length
            : 0;

        return { totalRevenue, totalProduction, avgUnitPrice, totalSoldQuantity, availableProduction: Math.max(0, totalProduction - totalSoldQuantity) };
    }, [salesTransactions, productionRecords]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-[1600px] mx-auto">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Report Center</h1>
                    <p className="text-gray-600 mt-2">Generate, customize, and manage dynamic reports with PDF/Excel export.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                            <PieChart size={20} className="text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summaryStats.totalRevenue)}
                        </p>
                        <p className="text-sm text-green-600 mt-2">Up 12.5% from last period</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-500">Total Production</h3>
                            <TrendingUp size={20} className="text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{summaryStats.totalProduction.toFixed(2)} tons</p>
                        <p className="text-sm text-green-600 mt-2">Up 8.2% from last period</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-500">Avg Unit Price</h3>
                            <AlertCircle size={20} className="text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summaryStats.avgUnitPrice)}
                        </p>
                        <p className="text-sm text-yellow-600 mt-2">Stable Stable</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-500">Available Production</h3>
                            <TrendingUp size={20} className="text-indigo-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {summaryStats.availableProduction.toFixed(2)} tons
                        </p>
                        <p className="text-sm text-indigo-600 mt-2">Current balance</p>
                    </div>
                </div>

                {/* Report Generator */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Dynamic Report Generator</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Report Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
                            <select
                                value={selectedReportType}
                                onChange={(e) => setSelectedReportType(e.target.value as ReportType)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Daily">Daily Report</option>
                                <option value="Weekly">Weekly Report</option>
                                <option value="Monthly">Monthly Report</option>
                                <option value="Yearly">Yearly Report</option>
                            </select>
                        </div>

                        {/* Data Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
                            <select
                                value={selectedDataType}
                                onChange={(e) => setSelectedDataType(e.target.value as DataType)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="audit">Audit Logs</option>
                                <option value="companies">Mining Companies</option>
                                <option value="production">Production Records</option>
                                <option value="sales">Sales Transactions</option>
                                <option value="forecast">Forecasts</option>
                                <option value="availability">Available Production</option>
                                <option value="sites">Site Status</option>
                            </select>
                        </div>

                        {/* Site Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mining Site</label>
                            <select
                                value={selectedSite}
                                onChange={(e) => setSelectedSite(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Sites</option>
                                {(companies as CompanyRow[]).map((company: CompanyRow) => (
                                    <option key={company.id} value={company.id}>{company.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Export Format */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setExportFormat('pdf')}
                                    className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition ${exportFormat === 'pdf'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    PDF
                                </button>
                                <button
                                    onClick={() => setExportFormat('excel')}
                                    className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition ${exportFormat === 'excel'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Excel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                            <input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={generateReport}
                        disabled={isGenerating}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileText size={20} />
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                    </button>

                    {/* Data Preview */}
                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Data Preview ({filteredData.length} records)</h3>
                        <div className="overflow-x-auto max-h-96">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        {filteredData.length > 0 && Object.keys(filteredData[0]).slice(0, 6).map(key => (
                                            <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {key.replace(/_/g, ' ')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredData.slice(0, 5).map((item: DataRecord, idx: number) => (
                                        <tr key={idx}>
                                            {Object.values(item).slice(0, 6).map((value: unknown, valIdx: number) => (
                                                <td key={valIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {typeof value === 'object' ? JSON.stringify(value).slice(0, 50) : String(value).slice(0, 50)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Generated Reports Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Generated Reports</h2>
                    </div>

                    {reports.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No reports generated yet. Use the generator above to create your first report.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Report Name</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Data Type</th>
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
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {getDataTypeIcon(report.dataType)}
                                                        <span className="text-sm text-gray-600 capitalize">{report.dataType}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{report.period}</td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {new Date(report.generatedOn).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{report.createdBy}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => exportToPDF(report)}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                            title="Download PDF"
                                                        >
                                                            <File size={18} className="text-red-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => exportToExcel(report)}
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
                        </>
                    )}
                </div>

                {/* Loading States */}
                {(auditLoading || companiesLoading || productionLoading || salesLoading || forecastLoading) && (
                    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Loading data...</span>
                    </div>
                )}
            </div>
        </div>
    );
}






