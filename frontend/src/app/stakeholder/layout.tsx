"use client";
import Navbar from "@/components/stakeholderComp/Navbar";
import Sidebar from "@/components/stakeholderComp/Sidebar";


export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {

    return (
        <div className="flex flex-row w-full min-h-screen bg-none">
            <Sidebar />
            <div className="flex flex-col ml-auto w-full lg:w-[calc(100%-280px)]">
                <Navbar onSearch={() => { }} />
                {children}
            </div>
        </div>
    );
}
