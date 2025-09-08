'use client';
import React, { useState } from 'react';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                            MineRevenue Tracker
                        </h1>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-slate-300 hover:text-amber-400 transition-colors duration-300">
                            Features
                        </a>
                        <a href="#about" className="text-slate-300 hover:text-amber-400 transition-colors duration-300">
                            About
                        </a>
                        <a href="#contact" className="text-slate-300 hover:text-amber-400 transition-colors duration-300">
                            Contact
                        </a>
                        <button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-semibold py-2 px-6 rounded-lg transition-all duration-300">
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-300 hover:text-white"
                        >
                            <span className="text-2xl">{isMenuOpen ? '✕' : '☰'}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-slate-800 rounded-lg mt-2 p-4">
                        <div className="flex flex-col space-y-4">
                            <a href="#features" className="text-slate-300 hover:text-amber-400 transition-colors duration-300">
                                Features
                            </a>
                            <a href="#about" className="text-slate-300 hover:text-amber-400 transition-colors duration-300">
                                About
                            </a>
                            <a href="#contact" className="text-slate-300 hover:text-amber-400 transition-colors duration-300">
                                Contact
                            </a>
                            <button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-semibold py-2 px-6 rounded-lg mt-2">
                                Get Started
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;