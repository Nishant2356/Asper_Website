"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Users, Lightbulb, Code2, MessageSquare, Rocket } from "lucide-react";

export default function AboutPage() {
    const offerings = [
        {
            icon: <Calendar className="w-8 h-8 text-neon-red" />,
            title: "Workshops & Training",
            description: "Hands-on sessions on Cloud, AI/ML, and Full Stack Development.",
        },
        {
            icon: <MessageSquare className="w-8 h-8 text-neon-red" />,
            title: "Tech Talks",
            description: "Insightful sessions from industry experts and alumni.",
        },
        {
            icon: <Users className="w-8 h-8 text-neon-red" />,
            title: "Peer Learning",
            description: "Collaborative environment where students grow together.",
        },
        {
            icon: <Code2 className="w-8 h-8 text-neon-red" />,
            title: "Project Building",
            description: "Build solutions for real-world problems in our labs.",
        },
        {
            icon: <Lightbulb className="w-8 h-8 text-neon-red" />,
            title: "Mentorship",
            description: "Guidance from seniors to navigate your tech career.",
        },
        {
            icon: <Rocket className="w-8 h-8 text-neon-red" />,
            title: "Hackathons",
            description: "Intense coding marathons to test your skills under pressure.",
        },
    ];

    return (
        <main className="bg-deep-black min-h-screen text-white overflow-hidden">
            <Navbar />

            {/* --- Gradients --- */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-red/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            {/* --- Hero Section --- */}
            <section className="pt-40 pb-20 px-6 relative">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-8xl font-black tracking-tighter mb-8 font-heading"
                    >
                        BUILDING THE <span className="text-neon-red text-transparent bg-clip-text bg-gradient-to-r from-neon-red to-red-600">FUTURE</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
                    >
                        ASPER is the elite technical community of the Students of UIT RGPV.
                        We don't just write code; we engineer the future.
                    </motion.p>
                </div>
            </section>

            {/* --- Stats Section --- */}
            <section className="py-10 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: "Community Members", value: "100+" },
                        { label: "Events Hosted", value: "20+" },
                        { label: "Success Stories", value: "50+" },
                        { label: "Years of Legacy", value: "5+" },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <h3 className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</h3>
                            <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- Mission & Vision (Split) --- */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Image Grid */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="space-y-4 translate-y-8">
                            <div className="relative h-64 rounded-2xl overflow-hidden border border-white/10 group">
                                <Image
                                    src="/assets/generated/innovation.png"
                                    alt="Innovation"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="relative h-64 rounded-2xl overflow-hidden border border-white/10 group">
                                <Image
                                    src="/assets/generated/hackathon.png"
                                    alt="Hackathon"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="relative h-64 rounded-2xl overflow-hidden border border-white/10 group">
                                <Image
                                    src="/assets/generated/workshop.png"
                                    alt="Workshop"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="relative h-64 rounded-2xl overflow-hidden border border-white/10 group">
                                <Image
                                    src="/assets/generated/community.png"
                                    alt="Community"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-neon-red font-bold tracking-widest uppercase text-sm mb-2 block">Our Mission</span>
                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                            EMPOWERING <br />
                            <span className="text-gray-600">INNOVATORS</span>
                        </h2>
                        <div className="space-y-6 text-lg text-gray-400 leading-relaxed">
                            <p>
                                The ASPER mission is to enable students by providing a platform for technical development and innovation. At ASPER, we believe in learning by doing. That is why we concentrate on providing practical exposure through immersion activities, workshops, and projects
                                <span className="text-white font-bold"> Our aim is to develop future leaders by inculcating discipline, team spirit, and problem-solving skills.</span>
                            </p>
                            <p>
                                Our final aim is to ensure that each and every member of our organization graduates not only with a degree but also as industry-ready professionals with confidence in their communication and technical skills.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- offerings / What we do --- */}
            <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
                        WHAT WE <span className="text-neon-red">DO</span>
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offerings.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-red/50 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-red/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-red/20 transition-all" />

                                <div className="mb-6 p-4 rounded-xl bg-black/50 w-fit border border-white/10 group-hover:border-neon-red/50 transition-colors">
                                    {item.icon}
                                </div>

                                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-neon-red transition-colors">{item.title}</h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA --- */}
            <section className="py-32 text-center px-6">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8">JOIN THE <br /><span className="text-neon-red">REVOLUTION</span></h2>
                <p className="text-gray-400 mb-10 max-w-xl mx-auto text-lg">
                    The future belongs to those who build it. Are you ready to make your mark?
                </p>
                <button onClick={() => window.open("/signup", "_self")} className="px-10 py-4 bg-white text-black font-black text-xl rounded hover:bg-neon-red hover:text-white transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,0,51,0.6)]">
                    BECOME A MEMBER
                </button>
            </section>

            <Footer />
        </main>
    );
}
