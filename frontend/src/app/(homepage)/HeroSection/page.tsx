"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import { useGetPublicStatsQuery } from "@/lib/redux/slices/MiningSlice";

function fmtRevenue(n: number): string {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B+`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M+`;
    return `$${n.toLocaleString()}`;
}

const MineTrackerHero: React.FC = () => {
    const { data: stats } = useGetPublicStatsQuery();

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(145deg,#030d1f 0%,#0a1628 45%,#091228 100%)" }}>
            {/* Grid overlay */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Glow orbs */}
            <div className="absolute top-1/4 left-1/5 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)" }} />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
            <div className="absolute top-1/2 right-1/5 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)" }} />

            {/* Video background */}
            <div className="absolute inset-0">
                <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-20">
                    <source src="/videos/Mining.mp4" type="video/mp4" />
                </video>
                {/* Gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, rgba(3,13,31,0.6) 0%, rgba(3,13,31,0.4) 40%, rgba(3,13,31,0.7) 100%)" }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 animate-fade-in" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd" }}>
                    <Zap size={13} />
                    <span className="text-xs font-semibold uppercase tracking-widest">AI-Powered Revenue Forecasting</span>
                </div>

                {/* Headline */}
                <h1
                    className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight animate-slide-up"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    Mine Smarter,{" "}
                    <span
                        style={{
                            background: "linear-gradient(135deg,#3b82f6,#8b5cf6,#06b6d4)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        Earn More
                    </span>
                </h1>

                {/* Sub */}
                <p className="text-xl sm:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up stagger-2" style={{ color: "#7c8fac" }}>
                    Real-time revenue tracking, AI-driven forecasting, and automated compliance — engineered for modern mining operations.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up stagger-3">
                    <Link
                        href="/auth"
                        className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold text-white transition-all"
                        style={{
                            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                            boxShadow: "0 8px 32px rgba(37,99,235,0.4)",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 12px 40px rgba(37,99,235,0.55)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(37,99,235,0.4)";
                        }}
                    >
                        Get started free
                        <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="#features"
                        className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-base font-medium transition-all"
                        style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "#cbd5e1",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.10)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; }}
                    >
                        Explore features
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto animate-slide-up stagger-4">
                    {[
                        {
                            value: stats ? `${stats.compliance_rate.toFixed(1)}%` : "—",
                            label: "Compliance rate",
                            icon: TrendingUp,
                        },
                        {
                            value: stats ? fmtRevenue(stats.total_revenue) : "—",
                            label: "Revenue tracked",
                            icon: Zap,
                        },
                        {
                            value: stats ? `${stats.active_sites}+` : "—",
                            label: "Mining sites monitored",
                            icon: Shield,
                        },
                    ].map(({ value, label, icon: Icon }) => (
                        <div
                            key={label}
                            className="rounded-2xl px-6 py-5 text-center"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            <div className="flex items-center justify-center mb-2">
                                <Icon size={16} style={{ color: "#3b82f6" }} />
                            </div>
                            <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
                            <p className="text-xs" style={{ color: "#4b6080" }}>{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decorative dots */}
            <div className="absolute top-20 left-16 w-3 h-3 rounded-full animate-pulse" style={{ background: "#3b82f6", opacity: 0.4 }} />
            <div className="absolute top-36 right-24 w-4 h-4 rounded-full animate-bounce" style={{ background: "#8b5cf6", opacity: 0.3, animationDelay: "0.5s" }} />
            <div className="absolute bottom-28 left-1/4 w-2 h-2 rounded-full animate-ping" style={{ background: "#06b6d4", opacity: 0.4 }} />
            <div className="absolute bottom-16 right-1/3 w-3 h-3 rounded-full animate-pulse" style={{ background: "#10b981", opacity: 0.35, animationDelay: "1s" }} />
        </section>
    );
};

export default MineTrackerHero;
