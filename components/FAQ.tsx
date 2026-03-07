"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "How can I join ASPER?",
        answer: "Recruitment drives are held timely. Keep an eye on our social media handles and the 'Join Us' section of this website for announcements.",
    },
    {
        question: "Is there a membership fee?",
        answer: "No, ASPER is a free-to-join student community dedicated to technical growth.",
    },
    {
        question: "Do I need prior coding experience?",
        answer: "Not necessarily! We look for passion and a willingness to learn. We have domains for beginners to experts.",
    },
    {
        question: "What domains does ASPER cover?",
        answer: "We have 9 active domains including Web Dev, ML/AI, Game Dev, Cloud, Android, IoT, DSA, Graphic Design, and Corporate Relations.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 px-6 bg-deep-black">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16 font-heading">
                    FREQUENTLY ASKED <span className="text-neon-red">QUESTIONS</span>
                </h2>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-white/10 rounded-lg bg-white/5 overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                            >
                                <span className="text-lg font-bold text-white font-heading">{faq.question}</span>
                                {openIndex === index ? (
                                    <Minus className="text-neon-red" />
                                ) : (
                                    <Plus className="text-gray-400" />
                                )}
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="p-6 text-gray-400 leading-relaxed border-t border-white/5 flex items-center">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
