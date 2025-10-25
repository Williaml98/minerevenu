"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Add your authentication logic here
        try {
            // Example: await signIn("credentials", { email, password });
            console.log("Sign in attempt:", { email, password });
        } catch (error) {
            console.error("Sign in error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-screen flex items-center justify-center p-2 md:p-6">
            <div className="w-full h-full md:h-[95vh] flex flex-col md:flex-row rounded-none md:rounded-3xl overflow-hidden shadow-2xl">
                {/* Left Side - Image with Blue Overlay */}
                <div className="hidden md:block md:w-1/2 relative">
                    <div className="absolute inset-0 bg-blue-600/60 z-10"></div>
                    <img
                        src="/images/mining.png"
                        alt="Construction worker"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right Side - Sign In Form */}
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
                                {/* Email Field */}
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

                                {/* Password Field */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-lg font-semibold text-gray-700 mb-4"
                                    >
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className="w-full px-6 py-5 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400"
                                    />
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
                                    Don't have an account?{" "}
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