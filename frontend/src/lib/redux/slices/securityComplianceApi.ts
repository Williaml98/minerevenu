import { apiSlice } from "./ApiSlice";

export interface SecurityEvent {
    id: number;
    action: string;
    timestamp: string;
    ip_address: string | null;
    user: number | null;
    user_email: string | null;
    target_user: number | null;
    target_user_email: string | null;
    additional_data: Record<string, unknown> | null;
}

export interface SecuritySummary {
    risk_score: number;
    failed_logins_last_24h: number;
    open_incidents: number;
    critical_open_incidents: number;
    users_inactive: number;
    latest_critical_events: SecurityEvent[];
}

export interface SecurityIncident {
    id: number;
    title: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    status: "open" | "investigating" | "resolved";
    created_by: number | null;
    created_by_email: string | null;
    assigned_to: number | null;
    assigned_to_email: string | null;
    detected_at: string;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CompliancePolicy {
    id: number;
    control_key: string;
    name: string;
    description: string;
    is_enabled: boolean;
    owner: number | null;
    owner_email: string | null;
    last_reviewed_at: string | null;
    updated_at: string;
}

export interface AccessReviewPayload {
    user_totals: Record<string, number>;
    privileged_users: Array<{
        id: number;
        email: string;
        username: string;
        is_active: boolean;
    }>;
    inactive_admin_count: number;
    active_admin_count: number;
}

type EventsQuery = {
    action?: string;
    user?: string;
    since_days?: number;
};

type NewIncidentPayload = {
    title: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    assigned_to?: number;
};

type UpdateIncidentStatusPayload = {
    id: number;
    status: "open" | "investigating" | "resolved";
    assigned_to?: number | null;
};

type UpdatePolicyControlPayload = {
    id: number;
    is_enabled: boolean;
    owner?: number | null;
    last_reviewed_at?: string | null;
};

export const securityComplianceApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSecuritySummary: builder.query<SecuritySummary, void>({
            query: () => "security/summary/",
        }),
        getSecurityEvents: builder.query<SecurityEvent[], EventsQuery | void>({
            query: (params) => ({
                url: "security/events/",
                params,
            }),
        }),
        getSecurityIncidents: builder.query<SecurityIncident[], void>({
            query: () => "security/incidents/",
        }),
        createSecurityIncident: builder.mutation<SecurityIncident, NewIncidentPayload>({
            query: (body) => ({
                url: "security/incidents/",
                method: "POST",
                body,
            }),
        }),
        updateIncidentStatus: builder.mutation<SecurityIncident, UpdateIncidentStatusPayload>({
            query: ({ id, ...body }) => ({
                url: `security/incidents/${id}/status/`,
                method: "PATCH",
                body,
            }),
        }),
        getCompliancePolicies: builder.query<CompliancePolicy[], void>({
            query: () => "security/policies/",
        }),
        updatePolicyControl: builder.mutation<CompliancePolicy, UpdatePolicyControlPayload>({
            query: ({ id, ...body }) => ({
                url: `security/policies/${id}/control/`,
                method: "PATCH",
                body,
            }),
        }),
        getAccessReviews: builder.query<AccessReviewPayload, void>({
            query: () => "security/access-reviews/",
        }),
    }),
});

export const {
    useGetSecuritySummaryQuery,
    useGetSecurityEventsQuery,
    useGetSecurityIncidentsQuery,
    useCreateSecurityIncidentMutation,
    useUpdateIncidentStatusMutation,
    useGetCompliancePoliciesQuery,
    useUpdatePolicyControlMutation,
    useGetAccessReviewsQuery,
} = securityComplianceApi;

