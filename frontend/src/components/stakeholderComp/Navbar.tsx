"use client"
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useGetMyDetailsMutation } from "@/lib/redux/slices/AuthSlice";
import NotificationCenter from "@/components/shared/NotificationCenter";


interface NavbarProps {
    onSearch: (query: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
    const { data: sessionData } = useSession()
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [getMyDetails, { data: userDetails, isLoading, error }] = useGetMyDetailsMutation();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, onSearch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        getMyDetails({});
    }, [getMyDetails]);

    const getProfileImageUrl = () => {
        if (userDetails?.profile_picture) {
            if (userDetails.profile_picture.startsWith('/media/')) {
                return `http://127.0.0.1:8000${userDetails.profile_picture}`;
            }
            if (userDetails.profile_picture.startsWith('http')) {
                return userDetails.profile_picture;
            }
            return userDetails.profile_picture.startsWith('/') ? userDetails.profile_picture : `/${userDetails.profile_picture}`;
        }
        return "/profile.jpg";
    };

    const getUserInitials = () => {
        if (userDetails?.username) {
            const names = userDetails.username.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[1][0]}`.toUpperCase();
            }
            return userDetails.username.substring(0, 2).toUpperCase();
        }
        return "K.F";
    };

    const handleProfileClick = () => {
        setShowUserDropdown(!showUserDropdown);
        if (!showUserDropdown) {
            getMyDetails({});
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.user-dropdown-container')) {
                setShowUserDropdown(false);
            }
        };

        if (showUserDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserDropdown]);

    return (
        <div className='sticky top-0 z-[90] w-full overflow-visible border-b border-slate-800/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.94))] px-4 py-4 text-white shadow-[0_18px_45px_rgba(15,23,42,0.22)] backdrop-blur'>
            <div className='flex w-full flex-row items-center justify-between gap-4'>
            <div className='flex-1 max-w-lg'>
                <div className='flex w-full flex-row items-center rounded-2xl border border-white/10 bg-white/10 p-2 shadow-inner backdrop-blur-sm'>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 17L12.3333 12.3333M13.8889 8.44444C13.8889 11.4513 11.4513 13.8889 8.44444 13.8889C5.43756 13.8889 3 11.4513 3 8.44444C3 5.43756 5.43756 3 8.44444 3C11.4513 3 13.8889 5.43756 13.8889 8.44444Z" stroke="#CBD5E1" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder='Search everything...'
                        className='w-full border-none bg-transparent px-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none'
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div className='flex flex-row gap-4 items-center'>
                <NotificationCenter role="Stakeholder" />

                <div className='relative user-dropdown-container'>
                    <div
                        className='flex items-center justify-center overflow-hidden cursor-pointer rounded-full bg-indigo-900 text-white w-10 h-10'
                        onClick={handleProfileClick}
                    >
                        {userDetails ? (
                            userDetails.profile_picture ? (
                                <Image
                                    src={getProfileImageUrl()}
                                    alt={`${userDetails.username}'s profile`}
                                    className='object-cover w-full h-full rounded-full'
                                    width={48}
                                    height={48}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/profile.jpg";
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full w-full text-white font-semibold">
                                    {getUserInitials()}
                                </div>
                            )
                        ) : sessionData?.user ? (
                            <Image
                                src={sessionData?.user?.image || '/profile.jpg'}
                                alt='profile'
                                width={40}
                                height={40}
                                className='object-cover'
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full w-full text-white font-semibold">
                                T.M
                            </div>
                        )}
                    </div>

                    {showUserDropdown && (
                        <div className="absolute right-0 top-12 z-[120] min-w-[280px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-900"></div>
                                    <span className="ml-2 text-sm text-gray-500">Loading...</span>
                                </div>
                            ) : error ? (
                                <div className="text-center py-4">
                                    <p className="text-red-500 text-sm mb-2">Failed to load user details</p>
                                    <button
                                        onClick={() => getMyDetails({})}
                                        className="text-indigo-900 text-sm hover:underline"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : userDetails ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                        <div className="flex items-center justify-center overflow-hidden rounded-full bg-indigo-900 text-white w-12 h-12">
                                            {userDetails.profile_picture ? (
                                                <Image
                                                    src={getProfileImageUrl()}
                                                    alt={`${userDetails.username}'s profile`}
                                                    className='object-cover w-full h-full rounded-full'
                                                    width={48}
                                                    height={48}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = "/profile.jpg";
                                                    }}
                                                />
                                            ) : (
                                                <span className="font-semibold text-sm">
                                                    {getUserInitials()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{userDetails.username}</h3>
                                            <p className="text-sm text-gray-500">{userDetails.role}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                                            <p className="text-sm text-gray-900">{userDetails.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase tracking-wide">User ID</label>
                                            <p className="text-sm text-gray-900">#{userDetails.id}</p>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100 space-y-2">
                                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                                            View Profile
                                        </button>
                                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                                            Settings
                                        </button>
                                        <button
                                            onClick={() => getMyDetails({})}
                                            className="w-full text-left px-3 py-2 text-sm text-indigo-900 hover:bg-indigo-50 rounded-md"
                                        >
                                            Refresh Details
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500 text-sm">No user details available</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    )
}

export default Navbar
