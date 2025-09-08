'use client';
import React from 'react';
import { Testimonial } from '@/types';

const TestimonialsSection: React.FC = () => {
    const testimonials: Testimonial[] = [
        {
            quote: "This system ensures fairness in mining revenues for all stakeholders.",
            author: "Sarah Johnson",
            role: "Community Leader"
        },
        {
            quote: "The transparency and real-time tracking have revolutionized our operations.",
            author: "Michael Chen",
            role: "Mining Operations Director"
        },
        {
            quote: "Finally, a solution that brings accountability to mining revenue distribution.",
            author: "Dr. Amara Kone",
            role: "Government Advisor"
        }
    ];

    return (
        <section className="py-20 bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        What Stakeholders Say
                    </h2>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        Trusted by mining operations, communities, and government institutions worldwide.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white rounded-xl p-8 shadow-xl">
                            <div className="text-4xl text-amber-500 mb-4">"</div>
                            <p className="text-slate-700 text-lg mb-6 leading-relaxed">
                                {testimonial.quote}
                            </p>
                            <div className="border-t border-slate-200 pt-4">
                                <div className="font-bold text-slate-900">{testimonial.author}</div>
                                <div className="text-slate-600">{testimonial.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;