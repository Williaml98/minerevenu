"use client";

import { useState } from "react";
import { Eye, EyeOff, TrendingUp, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useGetPublicStatsQuery } from "@/lib/redux/slices/MiningSlice";

function fmtRevenue(n: number): string {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B+`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M+`;
    return `$${n.toLocaleString()}`;
}

export default function SignInPage() {
    const [email, setEmail]           = useState("");
    const [password, setPassword]     = useState("");
    const [isLoading, setIsLoading]   = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { data: stats } = useGetPublicStatsQuery();

    const getRedirectPath = (role: string) => {
        switch (role.toLowerCase()) {
            case "admin":       return "/admin";
            case "stakeholder": return "/stakeholder";
            case "officer":     return "/officer";
            default:            return "/";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await signIn("credentials", { redirect: false, email, password });
            if (result?.error) {
                toast.error(
                    result.error === "CredentialsSignin" ? "Invalid email or password." : result.error,
                    { style: { background: "#1a0a0a", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" } }
                );
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
        <>
            <style>{`
                /* ── Keyframes ── */
                @keyframes lgFadeUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
                @keyframes lgFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes lgSlideRight {
                    from { opacity: 0; transform: translateX(-32px); }
                    to   { opacity: 1; transform: translateX(0);     }
                }
                @keyframes lgSlideLeft {
                    from { opacity: 0; transform: translateX(32px); }
                    to   { opacity: 1; transform: translateX(0);    }
                }
                @keyframes lgShimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
                @keyframes lgPulse {
                    0%,100% { opacity: 0.6; transform: scale(1);    }
                    50%     { opacity: 1;   transform: scale(1.015); }
                }
                @keyframes lgSpin { to { transform: rotate(360deg); } }
                @keyframes lgBar  {
                    from { width: 0;   opacity: 0; }
                    to   { width: 60px; opacity: 1; }
                }
                @keyframes lgBlink {
                    0%,100% { opacity: 1; }
                    50%     { opacity: 0; }
                }

                /* ── Utility animation classes ── */
                .lg-fade-up    { animation: lgFadeUp     0.7s cubic-bezier(.16,1,.3,1) both; }
                .lg-fade-in    { animation: lgFadeIn     0.6s ease both; }
                .lg-slide-r    { animation: lgSlideRight 0.65s cubic-bezier(.16,1,.3,1) both; }
                .lg-slide-l    { animation: lgSlideLeft  0.65s cubic-bezier(.16,1,.3,1) both; }
                .lg-spin       { animation: lgSpin       0.75s linear infinite; }

                .ld-0  { animation-delay: 0s;    }
                .ld-1  { animation-delay: 0.10s; }
                .ld-2  { animation-delay: 0.18s; }
                .ld-3  { animation-delay: 0.26s; }
                .ld-4  { animation-delay: 0.34s; }
                .ld-5  { animation-delay: 0.42s; }
                .ld-6  { animation-delay: 0.50s; }
                .ld-7  { animation-delay: 0.58s; }
                .ld-8  { animation-delay: 0.66s; }
                .ld-9  { animation-delay: 0.74s; }

                /* ── Shimmer headline ── */
                .shimmer-headline {
                    background: linear-gradient(90deg,#fff 0%,#93c5fd 25%,#c4b5fd 50%,#fff 75%,#93c5fd 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: lgShimmer 4s linear infinite;
                }

                /* ── Decorative accent bar ── */
                .accent-bar {
                    height: 4px;
                    border-radius: 4px;
                    background: linear-gradient(90deg,#3b82f6,#8b5cf6,#06b6d4);
                    animation: lgBar 1s cubic-bezier(.16,1,.3,1) 0.3s both;
                    margin: 20px 0 24px;
                }

                /* ── Floating glass card ── */
                .glass-card {
                    background: rgba(255,255,255,0.13);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                    border: 1px solid rgba(255,255,255,0.22);
                    border-radius: 28px;
                    box-shadow: 0 32px 80px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18);
                }

                /* ── Form inputs ── */
                .lg-input {
                    width: 100%;
                    background: rgba(255,255,255,0.92);
                    border: 1.5px solid rgba(255,255,255,0.5);
                    border-radius: 14px;
                    padding: 14px 16px 14px 44px;
                    font-size: 14px;
                    color: #111827;
                    outline: none;
                    transition: all 0.2s ease;
                    font-family: inherit;
                }
                .lg-input::placeholder { color: #9ca3af; }
                .lg-input:focus {
                    background: #fff;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
                }

                /* ── Submit button ── */
                .lg-btn {
                    width: 100%;
                    padding: 15px;
                    border-radius: 14px;
                    background: linear-gradient(135deg,#2563eb,#1d4ed8);
                    color: #fff;
                    font-size: 15px;
                    font-weight: 700;
                    letter-spacing: 0.03em;
                    border: none;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    box-shadow: 0 8px 28px rgba(37,99,235,0.50);
                }
                .lg-btn:not(:disabled):hover {
                    background: linear-gradient(135deg,#1d4ed8,#1e40af);
                    transform: translateY(-2px);
                    box-shadow: 0 14px 36px rgba(37,99,235,0.60);
                }
                .lg-btn:not(:disabled):active { transform: translateY(0); }
                .lg-btn:disabled { opacity: 0.7; cursor: not-allowed; }

                /* ── Create account outline button ── */
                .lg-outline-btn {
                    width: 100%;
                    padding: 13px;
                    border-radius: 14px;
                    background: rgba(255,255,255,0.10);
                    border: 1.5px solid rgba(255,255,255,0.35);
                    color: rgba(255,255,255,0.90);
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: center;
                    display: block;
                    text-decoration: none;
                    letter-spacing: 0.01em;
                }
                .lg-outline-btn:hover {
                    background: rgba(255,255,255,0.18);
                    border-color: rgba(255,255,255,0.60);
                    color: #fff;
                    transform: translateY(-1px);
                }

                /* ── Pulsing dot ── */
                .pulse-dot { animation: lgPulse 2.4s ease-in-out infinite; }

                /* ── Divider ── */
                .lg-divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 18px 0;
                }
                .lg-divider::before,
                .lg-divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: rgba(255,255,255,0.22);
                }
            `}</style>

            {/* ── ROOT: full-screen wrapper ── */}
            <div className="relative min-h-screen w-full overflow-hidden flex items-center">

                {/* ── BACKGROUND: full-screen hero image ── */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/images/miner-hero.png"
                    alt="Mining operations"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: "center center" }}
                />

                {/* ── OVERLAY layers ── */}
                {/* Base dark tint */}
                <div className="absolute inset-0" style={{ background: "rgba(3,10,26,0.52)" }} />
                {/* Left-to-right gradient — keeps left text readable, fades right */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(3,10,26,0.68) 0%, rgba(3,10,26,0.30) 45%, rgba(3,10,26,0.10) 100%)" }} />
                {/* Bottom fade */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(3,10,26,0.60) 0%, transparent 40%)" }} />
                {/* Blue glow bottom-left */}
                <div className="absolute bottom-0 left-0 w-[500px] h-[300px] pointer-events-none pulse-dot"
                    style={{ background: "radial-gradient(ellipse at bottom left, rgba(37,99,235,0.28) 0%, transparent 70%)" }} />

                {/* ── CONTENT ROW ── */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-10 min-h-screen py-12">

                    {/* ════ LEFT — text over image ════ */}
                    <div className="flex-1 flex flex-col justify-center max-w-xl">

                        {/* Brand */}
                        <div className="lg-slide-r ld-0 flex items-center gap-3 mb-10">
                            <div
                                className="flex items-center justify-center w-12 h-12 rounded-2xl pulse-dot"
                                style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 6px 24px rgba(37,99,235,0.55)" }}
                            >
                                <TrendingUp size={22} color="#fff" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-white leading-none" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}>
                                    MINEREVENUE
                                </p>
                                <p className="text-[10px] uppercase tracking-[0.2em] mt-0.5" style={{ color: "rgba(147,197,253,0.75)" }}>
                                    Intelligence Platform
                                </p>
                            </div>
                        </div>

                        {/* Big headline */}
                        <h1
                            className="lg-slide-r ld-1 font-black leading-none mb-1 uppercase"
                            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem,6vw,5.5rem)", letterSpacing: "-0.01em" }}
                        >
                            <span className="shimmer-headline">MINE</span>
                        </h1>
                        <h1
                            className="lg-slide-r ld-2 font-black leading-none mb-1 uppercase"
                            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem,6vw,5.5rem)", letterSpacing: "-0.01em" }}
                        >
                            <span className="shimmer-headline">SMARTER,</span>
                        </h1>
                        <h1
                            className="lg-slide-r ld-3 font-black leading-none uppercase"
                            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem,6vw,5.5rem)", letterSpacing: "-0.01em" }}
                        >
                            <span className="shimmer-headline">EARN MORE.</span>
                        </h1>

                        {/* Accent bar */}
                        <div className="accent-bar" />

                        {/* Sub-tagline */}
                        <p className="lg-slide-r ld-4 text-base leading-relaxed mb-2" style={{ color: "rgba(226,232,240,0.85)", maxWidth: 420 }}>
                            Where real-time revenue data meets AI-driven forecasting.
                        </p>
                        <p className="lg-slide-r ld-5 text-sm leading-relaxed" style={{ color: "rgba(148,163,184,0.75)", maxWidth: 400 }}>
                            Empowering mining operations, government bodies, and stakeholders across Rwanda and beyond with full transparency.
                        </p>

                        {/* Stat chips — desktop only */}
                        <div className="lg-fade-up ld-6 hidden lg:flex items-center gap-4 mt-10 flex-wrap">
                            {[
                                {
                                    value: stats ? `${stats.compliance_rate.toFixed(1)}%` : "—",
                                    label: "Compliance",
                                },
                                {
                                    value: stats ? fmtRevenue(stats.total_revenue) : "—",
                                    label: "Tracked",
                                },
                                {
                                    value: stats ? `${stats.active_sites}+` : "—",
                                    label: "Mines",
                                },
                            ].map(({ value, label }) => (
                                <div
                                    key={label}
                                    className="rounded-2xl px-5 py-3 text-center"
                                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(12px)" }}
                                >
                                    <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
                                    <p className="text-[11px] mt-0.5 uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.70)" }}>{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ════ RIGHT — floating glass form card ════ */}
                    <div className="w-full lg:w-[420px] xl:w-[460px] flex-shrink-0">
                        <div className="glass-card lg-slide-l ld-2 p-8 xl:p-10">

                            {/* Card header */}
                            <div className="mb-7">
                                <h2
                                    className="lg-fade-up ld-3 text-2xl font-bold text-white mb-1"
                                    style={{ fontFamily: "var(--font-display)" }}
                                >
                                    Sign In
                                </h2>
                                <p className="lg-fade-up ld-4 text-sm" style={{ color: "rgba(203,213,225,0.75)" }}>
                                    Access your revenue intelligence dashboard.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Email */}
                                <div className="lg-fade-up ld-4">
                                    <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(226,232,240,0.90)" }}>
                                        Email
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6b7280" }}>
                                            <Mail size={16} />
                                        </span>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                            className="lg-input"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="lg-fade-up ld-5">
                                    <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(226,232,240,0.90)" }}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6b7280" }}>
                                            <Lock size={16} />
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••••••"
                                            required
                                            className="lg-input"
                                            style={{ paddingRight: 48 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                                            style={{ color: "#6b7280" }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#2563eb"; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Forgot password */}
                                <div className="lg-fade-up ld-5 flex justify-end">
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs font-medium transition-colors"
                                        style={{ color: "rgba(147,197,253,0.90)" }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#93c5fd"; (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Remember me */}
                                <div className="lg-fade-up ld-6 flex items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        className="w-4 h-4 rounded cursor-pointer"
                                        style={{ accentColor: "#2563eb" }}
                                    />
                                    <label htmlFor="remember" className="text-sm select-none cursor-pointer" style={{ color: "rgba(203,213,225,0.80)" }}>
                                        Remember me for 30 days
                                    </label>
                                </div>

                                {/* Submit */}
                                <div className="lg-fade-up ld-7 pt-1">
                                    <button type="submit" disabled={isLoading} className="lg-btn">
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="lg-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Signing in…
                                            </span>
                                        ) : "SIGN IN"}
                                    </button>
                                </div>
                            </form>

                            {/* Divider */}
                            <div className="lg-fade-up ld-8 lg-divider">
                                <span className="text-xs" style={{ color: "rgba(203,213,225,0.55)" }}>or</span>
                            </div>

                            {/* Create account */}
                            <div className="lg-fade-up ld-9">
                                <Link href="/auth/signup" className="lg-outline-btn">
                                    Are you new? <span style={{ color: "#93c5fd", fontWeight: 700 }}>Create an Account</span>
                                </Link>
                            </div>

                            {/* Back to home */}
                            <div className="lg-fade-up ld-9 flex justify-center mt-5">
                                <Link
                                    href="/"
                                    className="text-xs transition-colors"
                                    style={{ color: "rgba(148,163,184,0.60)" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(148,163,184,0.90)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(148,163,184,0.60)"; }}
                                >
                                    ← Back to home
                                </Link>
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div className="lg-fade-up ld-9 flex items-center justify-center gap-5 mt-5 flex-wrap">
                            {[
                                { label: "256-bit SSL", color: "#10b981" },
                                { label: "GDPR Ready", color: "#60a5fa" },
                                { label: "SOC 2 Type II", color: "#a78bfa" },
                            ].map(({ label, color }) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                                    <span className="text-xs" style={{ color: "rgba(148,163,184,0.65)" }}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Bottom copyright */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <p className="text-xs text-center" style={{ color: "rgba(71,100,128,0.70)" }}>
                        © {new Date().getFullYear()} MineRevenue · Vision Nouvel Pour le Développement de la Femme
                    </p>
                </div>
            </div>
        </>
    );
}
