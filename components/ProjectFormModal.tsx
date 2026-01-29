"use client";

import { useState } from "react";
import { X, Upload, Check, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CldUploadWidget } from "next-cloudinary";

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DEPARTMENTS = [
    { value: "DSA", label: "DSA" },
    { value: "WEB_DEVELOPMENT", label: "Web Development" },
    { value: "IOT", label: "IOT" },
    { value: "GAME_DEVELOPMENT_ANIMATION", label: "Game Development & Animation" },
    { value: "DEVOPS_CLOUD", label: "Devops & Cloud" },
    { value: "ML_DATA_SCIENCE", label: "Machine Learning & Data Science" },
    { value: "MEDIA_GRAPHICS_VIDEO", label: "Media (Graphics & Video)" },
    { value: "CORPORATE_RELATIONS", label: "Corporate Relations" },
];

export default function ProjectFormModal({
    isOpen,
    onClose,
}: ProjectFormModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        department: "",
        githubLink: "",
        liveLink: "",
        doubts: "",
    });
    const [imageLinks, setImageLinks] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    imageLinks,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to submit project");
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setFormData({
                    name: "",
                    department: "",
                    githubLink: "",
                    liveLink: "",
                    doubts: "",
                });
                setImageLinks([]);
            }, 2000);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl shadow-neon-red/10">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white">
                                        Submit Project
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {success ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-green-500">
                                        <Check size={48} className="mb-4" />
                                        <p className="text-xl font-bold">Project Submitted!</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Name *
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, name: e.target.value })
                                                }
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-red transition-colors"
                                                placeholder="Enter your name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Department *
                                            </label>
                                            <select
                                                required
                                                value={formData.department}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        department: e.target.value,
                                                    })
                                                }
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-red transition-colors"
                                            >
                                                <option value="" disabled className="bg-black text-white">
                                                    Select Department
                                                </option>
                                                {DEPARTMENTS.map((dept) => (
                                                    <option key={dept.value} value={dept.value} className="bg-black text-white">
                                                        {dept.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                    Github Link {(formData.department === "WEB_DEVELOPMENT" || formData.department === "DSA") && "*"}
                                                </label>
                                                <input
                                                    type="url"
                                                    required={formData.department === "WEB_DEVELOPMENT" || formData.department === "DSA"}
                                                    value={formData.githubLink}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            githubLink: e.target.value,
                                                        })
                                                    }
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-red transition-colors"
                                                    placeholder="https://github.com/..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                    Live Link
                                                </label>
                                                <input
                                                    type="url"
                                                    value={formData.liveLink}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            liveLink: e.target.value,
                                                        })
                                                    }
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-red transition-colors"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Project Assets
                                            </label>
                                            <CldUploadWidget
                                                uploadPreset="asper_uploads"
                                                options={{
                                                    resourceType: "auto",
                                                    clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "pdf"],
                                                }}
                                                onSuccess={(result: any) => {
                                                    if (result.info?.secure_url) {
                                                        setImageLinks((prev) => [
                                                            ...prev,
                                                            result.info.secure_url,
                                                        ]);
                                                    }
                                                }}
                                            >
                                                {({ open }) => (
                                                    <div
                                                        onClick={() => open()}
                                                        className="w-full border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-neon-red/50 transition-colors"
                                                    >
                                                        <Upload className="text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-400">
                                                            Click to upload images or PDFs
                                                        </p>
                                                    </div>
                                                )}
                                            </CldUploadWidget>
                                            {imageLinks.length > 0 && (
                                                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                                    {imageLinks.map((link, idx) => {
                                                        const isPdf = link.toLowerCase().endsWith(".pdf");
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="relative w-20 h-20 flex-shrink-0 bg-white/5 rounded-md overflow-hidden border border-white/10"
                                                            >
                                                                {isPdf ? (
                                                                    <div className="w-full h-full flex items-center justify-center flex-col gap-1 p-1">
                                                                        <FileText className="text-neon-red" size={24} />
                                                                        <span className="text-[10px] text-gray-400 font-mono">PDF</span>
                                                                    </div>
                                                                ) : (
                                                                    <img
                                                                        src={link}
                                                                        alt="preview"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Doubts / Questions
                                            </label>
                                            <textarea
                                                value={formData.doubts}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, doubts: e.target.value })
                                                }
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-red transition-colors h-24 resize-none"
                                                placeholder="Any questions?"
                                            />
                                        </div>

                                        {error && (
                                            <p className="text-red-500 text-sm text-center">
                                                {error}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-neon-red text-white font-bold py-4 rounded-lg hover:bg-red-600 transition-all hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? "Submitting..." : "SUBMIT PROJECT"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
