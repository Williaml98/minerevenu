"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Filter, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import {
    useCreateSecurityIncidentMutation,
    useGetAccessReviewsQuery,
    useGetCompliancePoliciesQuery,
    useGetSecurityEventsQuery,
    useGetSecurityIncidentsQuery,
    useGetSecuritySummaryQuery,
    useUpdateIncidentStatusMutation,
    useUpdatePolicyControlMutation,
} from "@/lib/redux/slices/securityComplianceApi";

type IncidentFormState = {
    title: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
};

const defaultIncidentForm: IncidentFormState = {
    title: "",
    description: "",
    severity: "medium",
};

export default function SecurityCompliancePage() {
    const [actionFilter, setActionFilter] = useState("");
    const [sinceDays, setSinceDays] = useState(7);
    const [incidentForm, setIncidentForm] = useState<IncidentFormState>(defaultIncidentForm);

    const {
        data: summary,
        isLoading: summaryLoading,
        refetch: refetchSummary,
    } = useGetSecuritySummaryQuery(undefined, { pollingInterval: 60000 });
    const {
        data: events = [],
        isLoading: eventsLoading,
        refetch: refetchEvents,
    } = useGetSecurityEventsQuery(
        { action: actionFilter || undefined, since_days: sinceDays },
        { pollingInterval: 60000 }
    );
    const {
        data: incidents = [],
        isLoading: incidentsLoading,
        refetch: refetchIncidents,
    } = useGetSecurityIncidentsQuery(undefined, { pollingInterval: 60000 });
    const {
        data: policies = [],
        isLoading: policiesLoading,
        refetch: refetchPolicies,
    } = useGetCompliancePoliciesQuery();
    const { data: accessReview, isLoading: accessReviewLoading } = useGetAccessReviewsQuery();

    const [createIncident, { isLoading: creatingIncident }] = useCreateSecurityIncidentMutation();
    const [updateIncidentStatus, { isLoading: updatingIncident }] = useUpdateIncidentStatusMutation();
    const [updatePolicyControl, { isLoading: updatingPolicy }] = useUpdatePolicyControlMutation();

    const actionOptions = useMemo(() => {
        const uniqueActions = new Set(events.map((event) => event.action));
        return Array.from(uniqueActions).sort();
    }, [events]);

    const handleIncidentCreate = async () => {
        if (!incidentForm.title.trim() || !incidentForm.description.trim()) {
            toast.error("Title and description are required.");
            return;
        }

        try {
            await createIncident({
                title: incidentForm.title.trim(),
                description: incidentForm.description.trim(),
                severity: incidentForm.severity,
            }).unwrap();

            setIncidentForm(defaultIncidentForm);
            toast.success("Security incident created.");
            refetchIncidents();
            refetchSummary();
        } catch {
            toast.error("Failed to create incident.");
        }
    };

    const handleIncidentStatusChange = async (id: number, status: "open" | "investigating" | "resolved") => {
        try {
            await updateIncidentStatus({ id, status }).unwrap();
            toast.success("Incident status updated.");
            refetchIncidents();
            refetchSummary();
            refetchEvents();
        } catch {
            toast.error("Failed to update incident status.");
        }
    };

    const handlePolicyToggle = async (id: number, isEnabled: boolean) => {
        try {
            await updatePolicyControl({ id, is_enabled: !isEnabled }).unwrap();
            toast.success("Policy control updated.");
            refetchPolicies();
        } catch {
            toast.error("Failed to update policy control.");
        }
    };

    const formatDate = (value: string) => new Date(value).toLocaleString();

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Security & Compliance</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Live posture, incidents, controls, and access review connected to backend security APIs.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <MetricCard
                        title="Risk Score"
                        value={summaryLoading ? "..." : String(summary?.risk_score ?? 0)}
                        icon={<ShieldAlert className="h-5 w-5 text-red-600" />}
                    />
                    <MetricCard
                        title="Failed Logins (24h)"
                        value={summaryLoading ? "..." : String(summary?.failed_logins_last_24h ?? 0)}
                        icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
                    />
                    <MetricCard
                        title="Open Incidents"
                        value={summaryLoading ? "..." : String(summary?.open_incidents ?? 0)}
                        icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
                    />
                    <MetricCard
                        title="Critical Incidents"
                        value={summaryLoading ? "..." : String(summary?.critical_open_incidents ?? 0)}
                        icon={<ShieldAlert className="h-5 w-5 text-rose-700" />}
                    />
                    <MetricCard
                        title="Inactive Users"
                        value={summaryLoading ? "..." : String(summary?.users_inactive ?? 0)}
                        icon={<CheckCircle2 className="h-5 w-5 text-slate-600" />}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-2">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-gray-900">Security Events</h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                                    <Filter className="h-4 w-4 text-gray-500" />
                                    <select
                                        value={actionFilter}
                                        onChange={(e) => setActionFilter(e.target.value)}
                                        className="bg-transparent text-sm outline-none"
                                    >
                                        <option value="">All actions</option>
                                        {actionOptions.map((action) => (
                                            <option key={action} value={action}>
                                                {action}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <select
                                    value={sinceDays}
                                    onChange={(e) => setSinceDays(Number(e.target.value))}
                                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
                                >
                                    <option value={1}>Last 1 day</option>
                                    <option value={7}>Last 7 days</option>
                                    <option value={30}>Last 30 days</option>
                                </select>
                            </div>
                        </div>

                        <div className="max-h-[420px] overflow-y-auto rounded-xl border border-gray-100">
                            {eventsLoading ? (
                                <p className="p-4 text-sm text-gray-500">Loading events...</p>
                            ) : events.length === 0 ? (
                                <p className="p-4 text-sm text-gray-500">No events found for current filters.</p>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="sticky top-0 bg-gray-100 text-xs uppercase text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3">Action</th>
                                            <th className="px-4 py-3">Actor</th>
                                            <th className="px-4 py-3">IP</th>
                                            <th className="px-4 py-3">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map((event) => (
                                            <tr key={event.id} className="border-t border-gray-100">
                                                <td className="px-4 py-3 font-medium text-gray-900">{event.action}</td>
                                                <td className="px-4 py-3 text-gray-600">{event.user_email || "System"}</td>
                                                <td className="px-4 py-3 text-gray-600">{event.ip_address || "-"}</td>
                                                <td className="px-4 py-3 text-gray-600">{formatDate(event.timestamp)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <h2 className="text-lg font-semibold text-gray-900">Create Incident</h2>
                        <div className="mt-4 space-y-3">
                            <input
                                value={incidentForm.title}
                                onChange={(e) => setIncidentForm((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="Incident title"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                            <textarea
                                value={incidentForm.description}
                                onChange={(e) => setIncidentForm((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Incident description"
                                rows={4}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                            <select
                                value={incidentForm.severity}
                                onChange={(e) =>
                                    setIncidentForm((prev) => ({
                                        ...prev,
                                        severity: e.target.value as IncidentFormState["severity"],
                                    }))
                                }
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                            <button
                                onClick={handleIncidentCreate}
                                disabled={creatingIncident}
                                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {creatingIncident ? "Creating..." : "Create Incident"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Incidents</h2>
                        {incidentsLoading ? (
                            <p className="text-sm text-gray-500">Loading incidents...</p>
                        ) : incidents.length === 0 ? (
                            <p className="text-sm text-gray-500">No incidents logged yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {incidents.map((incident) => (
                                    <div key={incident.id} className="rounded-xl border border-gray-200 p-4">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                                <p className="font-semibold text-gray-900">{incident.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    Severity: <span className="uppercase">{incident.severity}</span> | Created by{" "}
                                                    {incident.created_by_email || "System"}
                                                </p>
                                            </div>
                                            <select
                                                value={incident.status}
                                                disabled={updatingIncident}
                                                onChange={(e) =>
                                                    handleIncidentStatusChange(
                                                        incident.id,
                                                        e.target.value as "open" | "investigating" | "resolved"
                                                    )
                                                }
                                                className="rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none"
                                            >
                                                <option value="open">Open</option>
                                                <option value="investigating">Investigating</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-700">{incident.description}</p>
                                        <p className="mt-2 text-xs text-gray-500">Detected: {formatDate(incident.detected_at)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Compliance Controls</h2>
                            {policiesLoading ? (
                                <p className="text-sm text-gray-500">Loading controls...</p>
                            ) : policies.length === 0 ? (
                                <p className="text-sm text-gray-500">No policies configured yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {policies.map((policy) => (
                                        <div
                                            key={policy.id}
                                            className="flex items-center justify-between rounded-xl border border-gray-200 p-3"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{policy.name}</p>
                                                <p className="text-xs text-gray-500">{policy.control_key}</p>
                                            </div>
                                            <button
                                                onClick={() => handlePolicyToggle(policy.id, policy.is_enabled)}
                                                disabled={updatingPolicy}
                                                className={`rounded-md px-3 py-1 text-xs font-semibold ${
                                                    policy.is_enabled
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-gray-200 text-gray-700"
                                                }`}
                                            >
                                                {policy.is_enabled ? "Enabled" : "Disabled"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Access Review</h2>
                            {accessReviewLoading || !accessReview ? (
                                <p className="text-sm text-gray-500">Loading access review...</p>
                            ) : (
                                <div className="space-y-3 text-sm text-gray-700">
                                    <p>
                                        Active admins: <span className="font-semibold">{accessReview.active_admin_count}</span>
                                    </p>
                                    <p>
                                        Inactive admins:{" "}
                                        <span className="font-semibold">{accessReview.inactive_admin_count}</span>
                                    </p>
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="mb-1 text-xs uppercase text-gray-500">Role totals</p>
                                        {Object.entries(accessReview.user_totals).map(([role, total]) => (
                                            <p key={role}>
                                                {role}: <span className="font-semibold">{total}</span>
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-gray-600">{title}</p>
                {icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}
