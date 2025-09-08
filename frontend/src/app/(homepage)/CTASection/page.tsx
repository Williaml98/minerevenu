'use client';
import React from 'react';

const CTASection: React.FC = () => {

    return (

        <section className="py-20 bg-gradient-to-r from-amber-600 to-yellow-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                    Start Tracking Mining Revenues Today
                </h2>
                <p className="text-xl text-slate-800 mb-12 max-w-3xl mx-auto">
                    Join the revolution in mining revenue transparency. Get started with
                    our AI-powered platform in minutes.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-xl">
                        Sign Up Now
                    </button>
                    <button className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300">
                        Contact Us
                    </button>
                </div>
            </div>

        </section>
    );
};

export default CTASection;