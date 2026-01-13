"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/adminComp/Navbar";
import AdminSideBar from "@/components/adminComp/Sidebar";

interface UserProfile {
    username: string;
    email: string;
    role: string;
}

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const [userProfile] = useState<UserProfile | null>({
        username: "admin",
        email: "admin@example.com",
        role: "admin"
    });

    return (
        <SessionProvider>
            <div className="flex flex-row w-full min-h-screen lg:w-[90%] bg-none">
                <AdminSideBar />
                <div className="flex flex-col ml-auto w-full lg:w-[78%]">
                    <Navbar onSearch={(query: string) => { /* handle search here */ }} />
                    {children}
                </div>
            </div>
        </SessionProvider>
    );
}