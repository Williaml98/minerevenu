'use client';
import React from 'react';

const AboutSection: React.FC = () => {
    return (
        <section className="py-20 bg-gradient-to-r from-blue-50 to-amber-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-slide-in-left">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 animate-slide-up">
                            About Our Mission
                        </h2>
                        <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
                            <p className="animate-slide-up stagger-1">
                                <strong>Vision Nouvel Pour le Développement de la Femme</strong> is
                                committed to empowering communities through transparency and
                                technological innovation in mining revenue management.
                            </p>
                            <p className="animate-slide-up stagger-2">
                                We believe that fair and transparent distribution of mining revenues
                                is essential for sustainable community development and economic growth.
                                Our AI-powered platform ensures that every stakeholder has access to
                                real-time, accurate revenue data.
                            </p>
                            <p className="animate-slide-up stagger-3">
                                By leveraging cutting-edge technology, we&apos;re building bridges between
                                mining operations, communities, and government institutions to create
                                a more equitable and prosperous future for all.
                            </p>
                        </div>
                    </div>

                    <div className="relative animate-scale-in stagger-2">
                        <div className="bg-white rounded-2xl shadow-2xl p-8">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-float">
                                    <span className="text-3xl">🌟</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 animate-slide-up stagger-3">
                                    Empowering Communities
                                </h3>
                                <p className="text-slate-600 animate-fade-in stagger-4">
                                    Through transparency, accountability, and innovative technology
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;