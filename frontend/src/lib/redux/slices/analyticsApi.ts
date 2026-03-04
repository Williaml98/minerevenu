import { apiSlice } from "./ApiSlice";

export interface AnalyticsSummary {
    last_30_revenue: number;
    prev_30_revenue: number;
    growth_rate: number;
    stability_score: number;
    anomaly_count: number;
    forecast_accuracy: number | null;
}

export interface AnomalyInsight {
    transaction_id: number;
    mine_name: string;
    date: string;
    amount: number;
    quantity: number;
    unit_price: number;
    reason: string;
}

export interface RecommendationItem {
    title: string;
    impact: "low" | "medium" | "high" | string;
    detail: string;
}

export const analyticsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAnalyticsSummary: builder.query<{ summary: AnalyticsSummary }, void>({
            query: () => "/analytics/summary/",
            providesTags: ["Analytics"],
        }),
        getAnalyticsAnomalies: builder.query<{ anomalies: AnomalyInsight[] }, void>({
            query: () => "/analytics/anomalies/",
            providesTags: ["Analytics"],
        }),
        getAnalyticsRecommendations: builder.query<{ recommendations: RecommendationItem[] }, void>({
            query: () => "/analytics/recommendations/",
            providesTags: ["Analytics"],
        }),
        regenerateForecasts: builder.mutation<unknown, void>({
            query: () => ({
                url: "/analytics/generate-forecast/",
                method: "GET",
            }),
            invalidatesTags: ["Analytics", "Forecasts"],
        }),
        retrainModels: builder.mutation<
            { message: string; forecast_metrics: unknown; anomaly_status: unknown },
            void
        >({
            query: () => ({
                url: "/analytics/train-models/",
                method: "POST",
            }),
            invalidatesTags: ["Analytics", "Forecasts"],
        }),
    }),
});

export const {
    useGetAnalyticsSummaryQuery,
    useGetAnalyticsAnomaliesQuery,
    useGetAnalyticsRecommendationsQuery,
    useRegenerateForecastsMutation,
    useRetrainModelsMutation,
} = analyticsApi;

