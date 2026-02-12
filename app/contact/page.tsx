"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, MapPin, Send } from "lucide-react";
import { asper } from "../data/asper";

export default function ContactPage() {
    return (
        <main className="bg-deep-black min-h-screen text-white">
            <Navbar />

            <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16">
                    {/* --- Info Section --- */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-neon-red font-bold tracking-widest uppercase text-sm mb-4 block">
                            Get In Touch
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black mb-8 font-heading leading-tight">
                            LET'S <br />
                            <span className="text-gray-600">CONNECT</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-12 max-w-lg leading-relaxed">
                            Have a question? Want to collaborate? Or just want to say hi?
                            Drop us a message and we'll get back to you.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-neon-red">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Email</h3>
                                    <p className="text-gray-400">{asper.email}</p>
                                </div>
                            </div>



                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-neon-red">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Location</h3>
                                    <p className="text-gray-400">
                                        IT Department, UIT RGPV <br />
                                        Bhopal, Madhya Pradesh, India
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* --- Form Section --- */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-red/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                        <form className="space-y-6 relative z-10">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2 flex flex-col">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wide pl-1">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Rahul Sharma"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-red/50 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2 flex flex-col">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wide pl-1">Email</label>
                                    <input
                                        type="email"
                                        placeholder="rahul@example.com"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-red/50 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wide pl-1">Subject</label>
                                <input
                                    type="text"
                                    placeholder="Collaboration Request"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-red/50 focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wide pl-1">Message</label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell us about your project..."
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-red/50 focus:outline-none transition-colors resize-none"
                                />
                            </div>

                            <button className="w-full py-4 bg-neon-red text-white font-bold rounded-lg uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,51,0.4)] hover:shadow-[0_0_30px_rgba(255,0,51,0.6)]">
                                Send Message <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
