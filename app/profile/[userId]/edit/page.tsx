"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Loader2, Save, ArrowLeft, Info, Trash2 } from "lucide-react";
import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";


interface ProfileForm {
    name: string;
    bio: string;
    profilePhoto: string;
    github: string;
    linkedin: string;
    instagram: string;
    twitter: string;
    birthDate: string;
    college: "UIT" | "SOIT" | "OTHER";
    branch: string;
    year: string;
    otherCollegeName: string;
}
interface PositionRow {
    id: string;
    position: string;
    department: string;
    approved: boolean;
    pending: boolean;
    // isNew: boolean;
    // originalPosition: string;
    // originalDepartment: string;
}



export default function EditProfilePage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();

    const isAdmin = session?.user?.role === "ADMIN";
    const isOwner = session?.user?.id === userId;
    const [deptAndPositions, setDeptAndPositions] = useState<PositionRow[]>([]);
    const [newPosition, setNewPosition] = useState<{
        position: string;
        department: string;
    }>({
        position: "",
        department: "",
    });
    const [form, setForm] = useState<ProfileForm>({
        name: "",
        bio: "",
        profilePhoto: "",
        github: "",
        linkedin: "",
        instagram: "",
        twitter: "",
        birthDate: "",
        college: "UIT",
        branch: "",
        year: "",
        otherCollegeName: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [removingDomainId, setRemovingDomainId] = useState<string | null>(null);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (
            status === "authenticated" &&
            !isOwner &&
            !isAdmin
        ) {
            router.push(`/profile/${userId}`);
        }
    }, [status, isOwner, isAdmin, userId, router]);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`/api/profile/${userId}`);
                if (!res.ok) return;
                const data = await res.json();
                console.log("Fetched profile data:", data);
                setForm({
                    name: data.name || "",
                    bio: data.bio || "",
                    profilePhoto: data.profilePhoto || "",
                    github: data.github || "",
                    linkedin: data.linkedin || "",
                    instagram: data.instagram || "",
                    twitter: data.twitter || "",

                    birthDate: data.birthDate
                        ? new Date(data.birthDate)
                            .toISOString()
                            .split("T")[0]
                        : "",
                    college: data.college || "UIT",
                    branch: data.branch || "",
                    year: data.year || "",
                    otherCollegeName: data.otherCollegeName || "",
                });
                setDeptAndPositions([
                    ...(data.domain === 0
                        ? [{
                            id: crypto.randomUUID(),
                            position: data.position,
                            department: "",
                            approved: true,
                            pending: false,
                            // isNew: false,
                            // originalPosition: data.position,
                            // originalDepartment: "",
                        }]
                        : []),

                    ...data.domains.map((item: any) => ({
                        id: item.id,

                        position: item.position,
                        department: item.department,

                        approved: true,
                        pending: false,
                        // isNew: false,

                        // originalPosition: item.position,
                        // originalDepartment: item.department,
                    })),
                ]);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        if (status === "authenticated") fetchProfile();
    }, [userId, status]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/profile/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessage({
                type: "success",
                text: data.message || "Profile updated successfully!",
            });

            setTimeout(() => router.push(`/profile/${userId}`), 2000);
        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.message || "Something went wrong.",
            });
        } finally {
            setSaving(false);
        }
    };
    const applyForPosition = async () => {
        try {
            if (!newPosition.position || !newPosition.department) {
                setMessage({
                    type: "error",
                    text: "Please select both position and department.",
                });
                return;
            }

            const res = await fetch(`/api/profile/${userId}/position`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPosition),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage({
                type: "success",
                text: data.message || "Position application submitted successfully!",
            });
            setNewPosition({
                position: "",
                department: "",
            });

        }
        catch (error: any) {
            setMessage({
                type: "error",
                text: error.message || "Something went wrong.",
            });
        } finally {
            // reloade the page
            () => router.push(`/profile/${userId}`)

        };
    };
    const handleDomainExit = async (row: PositionRow) => {
        const domainName = row.department.replace(/_/g, " ");

        const warning = isAdmin
            ? `Remove this user from ${domainName}?`
            : `Are you sure you want to exit ${domainName}?`;

        if (!confirm(warning)) return;

        setRemovingDomainId(row.id);

        try {
            const res = await fetch(
                `/api/profile/${userId}/domains/${row.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Unable to exit domain.");
            }

            setDeptAndPositions((previous) =>
                previous.filter((domain) => domain.id !== row.id)
            );

            setMessage({
                type: "success",
                text: data.message,
            });
        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.message || "Something went wrong.",
            });
        } finally {
            setRemovingDomainId(null);
            router.refresh(); // Refresh the page to reflect changes
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="flex justify-center items-center h-screen bg-deep-black">
                <Loader2 className="animate-spin text-neon-red w-10 h-10" />
            </div>
        );
    }

    return (
        <main className="bg-deep-black min-h-screen text-white">
            <Navbar />

            <section className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <Link
                        href={`/profile/${userId}`}
                        className="inline-flex items-center text-gray-400 hover:text-neon-red transition-colors group mb-6"
                    >
                        <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Profile
                    </Link>
                    <h1 className="text-4xl font-black">Edit Profile</h1>
                    <p className="text-gray-400 mt-2">
                        Update your profile information below.
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Profile Photo */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Profile
                        </h2>
                        <div className="flex items-center gap-6">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
                                {form.profilePhoto ? (
                                    <Image
                                        src={form.profilePhoto}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-neon-red/10 flex items-center justify-center text-3xl font-black text-neon-red">
                                        {session?.user?.name?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <CldUploadWidget
                                uploadPreset="asper_uploads"
                                options={{
                                    resourceType: "image",
                                    clientAllowedFormats: [
                                        "png",
                                        "jpg",
                                        "jpeg",
                                        "webp",
                                    ],
                                    maxFileSize: 5000000,
                                }}
                                onSuccess={(result: any) => {
                                    if (result.info?.secure_url) {
                                        setForm((prev) => ({
                                            ...prev,
                                            profilePhoto:
                                                result.info.secure_url,
                                        }));
                                    }
                                }}
                            >
                                {({ open }) => (
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => open()}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-bold transition-colors block mb-1"
                                        >
                                            Upload New Photo
                                        </button>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG up to 5MB
                                        </p>
                                    </div>
                                )}
                            </CldUploadWidget>
                        </div>
                        {/* create for name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="mt-3">
                                <label className="block text-sm text-gray-400 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            name: e.target.value,

                                        }))
                                    }
                                    placeholder="Your Name"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 transition-colors"
                                />
                            </div>
                            <div className="mt-3">
                                <label className="block text-sm text-gray-400 mb-2">
                                    Birth Date
                                </label>
                                <input
                                    type="date"
                                    value={form.birthDate}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            birthDate: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-red/50 transition-colors"
                                />
                            </div>
                        </div>


                    </div>

                    {/* Bio */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Bio
                        </h2>
                        <textarea
                            value={form.bio}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    bio: e.target.value,
                                }))
                            }
                            placeholder="Tell the world about yourself..."
                            rows={4}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 transition-colors resize-none"
                        />
                    </div>
                    {/* College Information */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                            College Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    College
                                </label>

                                <select
                                    value={form.college}
                                    onChange={(e) => {
                                        const college = e.target.value as
                                            | "UIT"
                                            | "SOIT"
                                            | "OTHER";

                                        setForm((prev) => ({
                                            ...prev,
                                            college,
                                            branch: college === "UIT" ? prev.branch : "",
                                            otherCollegeName:
                                                college === "OTHER"
                                                    ? prev.otherCollegeName
                                                    : "",
                                        }));
                                    }}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-red/50 transition-colors"
                                >
                                    <option value="UIT" className="bg-black">
                                        UIT RGPV
                                    </option>
                                    <option value="SOIT" className="bg-black">
                                        SOIT RGPV
                                    </option>
                                    <option value="OTHER" className="bg-black">
                                        Other College
                                    </option>
                                </select>
                            </div>

                            {form.college === "UIT" && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Branch
                                    </label>

                                    <input
                                        value={form.branch}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                branch: e.target.value,
                                            }))
                                        }
                                        placeholder="e.g., CSE, IT, ECE"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 transition-colors"
                                    />

                                </div>
                            )}
                            {/* year for every college */}

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Year
                                </label>
                                <select
                                    value={form.year}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            year: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-red/50 transition-colors"
                                >
                                    <option value="" className="bg-black">
                                        Select Year
                                    </option>
                                    <option value="FIRST" className="bg-black">
                                        1st Year
                                    </option>
                                    <option value="SECOND" className="bg-black">
                                        2nd Year
                                    </option>
                                    <option value="THIRD" className="bg-black">
                                        3rd Year
                                    </option>
                                    <option value="FOURTH" className="bg-black">

                                        4th Year
                                    </option>
                                </select>

                            </div>

                            {form.college === "OTHER" && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        College Name
                                    </label>

                                    <input
                                        value={form.otherCollegeName}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                otherCollegeName: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter your college name"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 transition-colors"
                                    />
                                </div>
                            )}
                        </div>


                    </div>

                    {/* Restricted Fields */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                Position / Title
                            </h2>
                            {!isAdmin && (
                                <div className="flex items-center gap-1 text-yellow-500 text-xs bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                                    <Info size={12} />
                                    Requires approval
                                </div>
                            )}
                        </div>
                        {/* create  a  table which have three columna position department and activity */}
                        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                            <table className="w-full min-w-[680px] text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="px-3 py-3 text-sm text-gray-400 sm:px-4">
                                            Position
                                        </th>
                                        <th className="px-3 py-3 text-sm text-gray-400 sm:px-4">
                                            Department
                                        </th>
                                        <th className="px-3 py-3 text-sm text-gray-400 sm:px-4">
                                            Activity
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {deptAndPositions.map((row) => (
                                        <tr key={row.id} className="border-b border-white/10">
                                            <td className="px-3 py-3 sm:px-4">
                                                {row.position}
                                            </td>
                                            <td className="px-3 py-3 sm:px-4">
                                                {row.department}
                                            </td>
                                            <td className="px-3 py-3 sm:px-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {row.approved ? (
                                                        <span className="text-green-500 text-sm font-bold">
                                                            Approved
                                                        </span>
                                                    ) : row.pending ? (
                                                        <span className="text-yellow-500 text-sm font-bold">
                                                            Pending Approval
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            // onClick={() => applyForPosition(row)}
                                                            className="px-4 py-2 bg-neon-red hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors"
                                                        >
                                                            Apply
                                                        </button>
                                                    )}


                                                    <button
                                                        type="button"
                                                        onClick={() => handleDomainExit(row)}
                                                        disabled={removingDomainId === row.id}
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                                    >
                                                        {removingDomainId === row.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={14} className="hidden md:block" />
                                                        )}

                                                        {isAdmin ? "Remove" : "Exit"}
                                                    </button>
                                                </div>

                                            </td>
                                        </tr>
                                    ))}




                                    {/* add new row button */}

                                    <tr className="border-b border-white/10">
                                        <td className="px-3 py-3 sm:px-4">
                                            <select
                                                value={newPosition.position}
                                                onChange={(e) => setNewPosition({ ...newPosition, position: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-red/50 transition-colors"
                                            >
                                                <option value="" className="bg-black">
                                                    Select Position
                                                </option>
                                                <option value="LEARNER" className="bg-black">
                                                    Learner
                                                </option>
                                                <option value="PRESIDENT" className="bg-black">President</option>
                                                <option value="VICE_PRESIDENT" className="bg-black">Vice President</option>
                                                <option value="SECRETARY" className="bg-black">Secretary</option>
                                                <option value="TREASURER" className="bg-black">Treasurer</option>
                                                <option value="CHAIR_MEMBER" className="bg-black">Chair Member</option>

                                                <option value="OPEN_SOURCE_EXECUTIVE" className="bg-black">
                                                    Open Source Executive
                                                </option>
                                                <option value="SOCIAL_MEDIA_MANAGER" className="bg-black">
                                                    Social Media Manager
                                                </option>
                                                <option value="EVENT_MANAGER" className="bg-black">
                                                    Event Manager
                                                </option>

                                                <option value="HEAD" className="bg-black">Head</option>
                                                <option value="CO_HEAD" className="bg-black">Co-Head</option>

                                                <option value="CORE_MEMBER" className="bg-black">
                                                    Core Member
                                                </option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-3 sm:px-4">
                                            <select
                                                value={newPosition.department}
                                                onChange={(e) => setNewPosition({ ...newPosition, department: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-red/50 transition-colors"
                                            >
                                                <option value="Null" className="bg-black">
                                                    Select Department
                                                </option>
                                                <option value="ASPER" className="bg-black">Asper</option>
                                                <option value="CORPORATE_RELATIONS" className="bg-black">CR</option>
                                                <option value="WEB_DEVELOPMENT" className="bg-black">Web Development</option>
                                                <option value="DSA" className="bg-black">DSA</option>
                                                <option value="ML_DATA_SCIENCE" className="bg-black">ML & Data Science</option>
                                                <option value="GRAPHICS" className="bg-black">Graphics</option>
                                                <option value="DEVOPS_CLOUD" className="bg-black">DevOps & Cloud</option>

                                                <option value="PHOTOGRAPHY_VIDEO_EDITING" className="bg-black">
                                                    Photography & Videography
                                                </option>
                                                <option value="IOT" className="bg-black">
                                                    IOT & Embedded Systems
                                                </option>
                                                <option value="GAME_DEVELOPMENT_ANIMATION" className="bg-black">
                                                    Game Development
                                                </option>
                                            </select>

                                        </td>
                                        <td className="px-3 py-3 sm:px-4 flex items-center gap-2">
                                            {/* delete button */}

                                            {/* apply button */}
                                            <button
                                                onClick={() => applyForPosition()}


                                                type="button"
                                                className="ml-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                            >
                                                Apply
                                            </button>

                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>

                    </div>

                    {/* Social Links */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Social Links
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(
                                [
                                    { key: "github", label: "GitHub URL" },
                                    { key: "linkedin", label: "LinkedIn URL" },
                                    {
                                        key: "instagram",
                                        label: "Instagram URL",
                                    },
                                    {
                                        key: "twitter",
                                        label: "Twitter / X URL",
                                    },
                                ] as const
                            ).map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        {label}
                                    </label>
                                    <input
                                        type="url"
                                        value={form[key]}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                [key]: e.target.value,
                                            }))
                                        }
                                        placeholder="https://..."
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-red/50 transition-colors"
                                    />
                                </div>
                            ))}
                        </div>
                    </div >






                    {/* Status Message */}
                    {
                        message && (
                            <div
                                className={`p-4 rounded-lg border text-sm font-medium ${message.type === "success"
                                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                                    }`}
                            >
                                {message.text}
                            </div>
                        )
                    }

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-neon-red text-white font-black rounded-xl hover:bg-red-600 transition-all hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <Save size={20} />
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form >
            </section >

            <Footer />
        </main >

    );

}