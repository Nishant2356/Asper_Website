"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Trophy, Medal, Trash2, Star } from "lucide-react";
import Link from "next/link";

interface QuizInfo {
    id: string;
    title: string;
    department: string;
    totalMarks: number;
}

interface LeaderboardEntry {
    id: string; // Attempt ID
    userId: string;
    userName: string;
    score: number;
    submittedAt: string;
    rank: number;
}

export default function QuizLeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { id: quizId } = use(params);

    const [quiz, setQuiz] = useState<QuizInfo | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch(`/api/quiz/${quizId}/leaderboard`);
            if (!res.ok) {
                throw new Error("Failed to fetch leaderboard");
            }
            const data = await res.json();
            setQuiz(data.quiz);
            setLeaderboard(data.leaderboard);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            fetchLeaderboard();
        } else if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [quizId, status, router]);

    const handleDelete = async (attemptId: string) => {
        if (!confirm("Are you sure you want to delete this attempt? This action cannot be undone.")) return;
        setDeletingId(attemptId);
        try {
            const res = await fetch(`/api/quiz/attempt/${attemptId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                // Refresh leaderboard to recalculate ranks and remove the deleted entry
                await fetchLeaderboard();
            } else {
                const data = await res.json();
                alert(`Failed to delete attempt: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error deleting attempt:", error);
            alert("An error occurred while deleting the attempt.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="animate-spin text-neon-red w-8 h-8" />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold bg-white/5 inline-block px-6 py-3 rounded-lg text-red-400">Quiz not found.</h1>
                <div className="mt-8">
                    <Link href="/quiz" className="flex items-center justify-center gap-2 text-gray-400 hover:text-white mx-auto w-fit">
                        <ArrowLeft size={20} /> Back to Quizzes
                    </Link>
                </div>
            </div>
        );
    }

    const currentUserEntry = leaderboard.find(entry => entry.userId === session?.user?.id);
    const isAdmin = session?.user?.role === "ADMIN";

    return (
        <div className="max-w-4xl mx-auto py-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/quiz" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-black font-montserrat uppercase flex items-center gap-3">
                        <Trophy className="text-yellow-500" size={32} />
                        Leaderboard
                    </h1>
                    <p className="text-gray-400 mt-1">Ranking for: <span className="text-neon-red font-bold">{quiz.title}</span></p>
                </div>
            </div>

            {/* Total Marks Banner */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3 mb-6 w-fit">
                <Star className="text-yellow-400" size={18} />
                <span className="text-gray-400 text-sm uppercase tracking-widest font-bold">Total Marks</span>
                <span className="text-white font-mono font-black text-lg">{quiz.totalMarks}</span>
            </div>

            {currentUserEntry && (
                <div className="bg-neon-red/10 border border-neon-red/30 rounded-xl p-6 mb-8 flex justify-between items-center shadow-[0_0_20px_rgba(255,0,51,0.15)]">
                    <div>
                        <p className="text-sm text-neon-red font-bold uppercase tracking-widest mb-1">Your Ranking</p>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            Rank #{currentUserEntry.rank}
                            {currentUserEntry.rank === 1 && <Medal className="text-yellow-500" size={24} />}
                            {currentUserEntry.rank === 2 && <Medal className="text-gray-300" size={24} />}
                            {currentUserEntry.rank === 3 && <Medal className="text-amber-600" size={24} />}
                        </h2>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Your Score</p>
                        <p className="text-3xl font-mono font-black text-white">{currentUserEntry.score}</p>
                    </div>
                </div>
            )}

            <div className="bg-deep-black border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-4 font-bold text-gray-400 uppercase text-xs tracking-wider w-20 text-center">Rank</th>
                                <th className="p-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Participant</th>
                                <th className="p-4 font-bold text-gray-400 uppercase text-xs tracking-wider text-right">Score</th>
                                <th className="p-4 font-bold text-gray-400 uppercase text-xs tracking-wider text-right hidden sm:table-cell">Submitted</th>
                                {isAdmin && <th className="p-4 font-bold text-gray-400 uppercase text-xs tracking-wider text-right w-24">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} className="p-8 text-center text-gray-500 italic">No one has completed this quiz yet.</td>
                                </tr>
                            ) : (
                                leaderboard.map((entry) => (
                                    <tr
                                        key={entry.id}
                                        className={`border-b border-white/5 hover:bg-white/5 transition-colors ${entry.userId === session?.user?.id ? 'bg-white/5 ring-1 ring-inset ring-neon-red/30' : ''}`}
                                    >
                                        <td className="p-4 text-center font-bold">
                                            {entry.rank === 1 ? <span className="text-yellow-500 text-lg flex justify-center"><Medal size={20} /></span> :
                                                entry.rank === 2 ? <span className="text-gray-300 text-lg flex justify-center"><Medal size={20} /></span> :
                                                    entry.rank === 3 ? <span className="text-amber-600 text-lg flex justify-center"><Medal size={20} /></span> :
                                                        <span className="text-gray-500">#{entry.rank}</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-white flex items-center gap-2">
                                                {entry.userName}
                                                {entry.userId === session?.user?.id && <span className="text-[10px] bg-neon-red/20 text-neon-red px-2 py-0.5 rounded uppercase">You</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-mono font-bold text-lg text-neon-red">
                                            {entry.score}
                                        </td>
                                        <td className="p-4 text-right text-sm text-gray-500 hidden sm:table-cell">
                                            {new Date(entry.submittedAt).toLocaleDateString()}
                                        </td>
                                        {isAdmin && (
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    disabled={deletingId === entry.id}
                                                    className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 inline-flex items-center justify-center group"
                                                    title="Delete attempt"
                                                >
                                                    {deletingId === entry.id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                                                    )}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
