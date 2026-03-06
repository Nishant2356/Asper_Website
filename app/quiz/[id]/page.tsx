"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Clock, CheckCircle2 } from "lucide-react";
import { Quiz, Question } from "@prisma/client";

export default function ParticipateQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { id: quizId } = use(params);

    const [quiz, setQuiz] = useState<(Quiz & { questions: Partial<Question>[] }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const answersRef = useRef(answers);
    const timeLeftRef = useRef(timeLeft);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        timeLeftRef.current = timeLeft;
    }, [timeLeft]);

    useEffect(() => {
        async function startQuizSession() {
            try {
                const res = await fetch(`/api/quiz/${quizId}/attempt/start`, { method: "POST" });
                if (!res.ok) {
                    if (res.status === 403) router.replace("/quiz");
                    throw new Error("Failed to start quiz session");
                }
                const data = await res.json();

                // If the returned attempt is already SUBMITTED or GRADED, redirect
                if (data.attempt && (data.attempt.status === "SUBMITTED" || data.attempt.status === "GRADED")) {
                    router.replace(`/quiz/${quizId}/result?attemptId=${data.attempt.id}`);
                    return;
                }

                setQuiz(data.quiz);

                // Load any previously saved answers
                if (data.attempt && data.attempt.answers) {
                    try {
                        const parsed = JSON.parse(data.attempt.answers);
                        setAnswers(parsed);
                    } catch (e) { }
                }

                // Load saved time left, or generate new time if empty
                if (data.attempt && typeof data.attempt.timeLeft === 'number') {
                    setTimeLeft(data.attempt.timeLeft);
                } else if (data.quiz.timeLimit) {
                    setTimeLeft(data.quiz.timeLimit * 60);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        if (status === "authenticated") {
            startQuizSession();
        } else if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [quizId, status, router]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev && prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto-submit when time is up
                    return 0;
                }
                return prev ? prev - 1 : 0;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Sync progress to the database every 5 seconds
    useEffect(() => {
        if (!quiz || !quizId) return;

        const syncInterval = setInterval(async () => {
            try {
                // Ensure we send the latest values using refs
                await fetch(`/api/quiz/${quizId}/attempt/sync`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ answers: answersRef.current, timeLeft: timeLeftRef.current })
                });
            } catch (err) {
                console.error("Sync error", err);
            }
        }, 5000);

        return () => clearInterval(syncInterval);
    }, [quizId, quiz]);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (submitting) return;
        setSubmitting(true);

        try {
            const res = await fetch("/api/quiz/attempt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quizId,
                    answers,
                }),
            });

            if (!res.ok) throw new Error("Failed to submit quiz");

            const { attemptId } = await res.json();
            router.push(`/quiz/${quizId}/result?attemptId=${attemptId}`);
        } catch (error) {
            console.error("Error submitting quiz", error);
            alert("Error submitting quiz. Please try again.");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="animate-spin text-neon-red w-8 h-8" />
            </div>
        );
    }

    if (!quiz) return <div className="text-center py-20 text-xl font-bold">Quiz not found</div>;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="bg-deep-black border border-white/10 rounded-xl p-6 mb-8 sticky top-24 z-10 shadow-lg shadow-black/50">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black font-montserrat uppercase">{quiz.title}</h1>
                        <p className="text-gray-400 text-sm mt-1">{quiz.description}</p>
                    </div>
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-2 text-xl font-mono font-bold px-4 py-2 rounded-lg border ${timeLeft < 60 ? 'bg-red-500/20 text-neon-red border-neon-red/50 animate-pulse' : 'bg-white/5 border-white/10'}`}>
                            <Clock size={20} />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {quiz.questions.map((q, index) => (
                    <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-bold pr-8">
                                <span className="text-neon-red mr-2">{index + 1}.</span>
                                {q.text}
                            </h3>
                            <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-gray-400 shrink-0">
                                {q.marks} Mark{q.marks !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {q.type === "MCQ" ? (
                            <div className="space-y-3">
                                {q.options?.map((opt, oIndex) => (
                                    <label
                                        key={oIndex}
                                        onClick={() => handleAnswerChange(q.id!, opt)}
                                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${answers[q.id!] === opt
                                            ? "bg-neon-red/10 border-neon-red text-white"
                                            : "bg-deep-black border-white/10 hover:border-white/30 text-gray-300"
                                            }`}
                                    >
                                        <div className="pt-0.5 flex-shrink-0">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[q.id!] === opt ? "border-neon-red" : "border-gray-500"
                                                }`}>
                                                {answers[q.id!] === opt && <div className="w-2.5 h-2.5 bg-neon-red rounded-full" />}
                                            </div>
                                        </div>
                                        <span className="font-medium leading-tight">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">

                                <textarea
                                    value={answers[q.id!] || ""}
                                    onChange={(e) => handleAnswerChange(q.id!, e.target.value)}
                                    placeholder="Type your comprehensive answer here..."
                                    className="w-full bg-deep-black border border-white/10 rounded-md px-4 py-3 min-h-[150px] focus:border-neon-red outline-none transition-colors font-mono text-sm"
                                />
                            </div>
                        )}
                    </div>
                ))}

                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-3 bg-neon-red text-white font-bold rounded-md hover:bg-red-600 transition-all hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                        {submitting ? "Submitting & Grading..." : "Submit Quiz"}
                    </button>
                </div>
            </form>
        </div>
    );
}
