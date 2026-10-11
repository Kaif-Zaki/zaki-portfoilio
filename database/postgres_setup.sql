-- ========================================================
-- KAIF ZAKI PORTFOLIO DATABASE SETUP SCRIPT (PostgreSQL)
-- ========================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_users (username, password_hash, salt) VALUES
('admin', 'c4676f2b921d55ee67c0f2cccdccd376e1f4c9d3ab55c3b0579363a640758a4c', 'kz_portfolio_salt_2026')
ON CONFLICT (username) DO NOTHING;

CREATE TABLE IF NOT EXISTS profile (
  id INT PRIMARY KEY DEFAULT 1,
  name VARCHAR(150) NOT NULL,
  short_name VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  tagline VARCHAR(255),
  hero_tagline VARCHAR(255),
  hero_sub TEXT,
  watermark VARCHAR(50),
  about_image VARCHAR(255) DEFAULT '/assets/about-developer.gif',
  about_headline VARCHAR(255),
  bio_paragraph_1 TEXT,
  bio_paragraph_2 TEXT,
  email VARCHAR(150),
  phone VARCHAR(50),
  location VARCHAR(150),
  github VARCHAR(255),
  github_handle VARCHAR(100),
  linkedin VARCHAR(255),
  linkedin_handle VARCHAR(100),
  resume_url VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO profile (
  id, name, short_name, title, tagline, hero_tagline, hero_sub,
  watermark, about_image, about_headline, bio_paragraph_1, bio_paragraph_2,
  email, phone, location, github, github_handle, linkedin, linkedin_handle, resume_url
) VALUES (
  1,
  'Kaif Zaki',
  'KZ',
  'Associate Software Engineer',
  'Junior Full Stack Developer & Microservices Specialist',
  'Ready for Production',
  'Associate Software Engineer specializing in modern JavaScript/TypeScript (React, Node.js), Java (Spring Boot), microservices architecture, and cloud infrastructure — engineering reliable systems for scalable production deployments.',
  'FULL STACK',
  '/assets/about-developer.gif',
  'Engineering Scalable Web Systems with Microservices, Spring Boot & Modern Cloud Ops',
  'Results-driven Software Engineer with extensive hands-on experience in developing scalable web applications, microservices architecture, and cloud infrastructure. Proficient across the full software development lifecycle, specializing in modern JavaScript/TypeScript (React, Node.js), Java (Spring Boot), and multi-database management.',
  'Demonstrated ability in API engineering, Linux server administration, and production deployments. Experienced in optimizing database schemas and complex queries across MySQL, PostgreSQL, and MongoDB, and automating deployments with Docker, PM2, aaPanel, and Nginx reverse proxies.',
  'kaifzakey22@gmail.com',
  '+94 776737532',
  'Jaffna / Panadura, Sri Lanka',
  'https://github.com/Kaif-Zaki',
  '@Kaif-Zaki',
  'https://linkedin.com/in/kaif-zaki',
  '/in/kaif-zaki',
  '#contact'
) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS stats (
  id SERIAL PRIMARY KEY,
  count_num INT NOT NULL,
  unit VARCHAR(20) DEFAULT '',
  label VARCHAR(150) NOT NULL,
  order_idx INT DEFAULT 0
);

INSERT INTO stats (count_num, unit, label, order_idx) VALUES
(3, '+', 'Years Engineering & Training', 1),
(6, '+', 'Enterprise & Core Projects', 2),
(7, '+', 'Professional Certifications', 3),
(100, '%', 'Production Deployment Precision', 4);

CREATE TABLE IF NOT EXISTS marquee_tools (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  order_idx INT DEFAULT 0
);

INSERT INTO marquee_tools (slug, label, order_idx) VALUES
('react', 'React', 1),
('springboot', 'Spring Boot', 2),
('nodedotjs', 'Node.js', 3),
('docker', 'Docker', 4),
('postgresql', 'PostgreSQL', 5),
('mongodb', 'MongoDB', 6),
('mysql', 'MySQL', 7),
('prisma', 'Prisma', 8),
('angular', 'Angular', 9),
('googlecloud', 'GCP', 10),
('nginx', 'Nginx', 11),
('cloudflare', 'Cloudflare', 12);

CREATE TABLE IF NOT EXISTS series (
  id SERIAL PRIMARY KEY,
  tag VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  link VARCHAR(255) DEFAULT '#projects',
  cta VARCHAR(100) DEFAULT 'Explore architecture →',
  order_idx INT DEFAULT 0
);

INSERT INTO series (tag, title, description, image, link, cta, order_idx) VALUES
('Architecture', 'Scalable Microservices with Spring Boot & Docker', 'Designing decoupled services, inter-service JWT authorization, high-throughput REST APIs, and automated container orchestration.', '/assets/series-microservices.svg', '#projects', 'Explore architecture →', 1),
('Algorithm & DB', 'Segment-Based Railway Seat Reservation Logic', 'Architecting segment allocation algorithms allowing independent seat reservation across non-overlapping journey intervals in PostgreSQL.', '/assets/series-railway.svg', '#projects', 'Read case study →', 2),
('Cloud & DevOps', 'Zero-Downtime Linux VPS Deployment Playbook', 'Step-by-step setup for aaPanel, PM2, Cloudflare SSL, Nginx reverse proxy configuration, and containerized Node.js workloads.', '/assets/series-vps.svg', '#projects', 'View DevOps stack →', 3),
('Mobile & AI', 'Cross-Platform Mobile Sync with Firestore & AI', 'Building background-synced React Native mobile apps with real-time cloud datastores, geofenced alerts, and AI task evaluation.', '/assets/series-mobile.svg', '#projects', 'See implementation →', 4);

CREATE TABLE IF NOT EXISTS skill_categories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  icon_svg TEXT,
  chips TEXT NOT NULL,
  order_idx INT DEFAULT 0
);

INSERT INTO skill_categories (title, icon_svg, chips, order_idx) VALUES
('Frontend Engineering', '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>', 'react:React,react:React Native,angular:Angular,tailwindcss:Tailwind CSS,bootstrap:Bootstrap,figma:Figma', 1),
('Backend & Microservices', '<rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/><circle cx="8" cy="7" r="0.6" fill="currentColor"/><circle cx="8" cy="17" r="0.6" fill="currentColor"/>', 'springboot:Spring Boot,nodedotjs:Node.js,express:Express.js,java:Java,:REST APIs,:Microservices,jsonwebtokens:JWT', 2),
('Programming Languages', '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', 'javascript:JavaScript,typescript:TypeScript,java:Java,python:Python,php:PHP,laravel:Laravel', 3),
('Cloud, Server & DevOps', '<path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="M4 7l8 4 8-4"/><path d="M12 11v10"/>', 'docker:Docker,googlecloud:GCP,cloudflare:Cloudflare,nginx:Nginx,:Linux VPS,:aaPanel,:PM2', 4),
('Databases & Storage', '<ellipse cx="12" cy="6" rx="7" ry="2.6"/><path d="M5 6v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6"/><path d="M5 12v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6"/>', 'postgresql:PostgreSQL,mysql:MySQL,mongodb:MongoDB,prisma:Prisma ORM,redis:Redis', 5),
('Developer Tools & Testing', '<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="18" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M7 6h8a3 3 0 0 1 3 3v.5"/><path d="M14.2 18h-0"/><path d="M9.8 18h2"/>', 'git:Git,github:GitHub,postman:Postman,apachemaven:Maven,visualstudiocode:VS Code', 6),
('Hosting & Infrastructure Ops', '<path d="M12 3.5 5 6v6c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6l-7-2.5Z"/><path d="M9.5 12.2l1.8 1.8 3.2-3.6"/>', ':Domain Management,:DNS Records,:SSL Certificates,:Reverse Proxies,:aaPanel', 7),
('Mobile & Realtime Architecture', '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>', 'react:React Native,firebase:Firestore,firebase:Firebase,:Background Sync,:Location Alerts', 8),
('Spoken & Professional Languages', '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>', ':English (Professional),:Tamil (Native),:Sinhala (Fluent),:Agile/Scrum,:Team Collaboration', 9);

CREATE TABLE IF NOT EXISTS experience (
  id SERIAL PRIMARY KEY,
  role VARCHAR(150) NOT NULL,
  company VARCHAR(150) NOT NULL,
  location VARCHAR(100),
  period VARCHAR(100) NOT NULL,
  bullets JSONB NOT NULL,
  order_idx INT DEFAULT 0
);

INSERT INTO experience (role, company, location, period, bullets, order_idx) VALUES
(
  'Junior Full Stack Developer',
  'Oncode Tech Solution (PVT) LTD',
  'Jaffna',
  '03/2026 — Present',
  '["Engineered RESTful APIs and secure microservices using React, Node.js, and Spring Boot with JWT authentication.", "Optimized database schemas and complex queries across MySQL and MongoDB for high data throughput and integrity.", "Managed end-to-end cloud deployments on Linux VPS environments utilizing Docker, PM2, Cloudflare, and aaPanel.", "Configured production hosting infrastructure including domain management, DNS records, SSL certificates, and reverse proxies."]'::jsonb,
  1
),
(
  'Trainee Software Engineer',
  'Institute of Software Engineering (IJSE)',
  'Panadura',
  '2023 — 2026',
  '["Developed enterprise-level software with Java, Spring Boot, and JavaFX following modular architecture principles.", "Built responsive user interfaces with React and Angular, enhancing cross-platform usability and client performance.", "Automated build pipelines and containerized application setups using Docker, Git, and Maven within team environments."]'::jsonb,
  2
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  tag VARCHAR(150),
  year VARCHAR(50),
  is_wide BOOLEAN DEFAULT FALSE,
  description TEXT,
  outcomes JSONB NOT NULL,
  chips TEXT,
  diagram_url VARCHAR(255),
  diagram_alt VARCHAR(255),
  github_url VARCHAR(255) DEFAULT '',
  live_url VARCHAR(255) DEFAULT '',
  order_idx INT DEFAULT 0
);

INSERT INTO projects (
  title, tag, year, is_wide, description, outcomes, chips, diagram_url, diagram_alt, github_url, live_url, order_idx
) VALUES
(
  'Sri Lanka Railway Seat Booking System',
  'Distributed Logic & Booking Engine',
  '2026',
  TRUE,
  'Architected segment-based booking logic allowing reserved seats to be independently booked across non-overlapping journey segments. Designed PostgreSQL relational schema and migrations with Prisma ORM and containerized deployment using Docker.',
  '["Architected segment-based booking engine allowing non-overlapping journey segments to share seats safely", "Designed comprehensive PostgreSQL relational schema and automated migrations using Prisma ORM", "Containerized production deployment using Docker ensuring repeatable environment setup and scalability", "Implemented high-concurrency safety and transaction locking to eliminate double-booking anomalies"]'::jsonb,
  'postgresql:PostgreSQL,prisma:Prisma,docker:Docker,nodedotjs:Node.js,express:Express.js',
  '/assets/diagram-railway.svg',
  'Sri Lanka Railway Booking System Architecture Diagram',
  'https://github.com/Kaif-Zaki',
  '',
  1
),
(
  'Pet Care Management & Tracking System',
  'Cloud-Native Microservices',
  '2025',
  FALSE,
  'Designed a cloud-native Spring Boot microservices platform separating pet tracking, management, and third-party integrations with robust inter-service communication and security protocols.',
  '["Decoupled microservice architecture with dedicated services for tracking, medical history, and user profiles", "Implemented secure inter-service API communication and role-based access protocols with Spring Security & JWT", "Scalable multi-database integration combining transactional relational data and document store tracking data"]'::jsonb,
  'springboot:Spring Boot,java:Java,docker:Docker,mysql:MySQL,mongodb:MongoDB',
  '/assets/diagram-petcare.svg',
  'Spring Boot Cloud-Native Microservices Architecture Diagram',
  'https://github.com/Kaif-Zaki',
  '',
  2
),
(
  'TaskWize Mobile Application',
  'Cross-Platform & Realtime AI',
  '2026',
  FALSE,
  'Created a cross-platform mobile task manager featuring real-time Firestore sync and location-triggered task alerts. Built background synchronization and used AI to analyze user daily tasks and determine high-priority focus areas.',
  '["Real-time multi-device database synchronization using Google Cloud Firestore with offline persistence", "Location-triggered background task reminders notifying users when entering relevant geofenced zones", "Intelligent AI task engine that analyzes daily schedules and recommends actionable priorities"]'::jsonb,
  'react:React Native,firebase:Firestore,python:AI/ML,:Background Sync,:Geolocation',
  '/assets/diagram-taskwize.svg',
  'TaskWize Mobile App Architecture and Firestore Sync Flow',
  'https://github.com/Kaif-Zaki',
  '',
  3
);

CREATE TABLE IF NOT EXISTS certifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  issuer VARCHAR(150),
  link VARCHAR(255) DEFAULT '#',
  order_idx INT DEFAULT 0
);

INSERT INTO certifications (title, issuer, link, order_idx) VALUES
('Gemini Certified Faculty by Google', 'Google', '#', 1),
('AI Engineer for Developers Associate', 'DataCamp', '#', 2),
('Gemini Certified Student by Google', 'Google', '#', 3),
('ASP.NET Core Foundations Course', 'Scholar Hat', '#', 4),
('Docker Foundations Course', 'Scholar Hat', '#', 5),
('Web Design', 'University of Moratuwa (UOM)', '#', 6),
('Python Dev', 'University of Moratuwa (UOM)', '#', 7);

CREATE TABLE IF NOT EXISTS education (
  id SERIAL PRIMARY KEY,
  degree VARCHAR(200) NOT NULL,
  institution VARCHAR(200) NOT NULL,
  period VARCHAR(100),
  coursework TEXT,
  order_idx INT DEFAULT 0
);

INSERT INTO education (degree, institution, period, coursework, order_idx) VALUES
(
  'Higher National Diploma in Software Engineering',
  'IJSE - Institute of Software Engineering',
  '2023 — 2026',
  'Object Oriented Programming, Databases, Discrete Maths, Data Structures and Algorithms, Operating Systems, Computer Networks, Machine Learning, Data Mining, Advance Data Structures and Algorithms, Information Retrieval, Image Processing',
  1
),
(
  'G.C.E. Advanced Level',
  'Al-Fahriya National College',
  '2021 — 2023',
  'Physical Science Stream / Advanced Level Studies',
  2
);

CREATE TABLE IF NOT EXISTS availability (
  id INT PRIMARY KEY DEFAULT 1,
  open_to_work BOOLEAN DEFAULT TRUE,
  badge_text VARCHAR(100) DEFAULT 'Open to work',
  engagement VARCHAR(150),
  target_roles VARCHAR(255),
  location VARCHAR(150),
  work_mode VARCHAR(150),
  subtext TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO availability (
  id, open_to_work, badge_text, engagement, target_roles, location, work_mode, subtext
) VALUES (
  1,
  TRUE,
  'Open to work',
  'Full-time · contract · freelance',
  'Associate Software Engineer · Junior Full Stack Developer · Backend / Spring Boot Engineer',
  'Jaffna / Panadura, Sri Lanka · IST (UTC+5:30)',
  'Remote / Hybrid / On-site · Open to relocation',
  'Open to Software Engineer, Full Stack Developer, and Backend roles — full-time, contract, or freelance. For project collaboration or inquiries, reach out below and I''ll get back quickly.'
) ON CONFLICT (id) DO NOTHING;
