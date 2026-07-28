"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence, m } from "framer-motion";
import {
    Loader2,
    Search,
    Filter,
    Plus,
    Trash2,
    Edit,
    Eye,
    Users,

    TriangleAlert,
    TriangleAlertIcon,
    CircleUserRound,

} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DEPARTMENTS } from "@/app/data/departments";

interface Member {
    id: string;
    name: string;
    email: string;
    role: string;
    domain: string[];
    status: "PENDING" | "APPROVED";
    position?: string;
    profilePhoto?: string;
    createdAt: string;
    _count: {
        projects: number;
        quizAttempts: number;
    };
}

export default function AdminMembersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedDomain, setSelectedDomain] = useState("ALL");
    const [selectedRole, setSelectedRole] = useState("ALL");
    const [selectedstatus, setSelectedstatus] = useState("ALL");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (
            status === "authenticated" &&
            session.user.role !== "ADMIN"
        ) {

            router.push("/");
        }
    }, [status, session, router]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (selectedDomain !== "ALL")
                params.set("domain", selectedDomain);
            if (selectedRole !== "ALL") params.set("role", selectedRole);
            if (selectedstatus !== "ALL") params.set("status", selectedstatus);
            const res = await fetch(
                `/api/profile/admin?${params.toString()}`
            );
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") fetchMembers();
    }, [status, search, selectedDomain, selectedRole, selectedstatus]);

    const handleDelete = async (id: string, name: string) => {
        if (
            !confirm(
                `Are you sure you want to delete ${name}'s profile? This cannot be undone.`
            )
        )
            return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/profile/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setMembers((prev) => prev.filter((m) => m.id !== id));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };
    const handleTeamStatus = async (id: string, name: string, status: string) => {
        if (
            !confirm(
                `Are you sure you want to ${status === "PENDING" ? "approve" : "reject"} ${name}'s profile?\n\n ${status === "PENDING" ? "Please verify that the profile is complete, accurate, and professional before  It can still be edited later if needed.After approval that user is part of ASPER Team " : "this action will change the member's status to PENDING. the user no longer have part of asper team "}`
            )
        ) 
            return;
        


        try {
            const res = await fetch(`/api/profile/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: status === "PENDING" ? "APPROVED" : "PENDING" }),
            });
            if (res.ok) {
                setMembers((prev) => prev.map((m) => m.id === id ? { ...m, status: status === "PENDING" ? "APPROVED" : "PENDING" } : m));
            }
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <main className="bg-deep-black min-h-screen text-white">
            <Navbar />

            <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-white/10 pb-8">
                    <div>
                        <span className="text-neon-red font-bold tracking-widest uppercase text-sm mb-2 block">
                            Admin Panel
                        </span>
                        <h1 className="text-4xl font-black flex items-center gap-3">
                            <Users className="text-neon-red" />
                            Members
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {members.length} total members
                        </p>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <Link
                            href="/profile/requests"
                            className="flex items-center gap-2 px-4 py-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-500 font-bold rounded-lg transition-colors text-sm"
                        >
                            Pending Requests
                        </Link>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-3 bg-neon-red text-white font-bold rounded-lg hover:bg-red-600 transition-all hover:shadow-[0_0_15px_rgba(255,0,51,0.4)] text-sm"
                        >
                            <Plus size={18} />
                            Add Member
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                            size={18}
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3">
                        <Filter size={16} className="text-gray-500" />
                        <select
                            value={selectedDomain}
                            onChange={(e) =>
                                setSelectedDomain(e.target.value)
                            }
                            className="bg-transparent text-white border-none focus:ring-0 py-3 pr-4 cursor-pointer text-sm"
                        >
                            <option value="ALL" className="bg-black">
                                All Domains
                            </option>
                            {DEPARTMENTS.filter(
                                (d) => d.value !== "ALL"
                            ).map((d) => (
                                <option
                                    key={d.value}
                                    value={d.value}
                                    className="bg-black"
                                >
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="bg-transparent text-white border-none focus:ring-0 py-3 pr-4 cursor-pointer text-sm"
                        >
                            <option value="ALL" className="bg-black">
                                All Roles
                            </option>
                            <option value="MEMBER" className="bg-black">
                                Member
                            </option>
                            <option value="ADMIN" className="bg-black">
                                Admin
                            </option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3">
                        <select
                            value={selectedstatus}
                            onChange={(e) => setSelectedstatus(e.target.value)}
                            className="bg-transparent text-white border-none focus:ring-0 py-3 pr-4 cursor-pointer text-sm"
                        >
                            <option value="ALL" className="bg-black">
                                Select Status
                            </option>
                            <option value="PENDING" className="bg-black">
                                Pending
                            </option>
                            <option value="APPROVED" className="bg-black">
                                Approved
                            </option>
                        </select>
                    </div>
                    
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-neon-red w-8 h-8" />
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-gray-400 text-lg">
                            No members found.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="text-left p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Member
                                        </th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                                            Domain
                                        </th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                                            Role
                                        </th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                                            Activity
                                        </th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                                            Joined
                                        </th>
                                        <th className="text-right p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {members.map((member, i) => (
                                            <motion.tr
                                                key={member.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{
                                                    delay: i * 0.03,
                                                }}
                                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                                                            {member.profilePhoto ? (
                                                                <Image
                                                                    src={
                                                                        member.profilePhoto
                                                                    }
                                                                    alt={
                                                                        member.name
                                                                    }
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-neon-red/10 flex items-center justify-center text-sm font-black text-neon-red">
                                                                    {member.name[0].toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white text-sm">
                                                                {member.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {member.email}
                                                            </p>
                                                            {member.position && (
                                                                <p className="text-xs text-neon-red">
                                                                    {
                                                                        member.position
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="p-4 hidden md:table-cell">
                                                    <div className="flex flex-wrap gap-1">
                                                        {member.domain
                                                            .slice(0, 2)
                                                            .map((d) => (
                                                                <span
                                                                    key={d}
                                                                    className="text-xs px-2 py-0.5 bg-neon-red/10 text-neon-red rounded border border-neon-red/20"
                                                                >
                                                                    {d.replace(
                                                                        /_/g,
                                                                        " "
                                                                    )}
                                                                </span>
                                                            ))}
                                                        {member.domain
                                                            .length > 2 && (
                                                                <span className="text-xs px-2 py-0.5 bg-white/5 text-gray-400 rounded">
                                                                    +
                                                                    {member.domain
                                                                        .length -
                                                                        2}
                                                                </span>
                                                            )}
                                                    </div>
                                                </td>

                                                <td className="p-4 hidden lg:table-cell">
                                                    <span
                                                        className={`text-xs font-bold px-2 py-1 rounded uppercase ${member.role ===
                                                                "ADMIN"
                                                                ? "bg-yellow-500/20 text-yellow-500"
                                                                : "bg-white/10 text-gray-400"
                                                            }`}
                                                    >
                                                        {member.role}
                                                    </span>
                                                </td>

                                                <td className="p-4 hidden lg:table-cell">
                                                    <div className="text-xs text-gray-400 space-y-1">
                                                        <p>
                                                            {
                                                                member._count
                                                                    .projects
                                                            }{" "}
                                                            projects
                                                        </p>
                                                        <p>
                                                            {
                                                                member._count
                                                                    .quizAttempts
                                                            }{" "}
                                                            quiz attempts
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="p-4 hidden sm:table-cell text-xs text-gray-500">
                                                    {new Date(
                                                        member.createdAt
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </td>

                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/profile/${member.id}`}
                                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                            title="View"
                                                        >
                                                            <Eye size={16} />
                                                        </Link>
                                                        <Link
                                                            href={`/profile/${member.id}/edit`}
                                                            className="p-2 bg-white/5 hover:bg-blue-500/20 rounded-lg transition-colors text-gray-400 hover:text-blue-400"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </Link>
                                                        {/* Team Status Button */}
                                                        <button
                                                            onClick={() =>
                                                                handleTeamStatus(
                                                                    member.id,
                                                                    member.name,
                                                                    member.status
                                                                )
                                                            }

                                                            className={`p-2 ${member.status === "APPROVED" ? " bg-white/5 hover:bg-green-500/20 rounded-lg transition-colors text-gray-400 hover:text-green-400" : " bg-white/5 hover:bg-yellow-500/20 rounded-lg transition-colors text-gray-400 hover:text-yellow-400"}
                                                                `}
                                                            title="team status"
                                                        >

                                                            {member.status === "APPROVED" ? (
                                                                <>
                                                                    <span className="text-green-400 hidden md:block text-xs font-bold">APPROVED</span>
                                                                    <CircleUserRound size={16} className="md:hidden text-green-400" />
                                                                </>
                                                            ) : (
                                                                <>

                                                                    <span className="text-yellow-400 hidden md:block text-xs font-bold">PENDING</span>
                                                                    <TriangleAlertIcon size={16} className="md:hidden text-yellow-400" />
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    member.id,
                                                                    member.name
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                member.id
                                                            }
                                                            className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400 disabled:opacity-50"
                                                            title="Delete"
                                                        >
                                                            {deletingId ===
                                                                member.id ? (
                                                                <Loader2
                                                                    size={16}
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Trash2
                                                                    size={16}
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            <Footer />

            {showCreateModal && (
                <CreateMemberModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchMembers();
                    }}
                />
            )}
        </main>
    );
}

// ─── Create Member Modal ──────────────────────────────
function CreateMemberModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "MEMBER",
        domain: [] as string[],
        position: "",
        bio: "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const res = await fetch("/api/profile/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
            >
                <h2 className="text-2xl font-black mb-6">
                    Add New Member
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">
                                Full Name *
                            </label>
                            <input
                                required
                                value={form.name}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        name: e.target.value,
                                    }))
                                }
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-red/50"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">
                                Role
                            </label>
                            <select
                                value={form.role}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        role: e.target.value,
                                    }))
                                }
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-red/50"
                            >
                                <option value="MEMBER" className="bg-black">
                                    Member
                                </option>
                                <option value="ADMIN" className="bg-black">
                                    Admin
                                </option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Email *
                        </label>
                        <input
                            required
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    email: e.target.value,
                                }))
                            }
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-red/50"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Password *
                        </label>
                        <input
                            required
                            type="password"
                            value={form.password}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    password: e.target.value,
                                }))
                            }
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-red/50"
                            placeholder="Min 6 characters"
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Position
                        </label>
                        <input
                            value={form.position}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    position: e.target.value,
                                }))
                            }
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-red/50"
                            placeholder="e.g. Web Development Head"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Domains
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                            {DEPARTMENTS.filter(
                                (d) => d.value !== "ALL"
                            ).map((dept) => (
                                <label
                                    key={dept.value}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${form.domain.includes(dept.value)
                                            ? "border-neon-red bg-neon-red/10 text-white"
                                            : "border-white/10 bg-white/5 text-gray-400"
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={form.domain.includes(
                                            dept.value
                                        )}
                                        onChange={() => {
                                            setForm((p) => ({
                                                ...p,
                                                domain: p.domain.includes(
                                                    dept.value
                                                )
                                                    ? p.domain.filter(
                                                        (d) =>
                                                            d !== dept.value
                                                    )
                                                    : [
                                                        ...p.domain,
                                                        dept.value,
                                                    ],
                                            }));
                                        }}
                                    />
                                    {dept.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Bio
                        </label>
                        <textarea
                            value={form.bio}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    bio: e.target.value,
                                }))
                            }
                            rows={3}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-red/50 resize-none"
                            placeholder="Short bio..."
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-bold transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 bg-neon-red text-white font-bold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            {saving ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                <Plus size={16} />
                            )}
                            {saving ? "Creating..." : "Create Member"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}