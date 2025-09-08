"use client";

import { Work_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import Image from "next/image";

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
            <div className={`${workSans.className} ${workSans.variable} flex items-center justify-center min-h-screen p-4 relative`}>
                <Image
                    src="/images/guest.jpg"
                    alt="Background Image"
                    fill
                    className="object-cover opacity-30 z-[-1]"
                />
                {/* <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
                >
                    <source src="/videos/wave.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video> */}
                <div className="w-full  flex flex-col md:flex-row bg-transparent shadow-lg rounded-xl overflow-hidden relative z-10">
                    <div style={{ width: "100%" }}>
                        {children}
                    </div>
                </div>
            </div>
        </SessionProvider>
    );
}