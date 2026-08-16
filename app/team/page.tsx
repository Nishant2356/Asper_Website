"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Users, ArrowRight, Linkedin, Github, InstagramIcon, TwitterIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface TeamMember {
    id: string;
    department: string;
    position: string;
    user: {
        id: string;
        name: string;
        profilePhoto?: string | null;
        bio?: string | null;
        github?: string | null;
        linkedin?: string | null;
        twitter?: string | null;
        instagram?: string | null;
    };

}

const hierarchySections = [
    {
        title: "Executive Leadership",
        description: "Driving the vision, strategy, and direction of ASPER.",
        positions: ["PRESIDENT", "VICE_PRESIDENT", "CHAIR_MEMBER"],
    },
    {
        title: "Office Bearers",
        description: "Managing operations, initiatives, events, and community.",
        positions: [
            "SECRETARY",
            "TREASURER",
            "OPEN_SOURCE_EXECUTIVE",
            "EVENT_MANAGER",
            "SOCIAL_MEDIA_MANAGER",
        ],
    },
    {
        title: "Domain Leadership",
        description: "Leading technical domains and mentoring the community.",
        positions: ["HEAD", "CO_HEAD"],
    },
    {
        title: "Core Team",
        description: "The members who build, organise, and make things happen.",
        positions: ["CORE_MEMBER"],
    },
    {
        title: "Learners",
        description: "Members learning, collaborating, and growing with ASPER.",
        positions: ["LEARNER"],
    },
];
const SocialLinks = ({ socials }: { socials: TeamMember["user"] }) => (
    <div className="flex items-center gap-3 mt-3 text-gray-400 group-hover:text-white transition-colors">
        {socials.linkedin && (
            <a
                href={socials.linkedin.startsWith("http") ? socials.linkedin : `https://${socials.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-[#0A66C2] transition-colors"
            >
                <Linkedin size={20} />
            </a>
        )}
        {socials.github && (
            <a
                href={socials.github.startsWith("http") ? socials.github : `https://${socials.github}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="hover:text-white transition-colors"
            >
                <Github size={20} />
            </a>
        )}
        {socials.twitter && (
            <a
                href={socials.twitter.startsWith("http") ? socials.twitter : `https://${socials.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="hover:text-[#1DA1F2] transition-colors"
            >
                <TwitterIcon size={20} />
            </a>
        )}
        {socials.instagram && (
            <a
                href={socials.instagram.startsWith("http") ? socials.instagram : `https://${socials.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-[#E1306C] transition-colors"
            >
                <InstagramIcon size={20} />
            </a>
        )}
    </div>
);

const TeamCard = ({ member, index }: { member: TeamMember; index: number }) => {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            onClick={() => router.push(`/profile/${member.user.id}`)}
            className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,0,51,0.3)] cursor-pointer"
        >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                    src={member.user.profilePhoto || "/default-profile.jpg"}
                    alt={member.user.name}
                    fill
                    className="
                        object-cover 
                        transition-transform duration-700 
                        grayscale-0                   /* Default: full color */
                        md:grayscale                  /* Desktop: grayscale by default */
                        md:group-hover:grayscale-0    /* Desktop hover: color */
                        group-hover:scale-110
                    "
                />

                {/* <div
                    className="
                        absolute inset-0 
                        bg-gradient-to-t from-black/90 via-black/40 to-transparent 
                        opacity-80 
                        md:opacity-0 md:group-hover:opacity-100 
                        transition-opacity duration-300
                    "
                /> */}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white bg-gradient-to-t from-black/100 via-black/80 to-transparent opacity-100  transition-opacity duration-300">
                <h3 className="text-xl font-bold leading-tight mb-1 group-hover:text-neon-red transition-colors">
                    {member.user.name}
                </h3>

                {/* Show the role specifically for Community head / President / Founder */}

                <p className="text-sm font-bold text-neon-red mt-1 uppercase tracking-widest">
                    {member.position.replace(/_/g, " ")}
                </p>
                {/* Show the department for heads and co-heads */}

                <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wider">
                    {member.department.replace(/_/g, " ")}
                </p>



                <div
                    className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    <SocialLinks socials={member.user} />
                </div>
            </div>
        </motion.div>
    );
};


const formatLabel = (value: string) =>
    value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTeam() {
            try {
                const res = await fetch("/api/team");

                if (!res.ok) {
                    throw new Error("Failed to load team");
                }

                const data = await res.json();
                setMembers(data);
            } catch (error) {
                console.error("Team fetch error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchTeam();
    }, []);

    return (
        <main className="bg-deep-black min-h-screen text-white">
            <Navbar />

            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-neon-red/10 rounded-full blur-[130px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[130px]" />
            </div>

            <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <section className="pb-10 px-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-red/10 rounded-full blur-[100px] -z-10" />

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-black mb-6 font-heading"
                    >
                        THE <span className="text-neon-red">MINDS</span> BEHIND
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto"
                    >
                        Meet the leaders, creators, and innovators driving ASPER forward.
                    </motion.p>
                </section>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="animate-spin text-neon-red w-10 h-10" />
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center py-24 bg-white/5 border border-white/10 rounded-2xl">
                        <Users className="mx-auto mb-4 text-gray-500" size={48} />
                        <p className="text-xl font-bold">
                            Team members will appear here soon.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-15">
                        {hierarchySections.map((section) => {
                            const sectionMembers = members.filter((member) =>
                                section.positions.includes(member.position)
                            );

                            if (sectionMembers.length === 0) return null;

                            return (
                                <section key={section.title}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="border-l-4 border-neon-red pl-5 mb-8"
                                    >
                                        <h2 className="text-2xl md:text-3xl font-black">
                                            {section.title}
                                        </h2>

                                        <p className="text-gray-400 mt-1">
                                            {section.description}
                                        </p>
                                    </motion.div>

                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {sectionMembers.map((member, index) => (
                                            <TeamCard
                                                key={member.id}
                                                member={member}
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}