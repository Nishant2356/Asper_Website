"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { team } from "@/app/data/team";
import { Github, Linkedin, Instagram, Twitter, ArrowLeft, Mail, MapPin } from "lucide-react";

export default function MemberDetailsPage() {
    const params = useParams();
    const id = Number(params.id);
    const member = team.find((m) => m.id === id);

    if (!member) {
        return (
            <main className="min-h-screen bg-deep-black text-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4">Member not found</h1>
                <Link href="/team" className="text-neon-red hover:underline flex items-center gap-2">
                    <ArrowLeft size={20} /> Back to Team
                </Link>
            </main>
        );
    }

    return (
        <main className="bg-deep-black min-h-screen text-white">
            <Navbar />

            <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Link
                        href="/team"
                        className="inline-flex items-center text-gray-400 hover:text-neon-red transition-colors group"
                    >
                        <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Team
                    </Link>
                </motion.div>

                <div className="grid md:grid-cols-[400px_1fr] gap-12 items-start">
                    {/* Image Column */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative group"
                    >
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(255,0,51,0.1)] max-w-xs md:max-w-none mx-auto md:mx-0 w-full">
                            <Image
                                src={member.image}
                                alt={member.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-neon-red/30 rounded-tl-3xl -z-10" />
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-neon-red/30 rounded-br-3xl -z-10" />
                    </motion.div>

                    {/* Info Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="mb-2">
                            <span className="inline-block px-3 py-1 rounded-full bg-neon-red/10 text-neon-red border border-neon-red/20 text-sm font-bold uppercase tracking-wider mb-4">
                                {member.role}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black mb-2 font-heading tracking-tight leading-none">
                            {member.name}
                        </h1>
                        <p className="text-xl text-gray-400 mb-8 font-light border-l-2 border-white/20 pl-4">
                            {member.department}
                        </p>

                        <div className="space-y-6 mb-10">
                            <div className="grid grid-cols-2 gap-4 max-w-md">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Branch</p>
                                    <p className="font-bold">{member.branch}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Year</p>
                                    <p className="font-bold">{member.year}</p>
                                </div>
                            </div>

                            {member.bio && (
                                <div className="prose prose-invert max-w-none">
                                    <h3 className="text-lg font-bold text-white mb-2">About</h3>
                                    <p className="text-gray-300 leading-relaxed text-lg">
                                        {member.bio}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="border-t border-white/10 pt-8">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                                Connect
                            </h3>
                            <div className="flex items-center gap-4 flex-wrap">
                                {member.email && (
                                    <Link
                                        href={`mailto:${member.email}`}
                                        className="p-3 rounded-full bg-white/5 hover:bg-neon-red text-gray-400 hover:text-white transition-all duration-300 border border-white/10 hover:border-transparent group"
                                        title="Email"
                                    >
                                        <Mail className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </Link>
                                )}
                                {member.socials.linkedin && (
                                    <Link
                                        href={member.socials.linkedin.startsWith("http") ? member.socials.linkedin : `https://${member.socials.linkedin}`}
                                        target="_blank"
                                        className="p-3 rounded-full bg-white/5 hover:bg-[#0077b5] text-gray-400 hover:text-white transition-all duration-300 border border-white/10 hover:border-transparent group"
                                        title="LinkedIn"
                                    >
                                        <Linkedin className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </Link>
                                )}
                                {member.socials.github && (
                                    <Link
                                        href={member.socials.github.startsWith("http") ? member.socials.github : `https://${member.socials.github}`}
                                        target="_blank"
                                        className="p-3 rounded-full bg-white/5 hover:bg-white text-gray-400 hover:text-black transition-all duration-300 border border-white/10 hover:border-transparent group"
                                        title="GitHub"
                                    >
                                        <Github className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </Link>
                                )}
                                {member.socials.instagram && (
                                    <Link
                                        href={member.socials.instagram.startsWith("http") ? member.socials.instagram : `https://${member.socials.instagram}`}
                                        target="_blank"
                                        className="p-3 rounded-full bg-white/5 hover:bg-[#E1306C] text-gray-400 hover:text-white transition-all duration-300 border border-white/10 hover:border-transparent group"
                                        title="Instagram"
                                    >
                                        <Instagram className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </Link>
                                )}
                                {member.socials.twitter && (
                                    <Link
                                        href={member.socials.twitter.startsWith("http") ? member.socials.twitter : `https://${member.socials.twitter}`}
                                        target="_blank"
                                        className="p-3 rounded-full bg-white/5 hover:bg-[#1DA1F2] text-gray-400 hover:text-white transition-all duration-300 border border-white/10 hover:border-transparent group"
                                        title="Twitter"
                                    >
                                        <Twitter className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
