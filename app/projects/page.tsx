"use client";

import { useState, useEffect } from "react";
import ProjectFormModal from "@/components/ProjectFormModal";
import UserProjectCard from "@/components/UserProjectCard";
import PublicProjectCard, { PublicProject } from "@/components/PublicProjectCard";
import { Plus, Layers, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { DEPARTMENTS } from "../data/departments";

interface MemberProject {
    id: string;
    name: string;
    department: string;
    githubLink?: string;
    liveLink?: string;
    imageLinks: string[];
    doubts?: string;
    marks: string;
    feedback?: string;
    checked: boolean;
    accepted: boolean;
    createdAt: string;
}

export default function ProjectsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: session, status } = useSession();

    // Member's own submissions
    const [myProjects, setMyProjects] = useState<MemberProject[]>([]);
    const [myLoading, setMyLoading] = useState(false);

    // Public showcase
    const [publicProjects, setPublicProjects] = useState<PublicProject[]>([]);
    const [publicLoading, setPublicLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState("ALL");

    // Fetch member's own projects when authenticated
    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            fetchMyProjects(session.user.id);
        }
    }, [status, session]);

    // Fetch public projects whenever department filter changes
    useEffect(() => {
        fetchPublicProjects(selectedDept);
    }, [selectedDept]);

    const fetchMyProjects = async (userId: string) => {
        setMyLoading(true);
        try {
            const res = await fetch(`/api/projects?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setMyProjects(data);
            }
        } catch (error) {
            console.error("Failed to fetch own projects", error);
        } finally {
            setMyLoading(false);
        }
    };

    const fetchPublicProjects = async (dept: string) => {
        setPublicLoading(true);
        try {
            const query = (dept && dept !== "ALL") ? `?department=${dept}` : "";
            const res = await fetch(`/api/projects/public${query}`);
            if (res.ok) {
                const data: PublicProject[] = await res.json();
                // Sort by DEPARTMENTS array order, then newest date as tiebreaker
                const deptOrder = DEPARTMENTS.map((d) => d.value);
                data.sort((a, b) => {
                    const indexA = deptOrder.indexOf(a.department);
                    const indexB = deptOrder.indexOf(b.department);
                    const orderA = indexA === -1 ? 999 : indexA;
                    const orderB = indexB === -1 ? 999 : indexB;
                    if (orderA !== orderB) return orderA - orderB;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                setPublicProjects(data);
            }
        } catch (error) {
            console.error("Failed to fetch public projects", error);
        } finally {
            setPublicLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-deep-black flex flex-col">
            <Navbar />

            <div className="pt-24 pb-16 px-6 flex-1">
                <div className="max-w-7xl mx-auto">

                    {/* ─── PAGE HEADER ─────────────────────────────────────────── */}
                    <div className="border-b border-white/10 pb-12 mb-16">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-neon-red font-bold tracking-widest uppercase text-sm mb-2 block"
                        >
                            Built by Asper
                        </motion.span>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-3"
                                >
                                    Member Projects
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-gray-400 text-lg max-w-2xl"
                                >
                                    Explore what the Asper community has built — from web apps to AI models, IoT experiments and beyond.
                                </motion.p>
                            </div>

                            {/* Submit button — only visible when logged in */}
                            {status === "authenticated" && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.15 }}
                                    onClick={() => setIsModalOpen(true)}
                                    className="group flex-shrink-0 flex items-center gap-2 bg-neon-red text-white px-8 py-4 rounded-lg font-bold hover:bg-red-600 transition-all hover:shadow-[0_0_20px_rgba(255,0,51,0.4)]"
                                >
                                    <Plus className="group-hover:rotate-90 transition-transform duration-300" />
                                    SUBMIT PROJECT
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* ─── MY SUBMISSIONS (logged‑in members only) ─────────────── */}
                    {status === "authenticated" && (
                        <div className="mb-16">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <Layers size={22} className="text-neon-red" />
                                Your Submissions
                            </h2>

                            {myLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-8 h-8 border-4 border-neon-red border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : myProjects.length === 0 ? (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                                    <p className="text-gray-400 mb-4">You haven't submitted any projects yet.</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="text-neon-red hover:underline font-medium"
                                    >
                                        Submit your first project →
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <AnimatePresence>
                                        {myProjects.map((project) => (
                                            <UserProjectCard key={project.id} project={project} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── PUBLIC SHOWCASE ─────────────────────────────────────── */}
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <h2 className="text-2xl font-bold text-white">
                                {status === "authenticated" ? "All Projects" : "Browse All Projects"}
                            </h2>

                            {/* Department dropdown — matches admin style */}
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                                <Filter className="text-gray-400 flex-shrink-0" size={16} />
                                <select
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    className="bg-transparent text-white border-none focus:ring-0 cursor-pointer text-sm pr-4"
                                >
                                    {DEPARTMENTS.map((dept) => (
                                        <option key={dept.value} value={dept.value} className="bg-black">
                                            {dept.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {publicLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-8 h-8 border-4 border-neon-red border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : publicProjects.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                                <p className="text-gray-500 text-lg mb-2">No projects found.</p>
                                <p className="text-gray-600 text-sm">
                                    {selectedDept && selectedDept !== "ALL"
                                        ? "Try a different domain filter."
                                        : "Be the first to submit a project!"}
                                </p>
                                {status !== "authenticated" && (
                                    <Link
                                        href="/login"
                                        className="mt-4 inline-block text-neon-red hover:underline font-medium text-sm"
                                    >
                                        Log in to submit →
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {publicProjects.map((project, i) => (
                                        <PublicProjectCard key={project.id} project={project} index={i} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* ─── SUBMISSION MODAL ────────────────────────────────────── */}
                    {status === "authenticated" && (
                        <ProjectFormModal
                            isOpen={isModalOpen}
                            onClose={() => {
                                setIsModalOpen(false);
                                if (session?.user?.id) fetchMyProjects(session.user.id);
                            }}
                        />
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
