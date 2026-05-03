"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                setError("Invalid email or password");
                setLoading(false);
            } else {
                // Check if user has completed onboarding
                const profileRes = await fetch("/api/auth/session");
                const session = await profileRes.json();

                if (session?.user?.id) {
                    const userRes = await fetch(`/api/profile/${session.user.id}`);
                    const userData = await userRes.json();

                    // If no bio and no profilePhoto → first time → onboarding
                    if (!userData.bio && !userData.profilePhoto) {
                        router.push("/onboarding");
                    } else {
                        router.push("/");
                    }
                } else {
                    router.push("/");
                }

                router.refresh();
            }
        } catch (err) {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-deep-black relative overflow-hidden flex flex-col">
            <Navbar />

            <div className="absolute top-1/4 -left-64 w-96 h-96 bg-neon-red/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

            <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 lg:p-10 backdrop-blur-xl shadow-2xl hover:border-neon-red/30 transition-colors duration-500">
                    <div className="text-center mb-10">
                        <Link href="/" className="inline-block mb-8">
                            <span className="text-2xl font-black tracking-tighter text-white">
                                ASPER<span className="text-neon-red">.</span>
                            </span>
                        </Link>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight font-heading">
                            WELCOME <span className="text-gray-500">BACK</span>
                        </h1>
                        <p className="text-gray-400">
                            Sign in to your account to continue
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wide">
                                Email
                            </label>
                            <div className="relative group">
                                <Mail
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-red transition-colors"
                                    size={20}
                                />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 focus:bg-white/5 transition-all duration-300"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-gray-300 text-sm font-bold uppercase tracking-wide">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-neon-red hover:underline decoration-neon-red"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-red transition-colors"
                                    size={20}
                                />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 focus:bg-white/5 transition-all duration-300"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-neon-red to-red-600 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <span className="animate-pulse">
                                    Signing in...
                                </span>
                            ) : (
                                <>
                                    Sign In{" "}
                                    <ArrowRight
                                        size={20}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-400 text-sm">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="text-white font-bold hover:text-neon-red transition-colors"
                        >
                            Sign up now
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}