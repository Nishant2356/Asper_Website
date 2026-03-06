import Navbar from "@/components/Navbar";

export default function QuizLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-deep-black text-white selection:bg-neon-red/30">
            <Navbar />
            <main className="pt-24 px-6 md:px-12 max-w-7xl mx-auto pb-20">
                {children}
            </main>
        </div>
    );
}
