"use client";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/stakeholderComp/Navbar";
import Sidebar from "@/components/stakeholderComp/Sidebar";


export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {

    return (
        <SessionProvider>
            <div className="flex flex-row w-full min-h-screen lg:w-[90%] bg-none">
                <Sidebar />
                <div className="flex flex-col ml-auto w-full lg:w-[78%]">
                    <Navbar onSearch={() => { /* handle search here */ }} />
                    {children}
                </div>
            </div>
        </SessionProvider>
    );
}