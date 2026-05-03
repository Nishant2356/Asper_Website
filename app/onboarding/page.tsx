"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import Navbar from "@/components/Navbar";

const STEPS = [
    { id: 1, title: "Welcome", desc: "Let's set up your profile" },
    { id: 2, title: "Photo & Bio", desc: "Tell us about yourself" },
    { id: 3, title: "Social Links", desc: "Connect your socials" },
    { id: 4, title: "All Done!", desc: "Your profile is ready" },
];

export default function OnboardingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        bio: "",
        profilePhoto: "",
        github: "",
        linkedin: "",
        instagram: "",
        twitter: "",
    });

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    const handleSave = async () => {
        if (!session?.user?.id) return;
        setSaving(true);
        try {
            await fetch(`/api/profile/${session.user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            setStep(4);
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center h-screen bg-deep-black">
                <Loader2 className="animate-spin text-neon-red w-10 h-10" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-deep-black text-white">
            <Navbar />

            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-red/10 rounded-full blur-[120px]" />
            </div>

            <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-20">
                <div className="w-full max-w-xl">

                    {/* Progress */}
                    <div className="flex items-center justify-between mb-10">
                        {STEPS.map((s, i) => (
                            <div key={s.id} className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                        step > s.id
                                            ? "bg-neon-red text-white"
                                            : step === s.id
                                            ? "bg-neon-red/20 border-2 border-neon-red text-neon-red"
                                            : "bg-white/5 border border-white/10 text-gray-600"
                                    }`}
                                >
                                    {step > s.id ? (
                                        <Check size={14} />
                                    ) : (
                                        s.id
                                    )}
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div
                                        className={`h-0.5 w-16 sm:w-24 mx-1 transition-all ${
                                            step > s.id
                                                ? "bg-neon-red"
                                                : "bg-white/10"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Step 1 */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
                            >
                                <div className="text-6xl mb-6">👋</div>
                                <h1 className="text-3xl font-black mb-3">
                                    Welcome,{" "}
                                    <span className="text-neon-red">
                                        {session?.user?.name?.split(" ")[0]}
                                    </span>
                                    !
                                </h1>
                                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                    Let's set up your ASPER profile in just
                                    a few steps. It'll only take a minute!
                                </p>
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex items-center gap-2 mx-auto px-8 py-4 bg-neon-red text-white font-black rounded-xl hover:bg-red-600 transition-all hover:shadow-[0_0_20px_rgba(255,0,51,0.4)]"
                                >
                                    Get Started <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2 */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-8"
                            >
                                <h2 className="text-2xl font-black mb-6">
                                    Photo & Bio
                                </h2>

                                <div className="flex items-center gap-5 mb-6">
                                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
                                        {form.profilePhoto ? (
                                            <Image
                                                src={form.profilePhoto}
                                                alt="Profile"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-neon-red/10 flex items-center justify-center text-2xl font-black text-neon-red">
                                                {session?.user?.name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <CldUploadWidget
                                        uploadPreset="asper_uploads"
                                        options={{
                                            resourceType: "image",
                                            clientAllowedFormats: [
                                                "png",
                                                "jpg",
                                                "jpeg",
                                                "webp",
                                            ],
                                            maxFileSize: 5000000,
                                        }}
                                        onSuccess={(result: any) => {
                                            if (result.info?.secure_url) {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    profilePhoto:
                                                        result.info
                                                            .secure_url,
                                                }));
                                            }
                                        }}
                                    >
                                        {({ open }) => (
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => open()}
                                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-bold transition-colors block mb-1"
                                                >
                                                    Upload Photo
                                                </button>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG up to 5MB
                                                </p>
                                            </div>
                                        )}
                                    </CldUploadWidget>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Bio{" "}
                                        <span className="text-gray-600">
                                            (optional)
                                        </span>
                                    </label>
                                    <textarea
                                        value={form.bio}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                bio: e.target.value,
                                            }))
                                        }
                                        placeholder="Tell the community about yourself..."
                                        rows={4}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 transition-colors resize-none"
                                    />
                                </div>

                                <div className="flex justify-between">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-colors"
                                    >
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="flex items-center gap-2 px-6 py-3 bg-neon-red text-white font-bold rounded-xl hover:bg-red-600 transition-all"
                                    >
                                        Next <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3 */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-8"
                            >
                                <h2 className="text-2xl font-black mb-2">
                                    Social Links
                                </h2>
                                <p className="text-gray-400 text-sm mb-6">
                                    All optional — add whichever you like.
                                </p>

                                <div className="space-y-4">
                                    {(
                                        [
                                            {
                                                key: "github",
                                                label: "GitHub",
                                                placeholder:
                                                    "https://github.com/username",
                                            },
                                            {
                                                key: "linkedin",
                                                label: "LinkedIn",
                                                placeholder:
                                                    "https://linkedin.com/in/username",
                                            },
                                            {
                                                key: "instagram",
                                                label: "Instagram",
                                                placeholder:
                                                    "https://instagram.com/username",
                                            },
                                            {
                                                key: "twitter",
                                                label: "Twitter / X",
                                                placeholder:
                                                    "https://x.com/username",
                                            },
                                        ] as const
                                    ).map(({ key, label, placeholder }) => (
                                        <div key={key}>
                                            <label className="block text-sm text-gray-400 mb-1">
                                                {label}
                                            </label>
                                            <input
                                                type="url"
                                                value={form[key]}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        [key]: e.target.value,
                                                    }))
                                                }
                                                placeholder={placeholder}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 transition-colors"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between mt-8">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-colors"
                                    >
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 bg-neon-red text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Check size={18} />
                                        )}
                                        {saving
                                            ? "Saving..."
                                            : "Finish Setup"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4 */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
                            >
                                <div className="text-6xl mb-6">🎉</div>
                                <h1 className="text-3xl font-black mb-3">
                                    You're all set!
                                </h1>
                                <p className="text-gray-400 text-lg mb-8">
                                    Your ASPER profile is ready. Welcome to
                                    the community!
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() =>
                                            router.push(
                                                `/profile/${session?.user?.id}`
                                            )
                                        }
                                        className="px-8 py-4 bg-neon-red text-white font-black rounded-xl hover:bg-red-600 transition-all hover:shadow-[0_0_20px_rgba(255,0,51,0.4)]"
                                    >
                                        View My Profile
                                    </button>
                                    <button
                                        onClick={() => router.push("/")}
                                        className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl transition-colors"
                                    >
                                        Go to Home
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}