"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Github,
    Linkedin,
    Instagram,
    Twitter,
    Mail,
    Edit,
    Loader2,
    Calendar,
    Briefcase,
    ArrowLeft,
    GraduationCap,
    Book,
} from "lucide-react";
interface UserDomain {
    id: string;
    department: string;
    position: string;
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    domains: UserDomain[];
    bio?: string;
    profilePhoto?: string;
    birthDate?: string;
    college?: string;
    branch?: string;
    year?: string;  
    otherCollegeName?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    createdAt: string;
}

export default function ProfilePage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const isOwner = session?.user?.id === userId;
    const isAdmin = session?.user?.role === "ADMIN";

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`/api/profile/${userId}`);
                if (!res.ok) {
                    router.push("/");
                    return;
                }
                const data = await res.json();
                setProfile(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [userId, router]);
    const positionOrder: Record<string, number> = {
        PRESIDENT: 1,
        VICE_PRESIDENT: 2,
        CHAIR_MEMBER: 3,
        SECRETARY: 4,
        OPEN_SOURCE_EXECUTIVE: 5,
        TREASURER: 6,
        EVENT_MANAGER: 7,
        HEAD: 8,
        SOCIAL_MEDIA_MANAGER: 9,
        CO_HEAD: 10,
        CORE_MEMBER: 11,
        LEARNER: 12,
    };

    const sortedDomains = [...(profile?.domains || [])].sort((a, b) => {
        const positionDifference =
            (positionOrder[a.position] ?? 999) -
            (positionOrder[b.position] ?? 999);

        // Same position wale members ke domains alphabetically dikhenge
        return (
            positionDifference ||
            a.department.localeCompare(b.department)
        );
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-deep-black">
                <Loader2 className="animate-spin text-neon-red w-10 h-10" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <main className="bg-deep-black min-h-screen text-white">
            <Navbar />

            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-red/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10"
                >
                    <Link
                        href="/team"
                        className="inline-flex items-center text-gray-400 hover:text-neon-red transition-colors group"
                    >
                        <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Team
                    </Link>
                </motion.div>

                <div className="grid md:grid-cols-[280px_1fr] gap-10 items-start">
                    {/* Left Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-5"
                    >
                        {/* Photo */}
                        <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-neon-red/40 shadow-[0_0_30px_rgba(255,0,51,0.2)]">
                            {profile.profilePhoto ? (
                                <Image
                                    src={profile.profilePhoto}
                                    alt={profile.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-neon-red/10 flex items-center justify-center text-6xl font-black text-neon-red">
                                    {profile.name[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Name & Role */}
                        <div className="text-center">
                            <h1 className="text-3xl font-black">
                                {profile.name}
                            </h1>

                            <span className="inline-block mt-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 uppercase tracking-wider">
                                {profile.role}
                            </span>
                            {profile?.birthDate && (
                                
                                    <div>

                                        <p className="text-white font-bold">
                                            {new Date(
                                                profile?.birthDate
                                            ).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>

                                
                            )}
                        </div>


                        {/* Edit Button */}
                        {(isOwner || isAdmin) && (
                            <Link
                                href={`/profile/${userId}/edit`}
                                className="flex items-center gap-2 px-6 py-2 bg-neon-red text-white font-bold rounded-lg hover:bg-red-600 transition-all hover:shadow-[0_0_15px_rgba(255,0,51,0.4)] text-sm"
                            >
                                <Edit size={16} />
                                Edit Profile
                            </Link>
                        )}

                        {/* Socials */}
                        <div className="flex gap-3 flex-wrap justify-center">
                            {profile.email && (
                                <a
                                    href={`mailto:${profile.email}`}
                                    className="p-2 rounded-full bg-white/5 hover:bg-neon-red text-gray-400 hover:text-white transition-all border border-white/10"
                                >
                                    <Mail size={18} />
                                </a>
                            )}
                            {profile.github && (
                                <a
                                    href={profile.github}
                                    target="_blank"
                                    className="p-2 rounded-full bg-white/5 hover:bg-white text-gray-400 hover:text-black transition-all border border-white/10"
                                >
                                    <Github size={18} />
                                </a>
                            )}
                            {profile.linkedin && (
                                <a
                                    href={profile.linkedin}
                                    target="_blank"
                                    className="p-2 rounded-full bg-white/5 hover:bg-[#0077b5] text-gray-400 hover:text-white transition-all border border-white/10"
                                >
                                    <Linkedin size={18} />
                                </a>
                            )}
                            {profile.instagram && (
                                <a
                                    href={profile.instagram}
                                    target="_blank"
                                    className="p-2 rounded-full bg-white/5 hover:bg-[#E1306C] text-gray-400 hover:text-white transition-all border border-white/10"
                                >
                                    <Instagram size={18} />
                                </a>
                            )}
                            {profile.twitter && (
                                <a
                                    href={profile.twitter}
                                    target="_blank"
                                    className="p-2 rounded-full bg-white/5 hover:bg-[#1DA1F2] text-gray-400 hover:text-white transition-all border border-white/10"
                                >
                                    <Twitter size={18} />
                                </a>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-8"
                    >
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                            {/* college and branch */}
                            {profile.college && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                                    <GraduationCap
                                        className="text-neon-red flex-shrink-0"
                                        size={20}
                                    />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                                            College
                                        </p>
                                        <p className="text-white font-bold">
                                            {profile.college}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {profile.branch && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                                    <Book
                                        className="text-neon-red flex-shrink-0"
                                        size={20}
                                    />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                                            Branch
                                        </p>
                                        <p className="text-white font-bold">
                                            {profile.branch}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {/* year */}
                            {profile.year && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                                    <Calendar
                                        className="text-neon-red flex-shrink-0"
                                        size={20}
                                    />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                                            Year
                                        </p>
                                        <p className="text-white font-bold">
                                            {profile.year}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Bio */}
                        {profile.bio && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    About
                                </h2>
                                <p className="text-gray-300 leading-relaxed text-lg">
                                    {profile.bio}
                                </p>
                            </div>
                        )}



                        {/* Domains */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                                Domains & Positions
                            </h2>

                            {sortedDomains?.length > 0 ? (
                                <div className="space-y-3">
                                    {sortedDomains.map((domain) => (
                                        <div
                                            key={domain.id}
                                            className="flex items-center justify-between gap-4 bg-black/30 border border-white/10 rounded-xl px-4 py-3"
                                        >
                                            <span className="text-sm font-bold text-white">
                                                {domain.department.replace(/_/g, " ")}
                                            </span>

                                            <span
                                                className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${domain.position === "LEARNER"
                                                    ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                                                    : "bg-neon-red/10 border border-neon-red/20 text-neon-red"
                                                    }`}
                                            >
                                                {domain.position.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                                    <p className="text-gray-400 text-sm">
                                        This member has not joined any domain yet.
                                    </p>
                                </div>
                            )}
                        </div>
                        {/* Member Since */}
                        <p className="text-gray-600 text-sm">
                            Member since{" "}
                            {new Date(profile.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                    month: "long",
                                    year: "numeric",
                                }
                            )}
                        </p>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}