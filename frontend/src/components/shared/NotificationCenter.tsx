"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    AlertTriangle,
    Bell,
    CheckCheck,
    CircleAlert,
    Clock3,
    Mail,
    Shield,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import {
    useGetUnreadMessagesQuery,
    useMarkMessageAsReadMutation,
    useMarkMultipleMessagesAsReadMutation,
    type CommunicationMessage,
} from "@/lib/redux/slices/CommunicationSlices";
import { useGetAuditLogsQuery } from "@/lib/redux/slices/AuditLogSlice";
import {
    useGetRevenueSummaryQuery,
    useGetSalesTransactionsQuery,
    useGetStakeholderInsightsQuery,
} from "@/lib/redux/slices/MiningSlice";
import { useGetAnalyticsAnomaliesQuery } from "@/lib/redux/slices/analyticsApi";

type Role = "Admin" | "Officer" | "Stakeholder" | string;

interface NotificationCenterProps {
    role: Role;
}

interface AuditLogItem {
    id: number;
    action: string;
    timestamp: string;
    user?: string | null;
    target_user?: string | null;
}

interface SystemSignal {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    severity: "critical" | "warning" | "info" | "success";
}

const formatRelativeTime = (timestamp?: string) => {
    if (!timestamp) {
        return "Just now";
    }

    const date = new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
};

const getSeverityStyles = (severity: SystemSignal["severity"]) => {
    switch (severity) {
        case "critical":
            return {
                icon: CircleAlert,
                chip: "bg-red-50 text-red-700 border-red-100",
                dot: "bg-red-500",
            };
        case "warning":
            return {
                icon: AlertTriangle,
                chip: "bg-amber-50 text-amber-700 border-amber-100",
                dot: "bg-amber-500",
            };
        case "success":
            return {
                icon: TrendingUp,
                chip: "bg-emerald-50 text-emerald-700 border-emerald-100",
                dot: "bg-emerald-500",
            };
        default:
            return {
                icon: Sparkles,
                chip: "bg-blue-50 text-blue-700 border-blue-100",
                dot: "bg-blue-500",
            };
    }
};

export default function NotificationCenter({ role }: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadQuery = useGetUnreadMessagesQuery(undefined, {
        pollingInterval: 30000,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });
    const [markMessageAsRead, { isLoading: isMarkingSingle }] = useMarkMessageAsReadMutation();
    const [markMultipleMessagesAsRead, { isLoading: isMarkingAll }] =
        useMarkMultipleMessagesAsReadMutation();

    const { data: auditLogsData = [] } = useGetAuditLogsQuery(
        {},
        { skip: role !== "Admin" }
    );
    const { data: revenueSummary } = useGetRevenueSummaryQuery(undefined, {
        skip: role !== "Officer",
    });
    const { data: salesTransactions = [] } = useGetSalesTransactionsQuery(undefined, {
        skip: role !== "Officer",
    });
    const { data: stakeholderInsights } = useGetStakeholderInsightsQuery(undefined, {
        skip: role !== "Stakeholder",
    });
    const { data: anomaliesData } = useGetAnalyticsAnomaliesQuery(undefined, {
        skip: role === "Stakeholder",
    });

    const unreadMessages = unreadQuery.data?.messages ?? [];
    const unreadCount = unreadQuery.data?.count ?? 0;
    const auditLogs = auditLogsData as AuditLogItem[];

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest(".notification-center-container")) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const systemSignals = useMemo<SystemSignal[]>(() => {
        const signals: SystemSignal[] = [];

        if (role === "Admin") {
            const recentLogins = auditLogs.filter((log) => log.action === "LOGIN").length;
            const recentPermissionChanges = auditLogs.filter((log) =>
                ["PERMISSION_CHANGE", "USER_DEACTIVATE", "USER_DELETE"].includes(log.action)
            );
            const anomalyCount = anomaliesData?.anomalies?.length ?? 0;

            if (anomalyCount > 0) {
                signals.push({
                    id: "admin-anomalies",
                    title: `${anomalyCount} anomaly alert${anomalyCount === 1 ? "" : "s"}`,
                    description: "Revenue patterns need admin review before they affect reporting quality.",
                    timestamp: "",
                    severity: anomalyCount > 3 ? "critical" : "warning",
                });
            }

            if (recentPermissionChanges.length > 0) {
                const latest = recentPermissionChanges[0];
                signals.push({
                    id: `admin-security-${latest.id}`,
                    title: "Recent security-sensitive account activity",
                    description: `${recentPermissionChanges.length} user access or permission change event(s) were logged recently.`,
                    timestamp: latest.timestamp,
                    severity: "warning",
                });
            }

            if (recentLogins > 0) {
                signals.push({
                    id: "admin-logins",
                    title: "Platform activity is healthy",
                    description: `${recentLogins} login event(s) were captured in the latest audit window.`,
                    timestamp: auditLogs[0]?.timestamp || "",
                    severity: "success",
                });
            }
        }

        if (role === "Officer") {
            const pendingEntries = revenueSummary?.pending_entries ?? 0;
            const flaggedEntries = revenueSummary?.flagged_entries ?? 0;
            const latestPendingSale = salesTransactions.find((sale) => sale.status === "Pending");

            if (flaggedEntries > 0) {
                signals.push({
                    id: "officer-flagged",
                    title: `${flaggedEntries} flagged revenue entr${flaggedEntries === 1 ? "y" : "ies"}`,
                    description: "These transactions should be reviewed quickly to reduce reporting risk.",
                    timestamp: "",
                    severity: "critical",
                });
            }

            if (pendingEntries > 0) {
                signals.push({
                    id: "officer-pending",
                    title: `${pendingEntries} transaction${pendingEntries === 1 ? "" : "s"} pending validation`,
                    description: "Validation backlog is visible here so officers can clear new work fast.",
                    timestamp: latestPendingSale?.created_at || "",
                    severity: "warning",
                });
            }

            if ((revenueSummary?.today_revenue ?? 0) > 0) {
                signals.push({
                    id: "officer-revenue",
                    title: "Today’s revenue feed is active",
                    description: "Collections are flowing into the dashboard and summary metrics are updating in real time.",
                    timestamp: "",
                    severity: "success",
                });
            }
        }

        if (role === "Stakeholder") {
            const complianceRate = stakeholderInsights?.overview?.compliance_rate ?? 0;
            const growthRate = stakeholderInsights?.overview?.annual_growth_rate ?? 0;
            const activeSites = stakeholderInsights?.overview?.active_sites ?? 0;

            signals.push({
                id: "stakeholder-compliance",
                title: `Compliance rate at ${complianceRate.toFixed(1)}%`,
                description: "Governance performance is being tracked from approved reporting activity.",
                timestamp: "",
                severity: complianceRate >= 80 ? "success" : "warning",
            });

            signals.push({
                id: "stakeholder-growth",
                title: `Annual revenue trend ${growthRate >= 0 ? "up" : "down"} ${Math.abs(growthRate).toFixed(1)}%`,
                description: `${activeSites} active mining site(s) are contributing to the current reporting cycle.`,
                timestamp: "",
                severity: growthRate >= 0 ? "info" : "warning",
            });
        }

        return signals.slice(0, 3);
    }, [role, auditLogs, anomaliesData, revenueSummary, salesTransactions, stakeholderInsights]);

    const handleMarkOneRead = async (messageId: number) => {
        try {
            await markMessageAsRead(messageId).unwrap();
            unreadQuery.refetch();
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const handleMarkAllRead = async () => {
        if (unreadMessages.length === 0) {
            return;
        }

        try {
            await markMultipleMessagesAsRead(unreadMessages.map((message) => message.id)).unwrap();
            unreadQuery.refetch();
        } catch (error) {
            console.error("Failed to mark notifications as read", error);
        }
    };

    const renderUnreadMessage = (message: CommunicationMessage) => (
        <button
            key={message.id}
            type="button"
            onClick={() => handleMarkOneRead(message.id)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
        >
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Mail size={16} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-slate-900">
                            {message.subject || "New message"}
                        </p>
                        <span className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-600" />
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                        {message.message_content}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-500">
                        <span>
                            From {message.sender_details?.full_name || message.sender_details?.username || "System"}
                        </span>
                        <span>{hasMounted ? formatRelativeTime(message.timestamp) : "Recent"}</span>
                    </div>
                </div>
            </div>
        </button>
    );

    return (
        <div className="relative notification-center-container" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-100 transition hover:bg-white/20"
                aria-label="Open notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white shadow-sm">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 z-[140] w-[360px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                            <p className="mt-1 text-xs text-slate-500">
                                {unreadCount > 0
                                    ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                                    : "You are all caught up"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0 || isMarkingAll}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <CheckCheck size={14} />
                            Mark all read
                        </button>
                    </div>

                    <div className="mt-4 space-y-4">
                        <section>
                            <div className="mb-2 flex items-center gap-2">
                                <Mail size={14} className="text-blue-600" />
                                <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                    New Messages
                                </h4>
                            </div>

                            {unreadQuery.isLoading ? (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                                    Loading notifications...
                                </div>
                            ) : unreadMessages.length > 0 ? (
                                <div className="space-y-2">
                                    {unreadMessages.map(renderUnreadMessage)}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                                    <p className="text-sm font-medium text-slate-700">No new messages</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Incoming communications will appear here until they are read.
                                    </p>
                                </div>
                            )}
                        </section>

                        <section>
                            <div className="mb-2 flex items-center gap-2">
                                <Shield size={14} className="text-amber-600" />
                                <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                    Live System Signals
                                </h4>
                            </div>

                            <div className="space-y-2">
                                {systemSignals.map((signal) => {
                                    const styles = getSeverityStyles(signal.severity);
                                    const Icon = styles.icon;

                                    return (
                                        <div
                                            key={signal.id}
                                            className="rounded-xl border border-slate-200 bg-white p-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                                                    <Icon size={16} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {signal.title}
                                                        </p>
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${styles.chip}`}
                                                        >
                                                            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                                                            {signal.severity}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                                        {signal.description}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                                                        <Clock3 size={12} />
                                                        <span>{hasMounted ? formatRelativeTime(signal.timestamp) : "Recent"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {(isMarkingSingle || isMarkingAll) && (
                        <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
                            Updating notification state...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
