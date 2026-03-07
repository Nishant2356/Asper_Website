"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

type QuestionType = "MCQ" | "DYNAMIC";
type Department = "DSA" | "WEB_DEVELOPMENT" | "IOT" | "GAME_DEVELOPMENT_ANIMATION" | "DEVOPS_CLOUD" | "ML_DATA_SCIENCE" | "MEDIA_GRAPHICS_VIDEO" | "CORPORATE_RELATIONS" | "PHOTOGRAPHY_VIDEO_EDITING";

const DEPARTMENTS = [
    { value: "ALL", label: "All Departments" },
    { value: "DSA", label: "DSA" },
    { value: "WEB_DEVELOPMENT", label: "Web Development" },
    { value: "IOT", label: "IOT" },
    { value: "GAME_DEVELOPMENT_ANIMATION", label: "Game Development & Animation" },
    { value: "DEVOPS_CLOUD", label: "Devops & Cloud" },
    { value: "ML_DATA_SCIENCE", label: "Machine Learning & Data Science" },
    { value: "MEDIA_GRAPHICS_VIDEO", label: "Media (Graphics & Video)" },
    { value: "CORPORATE_RELATIONS", label: "Corporate Relations" },
    { value: "PHOTOGRAPHY_VIDEO_EDITING", label: "Photography & Video Editing" },
];

interface QuestionInput {
    type: QuestionType;
    text: string;
    options: string[];
    correctAnswer: string;
    marks: number;
}

export default function CreateQuizPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const isAdmin = session?.user?.role === "ADMIN";
    const userDomains = session?.user?.domain || [];

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [department, setDepartment] = useState<Department>("WEB_DEVELOPMENT");
    const [timeLimit, setTimeLimit] = useState<number>(30);
    const [questions, setQuestions] = useState<QuestionInput[]>([
        { type: "MCQ", text: "", options: ["", "", "", ""], correctAnswer: "", marks: 1 },
    ]);

    const handleAddQuestion = (type: QuestionType) => {
        setQuestions([...questions, {
            type,
            text: "",
            options: type === "MCQ" ? ["", "", "", ""] : [],
            correctAnswer: "",
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

    // Auto-select the first available department if the default is inaccessible
    useEffect(() => {
        if (userDomains.length > 0 && !(userDomains as string[]).includes(department as string)) {
            setDepartment(userDomains[0] as Department);
        }
    }, [userDomains, department]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    department,
                    status: "ACTIVE", // Or DRAFT if you want to save without publishing
                    timeLimit,
                    questions,
                }),
            });

            if (!res.ok) throw new Error("Failed to create quiz");

            router.push("/quiz");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error creating quiz. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-black font-montserrat uppercase mb-8">Create New Quiz</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-bold text-neon-red border-b border-white/10 pb-2 mb-4">Basic Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 text-left"> {/* Added text-left here */}
                            <label className="text-sm font-medium text-gray-300">Title</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-deep-black border border-white/10 rounded-md px-4 py-2 focus:border-neon-red outline-none transition-colors"
                                placeholder="e.g. React Fundamentals"
                            />
                        </div>

                        <div className="space-y-2 text-left"> {/* Added text-left here */}
                            <label className="text-sm font-medium text-gray-300">Department</label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value as unknown as Department)}
                                className="w-full bg-deep-black border border-white/10 rounded-md px-4 py-2 focus:border-neon-red outline-none transition-colors"
                            >
                                {DEPARTMENTS.filter(d =>
                                    d.value !== "ALL" && (userDomains.length === 0 || (userDomains as string[]).includes(d.value))
                                ).map((dept) => (
                                    <option key={dept.value} value={dept.value}>
                                        {dept.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 text-left"> {/* Added text-left here */}
                            <label className="text-sm font-medium text-gray-300">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-deep-black border border-white/10 rounded-md px-4 py-2 focus:border-neon-red outline-none transition-colors min-h-[100px]"
                                placeholder="Short description of the quiz..."
                            />
                        </div>

                        <div className="space-y-2 text-left flex flex-col justify-start"> {/* Added text-left and flex justify-start here */}
                            <label className="text-sm font-medium text-gray-300">Time Limit (mins)</label>
                            <input
                                type="number"
                                min="1"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                                className="w-full bg-deep-black border border-white/10 rounded-md px-4 py-2 focus:border-neon-red outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                        <h2 className="text-xl font-bold text-neon-red">Questions</h2>
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

                            <div className="space-y-4 pr-8 text-left"> {/* Added text-left here */}
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-white/10 mt-4 text-left"> {/* Added text-left here */}
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex gap-2 items-center text-left"> {/* Added text-left here */}
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
                                ) : null}

                                <div className="flex justify-end text-left"> {/* Added text-left here */}
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
                        disabled={loading || questions.length === 0}
                        className="flex items-center gap-2 px-8 py-3 bg-neon-red text-white font-bold rounded-md hover:bg-red-600 transition-all hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {loading ? "Saving..." : "Publish Quiz"}
                    </button>
                </div>
            </form>
        </div>
    );
}
