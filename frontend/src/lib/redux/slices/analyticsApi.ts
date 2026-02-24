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
        }),
        getAnalyticsAnomalies: builder.query<{ anomalies: AnomalyInsight[] }, void>({
            query: () => "/analytics/anomalies/",
        }),
        getAnalyticsRecommendations: builder.query<{ recommendations: RecommendationItem[] }, void>({
            query: () => "/analytics/recommendations/",
        }),
        regenerateForecasts: builder.mutation<unknown, void>({
            query: () => ({
                url: "/analytics/generate-forecast/",
                method: "GET",
            }),
        }),
        retrainModels: builder.mutation<
            { message: string; forecast_metrics: unknown; anomaly_status: unknown },
            void
        >({
            query: () => ({
                url: "/analytics/train-models/",
                method: "POST",
            }),
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

