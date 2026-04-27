"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/shared/ThemeToggle";

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handler);

        // Detect initial theme
        const checkTheme = () => setIsDark(document.documentElement.getAttribute("data-theme") !== "light");
        checkTheme();
        const obs = new MutationObserver(checkTheme);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

        return () => { window.removeEventListener("scroll", handler); obs.disconnect(); };
    }, []);

    // When scrolled: always dark navbar → always use light text
    // When not scrolled + light theme: transparent over dark hero → still use light text
    const linkColor = "#94a3b8";
    const linkHoverColor = "#f1f5f9";
    const linkStyle: React.CSSProperties = { color: linkColor, fontSize: 14, fontWeight: 500, transition: "color 0.15s ease", textDecoration: "none" };
    const linkHover = (e: React.MouseEvent) => { (e.currentTarget as HTMLAnchorElement).style.color = linkHoverColor; };
    const linkLeave = (e: React.MouseEvent) => { (e.currentTarget as HTMLAnchorElement).style.color = linkColor; };

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                background: scrolled
                    ? "rgba(3,13,31,0.96)"
                    : isDark ? "transparent" : "rgba(3,13,31,0.72)",
                backdropFilter: scrolled || !isDark ? "blur(20px)" : "none",
                borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
            }}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div
                            className="flex items-center justify-center w-8 h-8 rounded-xl transition-transform group-hover:scale-105"
                            style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 4px 12px rgba(37,99,235,0.35)" }}
                        >
                            <TrendingUp size={15} color="#fff" />
                        </div>
                        <span className="text-base font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>MineRevenue</span>
                    </Link>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center gap-8">
                        {[["#features", "Features"], ["#about", "About"], ["#contact", "Contact"]].map(([href, label]) => (
                            <a key={href} href={href} style={linkStyle} onMouseEnter={linkHover} onMouseLeave={linkLeave}>{label}</a>
                        ))}
                    </div>

                    {/* Right actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggle />
                        <Link
                            href="/auth"
                            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                            style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
                        >
                            Sign in
                        </Link>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all"
                        style={{ background: "rgba(255,255,255,0.08)", color: "#cbd5e1" }}
                    >
                        {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div
                        className="md:hidden rounded-2xl mb-4 p-5 animate-slide-down"
                        style={{ background: "rgba(11,17,32,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                        <div className="flex flex-col gap-2">
                            {[["#features", "Features"], ["#about", "About"], ["#contact", "Contact"]].map(([href, label]) => (
                                <a
                                    key={href}
                                    href={href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                    style={{ color: "#7c8fac" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLAnchorElement).style.color = "#f1f5f9"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#7c8fac"; }}
                                >
                                    {label}
                                </a>
                            ))}
                            <div className="flex items-center gap-2 mt-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                                <ThemeToggle />
                                <Link
                                    href="/auth"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                                    style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
