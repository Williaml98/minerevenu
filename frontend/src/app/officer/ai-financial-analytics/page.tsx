"use client";

import React from "react";
import { AIAnalyticsDashboard } from "@/app/admin/ai-analytics/page";

export default function OfficerAIFinancialAnalyticsPage() {
    return (
        <AIAnalyticsDashboard
            allowModelActions={false}
            title="AI Financial Analytics"
            description="Review officer-facing predictions, anomaly detection, and revenue guidance using the same analytics engine as admin."
        />
    );
}
