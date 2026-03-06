import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function gradeDynamicAnswer(
    questionText: string,
    userAnswer: string,
    maxMarks: number,
    options?: string[]
): Promise<{ score: number; feedback: string }> {
    try {
        const isMCQ = options && options.length > 0;

        const prompt = `
    You are an expert evaluator grading a student's answer to a technical question.
    
    Question: "${questionText}"
    ${isMCQ ? `Available Options: ${options.map(o => `"${o}"`).join(", ")}` : ""}
    Max Marks: ${maxMarks}

    Student's Answer: "${userAnswer}"

    Rules for grading:
    ${isMCQ
                ? `1. The user has selected one of the Available Options. You MUST determine which of the available options is the absolute correct one. 
    2. If the Student's Answer MATCHES the absolute correct option, give them EXACTLY ${maxMarks} points.
    3. If the Student's Answer DOES NOT match the absolute correct option, give them EXACTLY 0 points. NO partial credit is allowed.`
                : `1. Evaluate how well the student's answer correctly addresses the question.
    2. Be fair but strict. Not mentioning core concepts should result in lost marks, but credit partial knowledge.`}
    3. Return your evaluation strictly as a valid JSON object in the following format, with NO Markdown wrapping, and NO additional text outside the JSON:
    {
      "score": <number between 0 and ${maxMarks}>,
      "feedback": "<EXTREMELY concise feedback. Max 5-10 words. E.g., 'Correct', 'Incorrect. Option B is right.', or 'Valid definition of JavaScript.'>"
    }
    `;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a JSON-only API that evaluates technical answers and outputs strictly valid JSON.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct", // Using the robust 8B model for fast, standard queries
            temperature: 0.2, // Low temperature for more deterministic grading
            response_format: { type: "json_object" },
        });

        const responseContent = completion.choices[0]?.message?.content;

        if (!responseContent) {
            throw new Error("No content received from Groq");
        }

        const result = JSON.parse(responseContent);

        // Ensure the score is within bounds
        const score = Math.max(0, Math.min(Number(result.score || 0), maxMarks));

        return {
            score,
            feedback: result.feedback || "Evaluated by AI.",
        };
    } catch (error) {
        console.error("Error grading with Groq AI:", error);
        // Fallback if LLM fails
        return {
            score: 0,
            feedback: "Failed to grade automatically due to an error. Manual review required.",
        };
    }
}
