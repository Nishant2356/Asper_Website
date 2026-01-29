"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Github, Globe, MessageSquare, ImageIcon, ChevronDown, ChevronUp, FileText } from "lucide-react";

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

interface AdminProjectCardProps {
    project: Project;
    onCheck: (id: string) => void;
    isProcessing: boolean;
}

export default function AdminProjectCard({ project, onCheck, isProcessing }: AdminProjectCardProps) {
    const [showImages, setShowImages] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-neon-red/30 transition-all group flex flex-col"
        >
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-xs font-mono text-neon-red bg-neon-red/10 px-2 py-1 rounded mb-2 inline-block">
                            {project.department.replace(/_/g, " ")}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-1">{project.name}</h3>
                        <p className="text-xs text-gray-500">
                            {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    {project.githubLink ? (
                        <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
                            title="GitHub Repo"
                        >
                            <Github size={18} />
                            <span>Code</span>
                        </a>
                    ) : (
                        <span className="text-gray-600 flex items-center gap-1 text-sm cursor-not-allowed">
                            <Github size={18} />
                            <span>No Code</span>
                        </span>
                    )}

                    {project.liveLink ? (
                        <a
                            href={project.liveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
                            title="Live Demo"
                        >
                            <Globe size={18} />
                            <span>Live</span>
                        </a>
                    ) : (
                        <span className="text-gray-600 flex items-center gap-1 text-sm cursor-not-allowed">
                            <Globe size={18} />
                            <span>No Demo</span>
                        </span>
                    )}
                </div>

                {project.doubts && (
                    <div className="bg-black/30 p-3 rounded-lg mb-6 border border-white/5">
                        <div className="flex items-center gap-2 mb-1 text-gray-400 text-xs uppercase font-bold">
                            <MessageSquare size={12} />
                            <span>Question/Doubts</span>
                        </div>
                        <p className="text-sm text-gray-300 italic">"{project.doubts}"</p>
                    </div>
                )}

                {/* Collapsible Images Section */}
                {project.imageLinks && project.imageLinks.length > 0 && (
                    <div className="mb-6">
                        <button
                            onClick={() => setShowImages(!showImages)}
                            className="flex items-center justify-between w-full bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-colors group/btn"
                        >
                            <div className="flex items-center gap-2 text-gray-300 group-hover/btn:text-white">
                                <ImageIcon size={18} />
                                <span className="text-sm font-medium">{project.imageLinks.length} Attachments</span>
                            </div>
                            {showImages ? (
                                <ChevronUp size={16} className="text-gray-500" />
                            ) : (
                                <ChevronDown size={16} className="text-gray-500" />
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
                                                    className={`block relative ${isPdf ? "aspect-auto py-4" : "aspect-video"
                                                        } bg-white/5 rounded overflow-hidden border border-white/10 hover:border-neon-red/50 transition-colors flex flex-col items-center justify-center gap-2 group/card`}
                                                >
                                                    {isPdf ? (
                                                        <>
                                                            <FileText className="text-gray-400 group-hover/card:text-neon-red transition-colors" size={32} />
                                                            <span className="text-xs text-gray-400 font-mono">View PDF</span>
                                                        </>
                                                    ) : (
                                                        <img
                                                            src={link}
                                                            alt={`Attachment ${idx + 1}`}
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

                <div className="mt-auto pt-4 border-t border-white/5">
                    <button
                        onClick={() => onCheck(project.id)}
                        disabled={isProcessing}
                        className="w-full bg-white/10 hover:bg-green-600 hover:text-white text-gray-300 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check size={18} />
                                Mark as Checked
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
