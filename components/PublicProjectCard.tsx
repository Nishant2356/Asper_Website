"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Globe, ImageIcon, ChevronDown, ChevronUp, FileText, User } from "lucide-react";
import { DEPARTMENTS } from "@/app/data/departments";

const getDeptLabel = (value: string) =>
    (DEPARTMENTS.find((d) => d.value === value)?.label ?? value.replace(/_/g, " ")).toUpperCase();

export interface PublicProject {
    id: string;
    name: string;
    department: string;
    githubLink?: string | null;
    liveLink?: string | null;
    imageLinks: string[];
    marks: string;
    createdAt: string;
    user: {
        name: string;
    };
}

interface PublicProjectCardProps {
    project: PublicProject;
    index?: number;
}

export default function PublicProjectCard({ project, index = 0 }: PublicProjectCardProps) {
    const [showImages, setShowImages] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            className="rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-neon-red/40 hover:bg-white/8 transition-all group flex flex-col"
        >
            <div className="p-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                        <span className="text-xs font-mono text-neon-red bg-neon-red/10 px-2 py-1 rounded mb-2 inline-block truncate max-w-full">
                            {getDeptLabel(project.department)}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-1 leading-snug group-hover:text-neon-red transition-colors">
                            {project.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <User size={11} />
                            <span>{project.user.name}</span>
                            <span className="text-gray-700">·</span>
                            <span>{new Date(project.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                    </div>

                    {/* Marks badge — only shown if marks is non-empty */}
                    {/* {project.marks && project.marks.trim() !== "" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="ml-3 flex-shrink-0 bg-gradient-to-br from-neon-red/20 to-black border border-neon-red/50 text-white text-xs font-mono px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(255,0,51,0.25)] flex items-center gap-1.5"
                        >
                            <span className="text-gray-400 text-[10px] uppercase tracking-wider">Score</span>
                            <span className="font-bold text-neon-red">{project.marks}</span>
                        </motion.div>
                    )} */}
                </div>

                {/* Links */}
                <div className="flex gap-4 mb-4">
                    {project.githubLink ? (
                        <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
                        >
                            <Github size={16} />
                            <span>Code</span>
                        </a>
                    ) : (
                        <span className="text-gray-700 flex items-center gap-1.5 text-sm cursor-not-allowed select-none">
                            <Github size={16} />
                            <span>No Code</span>
                        </span>
                    )}

                    {project.liveLink ? (
                        <a
                            href={project.liveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
                        >
                            <Globe size={16} />
                            <span>Live Demo</span>
                        </a>
                    ) : (
                        <span className="text-gray-700 flex items-center gap-1.5 text-sm cursor-not-allowed select-none">
                            <Globe size={16} />
                            <span>No Demo</span>
                        </span>
                    )}
                </div>

                {/* Collapsible Images */}
                {project.imageLinks && project.imageLinks.length > 0 && (
                    <div className="mt-auto">
                        <button
                            onClick={() => setShowImages(!showImages)}
                            className="flex items-center justify-between w-full bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-colors group/btn"
                        >
                            <div className="flex items-center gap-2 text-gray-400 group-hover/btn:text-gray-200 text-sm">
                                <ImageIcon size={15} />
                                <span>{project.imageLinks.length} Attachment{project.imageLinks.length > 1 ? "s" : ""}</span>
                            </div>
                            {showImages ? (
                                <ChevronUp size={14} className="text-gray-500" />
                            ) : (
                                <ChevronDown size={14} className="text-gray-500" />
                            )}
                        </button>

                        <AnimatePresence>
                            {showImages && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-3 grid grid-cols-2 gap-2">
                                        {project.imageLinks.map((link, idx) => {
                                            const isPdf = link.toLowerCase().endsWith(".pdf");
                                            return (
                                                <a
                                                    key={idx}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`block relative ${isPdf ? "aspect-auto py-4" : "aspect-video"} bg-white/5 rounded overflow-hidden border border-white/10 hover:border-neon-red/50 transition-colors flex flex-col items-center justify-center gap-2 group/card`}
                                                >
                                                    {isPdf ? (
                                                        <>
                                                            <FileText className="text-gray-400 group-hover/card:text-neon-red transition-colors" size={28} />
                                                            <span className="text-xs text-gray-400 font-mono">View PDF</span>
                                                        </>
                                                    ) : (
                                                        <img
                                                            src={link}
                                                            alt={`${project.name} — image ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </a>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
