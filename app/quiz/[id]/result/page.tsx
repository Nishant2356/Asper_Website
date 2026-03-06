"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { QuizAttempt, Quiz } from "@prisma/client";

export default function QuizResultPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const attemptId = searchParams.get("attemptId");
    const { data: session, status } = useSession();
    const { id: quizId } = use(params);

    const [attempt, setAttempt] = useState<(QuizAttempt & { quiz: Quiz }) | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchResult() {
            if (!attemptId) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`/api/quiz/attempt/${attemptId}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch result");
                }
                const data = await res.json();
                setAttempt(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        if (status === "authenticated") {
            fetchResult();
        } else if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [attemptId, status, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="animate-spin text-neon-red w-8 h-8" />
            </div>
        );
    }

    if (!attemptId || !attempt) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold bg-white/5 inline-block px-6 py-3 rounded-lg text-red-400">Result not found or invalid attempt ID.</h1>
                <div className="mt-8">
                    <Link href="/quiz" className="flex items-center justify-center gap-2 text-gray-400 hover:text-white mx-auto w-fit">
                        <ArrowLeft size={20} /> Back to Quizzes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-12">
            <div className="text-center mb-12">
                <div className="mx-auto w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <CheckCircle size={40} />
                </div>
                <h1 className="text-4xl font-black font-montserrat uppercase mb-2">Quiz Completed!</h1>
                <p className="text-gray-400">Successfully submitted {attempt.quiz.title}</p>
            </div>

            <div className="bg-deep-black border border-white/10 rounded-xl p-8 mb-8 text-center relative overflow-hidden group hover:border-neon-red/50 transition-colors">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-red to-transparent opacity-50"></div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Final Score</h2>
                <div className="text-6xl font-black font-mono text-white mb-2 group-hover:scale-110 transition-transform">{attempt.score}</div>
                {/* <p className="text-neon-red text-sm font-medium">Evaluated by LLaMA-based Grader & System logic</p> */}
            </div>

            {attempt.feedback && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-neon-red mb-4 border-b border-white/10 pb-2">Grading Breakdown</h3>
                    <div className="space-y-4">
                        {attempt.feedback.split('\n').map((line, index) => {
                            if (!line.trim()) return null;

                            const isCorrect = line.includes("Correct") || line.includes("1/1") || line.includes("2/2"); // basic heuristic for styling
                            const isIncorrect = line.includes("Incorrect") || line.includes("0/") || line.includes("Not answered");

                            return (
                                <div key={index} className={`p-4 rounded-lg border flex gap-3 ${isCorrect
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : isIncorrect
                                        ? 'bg-red-500/10 border-red-500/30'
                                        : 'bg-white/5 border-white/10'
                                    }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCorrect ? 'bg-green-500/20 text-green-400' : isIncorrect ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-400'
                                        }`}>
                                        {line.split(':')[0]}
                                    </div>
                                    <div className="pt-1">
                                        <p className={`font-mono text-sm leading-relaxed ${isCorrect ? 'text-green-200' : isIncorrect ? 'text-red-200' : 'text-gray-300'
                                            }`}>
                                            {line.substring(line.indexOf(':') + 1).trim()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="mt-12 text-center flex justify-center gap-4">
                <Link
                    href="/quiz"
                    className="px-8 py-3 bg-white/10 text-white font-bold rounded-md hover:bg-white/20 transition-all border border-white/10"
                >
                    Return to Quizzes
                </Link>
                <Link
                    href={`/quiz/${quizId}/leaderboard`}
                    className="px-8 py-3 bg-neon-red text-white font-bold rounded-md hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(255,0,51,0.3)]"
                >
                    View Leaderboard
                </Link>
            </div>
        </div>
    );
}
