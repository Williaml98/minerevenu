"use client";
import React from "react";
import { CheckCircle2 } from "lucide-react";

const impacts = [
    { title: "Accurate real-time updates", description: "Eliminate revenue delays with instant data synchronization across all mining sites." },
    { title: "Transparency in allocation", description: "Build trust with stakeholders through clear, auditable revenue distribution tracking." },
    { title: "Predictive insights", description: "Reduce risks of mismanagement with AI-powered revenue forecasting models." },
    { title: "Better decisions", description: "Make data-driven strategies with comprehensive analytics and historical trends." },
    { title: "Compliance-ready", description: "Seamless government reporting with automated compliance tools and audit trails." },
    { title: "Multi-role access", description: "Every stakeholder gets the right view — Admin, Officer, or Executive dashboard." },
];

const ImpactSection: React.FC = () => (
    <section className="py-24" style={{ background: "var(--bg-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <span
                    className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                    style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}
                >
                    Why MineRevenue
                </span>
                <h2 className="text-4xl md:text-5xl font-bold mb-5" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                    Measurable Impact
                </h2>
                <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                    Transform mining revenue management with tangible benefits for every stakeholder in the value chain.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {impacts.map((item, i) => (
                    <div
                        key={item.title}
                        className={`flex items-start gap-4 p-5 rounded-2xl animate-slide-up stagger-${Math.min(i + 1, 6)} transition-all`}
                        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(16,185,129,0.3)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--card-border)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            <CheckCircle2 size={20} style={{ color: "#10b981" }} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                                {item.title}
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default ImpactSection;
