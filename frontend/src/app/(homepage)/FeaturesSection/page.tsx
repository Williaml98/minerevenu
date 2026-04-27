"use client";
import React from "react";
import { BarChart3, BrainCircuit, Shield, FileText, Lock, TrendingUp } from "lucide-react";

const features = [
    { icon: BarChart3, title: "Real-Time Revenue Tracking", description: "Live dashboards with instant updates across all mining income streams and comprehensive analytics.", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { icon: BrainCircuit, title: "AI-Powered Forecasting", description: "Advanced machine learning models predict revenue trends and detect anomalies before they impact operations.", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    { icon: Shield, title: "Compliance & Transparency", description: "Automated regulatory reporting with full audit trails and stakeholder-ready documentation.", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { icon: FileText, title: "Automated Reports", description: "Monthly and yearly financial insights generated automatically with export to PDF and CSV.", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { icon: Lock, title: "Secure Cloud Storage", description: "Enterprise-grade encryption with role-based access control — Admin, Officer, and Stakeholder views.", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    { icon: TrendingUp, title: "Multi-role Dashboards", description: "Tailored views for every role with the right data, actions, and insights at the right level of detail.", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
];

const FeaturesSection: React.FC = () => (
    <section id="features" className="py-24" style={{ background: "var(--bg-base)" }}>
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <span
                    className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                    style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}
                >
                    Platform capabilities
                </span>
                <h2
                    className="text-4xl md:text-5xl font-bold mb-5"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
                >
                    Built for Mining Intelligence
                </h2>
                <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Every feature engineered around the real-world needs of mining finance, compliance, and operations teams.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feat, i) => (
                    <div
                        key={feat.title}
                        className={`ds-card p-7 animate-slide-up stagger-${Math.min(i + 1, 6)} group cursor-default`}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = feat.color + "44"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--card-border)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                    >
                        <div
                            className="flex items-center justify-center w-12 h-12 rounded-2xl mb-5 transition-transform group-hover:scale-110"
                            style={{ background: feat.bg }}
                        >
                            <feat.icon size={22} style={{ color: feat.color }} />
                        </div>
                        <h3 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                            {feat.title}
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            {feat.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default FeaturesSection;
