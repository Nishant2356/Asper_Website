"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, X, Clock } from "lucide-react";
import Image from "next/image";

interface User {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
}

interface UpdateRequest {
    id: string;
    field: string;
    oldValue: string;
    newValue: string;
    status: string;
    createdAt: string;
    user: User;
}

interface PositionRequest {
    id: string;
    position: string;
    department: string;
    status: string;
    createdAt: string;
    user: User;
}

type ActiveTab = "profile" | "position";

export default function ProfileRequestsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [profileRequests, setProfileRequests] = useState<UpdateRequest[]>([]);
    const [positionRequests, setPositionRequests] = useState<PositionRequest[]>([]);
    const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }

        if (status === "authenticated" && session.user.role !== "ADMIN") {
            router.push("/");
        }
    }, [status, session, router]);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/profile/requests");

            if (res.ok) {
                const data = await res.json();

                setProfileRequests(data.profileupdate || []);
                setPositionRequests(data.positionreq || []);
            }
        } catch (error) {
            console.error("Failed to fetch requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            fetchRequests();
        }
    }, [status]);

    type RequestType = "PROFILE" | "POSITION";

    const handleAction = async (
        requestId: string,
        action: "APPROVED" | "REJECTED",
        requestType: RequestType
    ) => {
        setProcessingId(requestId);

        try {
            const res = await fetch(`/api/profile/requests/${requestId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action,
                    requestType,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Action failed");
            }

            if (requestType === "PROFILE") {
                setProfileRequests((prev) =>
                    prev.filter((request) => request.id !== requestId)
                );
            } else {
                setPositionRequests((prev) =>
                    prev.filter((request) => request.id !== requestId)
                );
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };



    const EmptyState = ({ message }: { message: string }) => (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <Check className="mx-auto text-green-500 mb-4" size={48} />
            <p className="text-xl font-bold text-white">All caught up!</p>
            <p className="text-gray-400 mt-2">{message}</p>
        </div>
    );


    return (
        <main className="bg-deep-black min-h-screen text-white">
            <Navbar />

            <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <span className="text-neon-red font-bold tracking-widest uppercase text-sm mb-2 block">
                        Admin Panel
                    </span>

                    <h1 className="text-4xl font-black flex items-center gap-3">
                        <Clock className="text-neon-red" />
                        Pending Requests
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Review member profile and position update requests.
                    </p>
                </motion.div>

                <div className="flex flex-wrap gap-3 mb-8">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`px-5 py-3 rounded-xl font-bold transition-all ${activeTab === "profile"
                                ? "bg-neon-red text-white shadow-lg shadow-red-500/20"
                                : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        Profile Update Requests ({profileRequests.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("position")}
                        className={`px-5 py-3 rounded-xl font-bold transition-all ${activeTab === "position"
                                ? "bg-neon-red text-white shadow-lg shadow-red-500/20"
                                : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        Position Requests ({positionRequests.length})
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-neon-red w-8 h-8" />
                    </div>
                ) : activeTab === "profile" ? (
                    profileRequests.length === 0 ? (
                        <EmptyState message="No pending profile update requests." />
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {profileRequests.map((req) => (
                                    <motion.div
                                        key={req.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6"
                                    >
                                        {/* User Info */}
                                        <div onClick={() => router.push(`/profile/${req.user.id}`)}  className="flex cursor-pointer items-center gap-4 flex-1">
                                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
                                                {req.user.profilePhoto ? (
                                                    <Image
                                                        src={req.user.profilePhoto}
                                                        alt={req.user.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-neon-red/10 flex items-center justify-center text-xl font-black text-neon-red">
                                                        {req.user.name[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">
                                                    {req.user.name}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {req.user.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Request Details */}
                                        <div className="flex-1 bg-black/30 rounded-xl p-4">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                                                Wants to update{" "}
                                                <span className="text-neon-red font-bold">
                                                    {req.field}
                                                </span>
                                            </p>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-gray-500 line-through">
                                                    {req.oldValue || "—"}
                                                </span>
                                                <span className="text-gray-500">
                                                    →
                                                </span>
                                                <span className="text-white font-bold">
                                                    {req.newValue}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-2">
                                                {new Date(
                                                    req.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 flex-shrink-0">
                                            <button
                                                onClick={() => handleAction(req.id, "APPROVED", "PROFILE")}
                                                disabled={
                                                    processingId === req.id
                                                }
                                                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/20 rounded-lg font-bold transition-all disabled:opacity-50 text-sm"
                                            >
                                                {processingId === req.id ? (
                                                    <Loader2
                                                        size={16}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <Check size={16} />
                                                )}
                                                Approve
                                            </button>
                                            <button
                                               onClick={() => handleAction(req.id, "REJECTED", "PROFILE")}
                                                disabled={
                                                    processingId === req.id
                                                }
                                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-lg font-bold transition-all disabled:opacity-50 text-sm"
                                            >
                                                <X size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )
                ) : positionRequests.length === 0 ? (
                    <EmptyState message="No pending position requests." />
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {positionRequests.map((req) => (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
                                            {req.user.profilePhoto ? (
                                                <Image
                                                    src={req.user.profilePhoto}
                                                    alt={req.user.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-neon-red/10 flex items-center justify-center text-xl font-black text-neon-red">
                                                    {req.user.name[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="font-bold text-white">
                                                {req.user.name}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {req.user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-black/30 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                                            Requested Position
                                        </p>

                                        <p className="text-neon-red font-bold text-lg">
                                            {req.position}
                                        </p>

                                        <p className="text-sm text-gray-400 mt-1">
                                            Department: {req.department}
                                        </p>

                                        <p className="text-xs text-gray-600 mt-2">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex gap-3 flex-shrink-0">
                                        <button
                                            onClick={() => handleAction(req.id, "APPROVED", "POSITION")}
                                            disabled={processingId === req.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/20 rounded-lg font-bold transition-all disabled:opacity-50 text-sm"
                                        >
                                            {processingId === req.id ? (
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Check size={16} />
                                            )}
                                            Approve
                                        </button>

                                        <button
                                            onClick={() => handleAction(req.id, "REJECTED", "POSITION")}
                                            disabled={processingId === req.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-lg font-bold transition-all disabled:opacity-50 text-sm"
                                        >
                                            <X size={16} />
                                            Reject
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}
