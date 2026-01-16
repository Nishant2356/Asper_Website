import { Github, Linkedin, Instagram, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-black py-12 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-24 h-16">
                    <Image
                            src="https://res.cloudinary.com/dujwwjdkq/image/upload/v1768587223/Gemini_Generated_Image_ie1mzaie1mzaie1m_1_kgyx27.png"
                            alt="Asper Logo"
                            fill
                            className="object-contain mix-blend-screen"
                        />
                    </div>
                </Link>

                <p className="text-gray-500 text-sm">
                    © 2026 ASPER. All rights reserved.
                </p>

                <div className="flex items-center gap-6">
                    <Link href="#" className="text-gray-400 hover:text-neon-red transition-colors"><Instagram size={20} /></Link>
                    <Link href="#" className="text-gray-400 hover:text-neon-red transition-colors"><Linkedin size={20} /></Link>
                    <Link href="#" className="text-gray-400 hover:text-neon-red transition-colors"><Github size={20} /></Link>
                </div>
            </div>
        </footer>
    );
}
