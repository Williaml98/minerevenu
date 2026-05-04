"use client";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useGetMyDetailsMutation } from "@/lib/redux/slices/AuthSlice";
import NotificationCenter from "@/components/shared/NotificationCenter";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { RefreshCw, Settings, User } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
    onSearch: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
    const { data: sessionData } = useSession();
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
    const [getMyDetails, { data: userDetails, isLoading, error }] = useGetMyDetailsMutation();
    const [localPicUrl, setLocalPicUrl] = useState<string | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const stableOnSearch = useCallback(onSearch, []); // eslint-disable-line
    useEffect(() => { stableOnSearch(""); }, [stableOnSearch]);
    useEffect(() => { getMyDetails({}); }, [getMyDetails]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("mr_profile_pic");
            if (stored) setLocalPicUrl(stored);
        } catch { /* noop */ }
        const handler = () => {
            try {
                const stored = localStorage.getItem("mr_profile_pic");
                if (stored) setLocalPicUrl(stored);
            } catch { /* noop */ }
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const getProfileImageUrl = () => {
        if (userDetails?.profile_picture) {
            if (userDetails.profile_picture.startsWith("/media/")) return `http://127.0.0.1:8000${userDetails.profile_picture}`;
            if (userDetails.profile_picture.startsWith("http")) return userDetails.profile_picture;
            return userDetails.profile_picture.startsWith("/") ? userDetails.profile_picture : `/${userDetails.profile_picture}`;
        }
        return localPicUrl || "/profile.jpg";
    };

    const getInitials = () => {
        if (!userDetails?.username) return "SH";
        const parts = userDetails.username.trim().split(" ");
        return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : userDetails.username.substring(0, 2).toUpperCase();
    };

    const openDropdown = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
        }
        setShowDropdown((p) => !p);
        if (!showDropdown) getMyDetails({});
    };

    useEffect(() => {
        if (!showDropdown) return;
        const handler = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            if (!t.closest(".profile-trigger") && !t.closest(".profile-panel")) setShowDropdown(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showDropdown]);

    void sessionData;

    return (
        <header
            className="sticky top-0 z-[90] w-full"
            style={{
                background: "var(--navbar-bg)",
                borderBottom: "1px solid var(--navbar-border)",
                boxShadow: "var(--navbar-shadow)",
            }}
        >
            <div className="flex items-center justify-between px-5 py-3 gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "#a78bfa" }}>
                        Stakeholder
                    </span>
                    <span style={{ color: "var(--navbar-separator)" }}>·</span>
                    <span className="text-sm font-medium" style={{ color: "var(--navbar-subtitle)" }}>
                        Executive Overview
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <NotificationCenter role="Stakeholder" />

                    <button
                        ref={triggerRef}
                        onClick={openDropdown}
                        className="profile-trigger flex items-center justify-center w-10 h-10 rounded-full overflow-hidden cursor-pointer transition-all"
                        style={{ background: "linear-gradient(135deg,#3b1f6e,#7c3aed)", border: "2px solid rgba(255,255,255,0.55)", boxShadow: "0 0 0 1px rgba(124,58,237,0.5), 0 2px 8px rgba(0,0,0,0.3)" }}
                        aria-label="Profile menu"
                    >
                        {(userDetails?.profile_picture || localPicUrl) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={getProfileImageUrl()} alt="Profile" width={40} height={40} className="object-cover w-full h-full"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                            <span className="text-sm font-semibold text-white">{getInitials()}</span>
                        )}
                    </button>
                </div>
            </div>

            {showDropdown && (
                <div
                    className="profile-panel fixed animate-slide-down"
                    style={{
                        top: dropdownPos.top,
                        right: dropdownPos.right,
                        zIndex: 9999,
                        width: 280,
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                        borderRadius: 20,
                        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                        overflow: "hidden",
                    }}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-6">
                            <RefreshCw size={16} className="animate-spin" style={{ color: "#a78bfa" }} />
                            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading…</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-6 px-4">
                            <p className="text-sm" style={{ color: "var(--status-danger)" }}>Failed to load profile</p>
                            <button onClick={() => getMyDetails({})} className="mt-2 text-sm underline" style={{ color: "var(--accent)" }}>Retry</button>
                        </div>
                    ) : userDetails ? (
                        <>
                            <div
                                className="flex items-center gap-3 px-4 py-4"
                                style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(236,72,153,0.1))", borderBottom: "1px solid var(--card-border)" }}
                            >
                                <div className="flex items-center justify-center w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: "linear-gradient(135deg,#3b1f6e,#7c3aed)" }}>
                                    {(userDetails.profile_picture || localPicUrl) ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={getProfileImageUrl()} alt="Profile" width={48} height={48} className="object-cover w-full h-full" />
                                    ) : (
                                        <span className="text-lg font-bold text-white">{getInitials()}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{userDetails.username}</p>
                                    <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{userDetails.email}</p>
                                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>
                                        {userDetails.role}
                                    </span>
                                </div>
                            </div>
                            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--card-border)" }}>
                                <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: "var(--text-tertiary)" }}>User ID</p>
                                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>#{userDetails.id}</p>
                            </div>
                            <div className="p-2">
                                <Link href="/stakeholder/settings" onClick={() => setShowDropdown(false)}
                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                                    style={{ color: "var(--text-secondary)" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--bg-elevated)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; }}>
                                    <Settings size={15} /> Settings
                                </Link>
                                <button onClick={() => getMyDetails({})}
                                    className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-sm font-medium transition-all"
                                    style={{ color: "var(--text-secondary)" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-elevated)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}>
                                    <RefreshCw size={15} /> Refresh Profile
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <User size={28} className="mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} />
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No profile data</p>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
