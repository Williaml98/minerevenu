import type { Metadata } from "next";
import Header from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: "MineRevenue — AI-Powered Revenue Intelligence",
    description: "Real-time mining revenue tracking, AI-powered forecasting, and compliance — all in one intelligent platform.",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/logo.png",
        apple: "/logo.png",
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="antialiased min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
            <Header />
            <main className="flex-grow pt-16">{children}</main>
            <Footer />
        </div>
    );
}
