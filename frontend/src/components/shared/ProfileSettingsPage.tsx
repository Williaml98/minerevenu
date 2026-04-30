"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Bell, Camera, CheckCircle2, Info, KeyRound, Mail,
    Moon, Monitor, ShieldCheck, Sun, TriangleAlert, Upload, UserRound,
} from "lucide-react";
import { useUpdateProfileMutation } from "@/lib/redux/slices/AuthSlice";
import { getResolvedTheme, applyTheme } from "@/components/shared/ThemeToggle";

type MessageType = "success" | "error" | "info" | null;
type ThemePref = "light" | "dark" | "system";

interface ProfileFormData {
    username: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    profilePicture: File | null;
}

interface UpdateSessionUser { name?: string; email?: string; image?: string; }
interface UpdateSessionData { user?: UpdateSessionUser; [key: string]: unknown; }
interface UpdateProfileResult { username?: string; profile_picture?: string; [key: string]: unknown; }

interface ProfileSettingsPageProps {
    roleLabel: string;
    accentClassName?: string;
}

const messageStyles: Record<Exclude<MessageType, null>, { bg: string; border: string; text: string }> = {
    success: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.3)", text: "var(--status-success)" },
    error: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.3)", text: "var(--status-danger)" },
    info: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)", text: "var(--accent)" },
};

const getProfileFallback = (name?: string | null) => {
    if (!name) return "MR";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

const themeOptions: { value: ThemePref; label: string; Icon: React.ElementType; desc: string }[] = [
    { value: "light", label: "Light", Icon: Sun, desc: "Clean white surfaces" },
    { value: "dark", label: "Dark", Icon: Moon, desc: "Dark navy backgrounds" },
    { value: "system", label: "System", Icon: Monitor, desc: "Follows OS setting" },
];

export default function ProfileSettingsPage({ roleLabel, accentClassName = "from-slate-900 via-slate-800 to-blue-900" }: ProfileSettingsPageProps) {
    const { data: sessionData, update: updateSession } = useSession();
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [message, setMessage] = useState<{ type: MessageType; text: string }>({ type: null, text: "" });
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);
    const [themePref, setThemePref] = useState<ThemePref>("dark");
    const [formData, setFormData] = useState<ProfileFormData>({
        username: sessionData?.user?.name || "",
        email: sessionData?.user?.email || "",
        currentPassword: "",
        newPassword: "",
        profilePicture: null,
    });

    useEffect(() => {
        setFormData((p) => ({ ...p, username: sessionData?.user?.name || "", email: sessionData?.user?.email || "" }));
    }, [sessionData?.user?.name, sessionData?.user?.email]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("theme") as ThemePref | null;
            if (saved && ["light", "dark", "system"].includes(saved)) setThemePref(saved);
            else setThemePref(getResolvedTheme());
            const storedPic = localStorage.getItem("mr_profile_pic");
            if (storedPic) setSavedImageUrl(storedPic);
        } catch { setThemePref("dark"); }
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, []);

    const showMessage = (type: Exclude<MessageType, null>, text: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setMessage({ type, text });
        timerRef.current = setTimeout(() => setMessage({ type: null, text: "" }), 5000);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        if (message.type) setMessage({ type: null, text: "" });
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showMessage("error", "Image size must be less than 5 MB."); return; }
        if (!file.type.startsWith("image/")) { showMessage("error", "Please select a valid image file."); return; }
        setFormData((p) => ({ ...p, profilePicture: file }));
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreviewImage(ev.target?.result as string);
            showMessage("info", "Preview updated — save changes to apply.");
        };
        reader.readAsDataURL(file);
    };

    const handleThemeChange = (pref: ThemePref) => {
        setThemePref(pref);
        try { localStorage.setItem("theme", pref); } catch { /* noop */ }
        const resolved: "light" | "dark" = pref === "system"
            ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
            : pref;
        applyTheme(resolved);
        showMessage("success", `Theme changed to ${pref}.`);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage({ type: null, text: "" });
        try {
            if (formData.newPassword && !formData.currentPassword) { showMessage("error", "Enter your current password first."); return; }
            if (formData.newPassword && formData.newPassword.length < 8) { showMessage("error", "New password must be at least 8 characters."); return; }

            const hasChanges =
                (formData.username && formData.username !== sessionData?.user?.name) ||
                Boolean(formData.profilePicture) || Boolean(formData.newPassword);
            if (!hasChanges) { showMessage("info", "No changes detected."); return; }

            const payload = new FormData();
            if (formData.username && formData.username !== sessionData?.user?.name) payload.append("username", formData.username);
            if (formData.profilePicture) payload.append("profile_picture", formData.profilePicture);
            if (formData.newPassword) { payload.append("current_password", formData.currentPassword); payload.append("new_password", formData.newPassword); }

            showMessage("info", "Saving changes…");
            const result: UpdateProfileResult = await updateProfile(payload).unwrap();

            await updateSession({
                ...sessionData,
                user: { ...sessionData?.user, name: result.username || sessionData?.user?.name, image: result.profile_picture || sessionData?.user?.image },
            } as UpdateSessionData);

            if (result.profile_picture) {
                const fullUrl = result.profile_picture.startsWith("/media/")
                    ? `http://127.0.0.1:8000${result.profile_picture}`
                    : result.profile_picture;
                try { localStorage.setItem("mr_profile_pic", fullUrl); } catch { /* noop */ }
                setSavedImageUrl(fullUrl);
            }

            setFormData((p) => ({ ...p, currentPassword: "", newPassword: "", profilePicture: null }));
            // Keep previewImage so the uploaded photo stays visible after save
            showMessage("success", "Profile updated successfully.");
        } catch (error: unknown) {
            let msg = "Failed to update profile. Please try again.";
            if (typeof error === "object" && error !== null && "data" in error) {
                const d = (error as { data: Record<string, unknown> }).data;
                if (d.current_password) msg = "Current password is incorrect.";
                else if (d.new_password) msg = "New password does not meet requirements.";
                else if (d.username) msg = "Username is invalid or taken.";
                else if (d.profile_picture) msg = "Problem uploading the profile picture.";
            }
            showMessage("error", msg);
        }
    };

    const profileImageSrc = previewImage || sessionData?.user?.image || savedImageUrl || null;
    const profileInitials = useMemo(() => getProfileFallback(formData.username || sessionData?.user?.name), [formData.username, sessionData?.user?.name]);

    const inputStyle: React.CSSProperties = {
        width: "100%",
        background: "var(--input-bg)",
        border: "1px solid var(--input-border)",
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 14,
        color: "var(--input-text)",
        outline: "none",
        transition: "border-color 0.15s ease",
    };

    return (
        <div className="min-h-screen px-4 py-6 md:px-6" style={{ background: "var(--bg-base)" }}>
            <div className="mx-auto max-w-5xl space-y-6">

                {/* Header Banner */}
                <section className={`overflow-hidden rounded-3xl bg-gradient-to-br ${accentClassName} text-white`} style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                    <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-8">
                        <div className="space-y-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-slate-200">
                                <ShieldCheck size={13} /> {roleLabel} profile
                            </span>
                            <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
                                Profile Settings
                            </h1>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Manage your account, security, and preferences from one place.
                            </p>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-black/30 flex-shrink-0">
                                    {profileImageSrc ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={profileImageSrc} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-bold text-white">{profileInitials}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-lg font-semibold truncate">{formData.username || "Profile user"}</p>
                                    <p className="text-sm text-slate-300 truncate">{sessionData?.user?.email || ""}</p>
                                    <p className="mt-2 text-[10px] uppercase tracking-widest text-slate-400">Live account preview</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Status message */}
                {message.type && (
                    <div
                        className="flex items-start gap-3 rounded-2xl px-4 py-3 animate-slide-down"
                        style={{ background: messageStyles[message.type].bg, border: `1px solid ${messageStyles[message.type].border}`, color: messageStyles[message.type].text }}
                    >
                        {message.type === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />}
                        {message.type === "error" && <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />}
                        {message.type === "info" && <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">

                    {/* Left: Avatar + Notifications + Theme */}
                    <div className="space-y-5">

                        {/* Avatar */}
                        <section className="rounded-3xl p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                            <div className="flex items-center justify-between gap-3 mb-5">
                                <div>
                                    <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Profile picture</h2>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Appears across dashboards and messages.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                                    style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-elevated)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                                >
                                    <Upload size={14} /> Upload
                                </button>
                            </div>

                            <div
                                className="rounded-2xl p-6 text-center"
                                style={{ background: "var(--bg-elevated)", border: "1px dashed var(--border)" }}
                            >
                                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl mx-auto" style={{ background: "var(--bg-base)", border: "1px solid var(--border)" }}>
                                    {profileImageSrc ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={profileImageSrc} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold" style={{ color: "var(--text-tertiary)" }}>{profileInitials}</span>
                                    )}
                                    <div
                                        className="absolute bottom-2 right-2 rounded-full p-1.5 shadow-lg cursor-pointer"
                                        style={{ background: "var(--card-bg)", color: "var(--text-primary)" }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Camera size={13} />
                                    </div>
                                </div>
                                <p className="mt-3 text-xs font-medium" style={{ color: "var(--text-primary)" }}>PNG, JPG or GIF up to 5 MB</p>
                                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>Preview updates instantly on selection.</p>
                            </div>

                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
                        </section>

                        {/* Theme Preference */}
                        <section className="rounded-3xl p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                            <h2 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Theme preference</h2>
                            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>Changes apply instantly across all pages.</p>
                            <div className="grid grid-cols-3 gap-2">
                                {themeOptions.map(({ value, label, Icon, desc }) => {
                                    const active = themePref === value;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => handleThemeChange(value)}
                                            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all"
                                            style={{
                                                background: active ? "var(--accent-soft)" : "var(--bg-elevated)",
                                                border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                                                color: active ? "var(--accent)" : "var(--text-secondary)",
                                            }}
                                        >
                                            <Icon size={18} />
                                            <span className="text-xs font-semibold">{label}</span>
                                            <span className="text-[10px] text-center leading-tight" style={{ color: "var(--text-tertiary)" }}>{desc}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Notifications */}
                        <section className="rounded-3xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                            <div className="flex items-center gap-2 mb-4">
                                <Bell size={16} style={{ color: "var(--text-secondary)" }} />
                                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Notifications</h2>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Email notifications</p>
                                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{emailNotifications ? "Enabled for account updates" : "Disabled"}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEmailNotifications((p) => !p)}
                                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                    style={{ background: emailNotifications ? "var(--accent)" : "var(--border)" }}
                                >
                                    <span
                                        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
                                        style={{ transform: emailNotifications ? "translateX(22px)" : "translateX(4px)" }}
                                    />
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Right: Account details */}
                    <section className="rounded-3xl p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                        <h2 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Account details</h2>
                        <p className="text-xs mb-6" style={{ color: "var(--text-secondary)" }}>Update only the fields you want — partial saves are supported.</p>

                        <div className="space-y-5">
                            {/* Username */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                    <UserRound size={14} /> Username
                                </label>
                                <input
                                    type="text" name="username" value={formData.username} onChange={handleInputChange}
                                    placeholder="Enter your username" style={inputStyle}
                                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--input-focus-border)"; }}
                                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--input-border)"; }}
                                />
                            </div>

                            {/* Email (readonly) */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                    <Mail size={14} /> Email address
                                </label>
                                <input
                                    type="email" value={sessionData?.user?.email || ""} disabled
                                    style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }}
                                />
                                <p className="mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>Email is locked for security.</p>
                            </div>

                            {/* Password */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                        <KeyRound size={14} /> Current password
                                    </label>
                                    <input
                                        type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange}
                                        placeholder="Required for password change" style={inputStyle}
                                        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--input-focus-border)"; }}
                                        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--input-border)"; }}
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                        <ShieldCheck size={14} /> New password
                                    </label>
                                    <input
                                        type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange}
                                        placeholder="Leave blank to keep current" style={inputStyle}
                                        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--input-focus-border)"; }}
                                        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--input-border)"; }}
                                    />
                                    <p className="mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>At least 8 characters.</p>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="rounded-2xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                                <div className="flex items-start gap-2.5">
                                    <Info size={15} className="flex-shrink-0 mt-0.5" style={{ color: "var(--text-secondary)" }} />
                                    <p className="text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
                                        You can update your picture, username, password, or any combination in one save.
                                        Changes sync back to your live session immediately after saving.
                                    </p>
                                </div>
                            </div>

                            {/* Save */}
                            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end" style={{ borderTop: "1px solid var(--border)" }}>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all"
                                    style={{
                                        background: isLoading ? "var(--border)" : "var(--accent)",
                                        cursor: isLoading ? "not-allowed" : "pointer",
                                    }}
                                    onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-hover)"; }}
                                    onMouseLeave={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)"; }}
                                >
                                    {isLoading ? "Saving…" : "Save changes"}
                                </button>
                            </div>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    );
}
