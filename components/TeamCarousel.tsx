"use client";

import { memo, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { team, TeamMember } from "@/app/data/team";

// --- Simple Team Card ---
const TeamCard = memo(function TeamCard({ name, role, image, department }: TeamMember) {
    return (
        <div className="group relative w-64 flex-shrink-0 rounded-2xl border border-white/10 bg-white/5 p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-neon-red/50 hover:shadow-[0_0_20px_rgba(255,0,51,0.2)] cursor-pointer">
            <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-white/10 shadow-inner group-hover:border-neon-red/50 transition-colors duration-300">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    draggable={false}
                />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-neon-red transition-colors">{name}</h3>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">{department}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">{role}</p>
        </div>
    );
});

// --- Single-line Marquee (smooth + flicker-free) ---
function SingleLineMarquee({
    items,
    pxPerSecond = 30,
    gapPx = 24,
    onCardClick,
}: {
    items: TeamMember[];
    pxPerSecond?: number; // Speed
    gapPx?: number;
    onCardClick: (m: TeamMember) => void;
}) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const animRef = useRef<number | null>(null);
    const startRef = useRef<number>(0);
    const halfWidthRef = useRef<number>(0);

    // Double the list to create the "seamless" effect, may need more for wide screens if list is short
    // Tripling to be safe for 4k screens
    const trackItems = useMemo(() => [...items, ...items, ...items], [items]);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        const track = trackRef.current;
        if (!wrapper || !track) return;

        const measure = () => {
            const children = Array.from(track.children) as HTMLElement[];
            if (children.length === 0) return;

            let singleSetWidth = 0;
            // Measure one complete set of items
            const oneSetCount = items.length;

            // Calculate width of the first set of items + gaps
            for (let i = 0; i < oneSetCount; i++) {
                if (children[i]) {
                    singleSetWidth += children[i].offsetWidth + gapPx;
                }
            }

            halfWidthRef.current = singleSetWidth;
        };

        // Initial measure
        measure();

        // Re-measure on resize
        const ro = new ResizeObserver(() => measure());
        ro.observe(track);
        ro.observe(wrapper);

        const tick = (t: number) => {
            if (!startRef.current) startRef.current = t;
            const elapsed = (t - startRef.current) / 1000;
            const delta = elapsed * pxPerSecond;

            const half = halfWidthRef.current || 1;

            // The math: Move left (-delta). Modulo by one set width to snap back instantly.
            // This creates the illusion of infinite scrolling.
            const x = -1 * (delta % half);

            track.style.transform = `translate3d(${x}px, 0, 0)`;
            animRef.current = requestAnimationFrame(tick);
        };

        animRef.current = requestAnimationFrame(tick);

        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            ro.disconnect();
            startRef.current = 0;
        };
    }, [gapPx, pxPerSecond, items.length]);

    return (
        <div ref={wrapperRef} className="relative w-full overflow-hidden py-4">
            <div
                ref={trackRef}
                className="flex flex-nowrap items-center will-change-transform"
                style={{ gap: `${gapPx}px`, backfaceVisibility: "hidden" }}
            >
                {trackItems.map((member, idx) => (
                    <div
                        key={`${member.id}-${idx}`}
                        onClick={() => onCardClick(member)}
                    >
                        <TeamCard {...member} />
                    </div>
                ))}
            </div>

            {/* Fade Edges for depth - Dark Theme Adapted */}
            <div
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                    background:
                        "linear-gradient(to right, #050505 0%, transparent 10%, transparent 90%, #050505 100%)",
                }}
            />
        </div>
    );
}

export default function TeamCarousel() {
    const router = useRouter();

    return (
        <div className="relative">
            <SingleLineMarquee
                items={team}
                pxPerSecond={50}
                gapPx={32}
                onCardClick={(member) => router.push(`/team/${member.id}`)}
            />
        </div>
    );
}
