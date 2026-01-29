"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, LogOut } from "lucide-react";
import AdminProjectCard from "@/components/AdminProjectCard";
import { logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

interface Project {
    id: string;
    name: string;
    department: string;
    githubLink?: string;
    liveLink?: string;
    imageLinks: string[];
    doubts?: string;
    checked: boolean;
    createdAt: string;
}

const DEPARTMENTS = [
    { value: "ALL", label: "All Departments" },
    { value: "DSA", label: "DSA" },
    { value: "WEB_DEVELOPMENT", label: "Web Development" },
    { value: "IOT", label: "IOT" },
    { value: "GAME_DEVELOPMENT_ANIMATION", label: "Game Development & Animation" },
    { value: "DEVOPS_CLOUD", label: "Devops & Cloud" },
    { value: "ML_DATA_SCIENCE", label: "Machine Learning & Data Science" },
    { value: "MEDIA_GRAPHICS_VIDEO", label: "Media (Graphics & Video)" },
    { value: "CORPORATE_RELATIONS", label: "Corporate Relations" },
];

export default function AdminDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState("ALL");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const router = useRouter();

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects?checked=false");
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

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCheck = async (id: string) => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ checked: true }),
            });

            if (res.ok) {
                // Remove the project from the list immediately
                setProjects((prev) => prev.filter((p) => p.id !== id));
            }
        } catch (error) {
            console.error("Failed to update project", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.refresh();
    };

    const filteredProjects = selectedDept === "ALL"
        ? projects
        : projects.filter(p => p.department === selectedDept);

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/10 pb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                        <p className="text-gray-400">Review and approve submitted projects</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-lg border border-white/10">
                            <Filter className="text-gray-400 ml-2" size={20} />
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="bg-transparent text-white border-none focus:ring-0 cursor-pointer py-1 pr-8"
                            >
                                {DEPARTMENTS.map((dept) => (
                                    <option key={dept.value} value={dept.value} className="bg-black">
                                        {dept.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-3 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20"
                        >
                            <LogOut size={20} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-neon-red border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-xl">No pending projects found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredProjects.map((project) => (
                                <AdminProjectCard
                                    key={project.id}
                                    project={project}
                                    onCheck={handleCheck}
                                    isProcessing={processingId === project.id}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
