import React from 'react';

const Footer: React.FC = () => {
    const quickLinks = ['Features', 'About', 'Contact', 'Privacy Policy'];
    const socialLinks = [
        { name: 'LinkedIn', icon: '💼' },
        { name: 'Twitter', icon: '🐦' },
        { name: 'Facebook', icon: '📘' }
    ];

    return (
        <footer className="bg-slate-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Logo and Description */}
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                            MineRevenue Tracker
                        </h3>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            Empowering transparent and accountable mining revenue management
                            through cutting-edge AI technology and real-time analytics.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social, index) => (
                                <button
                                    key={index}
                                    className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors duration-300"
                                >
                                    <span className="text-xl">{social.icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href="#"
                                        className="text-slate-300 hover:text-amber-400 transition-colors duration-300"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact</h4>
                        <div className="space-y-3 text-slate-300">
                            <div>📧 info@minerevenue.com</div>
                            <div>📞 +250 (0) 123 456 789</div>
                            <div>📍 Kigali, Rwanda</div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 pt-8 text-center">
                    <p className="text-slate-400">
                        © 2025 Vision Nouvel Pour le Développement de la Femme. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;