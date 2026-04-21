"use client";

import { useState } from "react";
import { Eye, EyeOff, Home, Shield, User } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const getRoleIcon = (role: string) => {
        switch (role.toLowerCase()) {
            case "Admin":
                return <User className="h-6 w-6" />;
            case "Stakeholder":
                return <Shield className="h-6 w-6" />;
            case "Officer":
                return <Home className="h-6 w-6" />;
            default:
                return <User className="h-6 w-6" />;
        }
    };

    const getRoleMessage = (role: string) => {
        switch (role.toLowerCase()) {
            case "admin":
                return "welcome to the admin dashboard";
            case "stakeholder":
                return "welcome to the stakeholder dashboard";
            case "officer":
                return "welcome to the officer dashboard";
            default:
                return "welcome to the dashboard";
        }
    };

    const getRedirectPath = (role: string) => {
        switch (role.toLowerCase()) {
            case "admin":
                return "/admin";
            case "stakeholder":
                return "/stakeholder";
            case "officer":
                return "/officer";
            default:
                return "/";
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });
            if (result?.error) {
                toast.error(result.error === 'CredentialsSignin' ? 'Invalid credentials' : result.error, {
                    style: {
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        border: '1px solid #fca5a5',
                    },
                });
            } else {
                const sessionResponse = await fetch('/api/auth/session');
                const session = await sessionResponse.json();

                const userRole = session?.user?.role || 'User';
                const redirectPath = getRedirectPath(userRole);
                const welcomeMessage = getRoleMessage(userRole);

                toast.success(welcomeMessage, {
                    icon: getRoleIcon(userRole),
                    duration: 3000,
                    style: {
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: '1px solid #6ee7b7',
                        fontWeight: '600',
                    },
                });
                setTimeout(() => {
                    router.push(redirectPath);
                }, 1500);
            }
        } catch {
            toast.error('Login failed. Please try again.', {
                style: {
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: '1px solid #fca5a5',
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-screen flex items-center justify-center p-2 md:p-6">
            <div className="w-full h-full md:h-[95vh] flex flex-col md:flex-row rounded-none md:rounded-3xl overflow-hidden shadow-2xl">
                <div className="hidden md:block md:w-1/2 relative" style={{ textAlign: 'center' }}>
                    <div className="absolute inset-0 bg-blue-600/60 z-10">
                        <Link href="/" className="group flex items-center space-x-2 text-white hover:text-blue-400 transition-all duration-300 transform hover:scale-105" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                            <Home className="w-5 h-screen transition-transform duration-300 group-hover:rotate-12" />
                            <span className="relative" style={{ fontSize: '25 px' }}>
                                Back to Home
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                            </span>
                        </Link>
                    </div>
                    <Image
                        src="/images/mining.png"
                        alt="Construction worker"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div className="w-full md:w-1/2 bg-blue-600 flex items-center justify-center p-6 md:p-20">
                    <div className="w-full max-w-2xl">
                        <div className="bg-white rounded-3xl shadow-2xl p-12 md:p-20">
                            {/* Header */}
                            <div className="text-center mb-14">
                                <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
                                    Welcome Back
                                </h1>
                                <p className="text-gray-500 text-2xl">
                                    Sign in to your account
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-9">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-lg font-semibold text-gray-700 mb-4"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        className="w-full px-6 py-5 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400"
                                    />
                                </div>

                                <div className="mt-2 relative">
                                    <label
                                        htmlFor="email"
                                        className="block text-lg font-semibold text-gray-700 mb-4"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">  {/* ← wrap input + button */}
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="********"
                                            className="w-full px-6 py-5 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-300"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-6 w-6" aria-hidden="true" />
                                            ) : (
                                                <Eye className="h-6 w-6" aria-hidden="true" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Sign In Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold py-5 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-10"
                                >
                                    {isLoading ? "Signing in..." : "Sign In"}
                                </button>

                                {/* Forgot Password Link */}
                                <div className="text-center pt-3">
                                    <Link
                                        href="/forgot-password"
                                        className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </form>

                            {/* Sign Up Link */}
                            <div className="mt-12 text-center">
                                <p className="text-gray-600 text-lg">
                                    Don&apos;t have an account?{" "}
                                    <Link
                                        href="/auth/signup"
                                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}