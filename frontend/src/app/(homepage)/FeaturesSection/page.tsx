'use client';
import React from 'react';
import { Feature } from '@/types';

const FeaturesSection: React.FC = () => {
    const features: Feature[] = [
        {
            icon: "📊",
            title: "Real-Time Revenue Tracking",
            description: "Live dashboards for mining income streams with instant updates and comprehensive analytics."
        },
        {
            icon: "🤖",
            title: "AI-Powered Analytics",
            description: "Advanced forecasting and anomaly detection to optimize your mining operations."
        },
        {
            icon: "📝",
            title: "Compliance & Transparency",
            description: "Automated reporting for stakeholders with full regulatory compliance."
        },
        {
            icon: "📑",
            title: "Automated Reports",
            description: "Monthly and yearly financial insights generated automatically for easy review."
        },
        {
            icon: "🔒",
            title: "Secure Cloud Storage",
            description: "Encrypted, role-based access control ensuring your data stays protected."
        }
    ];

    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        Powerful Features for Mining Success
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Everything you need to manage, track, and optimize your mining revenues
                        with cutting-edge technology.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200"
                        >
                            <div className="text-5xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;