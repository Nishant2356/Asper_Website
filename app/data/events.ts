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
        title: "Hackathon 2026",
        date: "March 15, 2026",
        time: "10:00 AM - 10:00 AM (Next Day)",
        location: "Main Auditorium",
        description: "24-hour coding marathon to solve real-world problems. Win exciting prizes and connect with industry leaders!",
        image: "/assets/web_dev_cinematics.png",
        featured: true,
        tag: "Competition",
        details: `Join us for the biggest hackathon of the year! Hackathon 2026 is a 24-hour coding marathon where you'll collaborate with like-minded individuals to solve real-world problems. Whether you're a beginner or an expert, this is your chance to showcase your skills, learn new technologies, and win amazing prizes.

        We have mentors from top tech companies to guide you throughout the event. Food, drinks, and swag will be provided to keep you energized. Don't miss this opportunity to build something incredible!`,
        registerLink: "https://forms.gle/example",
        whatToExpect: [
            "24 hours of non-stop coding",
            "Mentorship from industry experts",
            "Free food and swag",
            "Networking opportunities",
            "Exciting prizes for winners"
        ]
    },
    {
        id: 2,
        title: "AI Workshop",
        date: "April 10, 2026",
        time: "2:00 PM - 5:00 PM",
        location: "Lab 3",
        description: "Hands-on session on Neural Networks and Deep Learning with industry experts. Bring your laptops!",
        image: "/assets/ml_ds_cinematics.png",
        featured: false,
        tag: "Workshop",
        details: `Dive deep into the world of Artificial Intelligence with our hands-on AI Workshop. In this session, you'll learn the fundamentals of Neural Networks and Deep Learning from industry experts. 
        
        We'll cover topics ranging from basic concepts to advanced applications. By the end of the workshop, you'll have built your own AI model. Make sure to bring your laptops!`,
        registerLink: "https://forms.gle/example",
        whatToExpect: [
            "Introduction to Neural Networks",
            "Hands-on coding session",
            "Q&A with AI experts",
            "Certificate of participation"
        ]
    },
    {
        id: 3,
        title: "Orientation Session",
        date: "Feb 20, 2026",
        time: "11:00 AM - 1:00 PM",
        location: "Seminar Hall",
        description: "Welcome to ASPER! Meet the team, learn about our domains, and start your journey with us.",
        image: "/assets/game_dev_cinematics.png",
        featured: false,
        tag: "Meetup",
        details: `Welcome to the Asper family! The Orientation Session is your gateway to understanding what our community is all about. Meet the core team, learn about our various technical domains (Web, App, AI/ML, etc.), and discover how you can contribute and grow with us.
        
        We'll also have some fun ice-breaking activities and a Q&A session to answer all your queries.`,
        whatToExpect: [
            "Meet the Core Team",
            "Overview of Technical Domains",
            "Success stories from alumni",
            "Fun activities and networking"
        ]
    },
    {
        id: 4,
        title: "Tech Talk: Future of Cloud",
        date: "May 05, 2026",
        time: "3:00 PM - 4:30 PM",
        location: "Virtual (Google Meet)",
        description: "Webinar on Cloud Computing trends and DevOps practices by alumni working at top tech companies.",
        image: "/assets/generated/innovation.png",
        featured: false,
        tag: "Webinar",
        details: `Cloud computing is reshaping the IT landscape. Join us for an insightful Tech Talk on the "Future of Cloud" featuring alumni who are currently working as Cloud Engineers and DevOps specialists at top tech companies.
        
        Learn about the latest trends, tools, and career paths in the cloud domain. This is a virtual event, so you can join from anywhere!`,
        registerLink: "https://meet.google.com/example",
        whatToExpect: [
            "Insights into Cloud & DevOps",
            "Career guidance from alumni",
            "Live Q&A session",
            "Resources for learning"
        ]
    },
];
