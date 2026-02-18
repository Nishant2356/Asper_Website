export interface Event {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    image: string;
    featured: boolean;
    tag: string;
    details: string;
    registerLink?: string;
    whatToExpect?: string[];
}

export const events: Event[] = [
    {
        id: 1,
        title: "Cloud Workshop",
        date: "March 12, 2026",
        time: "---",
        location: "Main Auditorium Hall",
        description: "Join our Cloud Computing Workshop for hands-on experience with modern cloud technologies.",
        image: "/assets/cloud_devops_cinematics.png",
        featured: true,
        tag: "WORKSHOP",
        details: `Join our Cloud Computing Workshop for hands-on experience with modern cloud technologies. From understanding core fundamentals and deployment models to mastering real-world applications, this session is designed to build the technical skills and industry insights you need to succeed in today’s digital landscape.`,
        registerLink: undefined,
        whatToExpect: [
            "Hands-On Learning",
            "Core Fundamentals",
            "Real-World Skills",
            "Career Advantage",
            "Industry Insights"
        ]
    }
];
