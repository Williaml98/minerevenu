import { apiSlice } from "./ApiSlice";

export type TransactionStatus = "Pending" | "Approved" | "Rejected";

export interface MineCompany {
    id: number;
    name: string;
    location: string;
    license_number: string;
    mineral_type: string;
    status: string;
    created_at: string;
}

export interface ProductionRecord {
    id: number;
    date: string;
    quantity_produced: number;
    unit_price: number;
    total_revenue: number;
    status?: TransactionStatus;
    mine: number;
}

export interface SalesTransaction {
    id: number;
    date: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    payment_method: string;
    is_flagged: boolean;
    status: TransactionStatus;
    mine: number;
    created_by: number | null;
    validated_by: number | null;
    validated_at: string | null;
    created_at: string;
}

export interface RevenueForecast {
    id: number;
    forecast_date: string;
    predicted_revenue: number;
    model_version: string;
    created_at: string;
}

export interface RevenueSummary {
    today_revenue: number;
    month_revenue: number;
    year_revenue: number;
    pending_entries: number;
    approved_entries: number;
    rejected_entries: number;
    flagged_entries: number;
    total_transactions: number;
}

export interface StakeholderInsights {
    overview: {
        total_revenue: number;
        current_year_revenue: number;
        previous_year_revenue: number;
        annual_growth_rate: number;
        active_sites: number;
        compliance_rate: number;
    };
    monthly_revenue: Array<{
        month: string;
        total_revenue: number;
    }>;
    site_breakdown: Array<{
        mine_id: number;
        mine_name: string;
        total_revenue: number;
        contribution_percent: number;
    }>;
}

export interface CreateMineCompanyPayload {
    name: string;
    location: string;
    license_number: string;
    mineral_type: string;
    status?: string;
}

export interface CreateProductionRecordPayload {
    mine: number;
    date: string;
    quantity_produced: number;
    unit_price: number;
}

export interface CreateSalesTransactionPayload {
    mine: number;
    date: string;
    quantity: number;
    payment_method: string;
}

export interface UpdateMineCompanyPayload extends Partial<CreateMineCompanyPayload> {
    id: number;
}

export interface UpdateProductionRecordPayload {
    id: number;
    mine?: number;
    date?: string;
    quantity_produced?: number;
    unit_price?: number;
}

export interface UpdateSalesTransactionPayload {
    id: number;
    mine?: number;
    date?: string;
    quantity?: number;
    payment_method?: string;
}

const miningApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createMineCompany: builder.mutation<MineCompany, CreateMineCompanyPayload>({
            query: (data) => ({
                url: "mining/mines/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Mines"],
        }),
        updateMineCompany: builder.mutation<MineCompany, UpdateMineCompanyPayload>({
            query: ({ id, ...data }) => ({
                url: `mining/mines/${id}/`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Mines"],
        }),
        deleteMineCompany: builder.mutation<{ detail?: string }, number>({
            query: (id) => ({
                url: `mining/mines/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Mines"],
        }),
        createProductionRecord: builder.mutation<
            ProductionRecord,
            CreateProductionRecordPayload
        >({
            query: (data) => ({
                url: "mining/production/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Production"],
        }),
        updateProductionRecord: builder.mutation<
            ProductionRecord,
            UpdateProductionRecordPayload
        >({
            query: ({ id, ...data }) => ({
                url: `mining/production/${id}/`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Production"],
        }),
        deleteProductionRecord: builder.mutation<{ detail?: string }, number>({
            query: (id) => ({
                url: `mining/production/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Production"],
        }),
        updateProductionStatus: builder.mutation<
            ProductionRecord,
            { id: number; status: TransactionStatus }
        >({
            query: ({ id, status }) => ({
                url: `mining/production/${id}/status/`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["Production"],
        }),
        createSalesTransaction: builder.mutation<
            SalesTransaction,
            CreateSalesTransactionPayload
        >({
            query: (data) => ({
                url: "revenue/transactions/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Sales", "RevenueSummary", "Analytics"],
        }),
        updateSalesTransaction: builder.mutation<
            SalesTransaction,
            UpdateSalesTransactionPayload
        >({
            query: ({ id, ...data }) => ({
                url: `revenue/transactions/${id}/`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Sales", "RevenueSummary", "Analytics"],
        }),
        deleteSalesTransaction: builder.mutation<{ detail?: string }, number>({
            query: (id) => ({
                url: `revenue/transactions/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Sales", "RevenueSummary", "Analytics"],
        }),
        updateSalesTransactionStatus: builder.mutation<
            SalesTransaction,
            { id: number; status: TransactionStatus }
        >({
            query: ({ id, status }) => ({
                url: `revenue/transactions/${id}/status/`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["Sales", "RevenueSummary", "Analytics"],
        }),
        generateForecast: builder.mutation<RevenueForecast[], unknown>({
            query: () => ({
                url: "analytics/generate-forecast/",
                method: "POST",
            }),
            invalidatesTags: ["Forecasts"],
        }),
        getForecast: builder.query<RevenueForecast[], unknown>({
            query: () => ({
                url: "analytics/forecasts/",
                method: "GET",
            }),
            providesTags: ["Forecasts"],
        }),
        getMineCompanies: builder.query<MineCompany[], unknown>({
            query: () => ({
                url: "mining/mines/",
                method: "GET",
            }),
            providesTags: ["Mines"],
        }),
        getProductionRecords: builder.query<ProductionRecord[], unknown>({
            query: () => ({
                url: "mining/production/",
                method: "GET",
            }),
            providesTags: ["Production"],
        }),
        getSalesTransactions: builder.query<SalesTransaction[], unknown>({
            query: () => ({
                url: "revenue/transactions/",
                method: "GET",
            }),
            providesTags: ["Sales"],
        }),
        getRevenueSummary: builder.query<RevenueSummary, unknown>({
            query: () => ({
                url: "revenue/summary/",
                method: "GET",
            }),
            providesTags: ["RevenueSummary"],
        }),
        getStakeholderInsights: builder.query<StakeholderInsights, unknown>({
            query: () => ({
                url: "revenue/stakeholder-insights/",
                method: "GET",
            }),
            providesTags: ["RevenueSummary", "Analytics"],
        }),
    }),
});

export const {
    useCreateMineCompanyMutation,
    useUpdateMineCompanyMutation,
    useDeleteMineCompanyMutation,
    useCreateProductionRecordMutation,
    useUpdateProductionRecordMutation,
    useDeleteProductionRecordMutation,
    useUpdateProductionStatusMutation,
    useCreateSalesTransactionMutation,
    useUpdateSalesTransactionMutation,
    useDeleteSalesTransactionMutation,
    useUpdateSalesTransactionStatusMutation,
    useGenerateForecastMutation,
    useGetForecastQuery,
    useGetMineCompaniesQuery,
    useGetProductionRecordsQuery,
    useGetSalesTransactionsQuery,
    useGetRevenueSummaryQuery,
    useGetStakeholderInsightsQuery,
} = miningApi;
