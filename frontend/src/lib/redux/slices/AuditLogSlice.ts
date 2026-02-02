import { apiSlice } from "./ApiSlice";

const auditLogApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAuditLogs: builder.query({
            query: () => ({
                url: "audit-logs/",
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        getAuditLogById: builder.query({
            query: (id) => ({
                url: `audit-logs/${id}/`,
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
    }),
});

export const {
    useGetAuditLogsQuery,
    useGetAuditLogByIdQuery,
} = auditLogApi;