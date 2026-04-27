"use client";
import React from "react";
import Link from "next/link";
import { TrendingUp, Mail, Phone, MapPin } from "lucide-react";

const Footer: React.FC = () => (
    <footer style={{ background: "#030d1f", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                {/* Brand */}
                <div className="md:col-span-2">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div
                            className="flex items-center justify-center w-9 h-9 rounded-xl"
                            style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 4px 12px rgba(37,99,235,0.35)" }}
                        >
                            <TrendingUp size={16} color="#fff" />
                        </div>
                        <span className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>MineRevenue</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: "#4b6080" }}>
                        Empowering transparent and accountable mining revenue management through cutting-edge AI technology and real-time analytics.
                    </p>
                    <div className="flex gap-2">
                        {["in", "tw", "fb"].map((s) => (
                            <button
                                key={s}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white uppercase transition-all"
                                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(37,99,235,0.2)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Quick links</h4>
                    <ul className="space-y-3">
                        {[["#features", "Features"], ["#about", "About"], ["#contact", "Contact"], ["/", "Privacy Policy"]].map(([href, label]) => (
                            <li key={href}>
                                <a
                                    href={href}
                                    className="text-sm transition-colors"
                                    style={{ color: "#4b6080" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#93c5fd"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#4b6080"; }}
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact</h4>
                    <div className="space-y-3">
                        {[
                            { Icon: Mail, text: "info@minerevenue.com" },
                            { Icon: Phone, text: "+250 (0) 123 456 789" },
                            { Icon: MapPin, text: "Kigali, Rwanda" },
                        ].map(({ Icon, text }) => (
                            <div key={text} className="flex items-center gap-2.5">
                                <Icon size={14} style={{ color: "#3b82f6", flexShrink: 0 }} />
                                <span className="text-sm" style={{ color: "#4b6080" }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-xs" style={{ color: "#2d3f55" }}>
                    © {new Date().getFullYear()} Vision Nouvel Pour le Développement de la Femme. All rights reserved.
                </p>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981" }} />
                    <span className="text-xs" style={{ color: "#2d3f55" }}>All systems operational</span>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
