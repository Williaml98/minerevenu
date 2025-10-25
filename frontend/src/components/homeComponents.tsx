'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '@/app/(homepage)/HeroSection/page';
import FeaturesSection from '@/app/(homepage)/FeaturesSection/page';
import DashboardPreview from '@/app/(homepage)/DashboardPreview/page';
import ImpactSection from '@/app/(homepage)/ImpactSection/page';
import AboutSection from '@/app/(homepage)/AboutSection/page';
import TestimonialsSection from '@/app/(homepage)/TestimonialsSection/page';
import CTASection from '@/app/(homepage)/CTASection/page';
import Footer from '@/components/Footer';

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen">
            <HeroSection />
            <FeaturesSection />
            <DashboardPreview />
            <ImpactSection />
            <AboutSection />
            <TestimonialsSection />
            <CTASection />
        </div>
    );
};

export default HomePage;