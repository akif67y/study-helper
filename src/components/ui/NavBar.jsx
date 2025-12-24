import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Users, Share2, User, LogOut } from 'lucide-react';

export const NavBar = ({ user, logout, unreadCount = 0 }) => (
    <nav className="bg-[#14181c]/95 backdrop-blur-md border-b border-[#2c3440] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-gradient-to-br from-[#00e054] to-[#40bcf4] p-2.5 rounded-xl shadow-lg group-hover:shadow-[0_0_20px_rgba(0,224,84,0.3)] transition-shadow">
                    <Layout className="w-5 h-5 text-[#14181c]" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">DevStudy</span>
            </Link>
            <div className="flex items-center gap-4">
                <Link
                    to="/groups"
                    className="p-2.5 rounded-lg text-[#678] hover:text-white hover:bg-[#2c3440] transition-all"
                    title="Groups"
                >
                    <Users className="w-5 h-5" />
                </Link>
                <Link
                    to="/shares"
                    className="relative p-2.5 rounded-lg text-[#678] hover:text-white hover:bg-[#2c3440] transition-all"
                >
                    <Share2 className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#00e054] text-[#14181c] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Link>
                <Link
                    to="/profile"
                    className="p-2.5 rounded-lg text-[#678] hover:text-white hover:bg-[#2c3440] transition-all"
                    title="Profile"
                >
                    <User className="w-5 h-5" />
                </Link>
                <span className="text-sm text-[#678] hidden sm:block">
                    {user?.email?.split('@')[0]}
                </span>
                <button
                    onClick={logout}
                    className="p-2.5 rounded-lg text-[#678] hover:text-white hover:bg-[#2c3440] transition-all"
                    data-tooltip="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
    </nav>
);
