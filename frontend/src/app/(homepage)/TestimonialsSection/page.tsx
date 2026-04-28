"use client";
import React from "react";

const testimonials = [
    { quote: "MineRevenue ensures absolute fairness in revenue distribution for all stakeholders. The transparency is unprecedented.", author: "Sarah Johnson", role: "Community Leader", avatar: "SJ" },
    { quote: "Real-time tracking and AI forecasting have completely transformed how we manage mining operations and finances.", author: "Michael Chen", role: "Mining Operations Director", avatar: "MC" },
    { quote: "Finally, a system that brings true accountability to mining revenue distribution at a government level.", author: "Dr. Amara Kone", role: "Government Advisor", avatar: "AK" },
];

const TestimonialsSection: React.FC = () => (
    <section className="py-24" style={{ background: "var(--bg-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <span
                    className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4 animate-fade-in"
                    style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}
                >
                    Trusted worldwide
                </span>
                <h2
                    className="text-4xl md:text-5xl font-bold mb-5 animate-slide-up stagger-1"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
                >
                    What Stakeholders Say
                </h2>
                <p className="text-lg max-w-2xl mx-auto animate-slide-up stagger-2" style={{ color: "var(--text-secondary)" }}>
                    Trusted by mining operations, communities, and government institutions worldwide.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                    <div
                        key={i}
                        className={`ds-card p-7 animate-slide-up stagger-${i + 1} relative`}
                        style={{ borderTop: "2px solid var(--accent)" }}
                    >
                        <p className="text-4xl font-bold mb-4" style={{ color: "var(--accent)", lineHeight: 1 }}>"</p>
                        <p className="text-base leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
                            {t.quote}
                        </p>
                        <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                            <div
                                className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-white flex-shrink-0"
                                style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}
                            >
                                {t.avatar}
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.author}</p>
                                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default TestimonialsSection;
