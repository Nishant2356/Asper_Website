"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import EventCard from "@/components/EventCard";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import Link from "next/link";
import TeamCarousel from "@/components/TeamCarousel";
import { events } from "@/app/data/events";
import Image from "next/image";
import { motion } from "framer-motion";





export default function Home() {
  return (
    <main className="bg-deep-black min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section id="home">
        <Hero />
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 max-w-7xl mx-auto border-b border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-neon-red font-bold tracking-widest uppercase text-sm mb-2 block">Who We Are</span>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              INNOVATING <br />
              <span className="text-gray-700">THE FUTURE</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              ASPER is a dynamic community of aspiring students, proudly driven by the <span className="text-white font-bold">IT Department of UIT RGPV</span>. We are dedicated to promoting innovation, cultivating growth, and mastering diverse technologies to shape the future.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 bg-white/5 border border-white/10 rounded-lg hover:border-neon-red/50 transition-colors">
                <h4 className="text-neon-red font-bold text-3xl mb-1">UIT RGPV</h4>
                <p className="text-gray-500 text-sm font-medium">IT Department</p>
              </div>
              <div className="p-5 bg-white/5 border border-white/10 rounded-lg hover:border-neon-red/50 transition-colors">
                <h4 className="text-neon-red font-bold text-3xl mb-1">100+</h4>
                <p className="text-gray-500 text-sm font-medium">Active Members</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 group hover:border-neon-red/50 transition-all shadow-2xl">
                {/* using standard img to respect natural aspect ratio of user assets */}
                <img
                  src="/assets/about_asper/about_image_1.jpg"
                  alt="Asper Community Event"
                  className="w-full h-auto object-contain block group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-white/10 group hover:border-neon-red/50 transition-all shadow-2xl">
                {/* using standard img to respect natural aspect ratio of user assets */}
                <img
                  src="/assets/about_asper/about_image_2.jpg"
                  alt="Asper Team"
                  className="w-full h-auto object-contain block group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-neon-red/10 blur-3xl -z-10 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-neon-red font-bold tracking-widest uppercase text-sm mb-2 block">Mark Your Calendars</span>
            <h2 className="text-4xl md:text-5xl font-black text-white">UPCOMING <span className="text-gray-500">EVENTS</span></h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-white hover:text-neon-red transition-colors font-bold">
            View All <span className="text-xl">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <EventCard {...event} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team/Community Section */}
      <section id="team" className="py-24 bg-black/50 border-y border-white/5 overflow-hidden">
        <div className="px-6 text-center max-w-7xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-widest font-heading"
          >
            Meet the <span className="text-neon-red">Team</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            The passionate individuals driving the Asper community forward.
          </motion.p>
        </div>

        <TeamCarousel />

        <div className="mt-12 text-center px-6">
          <Link
            href="/team"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/10 bg-white/5 text-white font-bold uppercase tracking-widest hover:bg-neon-red hover:border-neon-red transition-all duration-300"
          >
            View Full Team
          </Link>
        </div>
      </section>

      {/* Join CTA */}
      <section id="join" className="py-32 px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter font-heading">READY TO <span className="text-neon-red">LEVEL UP?</span></h2>
        <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto">Join the most elite technical community on campus. Build, innovate, and dominate.</p>
        <Link href="/signup">
          <button className="px-10 py-5 bg-neon-red text-white text-lg font-bold rounded-lg shadow-[0_0_20px_rgba(255,0,51,0.6)] hover:shadow-[0_0_50px_rgba(255,0,51,0.8)] hover:scale-105 transition-all font-heading">
            APPLY NOW
          </button>
        </Link>
      </section>

      {/* FAQ Section */}
      <FAQ />

      <Footer />
    </main>
  );
}
