"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Trash2, Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DEPARTMENTS } from "@/app/data/departments";

type QuestionType = "MCQ" | "DYNAMIC" | "TRUE_FALSE";
type Department = "DSA" | "WEB_DEVELOPMENT" | "IOT" | "GAME_DEVELOPMENT_ANIMATION" | "DEVOPS_CLOUD" | "ML_DATA_SCIENCE" | "MEDIA_GRAPHICS_VIDEO" | "CORPORATE_RELATIONS" | "PHOTOGRAPHY_VIDEO_EDITING";

interface QuestionInput {
    id?: string;
    type: QuestionType;
    text: string;
    options: string[];
    correctAnswer?: string;
    marks: number;
}

export default function EditQuizPage() {
    const router = useRouter();
    const params = useParams();
    const quizId = params.id as string;
    const { data: session, status } = useSession();

    const isAdmin = session?.user?.role === "ADMIN";
    const userDomains = session?.user?.domain || [];

    const [pageLoading, setPageLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [department, setDepartment] = useState<Department>("WEB_DEVELOPMENT");
    const [timeLimit, setTimeLimit] = useState<number>(30);
    const [quizStatus, setQuizStatus] = useState<string>("DRAFT");
    const [questions, setQuestions] = useState<QuestionInput[]>([]);

    useEffect(() => {
        async function fetchQuiz() {
            try {
                const res = await fetch(`/api/quiz/${quizId}`);
                if (!res.ok) {
                    if (res.status === 404) router.push('/404');
                    throw new Error("Failed to fetch quiz");
                }
                const data = await res.json();

                setTitle(data.title);
                setDescription(data.description || "");
                setDepartment(data.department as Department);
                setTimeLimit(data.timeLimit || 30);
                setQuizStatus(data.status);

                // Note: The GET endpoint currently excludes correctAnswer for security, 
                // so we can't fully edit existing MCQs without it, unless we update the GET endpoint 
                // or create a special admin-only GET endpoint. 
                // We'll proceed with what we have, but correctAnswers might be blank on load.
                const loadedQuestions = data.questions.map((q: any) => ({
                    id: q.id,
                    type: q.type,
                    text: q.text,
                    options: q.options || [],
                    correctAnswer: q.correctAnswer || "",
                    marks: q.marks || 1
                }));

                setQuestions(loadedQuestions.length > 0 ? loadedQuestions : [
                    { type: "MCQ", text: "", options: ["", "", "", ""], correctAnswer: "", marks: 1 }
                ]);

            } catch (error) {
                console.error(error);
                alert("Error loading quiz.");
            } finally {
                setPageLoading(false);
            }
        }

        if (status === "authenticated" && isAdmin) {
            fetchQuiz();
        } else if (status === "unauthenticated" || (status === "authenticated" && !isAdmin)) {
            router.push('/quiz');
        }
    }, [quizId, status, isAdmin, router]);

    const handleAddQuestion = (type: QuestionType) => {
        setQuestions([...questions, {
            type,
            text: "",
            options: type === "MCQ" ? ["", "", "", ""] : type === "TRUE_FALSE" ? ["True", "False"] : [],
            correctAnswer: type === "TRUE_FALSE" ? "True" : "",
            marks: 1
        }]);
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index: number, field: keyof QuestionInput, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[optIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/quiz/${quizId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    department,
                    status: quizStatus,
                    timeLimit,
                    questions, // We'll need to update the PATCH route to handle questions
                }),
            });

            if (!res.ok) throw new Error("Failed to update quiz");

            router.push("/quiz");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error updating quiz. Check console.");
        } finally {
            setSaving(false);
        }
    };

    if (pageLoading || status === "loading") {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="animate-spin text-neon-red w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/quiz" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-3xl font-black font-montserrat uppercase">Edit Quiz</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-bold text-neon-red border-b border-white/10 pb-2 mb-4">Basic Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-gray-300">Title</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-deep-black border border-white/10 rounded-md px-4 py-2 focus:border-neon-red outline-none transition-colors"
                                placeholder="e.g. React Fundamentals"
                            />
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-gray-300">Department</label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value as unknown as Department)}
                                className="w-full bg-deep-black border border-white/10 rounded-md px-4 py-2 focus:border-neon-red outline-none transition-colors"
                            >
                                {DEPARTMENTS.filter(d =>
                                    d.value !== "ALL" && (userDomains.length === 0 || userDomains.includes(d.value as Department))
                                ).map((dept) => (
                                    <option key={dept.value} value={dept.value}>
                                        {dept.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-gray-300">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-deep-black border border-white/10 rounded-md px-4 py-2 focus:border-neon-red outline-none transition-colors min-h-[100px]"
                                placeholder="Short description of the quiz..."
                            />
                        </div>

                        <div className="space-y-4 text-left flex flex-col justify-start">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Time Limit (mins)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                                    className="w-full bg-deep-black border border-white/10 rounded-md px-4 py-2 focus:border-neon-red outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Status</label>
                                <select
                                    value={quizStatus}
                                    onChange={(e) => setQuizStatus(e.target.value)}
                                    className="w-full bg-deep-black border border-white/10 rounded-md px-4 py-2 focus:border-neon-red outline-none transition-colors"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-neon-red">Questions</h2>
                            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">
                                Warning: Editing questions will overwrite existing ones.
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleAddQuestion("MCQ")}
                                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                            >
                                <Plus size={14} /> Add MCQ
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAddQuestion("TRUE_FALSE")}
                                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                            >
                                <Plus size={14} /> Add True/False
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAddQuestion("DYNAMIC")}
                                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                            >
                                <Plus size={14} /> Add Dynamic Query
                            </button>
                        </div>
                    </div>

                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white/5 border border-white/10 rounded-xl p-6 relative group">
                            <button
                                type="button"
                                onClick={() => handleRemoveQuestion(qIndex)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="space-y-4 pr-8 text-left">
                                <div>
                                    <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-gray-400 uppercase mb-2 inline-block">
                                        Question {qIndex + 1} - {q.type}
                                    </span>
                                    <textarea
                                        required
                                        value={q.text}
                                        onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                                        placeholder="Enter question text..."
                                        className="w-full bg-deep-black border border-white/10 rounded-md px-4 py-2 focus:border-neon-red outline-none transition-colors mt-2"
                                    />
                                </div>

                                {q.type === "MCQ" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-white/10 mt-4 text-left">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex gap-2 items-center text-left">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-gray-500 font-mono shrink-0">
                                                    {String.fromCharCode(65 + oIndex)}
                                                </div>
                                                <input
                                                    required
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                    className="w-full bg-deep-black border border-white/10 rounded-md px-3 py-1.5 text-sm focus:border-neon-red outline-none transition-colors"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : q.type === "TRUE_FALSE" ? (
                                    <div className="pl-4 border-l-2 border-white/10 mt-4">
                                        <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Correct Answer</p>
                                        <div className="flex gap-4">
                                            {["True", "False"].map((val) => (
                                                <label key={val} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${q.correctAnswer === val
                                                        ? "border-neon-red bg-neon-red/10 text-white"
                                                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/30"
                                                    }`}>
                                                    <input
                                                        type="radio"
                                                        className="hidden"
                                                        checked={q.correctAnswer === val}
                                                        onChange={() => handleQuestionChange(qIndex, "correctAnswer", val)}
                                                    />
                                                    <span className="font-bold">{val}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                <div className="flex justify-end text-left">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-400">Marks:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={q.marks}
                                            onChange={(e) => handleQuestionChange(qIndex, "marks", parseInt(e.target.value))}
                                            className="w-16 bg-deep-black border border-white/10 rounded-md px-2 py-1 text-sm text-center focus:border-neon-red outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-6 border-t border-white/10">
                    <button
                        type="submit"
                        disabled={saving || questions.length === 0}
                        className="flex items-center gap-2 px-8 py-3 bg-neon-red text-white font-bold rounded-md hover:bg-red-600 transition-all hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
