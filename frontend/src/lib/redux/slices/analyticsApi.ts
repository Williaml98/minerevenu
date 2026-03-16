import { apiSlice } from "./ApiSlice";

export interface AnalyticsSummary {
    last_30_revenue: number;
    prev_30_revenue: number;
    growth_rate: number | null;
    stability_score: number | null;
    anomaly_count: number;
    forecast_accuracy: number | null;
    forecast_accuracy_provisional?: number | null;
    forecast_accuracy_basis?: "mature" | "provisional" | null;
    model_status?: {
        forecast: ModelStatus;
        anomaly: ModelStatus;
    };
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

export interface ModelStatus {
    ready: boolean;
    model_version: string | null;
    last_trained: string | null;
    data_points: number | null;
    metrics?: Record<string, number | string | null> | null;
}

export interface AnalyticsQueryParams {
    mine_id?: number;
    limit?: number;
}

export const analyticsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAnalyticsSummary: builder.query<{ summary: AnalyticsSummary }, AnalyticsQueryParams | void>({
            query: (params) => ({
                url: "/analytics/summary/",
                params,
            }),
            providesTags: ["Analytics"],
        }),
        getAnalyticsAnomalies: builder.query<{ anomalies: AnomalyInsight[]; model_ready?: boolean; model_version?: string | null }, AnalyticsQueryParams | void>({
            query: (params) => ({
                url: "/analytics/anomalies/",
                params,
            }),
            providesTags: ["Analytics"],
        }),
        getAnalyticsRecommendations: builder.query<{ recommendations: RecommendationItem[] }, AnalyticsQueryParams | void>({
            query: (params) => ({
                url: "/analytics/recommendations/",
                params,
            }),
            providesTags: ["Analytics"],
        }),
        getForecasts: builder.query<{ id: number; forecast_date: string; predicted_revenue: number; model_version: string }[], void>({
            query: () => "/analytics/forecasts/",
            providesTags: ["Forecasts"],
        }),
        regenerateForecasts: builder.mutation<unknown, { steps?: number; replace?: boolean } | void>({
            query: (body) => ({
                url: "/analytics/generate-forecast/",
                method: "POST",
                body,
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
        syncModels: builder.mutation<
            { message: string; forecast_metrics: unknown; anomaly_status: unknown },
            void
        >({
            query: () => ({
                url: "/analytics/sync-models/",
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
    useGetForecastsQuery,
    useRegenerateForecastsMutation,
    useRetrainModelsMutation,
    useSyncModelsMutation,
} = analyticsApi;

