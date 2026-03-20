"use client"

import {
    Home,
    Users,
    BarChart3,
    Ship,
    Shield,
    LogOut,
    Menu,
    MessageSquare,
    X
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

const items = [
    {
        title: "Dashboard",
        url: "/officer",
        icon: Home,
    },
    {
        title: "Revenue Management",
        url: "/officer/revenue-management",
        icon: Users,
    },
    {
        title: "Mines & Companies",
        url: "/officer/mines",
        icon: Shield,
    },
    {
        title: "AI Financial Analytics",
        url: "/officer/ai-financial-analytics",
        icon: BarChart3,
    },
    {
        title: "Reports",
        url: "/officer/report",
        icon: Shield,
    },
    {
        title: "Communication & Feedback",
        url: "/officer/collaboration_hub",
        icon: MessageSquare,
    },
    {
        title: "Settings",
        url: "/officer/settings",
        icon: Shield,
    }
];

export default function Sidebar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const currentPath = pathname ?? "";
    const router = useRouter();
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const handleLogout = () => {
        setIsConfirmDialogOpen(true);
    };

    const performLogout = () => {

        localStorage.clear();

        router.push('/auth');
    };

    type ConfirmDialogProps = {
        open: boolean;
        setOpen: (open: boolean) => void;
        confirmFunc: () => void;
    };

    const ConfirmDialog = ({ open, setOpen, confirmFunc }: ConfirmDialogProps) => {
        if (!open) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-sm">
                    <h3 className="text-lg font-semibold">Are you sure you want to logout?</h3>
                    <p className="mt-2">If you click to continue you will no longer have access to this dashboard until you log in again</p>
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            className="px-4 py-2 border rounded-md hover:bg-gray-50"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            onClick={() => {
                                confirmFunc();
                                setOpen(false);
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-[280px] z-[1000] h-screen fixed">
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 right-2 z-50 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                aria-label="Toggle Menu"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <nav className={`
                inset-y-0 left-0 
                h-full
                w-full
                transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
                bg-gray-100
                z-40
                flex flex-col justify-between
                border-r border-gray-200
            `}>
                <div className="flex flex-col h-full">

                    <div className="justify-center items-center flex">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={120}
                            height={40}
                            style={{ borderRadius: '8px' }}
                        />
                    </div>
                    <div className="flex-1 px-4 py-6">
                        <ul className="space-y-2">
                            {items.map((item) => (
                                <li key={item.title}>
                                    <Link
                                        href={item.url}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentPath === item.url || currentPath.startsWith(`${item.url}/`)
                                            ? 'bg-blue-400 text-white'
                                            : 'text-gray-600 hover:bg-gray-200'
                                            }`}
                                        onClick={() => setIsMobileOpen(false)}
                                    >
                                        <item.icon size={18} />
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-200 w-full rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>

            <ConfirmDialog
                open={isConfirmDialogOpen}
                setOpen={setIsConfirmDialogOpen}
                confirmFunc={performLogout}
            />
        </div>
    );
}
