"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut, User } from "lucide-react";
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
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

    const handleLogout = () => {
        signOut();
        setIsUserMenuOpen(false);
    };

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
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors"
                            >
                                <div className="text-right hidden lg:block">
                                    <p className="text-white text-sm font-bold leading-none">{user.name}</p>
                                    <p className="text-gray-500 text-xs text-right mt-1">{user.role}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-neon-red/10 border border-neon-red flex items-center justify-center text-neon-red font-bold text-lg">
                                    {user.name?.[0]?.toUpperCase()}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-56 bg-deep-black border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                                    >
                                        <div className="p-4 border-b border-white/5 lg:hidden">
                                            <p className="text-white font-bold">{user.name}</p>
                                            <p className="text-gray-500 text-sm">{user.email}</p>
                                        </div>

                                        <div className="p-2">
                                            {user.role === "ADMIN" && (
                                                <Link
                                                    href="/projects/admin"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                >
                                                    <User size={18} />
                                                    Admin Dashboard
                                                </Link>
                                            )}
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

            {/* Mobile Menu Overlay */}
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
                                    <div className="text-center">
                                        <p className="text-white font-bold text-lg">{user.name}</p>
                                        <p className="text-gray-500 text-sm mb-4">{user.role}</p>
                                    </div>

                                    {user.role === "ADMIN" && (
                                        <Link
                                            href="/projects/admin"
                                            onClick={() => setIsOpen(false)}
                                            className="text-xl font-medium text-gray-300 hover:text-neon-red transition-colors"
                                        >
                                            Dashboard
                                        </Link>
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
