"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Loader2, Save, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

interface ProfileForm {
    bio: string;
    profilePhoto: string;
    github: string;
    linkedin: string;
    instagram: string;
    twitter: string;
    position: string;
    birthDate: string;
}

export default function EditProfilePage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();

    const isAdmin = session?.user?.role === "ADMIN";
    const isOwner = session?.user?.id === userId;

    const [form, setForm] = useState<ProfileForm>({
        bio: "",
        profilePhoto: "",
        github: "",
        linkedin: "",
        instagram: "",
        twitter: "",
        position: "",
        birthDate: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (
            status === "authenticated" &&
            !isOwner &&
            !isAdmin
        ) {
            router.push(`/profile/${userId}`);
        }
    }, [status, isOwner, isAdmin, userId, router]);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`/api/profile/${userId}`);
                if (!res.ok) return;
                const data = await res.json();
                setForm({
                    bio: data.bio || "",
                    profilePhoto: data.profilePhoto || "",
                    github: data.github || "",
                    linkedin: data.linkedin || "",
                    instagram: data.instagram || "",
                    twitter: data.twitter || "",
                    position: data.position || "",
                    birthDate: data.birthDate
                        ? new Date(data.birthDate)
                              .toISOString()
                              .split("T")[0]
                        : "",
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        if (status === "authenticated") fetchProfile();
    }, [userId, status]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/profile/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessage({
                type: "success",
                text: data.message || "Profile updated successfully!",
            });

            setTimeout(() => router.push(`/profile/${userId}`), 2000);
        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.message || "Something went wrong.",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="flex justify-center items-center h-screen bg-deep-black">
                <Loader2 className="animate-spin text-neon-red w-10 h-10" />
            </div>
        );
    }

    return (
        <main className="bg-deep-black min-h-screen text-white">
            <Navbar />

            <section className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <Link
                        href={`/profile/${userId}`}
                        className="inline-flex items-center text-gray-400 hover:text-neon-red transition-colors group mb-6"
                    >
                        <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Profile
                    </Link>
                    <h1 className="text-4xl font-black">Edit Profile</h1>
                    <p className="text-gray-400 mt-2">
                        Update your profile information below.
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Profile Photo */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Profile Photo
                        </h2>
                        <div className="flex items-center gap-6">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
                                {form.profilePhoto ? (
                                    <Image
                                        src={form.profilePhoto}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-neon-red/10 flex items-center justify-center text-3xl font-black text-neon-red">
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
                                                result.info.secure_url,
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
                                            Upload New Photo
                                        </button>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG up to 5MB
                                        </p>
                                    </div>
                                )}
                            </CldUploadWidget>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Bio
                        </h2>
                        <textarea
                            value={form.bio}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    bio: e.target.value,
                                }))
                            }
                            placeholder="Tell the world about yourself..."
                            rows={4}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 transition-colors resize-none"
                        />
                    </div>

                    {/* Restricted Fields */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                Position & Birth Date
                            </h2>
                            {!isAdmin && (
                                <div className="flex items-center gap-1 text-yellow-500 text-xs bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                                    <Info size={12} />
                                    Requires approval
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Position / Title
                                </label>
                                <input
                                    type="text"
                                    value={form.position}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            position: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Web Development Head"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Birth Date
                                </label>
                                <input
                                    type="date"
                                    value={form.birthDate}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            birthDate: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-red/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Social Links
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(
                                [
                                    { key: "github", label: "GitHub URL" },
                                    { key: "linkedin", label: "LinkedIn URL" },
                                    {
                                        key: "instagram",
                                        label: "Instagram URL",
                                    },
                                    {
                                        key: "twitter",
                                        label: "Twitter / X URL",
                                    },
                                ] as const
                            ).map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-sm text-gray-400 mb-2">
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
                                        placeholder="https://..."
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 transition-colors"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status Message */}
                    {message && (
                        <div
                            className={`p-4 rounded-lg border text-sm font-medium ${
                                message.type === "success"
                                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-neon-red text-white font-black rounded-xl hover:bg-red-600 transition-all hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <Save size={20} />
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </section>

            <Footer />
        </main>
    );
}