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
  problemStatement?:string[];
}

export const events: Event[] = [

  {
    id: 1,
    title: "ASPIREX 2026",
    date: "26th March - 1st April",
    time: "---",
    location: "Online",
    description:
      "An exciting week-long hackathon where innovators collaborate to build creative tech solutions.",
    image: "/assets/apeximg.jpeg",
    featured: true,
    tag: "HACKATHON",
    details: `Join our Hackathon 2026 and experience a thrilling week of innovation, creativity, and collaboration. 
Participants will work in teams to design and develop impactful technology solutions, solve real-world challenges, 
and showcase their coding, design, and problem-solving skills. This event provides an opportunity to learn, 
network with fellow developers, and push your technical limits while building something amazing.This hackathon will be conducted completely in online mode, allowing participants to collaborate and build projects from anywhere. 
Please note that this event is exclusively for ASPER club members**, and participation is not open to external applicants.`,

    registerLink: undefined,

    whatToExpect: [
      "24/7 Coding & Collaboration",
      "Real-World Problem Solving",
      "Team Innovation",
      "Mentorship & Guidance",
      "Exciting Prizes & Recognition",
    ],
    problemStatement: [
      "CI/CD Pipeline Automation System- Create a pipeline that Automatically builds, tests, deploys code Triggers on Git push Tools: Jenkins Docker  GitHub ",
      "Develop a system that: Detects suspicious activities Alerts admin  Logs security event",
      "Make a model for Language Identification from Audio Make your own data set , try to show all activities of Machine learning model . ",
      "Make a model for Forecast Weather Using ARIMA Make your own data set , try to show all activites of Machine learning model . ",
      "Participants are required to create and showcase a complete digital idenƟty for a startup/company. This challenge focuses on creativity, branding, and digital presence. ",
      "Participants are required to design and develop a professional website for their startup/company. The website should represent your brand identity and showcase your services effectively.",
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
