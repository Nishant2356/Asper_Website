"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, Briefcase, ChevronRight, ChevronDown, Check } from "lucide-react";
import Navbar from "@/components/Navbar";

const DEPARTMENTS = [
    { value: "DSA", label: "DSA" },
    { value: "WEB_DEVELOPMENT", label: "Web Development" },
    { value: "IOT", label: "IOT" },
    { value: "GAME_DEVELOPMENT_ANIMATION", label: "Game Development & Animation" },
    { value: "DEVOPS_CLOUD", label: "DevOps & Cloud" },
    { value: "ML_DATA_SCIENCE", label: "ML & Data Science" },
    { value: "MEDIA_GRAPHICS_VIDEO", label: "Graphic Design" },
    { value: "CORPORATE_RELATIONS", label: "Corporate Relations" },
    { value: "PHOTOGRAPHY_VIDEO_EDITING", label: "Photography & Video Editing" },
];

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        password: string;
        domain: string[];
    }>({
        name: "",
        email: "",
        password: "",
        domain: [],
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.domain.length === 0) {
            setError("Please select at least one domain.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/login");
            } else {
                const data = await res.json();
                setError(data.message || "Registration failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-deep-black relative overflow-hidden flex flex-col">
            <Navbar />

            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-neon-red/5 rounded-full blur-[120px]" />

            <div className="flex-1 flex items-center justify-center p-4 relative z-10 py-24">
                <div className="max-w-xl w-full bg-white/5 border border-white/10 rounded-2xl p-8 lg:p-10 backdrop-blur-xl shadow-2xl hover:border-neon-red/30 transition-colors duration-500">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight font-heading">JOIN THE <span className="text-neon-red">SQUAD</span></h1>
                        <p className="text-gray-400">Create your account to start your journey</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-8 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wide">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-red transition-colors" size={20} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 focus:bg-white/5 transition-all duration-300"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wide">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-red transition-colors" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 focus:bg-white/5 transition-all duration-300"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wide">
                                Select Your Domains (Choose at least one)
                            </label>
                            <div className="relative group">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-red transition-colors" size={20} />
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-10 text-left text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 focus:bg-white/5 transition-all duration-300 relative"
                                >
                                    <span className={`block truncate ${formData.domain.length === 0 ? "text-gray-600" : "text-white"}`}>
                                        {formData.domain.length === 0
                                            ? "Select your domains"
                                            : DEPARTMENTS.filter(d => formData.domain.includes(d.value)).map(d => d.label).join(", ")}
                                    </span>
                                    <ChevronDown
                                        className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                                        size={20}
                                    />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                                        {DEPARTMENTS.map((dept) => {
                                            const isSelected = formData.domain.includes(dept.value);
                                            return (
                                                <div
                                                    key={dept.value}
                                                    onClick={() => {
                                                        let newDomains;
                                                        if (isSelected) {
                                                            newDomains = formData.domain.filter(d => d !== dept.value);
                                                        } else {
                                                            newDomains = [...formData.domain, dept.value];
                                                        }
                                                        setFormData({ ...formData, domain: newDomains });
                                                    }}
                                                    className={`p-4 cursor-pointer flex items-center justify-between transition-colors border-b border-white/5 last:border-0 ${isSelected ? "bg-neon-red/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                        }`}
                                                >
                                                    <span className="font-medium">{dept.label}</span>
                                                    {isSelected && <Check className="text-neon-red" size={18} />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-500 text-xs mt-2 ml-1">
                                {formData.domain.length === 0
                                    ? "Please select at least one domain."
                                    : `${formData.domain.length} domain(s) selected.`}
                            </p>
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wide">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-red transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 focus:bg-white/5 transition-all duration-300"
                                    placeholder="Create a strong password"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-400 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-white font-bold hover:text-neon-red transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
