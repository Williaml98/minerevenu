'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    BarChart3,
    CalendarRange,
    Database,
    File,
    FileSpreadsheet,
    FileText,
    Filter,
    PieChart,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Trash2,
    TrendingUp,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart as RechartsPieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { useGetAuditLogsQuery } from '@/lib/redux/slices/AuditLogSlice';
import { useGetMyDetailsMutation } from '@/lib/redux/slices/AuthSlice';
import {
    useGetForecastQuery,
    useGetMineCompaniesQuery,
    useGetProductionRecordsQuery,
    useGetSalesTransactionsQuery,
} from '@/lib/redux/slices/MiningSlice';

interface Report {
    id: string;
    name: string;
    type: ReportType;
    period: string;
    generatedOn: string;
    createdBy: string;
    dataType: DataType;
    selectedSite: string;
    dateRange: DateRange;
}

interface DateRange {
    from: string;
    to: string;
}

interface AuditLogRow {
    id?: number;
    action?: string;
    target_user?: string | null;
    timestamp?: string;
    ip_address?: string;
    user_agent?: string;
}

interface CompanyRow {
    id: number;
    name: string;
    location?: string;
    license_number?: string;
    mineral_type?: string;
    status?: string;
    created_at?: string;
}

interface ProductionRow {
    id?: number;
    date?: string;
    quantity_produced?: number;
    unit_price?: number;
    total_revenue?: number;
    mine?: number;
}

interface SalesRow {
    id?: number;
    date?: string;
    quantity?: number;
    unit_price?: number;
    total_amount?: number;
    payment_method?: string;
    is_flagged?: boolean;
    mine?: number;
    status?: string;
    created_at?: string;
}

interface ForecastRow {
    id?: number;
    forecast_date?: string;
    predicted_revenue?: number;
    model_version?: string;
    created_at?: string;
}

type ReportType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
type DataType = 'audit' | 'companies' | 'production' | 'sales' | 'forecast' | 'availability' | 'sites';
type DataRecord = Record<string, unknown>;
type ReportColumn = { header: string; dataKey: string };

const reportTypeOptions: ReportType[] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
const dataTypeLabels: Record<DataType, string> = {
    audit: 'Audit Logs',
    companies: 'Mining Companies',
    production: 'Production Records',
    sales: 'Sales Transactions',
    forecast: 'Revenue Forecasts',
    availability: 'Available Production',
    sites: 'Site Status',
};
const chartPalette = ['#0F766E', '#2563EB', '#F59E0B', '#E11D48', '#7C3AED', '#059669'];
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toDateInput = (value: unknown): string | number | Date | null => {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') return value;
    return null;
};

const trimTrailingZero = (value: string) => value.replace(/\.0$/, '');

const asCurrency = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`;

const asCompactNumber = (value: number) => {
    const absoluteValue = Math.abs(value);
    if (absoluteValue >= 1_000_000_000) return `${trimTrailingZero((value / 1_000_000_000).toFixed(1))}B`;
    if (absoluteValue >= 1_000_000) return `${trimTrailingZero((value / 1_000_000).toFixed(1))}M`;
    if (absoluteValue >= 1_000) return `${trimTrailingZero((value / 1_000).toFixed(1))}K`;
    if (Number.isInteger(value)) return `${value}`;
    return trimTrailingZero(value.toFixed(1));
};

const asCompactCurrency = (value: number) => `$${asCompactNumber(value)}`;

const formatChartDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `${monthLabels[date.getUTCMonth()]} ${date.getUTCDate()}`;
};

const formatDateTimeLabel = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const year = date.getUTCFullYear();
    const month = monthLabels[date.getUTCMonth()];
    const day = `${date.getUTCDate()}`.padStart(2, '0');
    const hours = `${date.getUTCHours()}`.padStart(2, '0');
    const minutes = `${date.getUTCMinutes()}`.padStart(2, '0');
    return `${month} ${day}, ${year} ${hours}:${minutes} UTC`;
};

const getReportColumns = (dataType: DataType, selectedSite: string): ReportColumn[] => {
    switch (dataType) {
        case 'audit':
            return [
                { header: 'Timestamp', dataKey: 'timestamp' },
                { header: 'User', dataKey: 'target_user' },
                { header: 'Action', dataKey: 'action' },
                { header: 'IP Address', dataKey: 'ip_address' },
                { header: 'User Agent', dataKey: 'user_agent' },
            ];
        case 'companies':
            return [
                { header: 'Name', dataKey: 'name' },
                { header: 'Location', dataKey: 'location' },
                { header: 'License', dataKey: 'license_number' },
                { header: 'Mineral Type', dataKey: 'mineral_type' },
                { header: 'Status', dataKey: 'status' },
                { header: 'Created', dataKey: 'created_at' },
            ];
        case 'production':
            return [
                { header: 'Date', dataKey: 'date' },
                { header: 'Quantity Produced', dataKey: 'quantity_produced' },
                { header: 'Unit Price', dataKey: 'unit_price' },
                { header: 'Total Revenue', dataKey: 'total_revenue' },
                { header: 'Mine ID', dataKey: 'mine' },
            ];
        case 'sales':
            return selectedSite === 'all'
                ? [
                    { header: 'Site Name', dataKey: 'site_name' },
                    { header: 'Date', dataKey: 'date' },
                    { header: 'Quantity', dataKey: 'quantity' },
                    { header: 'Unit Price', dataKey: 'unit_price' },
                    { header: 'Total Amount', dataKey: 'total_amount' },
                    { header: 'Payment Method', dataKey: 'payment_method' },
                    { header: 'Status', dataKey: 'status' },
                ]
                : [
                    { header: 'Date', dataKey: 'date' },
                    { header: 'Quantity', dataKey: 'quantity' },
                    { header: 'Unit Price', dataKey: 'unit_price' },
                    { header: 'Total Amount', dataKey: 'total_amount' },
                    { header: 'Payment Method', dataKey: 'payment_method' },
                    { header: 'Status', dataKey: 'status' },
                ];
        case 'forecast':
            return [
                { header: 'Forecast Date', dataKey: 'forecast_date' },
                { header: 'Predicted Revenue', dataKey: 'predicted_revenue' },
                { header: 'Model Version', dataKey: 'model_version' },
                { header: 'Created', dataKey: 'created_at' },
            ];
        case 'availability':
            return [
                { header: 'Mine ID', dataKey: 'mine_id' },
                { header: 'Mine Name', dataKey: 'mine_name' },
                { header: 'Produced Quantity', dataKey: 'produced_quantity' },
                { header: 'Sold Quantity', dataKey: 'sold_quantity' },
                { header: 'Available Quantity', dataKey: 'available_quantity' },
                { header: 'As Of', dataKey: 'as_of' },
            ];
        case 'sites':
            return [
                { header: 'Site Name', dataKey: 'site_name' },
                { header: 'Location', dataKey: 'location' },
                { header: 'Mineral Type', dataKey: 'mineral_type' },
                { header: 'Status', dataKey: 'status' },
                { header: 'License Number', dataKey: 'license_number' },
                { header: 'Created', dataKey: 'created_at' },
            ];
        default:
            return [];
    }
};

export default function ReportCenter() {
    const { data: auditLogs = [], isLoading: auditLoading } = useGetAuditLogsQuery({});
    const { data: companies = [], isLoading: companiesLoading } = useGetMineCompaniesQuery({});
    const { data: productionRecords = [], isLoading: productionLoading } = useGetProductionRecordsQuery({});
    const { data: salesTransactions = [], isLoading: salesLoading } = useGetSalesTransactionsQuery({});
    const { data: forecasts = [], isLoading: forecastLoading } = useGetForecastQuery({});
    const [getMyDetails] = useGetMyDetailsMutation();

    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReportType, setSelectedReportType] = useState<ReportType>('Monthly');
    const [selectedDataType, setSelectedDataType] = useState<DataType>('sales');
    const [selectedSite, setSelectedSite] = useState<string>('all');
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
    const [isGenerating, setIsGenerating] = useState(false);
    const [exportedBy, setExportedBy] = useState('Unknown user');
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<DateRange>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await getMyDetails({}).unwrap();
                setExportedBy(res?.username || res?.email || 'Unknown user');
            } catch {
                setExportedBy('Unknown user');
            }
        };
        loadUser();
    }, [getMyDetails]);

    useEffect(() => {
        const loadLogo = async () => {
            try {
                const res = await fetch('/logo.png');
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

    const companyRows = companies as CompanyRow[];
    const productionRows = productionRecords as ProductionRow[];
    const salesRows = salesTransactions as SalesRow[];
    const forecastRows = forecasts as ForecastRow[];
    const auditRows = auditLogs as AuditLogRow[];

    const siteNameById = useMemo(
        () => new Map(companyRows.map((company) => [company.id, company.name])),
        [companyRows]
    );

    const getSiteLabel = (siteValue: string) => {
        if (siteValue === 'all') return 'All Sites';
        const site = companyRows.find((company) => String(company.id) === siteValue);
        return site?.name || `Mine #${siteValue}`;
    };

    const inRange = (value: unknown, from: string, to: string) => {
        const dateInput = toDateInput(value);
        if (dateInput === null) return false;
        const date = new Date(dateInput);
        if (Number.isNaN(date.getTime())) return false;
        return date >= new Date(from) && date <= new Date(to);
    };

    const availabilityData = useMemo(() => {
        const siteFilterId = selectedSite === 'all' ? null : Number(selectedSite);
        const producedByMine = new Map<number, number>();
        const soldByMine = new Map<number, number>();

        productionRows.forEach((record) => {
            if (!inRange(record.date, dateRange.from, dateRange.to)) return;
            const mineId = Number(record.mine);
            if (siteFilterId !== null && mineId !== siteFilterId) return;
            producedByMine.set(mineId, (producedByMine.get(mineId) || 0) + Number(record.quantity_produced || 0));
        });

        salesRows.forEach((sale) => {
            if (!inRange(sale.date, dateRange.from, dateRange.to)) return;
            const mineId = Number(sale.mine);
            if (siteFilterId !== null && mineId !== siteFilterId) return;
            soldByMine.set(mineId, (soldByMine.get(mineId) || 0) + Number(sale.quantity || 0));
        });

        const mineIds = new Set<number>([...producedByMine.keys(), ...soldByMine.keys()]);
        return Array.from(mineIds).map((mineId) => {
            const produced = producedByMine.get(mineId) || 0;
            const sold = soldByMine.get(mineId) || 0;
            return {
                mine_id: mineId,
                mine_name: siteNameById.get(mineId) || `Mine #${mineId}`,
                produced_quantity: produced,
                sold_quantity: sold,
                available_quantity: Math.max(0, produced - sold),
                as_of: dateRange.to,
            };
        });
    }, [productionRows, salesRows, selectedSite, dateRange, siteNameById]);

    const siteStatusData = useMemo(
        () =>
            companyRows.map((company) => ({
                site_name: company.name,
                location: company.location,
                mineral_type: company.mineral_type,
                status: company.status,
                license_number: company.license_number,
                created_at: company.created_at,
            })),
        [companyRows]
    );

    const filteredData = useMemo(() => {
        const filterBySite = <T extends { mine?: number; id?: number }>(items: T[]) => {
            if (selectedSite === 'all') return items;
            const siteId = Number(selectedSite);
            return items.filter((item) => item.mine === siteId || item.id === siteId);
        };

        switch (selectedDataType) {
            case 'audit':
                return auditRows.filter((item) => inRange(item.timestamp, dateRange.from, dateRange.to)) as DataRecord[];
            case 'companies':
                return companyRows as unknown as DataRecord[];
            case 'production':
                return filterBySite(
                    productionRows.filter((item) => inRange(item.date, dateRange.from, dateRange.to))
                ) as DataRecord[];
            case 'sales':
                return filterBySite(
                    salesRows
                        .filter((item) => inRange(item.date, dateRange.from, dateRange.to))
                        .map((sale) => ({
                            ...sale,
                            site_name: siteNameById.get(Number(sale.mine)) || `Mine #${sale.mine}`,
                        }))
                ) as DataRecord[];
            case 'forecast':
                return forecastRows.filter((item) => inRange(item.forecast_date, dateRange.from, dateRange.to)) as DataRecord[];
            case 'availability':
                return availabilityData as DataRecord[];
            case 'sites':
                return siteStatusData as DataRecord[];
            default:
                return [];
        }
    }, [
        selectedDataType,
        selectedSite,
        dateRange,
        auditRows,
        companyRows,
        productionRows,
        salesRows,
        forecastRows,
        availabilityData,
        siteStatusData,
        siteNameById,
    ]);

    const summaryStats = useMemo(() => {
        const scopedSales = salesRows.filter((item) => {
            const matchesSite = selectedSite === 'all' || Number(item.mine) === Number(selectedSite);
            return matchesSite && inRange(item.date, dateRange.from, dateRange.to);
        });
        const scopedProduction = productionRows.filter((item) => {
            const matchesSite = selectedSite === 'all' || Number(item.mine) === Number(selectedSite);
            return matchesSite && inRange(item.date, dateRange.from, dateRange.to);
        });
        const scopedForecasts = forecastRows.filter((item) =>
            inRange(item.forecast_date, dateRange.from, dateRange.to)
        );
        const scopedAudits = auditRows.filter((item) => inRange(item.timestamp, dateRange.from, dateRange.to));

        const totalRevenue = scopedSales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);
        const totalProduction = scopedProduction.reduce((sum, record) => sum + Number(record.quantity_produced || 0), 0);
        const totalSold = scopedSales.reduce((sum, sale) => sum + Number(sale.quantity || 0), 0);
        const avgUnitPrice = scopedSales.length
            ? scopedSales.reduce((sum, sale) => sum + Number(sale.unit_price || 0), 0) / scopedSales.length
            : 0;
        const flaggedTransactions = scopedSales.filter((sale) => sale.is_flagged).length;
        const forecastRevenue = scopedForecasts.reduce((sum, forecast) => sum + Number(forecast.predicted_revenue || 0), 0);

        return {
            totalRevenue,
            totalProduction,
            availableProduction: Math.max(0, totalProduction - totalSold),
            avgUnitPrice,
            records: filteredData.length,
            flaggedTransactions,
            auditEvents: scopedAudits.length,
            forecastRevenue,
        };
    }, [salesRows, productionRows, forecastRows, auditRows, selectedSite, dateRange, filteredData.length]);

    const revenueTrendData = useMemo(() => {
        const grouped = new Map<string, { revenue: number; production: number }>();

        salesRows.forEach((sale) => {
            if (!inRange(sale.date, dateRange.from, dateRange.to)) return;
            if (selectedSite !== 'all' && Number(sale.mine) !== Number(selectedSite)) return;
            const key = sale.date || '';
            const current = grouped.get(key) || { revenue: 0, production: 0 };
            current.revenue += Number(sale.total_amount || 0);
            grouped.set(key, current);
        });

        productionRows.forEach((record) => {
            if (!inRange(record.date, dateRange.from, dateRange.to)) return;
            if (selectedSite !== 'all' && Number(record.mine) !== Number(selectedSite)) return;
            const key = record.date || '';
            const current = grouped.get(key) || { revenue: 0, production: 0 };
            current.production += Number(record.quantity_produced || 0);
            grouped.set(key, current);
        });

        return Array.from(grouped.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12)
            .map(([date, totals]) => ({
                date: formatChartDate(date),
                revenue: Number(totals.revenue.toFixed(2)),
                production: Number(totals.production.toFixed(2)),
            }));
    }, [salesRows, productionRows, selectedSite, dateRange]);

    const sitePerformanceData = useMemo(() => {
        const relevantCompanies =
            selectedSite === 'all'
                ? companyRows
                : companyRows.filter((company) => String(company.id) === selectedSite);

        return relevantCompanies
            .map((company) => {
                const siteSales = salesRows.filter(
                    (sale) => Number(sale.mine) === company.id && inRange(sale.date, dateRange.from, dateRange.to)
                );
                const siteProduction = productionRows.filter(
                    (record) => Number(record.mine) === company.id && inRange(record.date, dateRange.from, dateRange.to)
                );

                return {
                    name: company.name.length > 16 ? `${company.name.slice(0, 16)}...` : company.name,
                    revenue: Number(siteSales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0).toFixed(2)),
                    production: Number(siteProduction.reduce((sum, record) => sum + Number(record.quantity_produced || 0), 0).toFixed(2)),
                };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 6);
    }, [companyRows, salesRows, productionRows, selectedSite, dateRange]);

    const statusBreakdownData = useMemo(() => {
        if (selectedDataType === 'sales') {
            const grouped = new Map<string, number>();
            salesRows.forEach((sale) => {
                if (!inRange(sale.date, dateRange.from, dateRange.to)) return;
                if (selectedSite !== 'all' && Number(sale.mine) !== Number(selectedSite)) return;
                const key = sale.status || 'Unknown';
                grouped.set(key, (grouped.get(key) || 0) + 1);
            });
            return Array.from(grouped.entries()).map(([name, value], index) => ({
                name,
                value,
                color: chartPalette[index % chartPalette.length],
            }));
        }

        if (selectedDataType === 'sites' || selectedDataType === 'companies') {
            const grouped = new Map<string, number>();
            companyRows.forEach((company) => {
                const key = company.status || 'Unknown';
                grouped.set(key, (grouped.get(key) || 0) + 1);
            });
            return Array.from(grouped.entries()).map(([name, value], index) => ({
                name,
                value,
                color: chartPalette[index % chartPalette.length],
            }));
        }

        return [
            { name: 'Records', value: filteredData.length, color: chartPalette[0] },
            { name: 'Alerts', value: summaryStats.flaggedTransactions, color: chartPalette[3] },
        ].filter((item) => item.value > 0);
    }, [selectedDataType, salesRows, companyRows, selectedSite, dateRange, filteredData.length, summaryStats.flaggedTransactions]);

    const getReportData = (report: Report): DataRecord[] => {
        const siteValue = report.selectedSite;
        const from = report.dateRange.from;
        const to = report.dateRange.to;

        switch (report.dataType) {
            case 'audit':
                return auditRows.filter((item) => inRange(item.timestamp, from, to)) as DataRecord[];
            case 'companies':
                return companyRows as unknown as DataRecord[];
            case 'production':
                return productionRows.filter((item) => {
                    const matchesSite = siteValue === 'all' || Number(item.mine) === Number(siteValue);
                    return matchesSite && inRange(item.date, from, to);
                }) as DataRecord[];
            case 'sales':
                return salesRows
                    .filter((item) => {
                        const matchesSite = siteValue === 'all' || Number(item.mine) === Number(siteValue);
                        return matchesSite && inRange(item.date, from, to);
                    })
                    .map((sale) => ({
                        ...sale,
                        site_name: siteNameById.get(Number(sale.mine)) || `Mine #${sale.mine}`,
                    })) as DataRecord[];
            case 'forecast':
                return forecastRows.filter((item) => inRange(item.forecast_date, from, to)) as DataRecord[];
            case 'availability':
                return availabilityData.filter((row) => siteValue === 'all' || String(row.mine_id) === siteValue) as DataRecord[];
            case 'sites':
                return siteStatusData as DataRecord[];
            default:
                return [];
        }
    };

    const exportToPDF = (report: Report) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const data = getReportData(report);
        const columns = getReportColumns(report.dataType, report.selectedSite);

        if (logoDataUrl) {
            doc.addImage(logoDataUrl, 'PNG', 14, 10, 24, 24);
        }

        doc.setFontSize(18);
        doc.text(report.name, 44, 22);
        doc.setDrawColor(209, 213, 219);
        doc.line(14, 38, pageWidth - 14, 38);

        doc.setFontSize(10);
        doc.text(`Period: ${report.period}`, 14, 48);
        doc.text(`Site: ${getSiteLabel(report.selectedSite)}`, 14, 54);
        doc.text(`Generated: ${formatDateTimeLabel(report.generatedOn)}`, 14, 60);

        autoTable(doc, {
            startY: 68,
            head: [columns.map((column) => column.header)],
            body: data.map((row) =>
                columns.map((column) => {
                    const value = row[column.dataKey];
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
                    if (
                        column.dataKey.includes('revenue') ||
                        column.dataKey.includes('amount') ||
                        column.dataKey.includes('price')
                    ) {
                        const numericValue = Number(value);
                        return Number.isFinite(numericValue) ? asCurrency(numericValue) : '';
                    }
                    return String(value);
                })
            ),
            styles: { fontSize: 8, cellPadding: 2.5 },
            headStyles: { fillColor: [15, 118, 110], textColor: 255 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
        });

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Exported by: ${report.createdBy}`, 14, pageHeight - 12);
        doc.text(`Generated with MineRevenue Tracker`, pageWidth - 70, pageHeight - 12);
        doc.save(`${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    };

    const exportToExcel = (report: Report) => {
        const data = getReportData(report);
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, dataTypeLabels[report.dataType].slice(0, 30));
        XLSX.writeFile(workbook, `${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`);
    };

    const generateReport = () => {
        setIsGenerating(true);
        const newReport: Report = {
            id: Date.now().toString(),
            name: `${dataTypeLabels[selectedDataType]} - ${selectedReportType} Snapshot`,
            type: selectedReportType,
            period: `${dateRange.from} to ${dateRange.to}`,
            generatedOn: new Date().toISOString(),
            createdBy: exportedBy,
            dataType: selectedDataType,
            selectedSite,
            dateRange: { ...dateRange },
        };
        setReports((prev) => [newReport, ...prev]);
        setIsGenerating(false);
    };

    const handleDeleteReport = (id: string) => {
        if (confirm('Are you sure you want to delete this report?')) {
            setReports((prev) => prev.filter((report) => report.id !== id));
        }
    };

    const getTypeBadgeColor = (type: ReportType) => {
        switch (type) {
            case 'Daily':
                return 'bg-emerald-50 text-emerald-700';
            case 'Weekly':
                return 'bg-blue-50 text-blue-700';
            case 'Monthly':
                return 'bg-amber-50 text-amber-700';
            case 'Yearly':
                return 'bg-purple-50 text-purple-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const getDataTypeIcon = (dataType: DataType) => {
        switch (dataType) {
            case 'audit':
                return <ShieldCheck size={16} className="text-teal-600" />;
            case 'companies':
            case 'sites':
                return <Database size={16} className="text-blue-600" />;
            case 'production':
                return <BarChart3 size={16} className="text-amber-600" />;
            case 'sales':
                return <PieChart size={16} className="text-rose-600" />;
            case 'forecast':
                return <TrendingUp size={16} className="text-purple-600" />;
            case 'availability':
                return <Sparkles size={16} className="text-indigo-600" />;
            default:
                return <FileText size={16} className="text-slate-600" />;
        }
    };

    const loading = auditLoading || companiesLoading || productionLoading || salesLoading || forecastLoading;
    const previewColumns =
        filteredData.length > 0
            ? Object.keys(filteredData[0]).slice(0, 6)
            : [];

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.08),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)] px-4 py-6 md:px-6">
            <div className="mx-auto max-w-[1550px] space-y-6">

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            label: 'Total Revenue',
                            value: asCurrency(summaryStats.totalRevenue),
                            hint: `${filteredData.length} records currently in scope`,
                            icon: TrendingUp,
                            accent: 'text-teal-600 bg-teal-50',
                        },
                        {
                            label: 'Total Production',
                            value: `${summaryStats.totalProduction.toFixed(2)} tons`,
                            hint: `${summaryStats.availableProduction.toFixed(2)} tons still available`,
                            icon: BarChart3,
                            accent: 'text-amber-600 bg-amber-50',
                        },
                        {
                            label: 'Avg Unit Price',
                            value: asCurrency(summaryStats.avgUnitPrice),
                            hint: `Forecast window: ${asCompactCurrency(summaryStats.forecastRevenue)}`,
                            icon: Sparkles,
                            accent: 'text-violet-600 bg-violet-50',
                        },
                        {
                            label: 'Audit + Alert Load',
                            value: `${summaryStats.auditEvents + summaryStats.flaggedTransactions}`,
                            hint: `${summaryStats.flaggedTransactions} flagged, ${summaryStats.auditEvents} audit events`,
                            icon: ShieldCheck,
                            accent: 'text-sky-600 bg-sky-50',
                        },
                    ].map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.label} className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">{card.label}</span>
                                    <div className={`rounded-2xl p-3 ${card.accent}`}>
                                        <Icon size={18} />
                                    </div>
                                </div>
                                <p className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">{card.value}</p>
                                <p className="mt-2 text-sm text-slate-500">{card.hint}</p>
                            </div>
                        );
                    })}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                    <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-sm">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">Revenue + Production</p>
                                <h2 className="mt-2 text-xl font-semibold text-slate-900">Performance trend</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Dynamic charting based on the selected filters and current backend records.
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                                {revenueTrendData.length} time points
                            </div>
                        </div>

                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueTrendData}>
                                    <defs>
                                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0F766E" stopOpacity={0.28} />
                                            <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                                    <YAxis stroke="#64748B" fontSize={12} tickFormatter={(value) => asCompactCurrency(Number(value))} />
                                    <Tooltip
                                        formatter={(value: number, name: string) =>
                                            name === 'revenue'
                                                ? [asCurrency(Number(value)), 'Revenue']
                                                : [`${Number(value).toFixed(2)} tons`, 'Production']
                                        }
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: '1px solid #E2E8F0',
                                            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#0F766E"
                                        strokeWidth={3}
                                        fill="url(#revenueFill)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-sm">
                            <div className="mb-4">
                                <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">Site comparison</p>
                                <h2 className="mt-2 text-xl font-semibold text-slate-900">Revenue by site</h2>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sitePerformanceData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                        <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                                        <YAxis stroke="#64748B" fontSize={11} tickFormatter={(value) => asCompactCurrency(Number(value))} />
                                        <Tooltip
                                            formatter={(value: number, name: string) =>
                                                name === 'revenue'
                                                    ? [asCurrency(Number(value)), 'Revenue']
                                                    : [`${Number(value).toFixed(2)} tons`, 'Production']
                                            }
                                        />
                                        <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                                            {sitePerformanceData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={chartPalette[index % chartPalette.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-sm">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-rose-700">Composition</p>
                                    <h2 className="mt-2 text-xl font-semibold text-slate-900">Status distribution</h2>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                    {dataTypeLabels[selectedDataType]}
                                </span>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                                <div className="h-52">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={statusBreakdownData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={55}
                                                outerRadius={82}
                                                paddingAngle={3}
                                            >
                                                {statusBreakdownData.map((entry, index) => (
                                                    <Cell key={entry.name} fill={entry.color || chartPalette[index % chartPalette.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3">
                                    {statusBreakdownData.length > 0 ? (
                                        statusBreakdownData.map((item) => (
                                            <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                                            No chartable records are available for the current dataset and filters.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-sm">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-700">Generator</p>
                                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Dynamic report builder</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Configure the exact reporting scope, preview the live data, then generate export-ready reports.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                                <CalendarRange size={14} className="mr-2 inline" />
                                {dateRange.from} to {dateRange.to}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Report period</label>
                                <select
                                    value={selectedReportType}
                                    onChange={(e) => setSelectedReportType(e.target.value as ReportType)}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                                >
                                    {reportTypeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Dataset</label>
                                <select
                                    value={selectedDataType}
                                    onChange={(e) => setSelectedDataType(e.target.value as DataType)}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                                >
                                    {Object.entries(dataTypeLabels).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Mining site</label>
                                <select
                                    value={selectedSite}
                                    onChange={(e) => setSelectedSite(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="all">All Sites</option>
                                    {companyRows.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Export preference</label>
                                <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setExportFormat('pdf')}
                                        className={`rounded-[18px] px-4 py-3 text-sm font-medium transition ${
                                            exportFormat === 'pdf' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600'
                                        }`}
                                    >
                                        PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setExportFormat('excel')}
                                        className={`rounded-[18px] px-4 py-3 text-sm font-medium transition ${
                                            exportFormat === 'excel' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
                                        }`}
                                    >
                                        Excel
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">From date</label>
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">To date</label>
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <button
                                onClick={generateReport}
                                disabled={isGenerating}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FileText size={18} />
                                {isGenerating ? 'Generating...' : 'Generate report'}
                            </button>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                <Filter size={15} className="mr-2 inline" />
                                {dataTypeLabels[selectedDataType]} for {getSiteLabel(selectedSite)}
                            </div>
                        </div>

                            <div className="mt-8 rounded-[26px] border border-slate-200 bg-slate-50/70 p-4">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">Live data preview</h3>
                                    <p className="text-sm text-slate-500">{filteredData.length} records currently match your filters.</p>
                                </div>
                                <div className="rounded-2xl bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
                                    Previewing first {Math.min(filteredData.length, 6)} rows
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            {previewColumns.length > 0 ? (
                                                previewColumns.map((column) => (
                                                    <th
                                                        key={column}
                                                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                                                    >
                                                        {column.replace(/_/g, ' ')}
                                                    </th>
                                                ))
                                            ) : (
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                                    No preview columns
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredData.length > 0 ? (
                                            filteredData.slice(0, 6).map((row, index) => (
                                                <tr key={index} className="hover:bg-slate-50/80">
                                                    {previewColumns.map((column) => (
                                                        <td key={column} className="px-4 py-3 text-sm text-slate-600">
                                                            {typeof row[column] === 'boolean'
                                                                ? row[column]
                                                                    ? 'Yes'
                                                                    : 'No'
                                                                : String(row[column] ?? '').slice(0, 60)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td className="px-4 py-10 text-center text-sm text-slate-500">
                                                    No records available for the current filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                </section>

                <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900">Generated reports</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Export-ready snapshots with live filters, metadata, and secure deletion controls.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Preferred export: <span className="font-semibold text-slate-900">{exportFormat.toUpperCase()}</span>
                        </div>
                    </div>

                    {reports.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                                <FileText size={28} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">No reports generated yet</h3>
                            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
                                Create a report from the dynamic builder above and it will appear here with downloadable PDF and Excel actions.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {['Report Name', 'Type', 'Dataset', 'Period', 'Generated On', 'Created By', 'Actions'].map((label) => (
                                            <th
                                                key={label}
                                                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                                            >
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {reports.map((report) => (
                                        <tr key={report.id} className="hover:bg-slate-50/80">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-slate-900">{report.name}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{getSiteLabel(report.selectedSite)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getTypeBadgeColor(report.type)}`}>
                                                    {report.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    {getDataTypeIcon(report.dataType)}
                                                    {dataTypeLabels[report.dataType]}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{report.period}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{formatDateTimeLabel(report.generatedOn)}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{report.createdBy}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => exportToPDF(report)}
                                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:text-red-600"
                                                    >
                                                        <File size={16} />
                                                        PDF
                                                    </button>
                                                    <button
                                                        onClick={() => exportToExcel(report)}
                                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-600"
                                                    >
                                                        <FileSpreadsheet size={16} />
                                                        Excel
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReport(report.id)}
                                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:text-rose-600"
                                                    >
                                                        <Trash2 size={16} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {loading && (
                    <div className="fixed bottom-4 right-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white shadow-xl">
                        <RefreshCw size={16} className="mr-2 inline animate-spin" />
                        Syncing report data...
                    </div>
                )}
            </div>
        </div>
    );
}
