export interface TeamMember {
    id: number;
    name: string;
    role: string;
    department: string;
    branch: string;
    year: string;
    image: string;
    bio?: string;
    socials: {
        linkedin?: string;
        instagram?: string;
        github?: string;
        twitter?: string;
    };
}

export const team: TeamMember[] = [
    {
        id: 1,
        name: "Harshit Navik",
        role: "Core member",
        department: "DSA, Web Development",
        branch: "CSE",
        year: "2nd",
        image: "/images/team/HarshitNavik.jpeg",
        bio: "I’m Harshit Navik. I’m a motivated learner with a strong interest in computer science and problem-solving.",
        socials: {}
    },
    {
        id: 27,
        name: "Deepti Lonkar",
        role: "Learner",
        department: "ML & Data Science",
        branch: "IT",
        year: "1st",
        image: "/images/team/DeeptiLonkar.jpg",
        bio: "Engineering student with a strong foundation in computer science and Python. Skilled in analytical thinking and problem-solving. Focused on continuous learning and building a career in technology.",
        socials: {}
    },
    {
        id: 2,
        name: "Mohita Patil",
        role: "Learner",
        department: "DSA",
        branch: "IT",
        year: "1st",
        image: "/images/team/MohitaPatil.JPG",
        bio: "I’m a curious and motivated student with an interest in technology, coding, and creative learning. I enjoy exploring new skills, and constantly improving myself.",
        socials: {
            instagram: "https://www.instagram.com/mohi._.tohh?igsh=YzQ5d2hmNGJ1NDB1&utm_source=qr"
        }
    },
    {
        id: 3,
        name: "Sneha Tiwari",
        role: "Learner",
        department: "DSA, Web Development",
        branch: "CSE",
        year: "1st",
        image: "/images/team/SnehaTiwari.jpg",
        bio: "Engineering student passionate about coding, problem-solving, and technology. I’m building my skills in Java, DSA, and core computer science fundamentals with the goal of becoming a skilled Software Developer.",
        socials: {
            linkedin: "https://www.linkedin.com/in/sneha-tiwari-71a2ba375"
        }
    },
    {
        id: 4,
        name: "VIVEK YADAV",
        role: "Learner",
        department: "DSA, IoT",
        branch: "EC",
        year: "1st",
        image: "/images/team/Vivekyadav.jpeg",
        bio: "Hello, my name is Vivek Yadav, I am from Orchha jhansi and currenly pursuing btech. in electronics and communication engineering . I am a motivated and detail-oriented student with a strong interest in technology and problem-solving. I enjoy learning new skills, working in teams, and taking responsibility in academic and organizational activities. I am always eager to improve myself and contribute positively wherever I work.",
        socials: {
            linkedin: "https://www.linkedin.com/in/vivek-yadav-9065a6380?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
            instagram: "https://www.instagram.com/vivek_yadavvvv?igsh=MTRwaDZpYjluY2dndQ=="
        }
    },
    {
        id: 5,
        name: "Prince Yadav",
        role: "Core member",
        department: "Media, Graphics & Video",
        branch: "Ex",
        year: "1st",
        image: "/images/team/PrinceYadav.png",
        bio: "B.Tech student in Electrical and Electronics Engineering at UIT RGPV, Bhopal. Passionate about Designing and Creative stuff and learning new skills.",
        socials: {
            linkedin: "https://www.linkedin.com/in/prince-yadav-a93183382?utm_source=share_via&utm_content=profile&utm_medium=member_android",
            instagram: "https://www.instagram.com/prince_yadav__013?igsh=NW9xeGw0ejZtYXVt"
        }
    },
    {
        id: 6,
        name: "Prince Yadav",
        role: "Learner",
        department: "DSA",
        branch: "Ex",
        year: "1st",
        image: "/images/team/PrinceYadav.png",
        bio: "B.Tech student in Electrical and Electronics Engineering at UIT RGPV, Bhopal. Passionate about electronics, AI integration, and learning new technologies with a strong problem-solving mindset.",
        socials: {
            linkedin: "https://www.linkedin.com/in/prince-yadav-a93183382?utm_source=share_via&utm_content=profile&utm_medium=member_android",
            instagram: "https://www.instagram.com/prince_yadav__013?igsh=NW9xeGw0ejZtYXVt"
        }
    },
    {
        id: 7,
        name: "Sumit Sharma",
        role: "Core member",
        department: "Web Development",
        branch: "IT",
        year: "2",
        image: "/images/team/SumitSharma.jpg",
        bio: "",
        socials: {}
    },
    {
        id: 8,
        name: "Sinki BHARBHOONJA",
        role: "Learner",
        department: "DSA",
        branch: "Mechanical",
        year: "1st",
        image: "/images/team/sinkikumari.jpg",
        bio: "Sinki | Tech Club\nInterested in DSA, Programming & Problem Solving",
        socials: {}
    },
    {
        id: 9,
        name: "Prawin Kumar",
        role: "Learner",
        department: "DSA",
        branch: "IT",
        year: "1st",
        image: "/images/team/Prawinkumarmahto.jpg",
        bio: "My hobby is listening music and Learn DSA, improve problem-solving, and grow with like-minded coders.",
        socials: {
            linkedin: "https://www.linkedin.com/in/prawin-kumar-a1a6b1382?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
        }
    },
    {
        id: 10,
        name: "Rohit Lodhi",
        role: "Head",
        department: "DevOps & Cloud",
        branch: "IT",
        year: "3rd",
        image: "/images/team/RoxsirGroup.jpg",
        bio: "Full stack vibe engineer",
        socials: {
            linkedin: "www.linkedin.com/in/rohitlodhiii",
            instagram: "https://www.instagram.com/rohitlodhiii",
            twitter: "https://x.com/Rohitlodhiii/",
            github: "https://github.com/Rohitlodhii"
        }
    },
    {
        id: 11,
        name: "Mohit Patidar",
        role: "Learner",
        department: "IoT, ML & Data Science, Media, Graphics & Video",
        branch: "EC",
        year: "1st",
        image: "/images/team/MohitPatidar.jpg",
        bio: "Proficiency in IOT , AI & Video Editing",
        socials: {
            linkedin: "https://www.linkedin.com/in/mohit-patidar-35a542281?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
            instagram: "https://www.instagram.com/i_m_mohitpatidar?igsh=MTFyeWc3MTZ2aWV2bg==",
            twitter: "https://x.com/im_mohitpatidar",
            github: "https://github.com/mohitpatidar2007123-star"
        }
    },
    {
        id: 12,
        name: "Aryan Dhola",
        role: "Learner",
        department: "Game Development & Animation",
        branch: "IT",
        year: "1st",
        image: "/images/team/AryanDhola.jpg",
        bio: "My name is Aryan Dhola,I am from ganj basoda ,my hobbies are playing football ,badminton and making drawings and listening music.",
        socials: {
            instagram: "aryan_dhola_05"
        }
    },
    {
        id: 13,
        name: "KASHISH GANVEER",
        role: "Learner",
        department: "DSA",
        branch: "IT",
        year: "1st",
        image: "/images/team/KashishGanveer.jpeg",
        bio: "I am kashish ganveer from branch IT I am very dedicated student interested in problem solving and skill development",
        socials: {
            instagram: "https://www.instagram.com/kash.ish._.g?igsh=ZnllZ3V4NXNiNGk4"
        }
    },
    {
        id: 14,
        name: "Neknarayan",
        role: "Learner",
        department: "DSA",
        branch: "CSE",
        year: "1st",
        image: "/images/team/NeknarayanLodhi.jpeg",
        bio: "I completed my schooling from Class 6 to 12 at Jawahar Navodaya Vidyalaya, Narsinghpur. Currently pursuing B.Tech in CSE at UIT RGPV. Passionate about problem-solving and software development.",
        socials: {
            linkedin: "www.linkedin.com/in/ neknarayan-lodhi-26631b399",
            instagram: "I completed my schooling (Classes 6–12) at Jawahar Navodaya Vidyalaya, Narsinghpur, and spent a year preparing for JEE at GAIL Utkarsh Super 100 (CSRL), Kanpur. Currently, I am pursuing a B.Tech in Computer Science and Engineering at UIT RGPV, Bhopal. I am building a strong foundation in software engineering and actively developing skills in C and C++."
        }
    },
    {
        id: 15,
        name: "Astha Gurjwar",
        role: "Learner",
        department: "DSA",
        branch: "IT",
        year: "1st",
        image: "/images/team/Astha.jpg",
        bio: "I am Astha Gurjwar, a first-year IT student with a strong interest in C++ and Data Structures & Algorithms. Along with my academic pursuits, I am passionate about travelling, creating vlogs, and exploring diverse cultures.",
        socials: {
            instagram: "astha_eve00"
        }
    },
    {
        id: 16,
        name: "Pranshu Verma",
        role: "Core member",
        department: "Corporate Relations",
        branch: "Mechanical",
        year: "1st",
        image: "/images/team/PranshuVerma.jpg",
        bio: "PR & Management | Mechanical Engineering Student | Co-operate Relations Core Member @AsperTechClub | Geopolitics & Defence Enthusiast | Storyteller & Public Speaker | Volunteer",
        socials: {
            linkedin: "https://www.linkedin.com/in/pranshu06"
        }
    },
    {
        id: 17,
        name: "Sankalp Malviya",
        role: "Learner",
        department: "Web Development, DevOps & Cloud",
        branch: "Mechanical",
        year: "2nd",
        image: "/images/team/SankalpMalviya.jpg",
        bio: "Sankalp Malviya is a B.Tech student at UIT RGPV with a strong passion for Web Development and Generative AI. He is eager to harness his potential in design and development while contributing to the society's technical projects.",
        socials: {
            linkedin: "https://www.linkedin.com/in/sankalp-malviya-407240237?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
            instagram: "https://www.instagram.com/all_about_sankalp?igsh=MXZveDR6eTA4aGlkMA==",
            github: "https://github.com/sankalp-malviya"
        }
    },
    {
        id: 18,
        name: "Nancy Jha",
        role: "Learner",
        department: "DSA, Web Development",
        branch: "IT",
        year: "2nd",
        image: "/images/team/NancyJha.jpg",
        bio: "My name is Nancy jha. I am from Datia. I am 2nd year student from IT branch and pursuing BTech degree in UIT RGPV, Bhopal. I have intrested in Web Development and DSA with JAVA . I have learned HTML, CSS, and basic JS, and I have created small practice projects. I am a quick learner and open to learning new tools and technologies.",
        socials: {
            linkedin: "https://www.linkedin.com/in/nancy-jha-827384336?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
            github: "https://github.com/nancy364/HTML"
        }
    },
    {
        id: 19,
        name: "Pranjal Dwivedi",
        role: "Core member",
        department: "Corporate Relations",
        branch: "Ex",
        year: "1st",
        image: "/images/team/pranjaldwivedi.JPG",
        bio: "I am a first-year Electrical and Electronics Engineering student at UIT RGPV. My interests include Electronics, AI integration, and Robotics, and I’m passionate about exploring how these technologies can work together to create smarter systems.",
        socials: {
            linkedin: "linkedin.com/in/pranjaldwivedi14",
            instagram: "https://www.instagram.com/oyee_pranjal14/"
        }
    },
    {
        id: 20,
        name: "Divya Bichpuriya",
        role: "Learner",
        department: "DevOps & Cloud, Corporate Relations",
        branch: "IT",
        year: "1st",
        image: "/images/team/Divya.jpg",
        bio: "",
        socials: {}
    },
    {
        id: 21,
        name: "Pari Lakhera",
        role: "Learner",
        department: "Web Development, Game Development & Animation",
        branch: "IT",
        year: "1st",
        image: "/images/team/PariLakhera.jpg",
        bio: "My name is Pari Lakhera. I'm in it branch 1st year. I'm interested in learning new skills and currently applied in web Development and game Development in asper department.",
        socials: {
            instagram: "https://www.instagram.com/parrriii_07",
            github: "https://github.com/parrriii_07"
        }
    },
    {
        id: 22,
        name: "Aryan Kushwaha",
        role: "Core member",
        department: "Media, Graphics & Video, Corporate Relations",
        branch: "Ex",
        year: "1st",
        image: "/images/team/AryanKushwaha.jpeg",
        bio: "Electrical and Electronics Engineering student at UIT RGPV with a passion for blending electronics and computer science. I enjoy working on Arduino projects, circuit designing, and building smart solutions using Python, MySQL, and Pandas.",
        socials: {
            linkedin: "https://www.linkedin.com/in/aryan-kushwaha1/",
            instagram: "https://www.instagram.com/i.amaryankushwaha",
            github: "https://github.com/AryKush"
        }
    },
    {
        id: 23,
        name: "Pratik Songara",
        role: "Core member",
        department: "Web Development",
        branch: "IT",
        year: "3rd",
        image: "/images/team/PrateekSongara.jpg",
        bio: "Aspiring web developer with a strong interest in building clean, user-friendly websites. Currently learning HTML, CSS, JavaScript, and exploring modern web technologies through hands-on projects.",
        socials: {
            linkedin: "https://www.linkedin.com/in/prateek-songara?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
            instagram: "https://www.instagram.com/prateek_songara_77",
            twitter: "https://x.com/PSongara6261",
            github: "https://github.com/Pratik-Songara"
        }
    },
    {
        id: 24,
        name: "Ishika Agrawal",
        role: "Core member",
        department: "Web Development, Media, Graphics & Video",
        branch: "EC",
        year: "2nd",
        image: "/images/team/IshikaAgrawal.jpg",
        bio: "I’m Ishika Agrawal, a motivated student who loves exploring technology and learning beyond the classroom. I’m driven by curiosity, teamwork, and hands-on experience.",
        socials: {
            linkedin: "https://www.linkedin.com/in/Ishika Agrawal",
            github: "https://github.com/agrawalishika246-pixel"
        }
    },
    {
        id: 25,
        name: "Abhinandan Pathak",
        role: "Learner",
        department: "DSA",
        branch: "CSE",
        year: "2nd",
        image: "/images/team/AbhinandanPathak.webp",
        bio: "Hello I am Abhinandan Pathak. I am from 2nd year Computer science. Currently learning DSA in Java",
        socials: {
            linkedin: "https://www.linkedin.com/in/abhinandan-pathak-22b04b220"
        }
    },
    {
        id: 26,
        name: "Suraj Chaurasiya",
        role: "Learner",
        department: "DSA, Web Development",
        branch: "CSE",
        year: "1st",
        image: "/images/team/GauriCHAURASIYA.jpg",
        bio: "I am very curious to learn something new",
        socials: {
            linkedin: "https://www.linkedin.com/in/suraj chaurasiya"
        }
    },
];
