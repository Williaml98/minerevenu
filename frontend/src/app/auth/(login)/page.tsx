"use client";

import { useState } from "react";
import { Eye, EyeOff, TrendingUp, ArrowLeft, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const getRedirectPath = (role: string) => {
        switch (role.toLowerCase()) {
            case "admin": return "/admin";
            case "stakeholder": return "/stakeholder";
            case "officer": return "/officer";
            default: return "/";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await signIn("credentials", { redirect: false, email, password });
            if (result?.error) {
                toast.error(result.error === "CredentialsSignin" ? "Invalid email or password." : result.error, {
                    style: { background: "#1a0a0a", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" },
                });
            } else {
                const sessionResponse = await fetch("/api/auth/session");
                const session = await sessionResponse.json();
                const userRole = session?.user?.role || "User";
                toast.success(`Welcome back — redirecting to ${userRole.toLowerCase()} dashboard`, {
                    style: { background: "#0a1a0a", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)" },
                    duration: 2500,
                });
                setTimeout(() => router.push(getRedirectPath(userRole)), 1200);
            }
        } catch {
            toast.error("Login failed. Please try again.", {
                style: { background: "#1a0a0a", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" },
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>

            {/* ── Left panel ── */}
            <div
                className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-14"
                style={{ background: "linear-gradient(145deg, #020c1e 0%, #081224 40%, #060e1e 100%)" }}
            >
                {/* Grid */}
                <div className="absolute inset-0" style={{
                    backgroundImage: "linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                }} />

                {/* Glow orbs */}
                <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 65%)" }} />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 65%)" }} />
                <div className="absolute top-2/3 left-1/4 w-56 h-56 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 65%)" }} />

                {/* Brand */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="flex items-center justify-center w-11 h-11 rounded-2xl" style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 4px 20px rgba(37,99,235,0.45)" }}>
                            <TrendingUp size={20} color="#fff" />
                        </div>
                        <span className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>MineRevenue</span>
                    </Link>
                </div>

                {/* SVG Illustration */}
                <div className="relative z-10 flex-1 flex items-center justify-center py-8">
                    <svg viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-lg">
                        {/* Dashboard frame */}
                        <rect x="30" y="30" width="460" height="300" rx="20" fill="#0b1726" stroke="#1e3a5f" strokeWidth="1.5"/>
                        <rect x="30" y="30" width="460" height="46" rx="20" fill="#0d1e30"/>
                        <rect x="30" y="60" width="460" height="16" fill="#0d1e30"/>
                        {/* Title bar dots */}
                        <circle cx="56" cy="53" r="5" fill="#e11d48" opacity="0.7"/>
                        <circle cx="74" cy="53" r="5" fill="#f59e0b" opacity="0.7"/>
                        <circle cx="92" cy="53" r="5" fill="#10b981" opacity="0.7"/>
                        {/* Header text lines */}
                        <rect x="116" y="48" width="80" height="8" rx="4" fill="#1e3a5f"/>
                        <rect x="370" y="48" width="60" height="8" rx="4" fill="#1e3a5f"/>

                        {/* KPI Cards row */}
                        <rect x="50" y="90" width="95" height="62" rx="10" fill="#0f2035" stroke="#1e3a5f" strokeWidth="1"/>
                        <rect x="60" y="100" width="30" height="5" rx="2.5" fill="#3d5a7a"/>
                        <rect x="60" y="111" width="50" height="9" rx="4" fill="#f59e0b" opacity="0.9"/>
                        <circle cx="128" cy="102" r="10" fill="rgba(245,158,11,0.15)"/>
                        <rect x="60" y="128" width="40" height="4" rx="2" fill="#1e3a5f"/>
                        <rect x="105" y="128" width="18" height="4" rx="2" fill="rgba(16,185,129,0.6)"/>

                        <rect x="158" y="90" width="95" height="62" rx="10" fill="#0f2035" stroke="#1e3a5f" strokeWidth="1"/>
                        <rect x="168" y="100" width="30" height="5" rx="2.5" fill="#3d5a7a"/>
                        <rect x="168" y="111" width="50" height="9" rx="4" fill="#3b82f6" opacity="0.9"/>
                        <circle cx="236" cy="102" r="10" fill="rgba(59,130,246,0.15)"/>
                        <rect x="168" y="128" width="40" height="4" rx="2" fill="#1e3a5f"/>
                        <rect x="213" y="128" width="18" height="4" rx="2" fill="rgba(16,185,129,0.6)"/>

                        <rect x="266" y="90" width="95" height="62" rx="10" fill="#0f2035" stroke="#1e3a5f" strokeWidth="1"/>
                        <rect x="276" y="100" width="30" height="5" rx="2.5" fill="#3d5a7a"/>
                        <rect x="276" y="111" width="50" height="9" rx="4" fill="#10b981" opacity="0.9"/>
                        <circle cx="344" cy="102" r="10" fill="rgba(16,185,129,0.15)"/>
                        <rect x="276" y="128" width="40" height="4" rx="2" fill="#1e3a5f"/>
                        <rect x="321" y="128" width="18" height="4" rx="2" fill="rgba(16,185,129,0.6)"/>

                        <rect x="374" y="90" width="95" height="62" rx="10" fill="#0f2035" stroke="#1e3a5f" strokeWidth="1"/>
                        <rect x="384" y="100" width="30" height="5" rx="2.5" fill="#3d5a7a"/>
                        <rect x="384" y="111" width="50" height="9" rx="4" fill="#8b5cf6" opacity="0.9"/>
                        <circle cx="452" cy="102" r="10" fill="rgba(139,92,246,0.15)"/>
                        <rect x="384" y="128" width="40" height="4" rx="2" fill="#1e3a5f"/>
                        <rect x="429" y="128" width="18" height="4" rx="2" fill="rgba(16,185,129,0.6)"/>

                        {/* Revenue area chart */}
                        <rect x="50" y="168" width="270" height="140" rx="10" fill="#0f2035" stroke="#1e3a5f" strokeWidth="1"/>
                        <rect x="64" y="178" width="80" height="6" rx="3" fill="#3d5a7a"/>
                        <rect x="64" y="188" width="50" height="4" rx="2" fill="#1e3a5f"/>
                        {/* Chart grid lines */}
                        <line x1="64" y1="290" x2="306" y2="290" stroke="#1e3a5f" strokeWidth="0.5"/>
                        <line x1="64" y1="270" x2="306" y2="270" stroke="#1e3a5f" strokeWidth="0.5"/>
                        <line x1="64" y1="250" x2="306" y2="250" stroke="#1e3a5f" strokeWidth="0.5"/>
                        <line x1="64" y1="230" x2="306" y2="230" stroke="#1e3a5f" strokeWidth="0.5"/>
                        <line x1="64" y1="210" x2="306" y2="210" stroke="#1e3a5f" strokeWidth="0.5"/>
                        {/* Area fill */}
                        <path d="M64 278 L100 260 L140 270 L180 245 L220 252 L260 228 L300 235 L306 235 L306 290 L64 290 Z" fill="url(#revGrad)" opacity="0.7"/>
                        {/* Line */}
                        <path d="M64 278 L100 260 L140 270 L180 245 L220 252 L260 228 L300 235" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        {/* Dots */}
                        <circle cx="64"  cy="278" r="3.5" fill="#3b82f6"/>
                        <circle cx="100" cy="260" r="3.5" fill="#3b82f6"/>
                        <circle cx="140" cy="270" r="3.5" fill="#3b82f6"/>
                        <circle cx="180" cy="245" r="3.5" fill="#3b82f6"/>
                        <circle cx="220" cy="252" r="3.5" fill="#3b82f6"/>
                        <circle cx="260" cy="228" r="5"   fill="#fff" stroke="#3b82f6" strokeWidth="2"/>
                        <circle cx="300" cy="235" r="3.5" fill="#3b82f6"/>
                        {/* Active tooltip */}
                        <rect x="238" y="208" width="72" height="32" rx="8" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1"/>
                        <rect x="248" y="216" width="28" height="4" rx="2" fill="#3d5a7a"/>
                        <rect x="248" y="224" width="42" height="5" rx="2.5" fill="#60a5fa"/>
                        <line x1="260" y1="240" x2="260" y2="228" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2"/>

                        {/* Pie / Donut chart card */}
                        <rect x="334" y="168" width="135" height="140" rx="10" fill="#0f2035" stroke="#1e3a5f" strokeWidth="1"/>
                        <rect x="348" y="178" width="60" height="6" rx="3" fill="#3d5a7a"/>
                        {/* Donut */}
                        <circle cx="401" cy="248" r="38" fill="none" stroke="#1e3a5f" strokeWidth="18"/>
                        <circle cx="401" cy="248" r="38" fill="none" stroke="#f59e0b" strokeWidth="18" strokeDasharray="72 167" strokeDashoffset="0" strokeLinecap="butt"/>
                        <circle cx="401" cy="248" r="38" fill="none" stroke="#3b82f6" strokeWidth="18" strokeDasharray="55 184" strokeDashoffset="-72" strokeLinecap="butt"/>
                        <circle cx="401" cy="248" r="38" fill="none" stroke="#10b981" strokeWidth="18" strokeDasharray="40 199" strokeDashoffset="-127" strokeLinecap="butt"/>
                        <circle cx="401" cy="248" r="38" fill="none" stroke="#8b5cf6" strokeWidth="18" strokeDasharray="32 207" strokeDashoffset="-167" strokeLinecap="butt"/>
                        <circle cx="401" cy="248" r="22" fill="#0f2035"/>
                        <rect x="391" y="241" width="20" height="5" rx="2.5" fill="#3d5a7a"/>
                        <rect x="386" y="250" width="30" height="5" rx="2.5" fill="#60a5fa"/>

                        {/* AI insight banner */}
                        <rect x="50" y="318" width="459" height="34" rx="10" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.2)" strokeWidth="1"/>
                        <circle cx="68" cy="335" r="8" fill="rgba(245,158,11,0.15)"/>
                        <rect x="56" cy="331" width="24" height="8" rx="4" fill="rgba(245,158,11,0.3)" x="56" y="331"/>
                        <rect x="86" y="330" width="100" height="5" rx="2.5" fill="rgba(245,158,11,0.5)"/>
                        <rect x="196" y="330" width="160" height="5" rx="2.5" fill="#3d5a7a"/>
                        <rect x="420" y="328" width="68" height="14" rx="7" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.3)" strokeWidth="1"/>
                        <rect x="434" y="333" width="40" height="4" rx="2" fill="rgba(245,158,11,0.6)"/>

                        {/* Floating badge top right */}
                        <rect x="340" y="10" width="110" height="30" rx="15" fill="#0d1e30" stroke="#1e3a5f" strokeWidth="1"/>
                        <circle cx="358" cy="25" r="5" fill="#10b981"/>
                        <rect x="368" y="21" width="60" height="8" rx="4" fill="#1e3a5f"/>

                        <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35"/>
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Stats */}
                <div className="relative z-10 grid grid-cols-3 gap-4 mb-8">
                    {[
                        { value: "98.4%", label: "Forecast accuracy" },
                        { value: "$2.4B+", label: "Revenue tracked" },
                        { value: "240+", label: "Active mines" },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-2xl px-4 py-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{stat.value}</p>
                            <p className="text-xs mt-0.5" style={{ color: "#4b6080" }}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Footer note */}
                <div className="relative z-10">
                    <p className="text-xs" style={{ color: "#3d5066" }}>
                        © {new Date().getFullYear()} MineRevenue · Vision Nouvel Pour le Développement de la Femme
                    </p>
                </div>
            </div>

            {/* ── Right panel — form ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: "var(--bg-base)" }}>
                <div className="w-full max-w-lg">

                    {/* Back */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm mb-10 transition-colors"
                        style={{ color: "var(--text-tertiary)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-tertiary)"; }}
                    >
                        <ArrowLeft size={15} />
                        Back to home
                    </Link>

                    {/* Card */}
                    <div
                        className="rounded-3xl p-10 animate-slide-up"
                        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow-lg)" }}
                    >
                        {/* Mobile logo */}
                        <div className="flex items-center gap-2 mb-8 lg:hidden">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
                                <TrendingUp size={16} color="#fff" />
                            </div>
                            <span className="text-base font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>MineRevenue</span>
                        </div>

                        {/* Heading */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                                Welcome back
                            </h1>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                Sign in to access your revenue intelligence dashboard.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                                    Email address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }}>
                                        <Mail size={16} />
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                                        style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}
                                        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--input-focus-border)"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px var(--input-focus-ring)"; }}
                                        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--input-border)"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Password</label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs transition-colors"
                                        style={{ color: "var(--accent)" }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent-hover)"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)"; }}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }}>
                                        <Lock size={16} />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-11 pr-14 py-3.5 rounded-xl text-sm outline-none transition-all"
                                        style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}
                                        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--input-focus-border)"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px var(--input-focus-ring)"; }}
                                        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--input-border)"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                                        style={{ color: "var(--text-tertiary)" }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)"; }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="rounded w-4 h-4"
                                    style={{ accentColor: "var(--accent)" }}
                                />
                                <label htmlFor="remember" className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                    Remember me for 30 days
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold text-white transition-all"
                                style={{
                                    background: isLoading ? "var(--text-tertiary)" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                    boxShadow: isLoading ? "none" : "0 8px 24px rgba(37,99,235,0.35)",
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                }}
                                onMouseEnter={(e) => { if (!isLoading) { (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #1d4ed8, #1e40af)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; } }}
                                onMouseLeave={(e) => { if (!isLoading) { (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #2563eb, #1d4ed8)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; } }}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Signing in…
                                    </>
                                ) : "Sign in"}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/auth/signup"
                                className="font-semibold transition-colors"
                                style={{ color: "var(--accent)" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent-hover)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)"; }}
                            >
                                Create account
                            </Link>
                        </p>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
                        {["256-bit SSL", "GDPR Ready", "SOC 2 Type II"].map((badge) => (
                            <div key={badge} className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{badge}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
