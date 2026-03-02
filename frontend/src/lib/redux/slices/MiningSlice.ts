import { apiSlice } from "./ApiSlice";

const miningApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createMineCompany: builder.mutation({
            query: (data) => ({
                url: "mining/mines/",
                method: "POST",
                body: data,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        createProductionRecord: builder.mutation({
            query: (data) => ({
                url: "mining/production/",
                method: "POST",
                body: data,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),

        createSalesTransaction: builder.mutation({
            query: (data) => ({
                url: "mining/production/",
                method: "POST",
                body: data,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        generateForecast: builder.mutation({
            query: (data) => ({
                url: "analytics/generate-forecast/",
                method: "POST",
                body: data,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        getForecast: builder.query({
            query: (data) => ({
                url: `analytics/generate-forecast/`,
                method: "GET",
                body: data,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        getMineCompanies: builder.query({
            query: () => ({
                url: "mining/mines/",
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        getProductionRecords: builder.query({
            query: () => ({
                url: "mining/production/",
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        getSalesTransactions: builder.query({
            query: () => ({
                url: "revenue/transactions/",
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
    }),
});

export const {
    useCreateMineCompanyMutation,
    useCreateProductionRecordMutation,
    useCreateSalesTransactionMutation,
    useGenerateForecastMutation,
    useGetForecastQuery,
    useGetMineCompaniesQuery,
    useGetProductionRecordsQuery,
    useGetSalesTransactionsQuery,
} = miningApi;