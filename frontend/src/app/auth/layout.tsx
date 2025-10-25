"use client";

import { Work_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";

const workSans = Work_Sans({
    variable: "--font-work-sans",
    subsets: ["latin"]
});

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SessionProvider>
            <div className={`${workSans.className} ${workSans.variable} min-h-screen relative overflow-hidden`}>
                {/* Background Video */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="fixed top-0 left-0 w-full h-full object-cover"
                >
                    <source src="/videos/Mining.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Dark Overlay */}
                <div className="fixed top-0 left-0 w-full h-full bg-black/30 z-0"></div>

                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </SessionProvider>
    );
}