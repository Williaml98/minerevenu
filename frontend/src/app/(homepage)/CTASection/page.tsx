"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection: React.FC = () => (
    <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#030d1f 0%,#0a1628 50%,#091228 100%)" }}>
        {/* Grid */}
        <div
            className="absolute inset-0"
            style={{
                backgroundImage: "linear-gradient(rgba(59,130,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.05) 1px,transparent 1px)",
                backgroundSize: "48px 48px",
            }}
        />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64" style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.2) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold uppercase tracking-widest"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}
            >
                <Sparkles size={12} /> Get started today
            </span>
            <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
            >
                Start Tracking Mining
                <br />
                <span style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Revenue Today
                </span>
            </h2>
            <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "#7c8fac" }}>
                Join mining operations, government bodies, and financial institutions already using MineRevenue to bring full transparency to mining revenues.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                    href="/auth"
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold text-white transition-all"
                    style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 8px 32px rgba(37,99,235,0.4)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
                >
                    Sign up free <ArrowRight size={17} />
                </Link>
                <a
                    href="#features"
                    className="inline-flex items-center px-6 py-4 rounded-2xl text-base font-medium transition-all"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.10)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; }}
                >
                    Learn more
                </a>
            </div>
        </div>
    </section>
);

export default CTASection;
