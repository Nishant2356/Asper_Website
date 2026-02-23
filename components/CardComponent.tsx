"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface CardComponentProps {
    title: string;
    points: string[];
}

const CardComponent: React.FC<CardComponentProps> = ({ title, points }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="w-full max-w-[300px] xl:max-w-[320px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col relative group transition-all duration-300 hover:border-neon-red/50 hover:shadow-[0_0_30px_rgba(255,0,51,0.2)] mt-6 mx-auto"
        >
            {/* Title Badge flex-center centered */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-max">
                <div className="bg-neon-red text-white px-6 py-1.5 rounded-full text-[13px] font-bold shadow-[0_0_15px_rgba(255,0,51,0.5)] uppercase tracking-widest whitespace-nowrap text-center">
                    {title}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 lg:p-6 pt-10 text-gray-300 flex-1 flex flex-col justify-start">
                <ul className="space-y-4 text-[13px] xl:text-sm leading-relaxed">
                    {points.map((point, index) => (
                        <motion.li
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.1 }}
                            viewport={{ once: true }}
                            key={index}
                            className="flex items-start gap-4"
                        >
                            <span className="text-neon-red text-xl leading-none mt-0.5">▹</span>
                            <span>{point}</span>
                        </motion.li>
                    ))}
                </ul>
            </div>

            {/* Subtle Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-neon-red/0 via-neon-red/0 to-neon-red/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>
    );
};

export default CardComponent;
