'use client';

import React from 'react';
import Link from 'next/link';

const MineTrackerHero: React.FC = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

            <div className="absolute inset-0">

                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-blue-700/70 z-10" />
                <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                >
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src="/videos/Mining.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Main Heading */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                    Mine Tracker System
                </h1>

                {/* Subtitle */}
                <p className="text-xl sm:text-2xl md:text-3xl text-blue-100 font-light mb-12 max-w-4xl mx-auto leading-relaxed">
                    Mining Revenue Tracking & Transparency
                </p>

                {/* Call to Action Button */}
                <div className="flex justify-center">
                    <Link
                        href="/get-started"
                        className="inline-flex items-center justify-center px-8 py-4 sm:px-12 sm:py-5 text-lg sm:text-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Optional: Additional Features or Stats */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">Real-time</div>
                        <div className="text-blue-200">Revenue Tracking</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">AI-Powered</div>
                        <div className="text-blue-200">Analytics</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">100%</div>
                        <div className="text-blue-200">Transparency</div>
                    </div>
                </div>
            </div>

            {/* Animated Background Elements */}
            <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-60 animate-pulse" />
            <div className="absolute top-40 right-20 w-6 h-6 bg-blue-300 rounded-full opacity-40 animate-bounce" />
            <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-white rounded-full opacity-30 animate-pulse" />
            <div className="absolute bottom-20 right-1/3 w-5 h-5 bg-blue-200 rounded-full opacity-50 animate-ping" />
        </section>
    );
};

export default MineTrackerHero;