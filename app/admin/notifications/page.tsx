"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2,
    Bell,
    UserPlus,
    Check,
    Trash2,
    Eye,
    CheckCheck,
} from "lucide-react";
import Link from "next/link";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: string;
    status: string;
    createdAt: string;
    readAt?: string;
}

export default function AdminNotificationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (
            status === "authenticated" &&
            session.user.role !== "ADMIN"
        )
            router.push("/");
    }, [status, session, router]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") fetchNotifications();
    }, [status]);

    const handleMarkRead = async (id: string) => {
        setProcessingId(id);
        try {
            await fetch(`/api/notifications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "READ" }),
            });
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, status: "READ" } : n
                )
            );
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleMarkActioned = async (id: string) => {
        setProcessingId(id);
        try {
            await fetch(`/api/notifications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ACTIONED" }),
            });
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, status: "ACTIONED" } : n
                )
            );
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        setProcessingId(id);
        try {
            await fetch(`/api/notifications/${id}`, { method: "DELETE" });
            setNotifications((prev) =>
                prev.filter((n) => n.id !== id)
            );
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "NEW_USER":
                return <UserPlus className="text-green-400" size={20} />;
            default:
                return <Bell className="text-neon-red" size={20} />;
        }
    };

    const getStatusStyle = (notifStatus: string) => {
        switch (notifStatus) {
            case "UNREAD":
                return "border-neon-red/30 bg-neon-red/5";
            case "READ":
                return "border-white/10 bg-white/5 opacity-75";
            case "ACTIONED":
                return "border-green-500/20 bg-green-500/5 opacity-60";
            default:
                return "border-white/10 bg-white/5";
        }
    };

    return (
        <main className="bg-deep-black min-h-screen text-white">
            <Navbar />

            <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <span className="text-neon-red font-bold tracking-widest uppercase text-sm mb-2 block">
                        Admin Panel
                    </span>
                    <h1 className="text-4xl font-black flex items-center gap-3">
                        <Bell className="text-neon-red" />
                        Notifications
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Stay updated with member registrations and
                        activities.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-neon-red w-8 h-8" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
                        <Bell
                            className="mx-auto text-gray-600 mb-4"
                            size={48}
                        />
                        <p className="text-xl font-bold text-white">
                            No notifications
                        </p>
                        <p className="text-gray-400 mt-2">
                            You&apos;re all caught up!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {notifications.map((notif) => {
                                const parsed = notif.data
                                    ? JSON.parse(notif.data)
                                    : null;

                                return (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        className={`border rounded-2xl p-6 transition-all ${getStatusStyle(notif.status)}`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            {/* Icon + Content */}
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex-shrink-0">
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-white">
                                                            {notif.title}
                                                        </h3>
                                                        {notif.status ===
                                                            "UNREAD" && (
                                                            <span className="w-2 h-2 bg-neon-red rounded-full animate-pulse" />
                                                        )}
                                                    </div>
                                                    <p className="text-gray-400 text-sm">
                                                        {notif.message}
                                                    </p>

                                                    {/* Domain tags for NEW_USER */}
                                                    {parsed?.domain &&
                                                        parsed.domain.length >
                                                            0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {parsed.domain.map(
                                                                    (
                                                                        d: string
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                d
                                                                            }
                                                                            className="text-xs px-2 py-0.5 bg-neon-red/10 text-neon-red rounded border border-neon-red/20"
                                                                        >
                                                                            {d.replace(
                                                                                /_/g,
                                                                                " "
                                                                            )}
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}

                                                    <p className="text-xs text-gray-600 mt-2">
                                                        {new Date(
                                                            notif.createdAt
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {/* View Profile */}
                                                {parsed?.userId && (
                                                    <Link
                                                        href={`/profile/${parsed.userId}`}
                                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                        title="View Profile"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                )}

                                                {notif.status ===
                                                    "UNREAD" && (
                                                    <button
                                                        onClick={() =>
                                                            handleMarkRead(
                                                                notif.id
                                                            )
                                                        }
                                                        disabled={
                                                            processingId ===
                                                            notif.id
                                                        }
                                                        className="p-2 bg-white/5 hover:bg-blue-500/20 rounded-lg transition-colors text-gray-400 hover:text-blue-400 disabled:opacity-50"
                                                        title="Mark as Read"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}

                                                {notif.status !== "ACTIONED" && (
                                                    <button
                                                        onClick={() =>
                                                            handleMarkActioned(
                                                                notif.id
                                                            )
                                                        }
                                                        disabled={
                                                            processingId ===
                                                            notif.id
                                                        }
                                                        className="p-2 bg-white/5 hover:bg-green-500/20 rounded-lg transition-colors text-gray-400 hover:text-green-400 disabled:opacity-50"
                                                        title="Mark as Done"
                                                    >
                                                        <CheckCheck
                                                            size={16}
                                                        />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            notif.id
                                                        )
                                                    }
                                                    disabled={
                                                        processingId ===
                                                        notif.id
                                                    }
                                                    className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400 disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {processingId ===
                                                    notif.id ? (
                                                        <Loader2
                                                            size={16}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}