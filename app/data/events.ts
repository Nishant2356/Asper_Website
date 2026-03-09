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
    date: "18th March - 24th March",
    time: "---",
    location: "Main Auditorium Hall",
    description:
      "An exciting week-long hackathon where innovators collaborate to build creative tech solutions.",
    image: "/assets/hackathon_event.png",
    featured: true,
    tag: "HACKATHON",
    details: `Join our Hackathon 2026 and experience a thrilling week of innovation, creativity, and collaboration. 
Participants will work in teams to design and develop impactful technology solutions, solve real-world challenges, 
and showcase their coding, design, and problem-solving skills. This event provides an opportunity to learn, 
network with fellow developers, and push your technical limits while building something amazing.`,

    registerLink: undefined,

    whatToExpect: [
      "24/7 Coding & Collaboration",
      "Real-World Problem Solving",
      "Team Innovation",
      "Mentorship & Guidance",
      "Exciting Prizes & Recognition",
    ],
  },

  {
    id: 2,
    title: "Cloud Workshop",
    date: "---",
    time: "---",
    location: "Main Auditorium Hall",
    description:
      "Join our Cloud Computing Workshop for hands-on experience with modern cloud technologies.",
    image: "/assets/cloud_devops_cinematics.png",
    featured: false,
    tag: "WORKSHOP",
    details: `Join our Cloud Computing Workshop for hands-on experience with modern cloud technologies. From understanding core fundamentals and deployment models to mastering real-world applications, this session is designed to build the technical skills and industry insights you need to succeed in today’s digital landscape.`,
    registerLink: undefined,
    whatToExpect: [
      "Hands-On Learning",
      "Core Fundamentals",
      "Real-World Skills",
      "Career Advantage",
      "Industry Insights",
    ],
  },
];
