"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
    Bell,
    Camera,
    CheckCircle2,
    Info,
    KeyRound,
    Mail,
    ShieldCheck,
    TriangleAlert,
    Upload,
    UserRound,
} from "lucide-react";
import { useUpdateProfileMutation } from "@/lib/redux/slices/AuthSlice";

type MessageType = "success" | "error" | "info" | null;

interface ProfileFormData {
    username: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    profilePicture: File | null;
}

interface UpdateSessionUser {
    name?: string;
    email?: string;
    image?: string;
}

interface UpdateSessionData {
    user?: UpdateSessionUser;
    [key: string]: unknown;
}

interface UpdateProfileResult {
    username?: string;
    profile_picture?: string;
    [key: string]: unknown;
}

interface ProfileSettingsPageProps {
    roleLabel: string;
    accentClassName?: string;
}

const messageStyles: Record<Exclude<MessageType, null>, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
};

const getProfileFallback = (name?: string | null) => {
    if (!name) {
        return "MR";
    }

    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

export default function ProfileSettingsPage({
    roleLabel,
    accentClassName = "from-slate-900 via-slate-800 to-blue-900",
}: ProfileSettingsPageProps) {
    const { data: sessionData, update: updateSession } = useSession();
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [message, setMessage] = useState<{ type: MessageType; text: string }>({
        type: null,
        text: "",
    });
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProfileFormData>({
        username: sessionData?.user?.name || "",
        email: sessionData?.user?.email || "",
        currentPassword: "",
        newPassword: "",
        profilePicture: null,
    });

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            username: sessionData?.user?.name || "",
            email: sessionData?.user?.email || "",
        }));
    }, [sessionData?.user?.name, sessionData?.user?.email]);

    useEffect(() => {
        return () => {
            if (messageTimerRef.current) {
                clearTimeout(messageTimerRef.current);
            }
        };
    }, []);

    const showMessage = (type: Exclude<MessageType, null>, text: string) => {
        if (messageTimerRef.current) {
            clearTimeout(messageTimerRef.current);
        }

        setMessage({ type, text });
        messageTimerRef.current = setTimeout(() => {
            setMessage({ type: null, text: "" });
        }, 5000);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (message.type) {
            setMessage({ type: null, text: "" });
        }
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage("error", "Image size should be less than 5MB.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            showMessage("error", "Please select a valid image file.");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            profilePicture: file,
        }));

        const reader = new FileReader();
        reader.onload = (event) => {
            setPreviewImage(event.target?.result as string);
            showMessage("info", "New profile picture selected. Save changes to apply it.");
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage({ type: null, text: "" });

        try {
            if (formData.newPassword && !formData.currentPassword) {
                showMessage("error", "Enter your current password before setting a new one.");
                return;
            }

            if (formData.newPassword && formData.newPassword.length < 8) {
                showMessage("error", "New password must be at least 8 characters long.");
                return;
            }

            const hasChanges =
                (formData.username && formData.username !== sessionData?.user?.name) ||
                Boolean(formData.profilePicture) ||
                Boolean(formData.newPassword);

            if (!hasChanges) {
                showMessage("info", "No changes detected yet.");
                return;
            }

            const payload = new FormData();

            if (formData.username && formData.username !== sessionData?.user?.name) {
                payload.append("username", formData.username);
            }

            if (formData.profilePicture) {
                payload.append("profile_picture", formData.profilePicture);
            }

            if (formData.newPassword) {
                payload.append("current_password", formData.currentPassword);
                payload.append("new_password", formData.newPassword);
            }

            showMessage("info", "Updating your profile...");

            const result: UpdateProfileResult = await updateProfile(payload).unwrap();

            await updateSession({
                ...sessionData,
                user: {
                    ...sessionData?.user,
                    name: result.username || sessionData?.user?.name,
                    image: result.profile_picture || sessionData?.user?.image,
                },
            } as UpdateSessionData);

            setFormData((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                profilePicture: null,
            }));
            setPreviewImage(null);

            if (formData.profilePicture && !formData.newPassword && formData.username === sessionData?.user?.name) {
                showMessage("success", "Profile picture updated successfully.");
                return;
            }

            if (formData.newPassword && formData.username !== sessionData?.user?.name) {
                showMessage("success", "Username and password updated successfully.");
                return;
            }

            if (formData.newPassword) {
                showMessage("success", "Password updated successfully.");
                return;
            }

            showMessage("success", "Profile updated successfully.");
        } catch (error: unknown) {
            let errorMessage = "Failed to update profile. Please try again.";

            if (
                typeof error === "object" &&
                error !== null &&
                "data" in error &&
                typeof (error as { data?: unknown }).data === "object" &&
                (error as { data?: unknown }).data !== null
            ) {
                const errorData = (error as { data: Record<string, unknown> }).data;

                if (errorData.current_password) {
                    errorMessage = "Current password is incorrect.";
                } else if (errorData.new_password) {
                    errorMessage = "New password does not meet the required rules.";
                } else if (errorData.username) {
                    errorMessage = "Username is invalid or already taken.";
                } else if (errorData.profile_picture) {
                    errorMessage = "There was a problem uploading the profile picture.";
                }
            } else if (
                typeof error === "object" &&
                error !== null &&
                "message" in error &&
                typeof (error as { message?: unknown }).message === "string"
            ) {
                errorMessage = (error as { message: string }).message;
            }

            showMessage("error", errorMessage);
        }
    };

    const handleToggleNotifications = () => {
        setEmailNotifications((prev) => !prev);
        showMessage(
            "success",
            !emailNotifications
                ? "Email notifications enabled."
                : "Email notifications disabled."
        );
    };

    const profileImageSrc = previewImage || sessionData?.user?.image || null;
    const profileInitials = useMemo(
        () => getProfileFallback(formData.username || sessionData?.user?.name),
        [formData.username, sessionData?.user?.name]
    );

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-6">
            <div className="mx-auto max-w-6xl space-y-6">
                <section className={`overflow-hidden rounded-[32px] bg-gradient-to-br ${accentClassName} text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]`}>
                    <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-8">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-200">
                                <ShieldCheck size={14} />
                                {roleLabel} profile
                            </span>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                    Profile settings
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                                    Keep account details current, update your profile image, and manage password access from one clean workspace.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-slate-900/60">
                                    {profileImageSrc ? (
                                        <Image
                                            src={profileImageSrc}
                                            alt="Profile"
                                            width={96}
                                            height={96}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xl font-semibold text-white">{profileInitials}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-lg font-semibold">
                                        {formData.username || "Profile user"}
                                    </p>
                                    <p className="truncate text-sm text-slate-200">
                                        {sessionData?.user?.email || "No email available"}
                                    </p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-300">
                                        Live account preview
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {message.type && (
                    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm ${messageStyles[message.type]}`}>
                        {message.type === "success" && <CheckCircle2 className="mt-0.5 h-5 w-5" />}
                        {message.type === "error" && <TriangleAlert className="mt-0.5 h-5 w-5" />}
                        {message.type === "info" && <Info className="mt-0.5 h-5 w-5" />}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
                    <section className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Profile image</h2>
                                <p className="text-sm text-slate-500">
                                    Use a clear professional image for dashboard identity.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                <Upload size={16} />
                                Upload
                            </button>
                        </div>

                        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[28px] border border-slate-200 bg-slate-900">
                                    {profileImageSrc ? (
                                        <Image
                                            src={profileImageSrc}
                                            alt="Profile preview"
                                            width={160}
                                            height={160}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-3xl font-semibold text-white">{profileInitials}</span>
                                    )}
                                    <div className="absolute bottom-3 right-3 rounded-full bg-white p-2 text-slate-900 shadow-lg">
                                        <Camera size={16} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">
                                        PNG, JPG or GIF up to 5MB
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        The new image appears instantly here before saving.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            className="hidden"
                        />

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-start gap-3">
                                <Bell className="mt-0.5 h-5 w-5 text-slate-700" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Notification preference</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Control whether account-related updates should be sent to your email inbox.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Email notifications</p>
                                    <p className="text-xs text-slate-500">
                                        {emailNotifications ? "Enabled for account updates" : "Disabled for account updates"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleToggleNotifications}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${emailNotifications ? "bg-slate-900" : "bg-slate-300"}`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 rounded-full bg-white transition ${emailNotifications ? "translate-x-6" : "translate-x-1"}`}
                                    />
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Account details</h2>
                            <p className="text-sm text-slate-500">
                                Update only the fields you want. The form supports partial changes.
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <UserRound size={16} />
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter your username"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Mail size={16} />
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={sessionData?.user?.email || ""}
                                    disabled
                                    className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    Email stays locked here for security and identity consistency.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <KeyRound size={16} />
                                    Current password
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    placeholder="Required to set a new password"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <ShieldCheck size={16} />
                                    New password
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="Leave blank to keep current password"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    Use at least 8 characters for a stronger account password.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-start gap-3">
                                <Info className="mt-0.5 h-5 w-5 text-slate-700" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">How updates behave</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        You can update your image only, your username only, your password only, or any valid combination in one save.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-slate-500">
                                Changes sync back to your live session after a successful update.
                            </p>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition ${isLoading ? "cursor-not-allowed bg-slate-400" : "bg-slate-900 hover:bg-slate-800"}`}
                            >
                                {isLoading ? "Saving changes..." : "Save changes"}
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    );
}
