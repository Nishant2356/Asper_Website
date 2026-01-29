"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Lock } from "lucide-react";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await login(password);
            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || "Authentication failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-neon-red/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="text-neon-red" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                    <p className="text-gray-400 text-sm mt-2">Enter your password to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-red transition-colors"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-neon-red text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Verifying..." : "Access Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
}
