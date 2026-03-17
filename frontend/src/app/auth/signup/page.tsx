"use client";

import { useState } from "react";
import Link from "next/link";
import { useRegisterMutation } from "@/lib/redux/slices/AuthSlice";
import { Home } from "lucide-react";
import Image from "next/image";

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [signUp] = useRegisterMutation();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullname.trim()) {
            newErrors.fullname = "Fullname is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        // Add your registration logic here
        try {
            await signUp({
                username: formData.fullname.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });
            console.log("Sign up attempt:", formData);
        } catch (error) {
            console.error("Sign up error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-screen flex items-center justify-center p-2 md:p-6">
            <div className="w-full h-full md:h-[95vh] flex flex-col md:flex-row rounded-none md:rounded-3xl overflow-hidden shadow-2xl">
                {/* Left Side - Image with Blue Overlay */}
                <div className="hidden md:block md:w-1/2 relative">
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

                {/* Right Side - Sign Up Form */}
                <div className="w-full md:w-1/2 bg-blue-600 flex items-center justify-center p-6 md:p-20">
                    <div className="w-full max-w-2xl">
                        <div className="bg-white rounded-3xl shadow-2xl p-12 md:p-20">
                            {/* Header */}
                            <div className="text-center mb-12">
                                <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
                                    Welcome Back
                                </h1>
                                <p className="text-gray-500 text-2xl">
                                    Create your account
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-7">
                                {/* Fullname Field */}
                                <div>
                                    <label
                                        htmlFor="fullname"
                                        className="block text-lg font-semibold text-gray-700 mb-3"
                                    >
                                        Fullname
                                    </label>
                                    <input
                                        id="fullname"
                                        name="fullname"
                                        type="text"
                                        value={formData.fullname}
                                        onChange={handleChange}
                                        placeholder="Enter your fullname"
                                        className={`w-full px-6 py-5 text-lg border ${errors.fullname ? 'border-red-500' : 'border-gray-300'
                                            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400`}
                                    />
                                    {errors.fullname && (
                                        <p className="mt-2 text-base text-red-500">{errors.fullname}</p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-lg font-semibold text-gray-700 mb-3"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className={`w-full px-6 py-5 text-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'
                                            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400`}
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-base text-red-500">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-lg font-semibold text-gray-700 mb-3"
                                    >
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className={`w-full px-6 py-5 text-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'
                                            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400`}
                                    />
                                    {errors.password && (
                                        <p className="mt-2 text-base text-red-500">{errors.password}</p>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-lg font-semibold text-gray-700 mb-3"
                                    >
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Enter confirm password"
                                        className={`w-full px-6 py-5 text-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400`}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="mt-2 text-base text-red-500">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                {/* Create Account Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold py-5 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-9"
                                >
                                    {isLoading ? "Creating Account..." : "Create Account"}
                                </button>
                            </form>

                            {/* Sign In Link */}
                            <div className="mt-10 text-center">
                                <p className="text-gray-600 text-lg">
                                    Already have an Account?{" "}
                                    <Link
                                        href="/auth"
                                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                    >
                                        Sign in
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
