"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Menu,
    X,
    LogOut,
    User,
    Bell,
    Users,
    Shield,
    Edit,
    ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Events", href: "/events" },
    { name: "Team", href: "/team" },
    { name: "Projects", href: "/projects" },
    { name: "Quiz", href: "/quiz" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar() {
    const { data: session } = useSession();
    const user = session?.user;
    const isAdmin = user?.role === "ADMIN";
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsUserMenuOpen(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // ─── Fetch profile photo ──────────────────────────
    useEffect(() => {
        if (!user?.id) return;

        const fetchPhoto = async () => {
            try {
                const res = await fetch(`/api/profile/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.profilePhoto) {
                        setProfilePhoto(data.profilePhoto);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile photo:", error);
            }
        };

        fetchPhoto();
    }, [user?.id]);

    // ─── Fetch unread notification count ──────────────
    useEffect(() => {
        if (!isAdmin) return;

        const fetchCount = async () => {
            try {
                const res = await fetch("/api/notifications", {
                    method: "HEAD",
                });
                const count = res.headers.get("X-Unread-Count");
                if (count) setUnreadCount(parseInt(count));
            } catch (error) {
                console.error(error);
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    const handleLogout = () => {
        signOut();
        setIsUserMenuOpen(false);
    };

    // ─── Avatar Component ─────────────────────────────
    const UserAvatar = ({ size = "w-10 h-10", textSize = "text-lg" }: { size?: string; textSize?: string }) => (
        <div
            className={`${size} rounded-full overflow-hidden border-2 border-neon-red flex items-center justify-center flex-shrink-0 relative`}
        >
            {profilePhoto ? (
                <Image
                    src={profilePhoto}
                    alt={user?.name || "Profile"}
                    fill
                    className="object-cover"
                />
            ) : (
                <div
                    className={`w-full h-full bg-neon-red/10 flex items-center justify-center ${textSize} font-bold text-neon-red`}
                >
                    {user?.name?.[0]?.toUpperCase()}
                </div>
            )}
        </div>
    );

    return (
        <nav
            className={clsx(
                "fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b",
                isScrolled
                    ? "backdrop-blur-md bg-deep-black/70 border-white/10"
                    : "bg-transparent border-transparent backdrop-blur-none"
            )}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-24 h-16">
                        <Image
                            src="https://res.cloudinary.com/dujwwjdkq/image/upload/v1768587223/Gemini_Generated_Image_ie1mzaie1mzaie1m_1_kgyx27.png"
                            alt="Asper Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-gray-400 hover:text-neon-red transition-colors text-sm font-medium uppercase tracking-wide"
                        >
                            {link.name}
                        </Link>
                    ))}

                    {user ? (
                        <div
                            className="relative flex items-center gap-3"
                            ref={dropdownRef}
                        >
                            {/* Admin Bell */}
                            {isAdmin && (
                                <Link
                                    href="/admin/notifications"
                                    className="relative p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-red text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                            {unreadCount > 9
                                                ? "9+"
                                                : unreadCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* User Button with Profile Photo */}
                            <button
                                onClick={() =>
                                    setIsUserMenuOpen(!isUserMenuOpen)
                                }
                                className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors"
                            >
                                <div className="text-right hidden lg:block">
                                    <p className="text-white text-sm font-bold leading-none">
                                        {user.name}
                                    </p>
                                    <p className="text-gray-500 text-xs text-right mt-1">
                                        {user.role}
                                    </p>
                                </div>
                                <UserAvatar />
                            </button>

                            {/* Dropdown */}
                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                            scale: 0.95,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: 10,
                                            scale: 0.95,
                                        }}
                                        className="absolute right-0 mt-2 w-64 bg-deep-black border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 top-full"
                                    >
                                        {/* User Info with Photo */}
                                        <div className="p-4 border-b border-white/5 flex items-center gap-3">
                                            <UserAvatar
                                                size="w-12 h-12"
                                                textSize="text-xl"
                                            />
                                            <div>
                                                <p className="text-white font-bold">
                                                    {user.name}
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-2">
                                            {/* My Profile */}
                                            <Link
                                                href={`/profile/${user.id}`}
                                                onClick={() =>
                                                    setIsUserMenuOpen(false)
                                                }
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                <User size={18} />
                                                My Profile
                                            </Link>

                                            {/* Edit Profile */}
                                            <Link
                                                href={`/profile/${user.id}/edit`}
                                                onClick={() =>
                                                    setIsUserMenuOpen(false)
                                                }
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                <Edit size={18} />
                                                Edit Profile
                                            </Link>

                                            {/* Admin Section */}
                                            {isAdmin && (
                                                <>
                                                    <div className="my-2 mx-4 border-t border-white/5" />
                                                    <p className="px-4 py-1 text-xs font-bold text-gray-600 uppercase tracking-widest">
                                                        Admin
                                                    </p>

                                                    <Link
                                                        href="/admin/members"
                                                        onClick={() =>
                                                            setIsUserMenuOpen(
                                                                false
                                                            )
                                                        }
                                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                    >
                                                        <Users size={18} />
                                                        Manage Members
                                                    </Link>

                                                    <Link
                                                        href="/admin/notifications"
                                                        onClick={() =>
                                                            setIsUserMenuOpen(
                                                                false
                                                            )
                                                        }
                                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                    >
                                                        <Bell size={18} />
                                                        Notifications
                                                        {unreadCount > 0 && (
                                                            <span className="ml-auto px-2 py-0.5 bg-neon-red text-white text-xs font-bold rounded-full">
                                                                {unreadCount}
                                                            </span>
                                                        )}
                                                    </Link>

                                                    <Link
                                                        href="/profile/requests"
                                                        onClick={() =>
                                                            setIsUserMenuOpen(
                                                                false
                                                            )
                                                        }
                                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                    >
                                                        <ClipboardList
                                                            size={18}
                                                        />
                                                        Profile Requests
                                                    </Link>

                                                    <Link
                                                        href="/projects/admin"
                                                        onClick={() =>
                                                            setIsUserMenuOpen(
                                                                false
                                                            )
                                                        }
                                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                    >
                                                        <Shield size={18} />
                                                        Project Dashboard
                                                    </Link>
                                                </>
                                            )}
                                        </div>

                                        {/* Logout */}
                                        <div className="p-2 border-t border-white/5">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <LogOut size={18} />
                                                Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-gray-400 hover:text-neon-red transition-colors text-sm font-medium uppercase tracking-wide"
                            >
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="px-6 py-2 bg-neon-red text-white font-bold rounded-md hover:bg-red-600 transition-all hover:shadow-[0_0_20px_rgba(255,0,51,0.4)]"
                            >
                                JOIN US
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white hover:text-neon-red transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black/95 border-b border-white/10 overflow-hidden"
                    >
                        <div className="flex flex-col items-center py-8 gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-xl font-medium text-gray-300 hover:text-neon-red transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {user ? (
                                <>
                                    <div className="w-full h-px bg-white/10 my-2" />

                                    {/* Mobile User Info with Photo */}
                                    <div className="flex flex-col items-center gap-3">
                                        <UserAvatar
                                            size="w-16 h-16"
                                            textSize="text-2xl"
                                        />
                                        <div className="text-center">
                                            <p className="text-white font-bold text-lg">
                                                {user.name}
                                            </p>
                                            <p className="text-gray-500 text-sm mb-2">
                                                {user.role}
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/profile/${user.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="text-xl font-medium text-gray-300 hover:text-neon-red transition-colors"
                                    >
                                        My Profile
                                    </Link>

                                    <Link
                                        href={`/profile/${user.id}/edit`}
                                        onClick={() => setIsOpen(false)}
                                        className="text-xl font-medium text-gray-300 hover:text-neon-red transition-colors"
                                    >
                                        Edit Profile
                                    </Link>

                                    {isAdmin && (
                                        <>
                                            <div className="w-full h-px bg-white/10 my-2" />
                                            <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">
                                                Admin
                                            </p>

                                            <Link
                                                href="/admin/members"
                                                onClick={() => setIsOpen(false)}
                                                className="text-xl font-medium text-gray-300 hover:text-neon-red transition-colors"
                                            >
                                                Manage Members
                                            </Link>
                                            <Link
                                                href="/admin/notifications"
                                                onClick={() => setIsOpen(false)}
                                                className="text-xl font-medium text-gray-300 hover:text-neon-red transition-colors flex items-center gap-2"
                                            >
                                                Notifications
                                                {unreadCount > 0 && (
                                                    <span className="px-2 py-0.5 bg-neon-red text-white text-xs font-bold rounded-full">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </Link>
                                            <Link
                                                href="/profile/requests"
                                                onClick={() => setIsOpen(false)}
                                                className="text-xl font-medium text-gray-300 hover:text-neon-red transition-colors"
                                            >
                                                Profile Requests
                                            </Link>
                                            <Link
                                                href="/projects/admin"
                                                onClick={() => setIsOpen(false)}
                                                className="text-xl font-medium text-gray-300 hover:text-neon-red transition-colors"
                                            >
                                                Project Dashboard
                                            </Link>
                                        </>
                                    )}

                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false);
                                        }}
                                        className="text-xl font-medium text-red-500 hover:text-red-400 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="text-xl font-medium text-gray-300 hover:text-neon-red transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        onClick={() => setIsOpen(false)}
                                        className="px-8 py-3 bg-neon-red text-white font-bold rounded-md hover:bg-red-600 w-3/4 text-center transition-all"
                                    >
                                        JOIN US
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}