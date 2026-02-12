"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { motion } from "framer-motion";
import { events } from "@/app/data/events";
import { Calendar, MapPin, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export default function EventsPage() {
    const featuredEvent = events.find((e) => e.featured) || events[0];
    const regularEvents = events.filter((e) => e.id !== featuredEvent.id);

    return (
        <main className="bg-deep-black min-h-screen text-white">
            <Navbar />

            <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <span className="text-neon-red font-bold tracking-widest uppercase text-sm mb-4 block">
                        Calendar
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 font-heading">
                        UPCOMING <span className="text-gray-600">EVENTS</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Join us for hackathons, workshops, and tech talks. Level up your skills.
                    </p>
                </motion.div>

                {/* --- Featured Event --- */}
                {featuredEvent && (
                    <Link href={`/events/${featuredEvent.id}`}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="group relative w-full h-[60vh] min-h-[500px] rounded-3xl overflow-hidden mb-24 border border-white/10 hover:border-neon-red/50 transition-all shadow-2xl cursor-pointer"
                        >
                            <Image
                                src={featuredEvent.image}
                                alt={featuredEvent.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
                                <span className="px-4 py-2 bg-neon-red text-white font-bold rounded-full text-xs uppercase tracking-widest mb-4 inline-block shadow-[0_0_15px_rgba(255,0,51,0.5)]">
                                    Featured
                                </span>
                                <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                                    {featuredEvent.title}
                                </h2>
                                <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl line-clamp-2">
                                    {featuredEvent.description}
                                </p>

                                <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-neon-red" />
                                        {featuredEvent.date}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-neon-red" />
                                        {featuredEvent.time}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-neon-red" />
                                        {featuredEvent.location}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                )}

                {/* --- Regular Events Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularEvents.map((event, i) => (
                        <Link href={`/events/${event.id}`} key={event.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-neon-red/30 transition-all flex flex-col h-full cursor-pointer"
                            >
                                <div className="relative h-48 overflow-hidden shrink-0">
                                    <Image
                                        src={event.image}
                                        alt={event.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-black/80 backdrop-blur text-white text-xs font-bold rounded uppercase tracking-wider border border-white/10">
                                            {event.tag}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="mb-auto">
                                        <h3 className="text-2xl font-bold mb-2 group-hover:text-neon-red transition-colors">
                                            {event.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                                            {event.description}
                                        </p>
                                    </div>

                                    <div className="border-t border-white/10 pt-4 space-y-3 mt-auto">
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <Calendar className="w-4 h-4 text-neon-red" />
                                            <span>{event.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <MapPin className="w-4 h-4 text-neon-red" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>

                                    <button className="w-full mt-6 py-3 rounded bg-white/5 hover:bg-neon-red hover:text-white transition-colors text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(255,0,51,0.4)]">
                                        View Details <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}
