"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    AlertTriangle, Bell, CheckCheck, CircleAlert, Clock3,
    Mail, Shield, Sparkles, TrendingUp,
} from "lucide-react";
import {
    useGetUnreadMessagesQuery, useMarkMessageAsReadMutation,
    useMarkMultipleMessagesAsReadMutation, type CommunicationMessage,
} from "@/lib/redux/slices/CommunicationSlices";
import { useGetAuditLogsQuery } from "@/lib/redux/slices/AuditLogSlice";
import {
    useGetRevenueSummaryQuery, useGetSalesTransactionsQuery, useGetStakeholderInsightsQuery,
} from "@/lib/redux/slices/MiningSlice";
import { useGetAnalyticsAnomaliesQuery } from "@/lib/redux/slices/analyticsApi";

type Role = "Admin" | "Officer" | "Stakeholder" | string;

interface NotificationCenterProps { role: Role; }
interface AuditLogItem { id: number; action: string; timestamp: string; user?: string | null; target_user?: string | null; }
interface SystemSignal {
    id: string; title: string; description: string; timestamp: string;
    severity: "critical" | "warning" | "info" | "success";
}

const formatRelativeTime = (timestamp?: string) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const severityConfig = {
    critical: { icon: CircleAlert, badge: "rgba(239,68,68,0.12)", badgeText: "#f87171", dot: "#ef4444" },
    warning: { icon: AlertTriangle, badge: "rgba(245,158,11,0.12)", badgeText: "#fbbf24", dot: "#f59e0b" },
    success: { icon: TrendingUp, badge: "rgba(16,185,129,0.12)", badgeText: "#34d399", dot: "#10b981" },
    info: { icon: Sparkles, badge: "rgba(59,130,246,0.12)", badgeText: "#60a5fa", dot: "#3b82f6" },
};

export default function NotificationCenter({ role }: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });
    const [hasMounted, setHasMounted] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const unreadQuery = useGetUnreadMessagesQuery(undefined, { pollingInterval: 30000, refetchOnFocus: true, refetchOnReconnect: true });
    const [markMessageAsRead, { isLoading: isMarkingSingle }] = useMarkMessageAsReadMutation();
    const [markMultipleMessagesAsRead, { isLoading: isMarkingAll }] = useMarkMultipleMessagesAsReadMutation();

    const { data: auditLogsData = [] } = useGetAuditLogsQuery({}, { skip: role !== "Admin" });
    const { data: revenueSummary } = useGetRevenueSummaryQuery(undefined, { skip: role !== "Officer" });
    const { data: salesTransactions = [] } = useGetSalesTransactionsQuery(undefined, { skip: role !== "Officer" });
    const { data: stakeholderInsights } = useGetStakeholderInsightsQuery(undefined, { skip: role !== "Stakeholder" });
    const { data: anomaliesData } = useGetAnalyticsAnomaliesQuery(undefined, { skip: role === "Stakeholder" });

    const unreadMessages = unreadQuery.data?.messages ?? [];
    const unreadCount = unreadQuery.data?.count ?? 0;
    const auditLogs = auditLogsData as AuditLogItem[];

    useEffect(() => { setHasMounted(true); }, []);

    const openPanel = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPanelPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
        }
        setIsOpen((p) => !p);
    };

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            if (!buttonRef.current?.contains(t) && !panelRef.current?.contains(t)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    const systemSignals = useMemo<SystemSignal[]>(() => {
        const signals: SystemSignal[] = [];

        if (role === "Admin") {
            const recentLogins = auditLogs.filter((l) => l.action === "LOGIN").length;
            const permChanges = auditLogs.filter((l) => ["PERMISSION_CHANGE", "USER_DEACTIVATE", "USER_DELETE"].includes(l.action));
            const anomalyCount = anomaliesData?.anomalies?.length ?? 0;

            if (anomalyCount > 0) signals.push({ id: "admin-anomalies", title: `${anomalyCount} anomaly alert${anomalyCount === 1 ? "" : "s"}`, description: "Revenue patterns need admin review before affecting reporting quality.", timestamp: "", severity: anomalyCount > 3 ? "critical" : "warning" });
            if (permChanges.length > 0) signals.push({ id: `admin-security-${permChanges[0].id}`, title: "Recent security-sensitive account activity", description: `${permChanges.length} user access/permission event(s) were logged.`, timestamp: permChanges[0].timestamp, severity: "warning" });
            if (recentLogins > 0) signals.push({ id: "admin-logins", title: "Platform activity is healthy", description: `${recentLogins} login event(s) captured in the latest audit window.`, timestamp: auditLogs[0]?.timestamp || "", severity: "success" });
        }

        if (role === "Officer") {
            const pending = revenueSummary?.pending_entries ?? 0;
            const flagged = revenueSummary?.flagged_entries ?? 0;
            const latestPending = (salesTransactions as Array<{ status: string; created_at: string }>).find((s) => s.status === "Pending");

            if (flagged > 0) signals.push({ id: "officer-flagged", title: `${flagged} flagged revenue entr${flagged === 1 ? "y" : "ies"}`, description: "Review these transactions to reduce reporting risk.", timestamp: "", severity: "critical" });
            if (pending > 0) signals.push({ id: "officer-pending", title: `${pending} transaction${pending === 1 ? "" : "s"} pending validation`, description: "Clear validation backlog to keep reporting current.", timestamp: latestPending?.created_at || "", severity: "warning" });
            if ((revenueSummary?.today_revenue ?? 0) > 0) signals.push({ id: "officer-revenue", title: "Today's revenue feed is active", description: "Collections are flowing and summary metrics are updating in real time.", timestamp: "", severity: "success" });
        }

        if (role === "Stakeholder") {
            const compliance = stakeholderInsights?.overview?.compliance_rate ?? 0;
            const growth = stakeholderInsights?.overview?.annual_growth_rate ?? 0;
            const activeSites = stakeholderInsights?.overview?.active_sites ?? 0;

            signals.push({ id: "stakeholder-compliance", title: `Compliance rate at ${compliance.toFixed(1)}%`, description: "Governance performance tracked from approved reporting activity.", timestamp: "", severity: compliance >= 80 ? "success" : "warning" });
            signals.push({ id: "stakeholder-growth", title: `Annual revenue trend ${growth >= 0 ? "up" : "down"} ${Math.abs(growth).toFixed(1)}%`, description: `${activeSites} active mining site(s) contributing to the current cycle.`, timestamp: "", severity: growth >= 0 ? "info" : "warning" });
        }

        return signals.slice(0, 3);
    }, [role, auditLogs, anomaliesData, revenueSummary, salesTransactions, stakeholderInsights]);

    const handleMarkOneRead = async (id: number) => {
        try { await markMessageAsRead(id).unwrap(); unreadQuery.refetch(); } catch { /* noop */ }
    };

    const handleMarkAllRead = async () => {
        if (!unreadMessages.length) return;
        try { await markMultipleMessagesAsRead(unreadMessages.map((m) => m.id)).unwrap(); unreadQuery.refetch(); } catch { /* noop */ }
    };

    const renderMessage = (message: CommunicationMessage) => (
        <button
            key={message.id}
            type="button"
            onClick={() => handleMarkOneRead(message.id)}
            className="w-full rounded-xl p-3 text-left transition-all"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
        >
            <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0" style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}>
                    <Mail size={15} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                            {message.subject || "New message"}
                        </p>
                        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: "#3b82f6" }} />
                    </div>
                    <p className="mt-1 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>{message.message_content}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        <span>From {message.sender_details?.full_name || message.sender_details?.username || "System"}</span>
                        <span>{hasMounted ? formatRelativeTime(message.timestamp) : "Recent"}</span>
                    </div>
                </div>
            </div>
        </button>
    );

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={openPanel}
                className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)", color: "#cbd5e1" }}
                aria-label="Open notifications"
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span
                        className="absolute -right-1 -top-1 flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-bold text-white shadow-sm"
                        style={{ background: "#ef4444" }}
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Fixed-position panel — always above sidebar */}
            {isOpen && (
                <div
                    ref={panelRef}
                    className="fixed animate-slide-down"
                    style={{
                        top: panelPos.top,
                        right: panelPos.right,
                        zIndex: 9999,
                        width: 360,
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                        borderRadius: 20,
                        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--card-border)" }}>
                        <div>
                            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</h3>
                            <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0 || isMarkingAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all disabled:opacity-40"
                            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-elevated)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                            <CheckCheck size={13} />
                            Mark all read
                        </button>
                    </div>

                    <div className="p-4 space-y-5 max-h-[480px] overflow-y-auto">
                        {/* Messages */}
                        <section>
                            <div className="flex items-center gap-2 mb-2.5">
                                <Mail size={13} style={{ color: "#3b82f6" }} />
                                <h4 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>New Messages</h4>
                            </div>
                            {unreadQuery.isLoading ? (
                                <div className="rounded-xl p-4 text-center text-sm" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                                    Loading notifications…
                                </div>
                            ) : unreadMessages.length > 0 ? (
                                <div className="space-y-2">{unreadMessages.map(renderMessage)}</div>
                            ) : (
                                <div className="rounded-xl p-4 text-center" style={{ background: "var(--bg-elevated)", border: "1px dashed var(--border)" }}>
                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No new messages</p>
                                    <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>Incoming messages will appear here until read.</p>
                                </div>
                            )}
                        </section>

                        {/* System Signals */}
                        <section>
                            <div className="flex items-center gap-2 mb-2.5">
                                <Shield size={13} style={{ color: "#f59e0b" }} />
                                <h4 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>Live System Signals</h4>
                            </div>
                            <div className="space-y-2">
                                {systemSignals.map((signal) => {
                                    const cfg = severityConfig[signal.severity];
                                    const Icon = cfg.icon;
                                    return (
                                        <div
                                            key={signal.id}
                                            className="rounded-xl p-3"
                                            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0" style={{ background: cfg.badge, color: cfg.badgeText }}>
                                                    <Icon size={15} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{signal.title}</p>
                                                        <span
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
                                                            style={{ background: cfg.badge, color: cfg.badgeText }}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                                                            {signal.severity}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>{signal.description}</p>
                                                    <div className="mt-2 flex items-center gap-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                                                        <Clock3 size={11} />
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
                        <div className="px-4 py-2 text-xs" style={{ background: "var(--accent-soft)", color: "var(--accent)", borderTop: "1px solid var(--border)" }}>
                            Updating notification state…
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
