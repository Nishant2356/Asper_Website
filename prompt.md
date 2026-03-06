Role: You are a Senior Frontend Engineer and UI/UX Designer specializing in high-performance, cinematic web experiences.

Project: Create a stunning, responsive landing page for a college technical club called "ASPER" (IT Department).

Tech Stack:

Framework: Next.js (App Router)

Styling: Tailwind CSS

Animations: Framer Motion (Essential for smooth, elegant transitions)

Icons: Lucide React

Design System & Aesthetics:

Primary Color: Neon Red / Crimson (matching the club's "recruiting" poster).

Background: Deep Black / Dark Charcoal (Dark Mode by default).

Vibe: Futuristic, Cinematic, "High-Tech," and Professional.

Typography: Clean, modern sans-serif (e.g., Inter or Montserrat) with bold headings.

Core Page Structure & Requirements:

1. Navbar:

Glassmorphism effect (frosted blur).

Logo on the left (ASPER).

Links: Home, Events, Team, Departments, Join Us.

Mobile: A responsive hamburger menu that slides in smoothly.

2. The Hero Section (The Showstopper):

Concept: A "Department Slider" that creates a cinematic introduction.

Functionality: An auto-playing background slider that cycles through the club's domains.

Slides Data:

Slide 1: "Web Development" (Bg image: Code/React abstract)

Slide 2: "Machine Learning & Data Science" (Bg image: Neural networks)

Slide 3: "Game Development & Animation" (Bg image: 3D render/Game assets)

Slide 4: "Cloud & DevOps" (Bg image: Server infrastructure)

Animation: As the slide changes, the text should fade up/slide in elegantly using framer-motion. The background image should have a slow zoom effect (Ken Burns effect).

CTA: A prominent "Join Us" button with a glowing red hover effect.

3. Upcoming Events Section (Logic Requirement):

Do not hardcode cards. Create a const events array of JSON objects (id, title, date, description, image).

Data: Include dummy events like "Hackathon 2026", "AI Workshop", and "Orientation Session".

Design: Map through this array to render cards. Cards should feature a subtle border glow on hover.

4. Team/Community Section:

A grid layout displaying core team members.

Use placeholder avatars if images aren't provided, but style them professionally.

5. Footer:

Social media links (Instagram, LinkedIn).

Copyright text "© 2026 ASPER. All rights reserved."

Specific Implementation Instructions:

Use framer-motion for scroll animations (elements should fade in as the user scrolls down).

Ensure the site is fully responsive. The Hero text must be readable on mobile.

Implement a "Dark Mode" toggle, but ensure the default state is the dark/red theme shown in the attached brand assets.

Output: Please provide the full Next.js project structure, including the page.tsx, layout.tsx, and component files (Hero, Navbar, EventCard, Footer). Focus heavily on the CSS/Tailwind classes to nail the "gorgeous" look.

Theme: The images show a strong "Cyberpunk/Tech" aesthetic with a Deep Red (Neon) and Black color palette.

Content: The recruitment poster gives us the exact departments (Cloud, ML, DSA, etc.) needed for your Hero Section slider.

Vibe: It needs to be "cinematic" and "badass" to match your personal taste and the club's branding.



chat the other pages are looking exactly similar to the reference pages that i have provided i dont want it to look exactly alike as this this is another important club in our college and it will look its copy so i want to make the pages somewhat slightly different with all the details and quality intact for team contact and about page also make the events page as well


chat i want you to add another filed in the project model named marks in string i will be giving marks to them out of ten that i will manually give like this 9/10 but at initially when not checked it will have the value as not checked something like that