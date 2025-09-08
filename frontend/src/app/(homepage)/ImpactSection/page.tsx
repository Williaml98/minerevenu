'use client';
import React from 'react';
import { ImpactItem } from '@/types';

const ImpactSection: React.FC = () => {
    const impacts: ImpactItem[] = [
        {
            title: "Accurate real-time updates",
            description: "Eliminate revenue delays with instant data synchronization"
        },
        {
            title: "Transparency in allocation",
            description: "Build trust with stakeholders through clear revenue distribution"
        },
        {
            title: "Predictive insights",
            description: "Reduce risks of mismanagement with AI-powered forecasting"
        },
        {
            title: "Better decisions",
            description: "Make data-driven strategies with comprehensive analytics"
        },
        {
            title: "Compliance-ready",
            description: "Seamless government reporting with automated compliance tools"
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        Expected Impact
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Transform your mining revenue management with measurable results
                        and tangible benefits for all stakeholders.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {impacts.map((impact, index) => (
                        <div key={index} className="flex items-start space-x-4 p-6 rounded-lg hover:bg-slate-50 transition-all duration-300">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">✓</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {impact.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {impact.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ImpactSection;