"use client";

import { useState } from "react";
import ProjectFormModal from "@/components/ProjectFormModal";
import { Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-6">
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
                    onClose={() => setIsModalOpen(false)}
                />
            </div>
        </div>
    );
}
