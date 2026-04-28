"use client";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/adminComp/Navbar";
import AdminSideBar from "@/components/adminComp/Sidebar";


export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {

    return (
        <SessionProvider>
            <div className="flex flex-row w-full min-h-screen">
                <AdminSideBar />
                <div className="flex flex-col ml-auto w-full md:w-[calc(100%-260px)]">
                    <Navbar onSearch={() => { }} />
                    {children}
                </div>
            </div>
        </SessionProvider>
    );
}