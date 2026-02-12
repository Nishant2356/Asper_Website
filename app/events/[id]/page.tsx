"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { events } from "@/app/data/events";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, MapPin, Clock, Ticket } from "lucide-react";
import { motion } from "framer-motion";

export default function EventDetailsPage() {
    const params = useParams();
    const id = Number(params.id);
    const event = events.find((e) => e.id === id);

    if (!event) {
        return (
            <main className="min-h-screen bg-deep-black text-white flex flex-col items-center justify-center">
                <Navbar />
                <h1 className="text-3xl font-bold mb-4">Event not found</h1>
                <Link href="/events" className="text-neon-red hover:underline flex items-center gap-2">
                    <ArrowLeft size={20} /> Back to Events
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-deep-black text-white">
            <Navbar />

            <div className="pt-24 md:pt-32 px-6 md:px-8 max-w-7xl mx-auto">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center text-gray-400 hover:text-neon-red transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full h-[40vh] md:h-[60vh] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 mb-12 group"
                >
                    <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-4 py-1 mb-4 text-xs font-bold tracking-widest uppercase bg-neon-red text-white rounded-full shadow-[0_0_15px_rgba(255,0,51,0.4)]"
                        >
                            {event.tag}
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-6xl font-black mb-4 leading-tight font-heading uppercase"
                        >
                            {event.title}
                        </motion.h1>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-gray-300"
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-neon-red" />
                                <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-neon-red" />
                                <span>{event.location}</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-24">
                    {/* Left Column: Description */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-2xl font-bold mb-4 text-white uppercase tracking-wider border-l-4 border-neon-red pl-4">About the Event</h2>
                            <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-line">
                                {event.details}
                            </p>
                        </motion.div>

                        {/* What to Expect Section */}
                        {event.whatToExpect && event.whatToExpect.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-neon-red/30 transition-colors"
                            >
                                <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-wider">What to Expect</h3>
                                <ul className="space-y-4">
                                    {event.whatToExpect.map((item, index) => (
                                        <li key={index} className="flex items-start gap-4">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-red/20 text-neon-red flex items-center justify-center font-bold text-xs mt-1">
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column: Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6"
                    >
                        {/* Registration Card */}
                        <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm sticky top-24 hover:border-neon-red/30 transition-colors shadow-2xl">
                            <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-wider">Event Details</h3>

                            <div className="space-y-6 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <Clock className="w-5 h-5 text-neon-red" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm uppercase tracking-wider mb-1">Time</div>
                                        <div className="text-sm text-gray-400">{event.time}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <MapPin className="w-5 h-5 text-neon-red" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm uppercase tracking-wider mb-1">Location</div>
                                        <div className="text-sm text-gray-400">{event.location}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Register Button */}
                            {event.registerLink ? (
                                <Link
                                    href={event.registerLink}
                                    target="_blank"
                                    className="w-full py-4 bg-neon-red text-white rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,0,51,0.3)] hover:shadow-[0_0_30px_rgba(255,0,51,0.5)]"
                                >
                                    <Ticket className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                                    REGISTER NOW
                                </Link>
                            ) : (
                                <button
                                    disabled
                                    className="w-full py-4 bg-white/10 text-gray-500 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    REGISTRATION CLOSED
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
