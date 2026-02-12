"use client";

import { useState, useEffect } from "react";
import ProjectFormModal from "@/components/ProjectFormModal";
import UserProjectCard from "@/components/UserProjectCard";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Project {
    id: string;
    name: string;
    department: string;
    githubLink?: string;
    liveLink?: string;
    imageLinks: string[];
    doubts?: string;
    checked: boolean;
    accepted: boolean;
    createdAt: string;
}

export default function ProjectsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && session?.user?.id) {
            fetchProjects(session.user.id);
        }
    }, [status, session, router]);

    const fetchProjects = async (userId: string) => {
        try {
            const res = await fetch(`/api/projects?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-deep-black flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-neon-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-deep-black">
            <Navbar />
            <div className="pt-24 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 border-b border-white/10 pb-12">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-4"
                            >
                                Project Submission
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-gray-400 text-lg max-w-2xl"
                            >
                                Submit your assigned projects here. Ensure all details are correct and assets are uploaded before final submission.
                            </motion.p>
                        </div>

                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            onClick={() => setIsModalOpen(true)}
                            className="group flex items-center gap-2 bg-neon-red text-white px-8 py-4 rounded-lg font-bold hover:bg-red-600 transition-all hover:shadow-[0_0_20px_rgba(255,0,51,0.4)]"
                        >
                            <Plus className="group-hover:rotate-90 transition-transform duration-300" />
                            SUBMIT PROJECT
                        </motion.button>
                    </div>

                    {/* Your Submissions Section */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold text-white mb-6">Your Submissions</h2>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-4 border-neon-red border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                                <p className="text-gray-400 mb-4">You haven't submitted your project yet.</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-neon-red hover:underline"
                                >
                                    Submit your project
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {projects.map((project) => (
                                        <UserProjectCard key={project.id} project={project} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Instructions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {[
                            {
                                step: "01",
                                title: "Prepare Your Assets",
                                desc: "Gather your project links (GitHub, Live URL) and image assets. Make sure images are high quality."
                            },
                            {
                                step: "02",
                                title: "Fill Details",
                                desc: "Select your department and provide all necessary information in the submission form."
                            },
                            {
                                step: "03",
                                title: "Submit & Review",
                                desc: "Once submitted, your project will be reviewed by the admin."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-neon-red/30 transition-colors"
                            >
                                <span className="text-neon-red font-mono text-xl mb-4 block">{item.step}</span>
                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Modal */}
                    <ProjectFormModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            if (session?.user?.id) fetchProjects(session.user.id); // Refresh list on close
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
