import { Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface EventCardProps {
    id: number;
    title: string;
    date: string;
    description: string;
    image?: string;
}

export default function EventCard({ id, title, date, description, image }: EventCardProps) {
    return (
        <Link href={`/events/${id}`} className="block group h-full">
            <div className="h-full bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-neon-red/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(255,0,51,0.3)] hover:-translate-y-2 flex flex-col">
                {/* Image Placeholder */}
                <div className="h-48 w-full relative shrink-0">
                    {image ? (
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-neon-red/20 backdrop-blur-md border border-neon-red/50 rounded-full flex items-center gap-2 z-10">
                        <Calendar size={14} className="text-neon-red" />
                        <span className="text-xs font-bold text-white max-w-[150px] truncate">{date}</span>
                    </div>
                </div>

                <div className="p-6 flex flex-col grow">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-red transition-colors">
                        {title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2 grow">
                        {description}
                    </p>

                    <button className="flex items-center gap-2 text-sm font-bold text-white group-hover:translate-x-1 transition-transform mt-auto">
                        View Details
                        <ArrowRight size={16} className="text-neon-red" />
                    </button>
                </div>
            </div>
        </Link>
    );
}
