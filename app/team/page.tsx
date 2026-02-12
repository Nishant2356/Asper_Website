"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { team, TeamMember } from "@/app/data/team";
import { Github, Linkedin, Instagram, Twitter } from "lucide-react";

// --- Components ---

const SocialLinks = ({ socials }: { socials: TeamMember["socials"] }) => (
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
                <Twitter size={20} />
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
                <Instagram size={20} />
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
            onClick={() => router.push(`/team/${member.id}`)}
            className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,0,51,0.3)] cursor-pointer"
        >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                    src={member.image}
                    alt={member.name}
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

                <div
                    className="
                        absolute inset-0 
                        bg-gradient-to-t from-black/90 via-black/40 to-transparent 
                        opacity-80 
                        md:opacity-0 md:group-hover:opacity-100 
                        transition-opacity duration-300
                    "
                />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white bg-gradient-to-t from-black via-black/80 to-transparent md:bg-none">
                <h3 className="text-xl font-bold leading-tight mb-1 group-hover:text-neon-red transition-colors">
                    {member.name}
                </h3>
                <p className="text-sm font-medium text-gray-300 mb-1">
                    {member.role}
                </p>
                <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wider">
                    {member.department}
                </p>

                <div
                    className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    <SocialLinks socials={member.socials} />
                </div>
            </div>
        </motion.div>
    );
};

// --- Data Filtering and Sorting ---

const getSortPriority = (dept: string) => {
    const d = dept.toLowerCase();
    if (d.includes("web")) return 1;
    if (d.includes("dsa")) return 2;
    if (d.includes("game")) return 3;
    if (d.includes("machine") || d.includes("ml")) return 4;
    return 5;
};

const sortByDept = (a: TeamMember, b: TeamMember) => {
    return getSortPriority(a.department) - getSortPriority(b.department);
};

const heads = team.filter((m) => m.role.toLowerCase().includes("head")).sort(sortByDept);
const core = team.filter((m) => m.role.toLowerCase().includes("core")).sort(sortByDept);
const learners = team.filter((m) => m.role.toLowerCase().includes("learner"));
const others = team.filter(
    (m) =>
        !m.role.toLowerCase().includes("head") &&
        !m.role.toLowerCase().includes("core") &&
        !m.role.toLowerCase().includes("learner")
);
const learnersAndOthers = [...learners, ...others].sort(sortByDept);

const TeamSection = ({ title, members }: { title: string; members: TeamMember[] }) => {
    if (members.length === 0) return null;

    return (
        <section className="py-16 px-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
                <div className="h-10 w-1 bg-neon-red"></div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white">
                    {title}
                </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {members.map((member, i) => (
                    <TeamCard key={member.id} member={member} index={i} />
                ))}
            </div>
        </section>
    );
};

// --- Main Page ---

export default function TeamPage() {
    return (
        <main className="bg-deep-black min-h-screen text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 text-center relative overflow-hidden">
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

            <TeamSection title="Leads" members={heads} />
            <TeamSection title="Core Members" members={core} />
            <TeamSection title="Learners" members={learnersAndOthers} />

            <Footer />
        </main>
    );
}
