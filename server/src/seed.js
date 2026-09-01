import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Profile from './models/Profile.js';
import Project from './models/Project.js';
import BlogPost from './models/BlogPost.js';
import Skill from './models/Skill.js';
import Experience from './models/Experience.js';
import Testimonial from './models/Testimonial.js';
import Analytics from './models/Analytics.js';

dotenv.config();

// Default data (matching src/lib/data.ts)
const defaultProfile = {
  name: 'Udeh Samson',
  title: 'Full Stack Engineer',
  tagline: 'Building scalable digital experiences that blend performance, design, and intelligence.',
  bio: `I'm Udeh Samson, a results-driven Full Stack Engineer with a passion for turning complex problems into elegant, high-performance web and mobile applications. Over the years I've architected products across fintech, e-commerce, SaaS, and AI tooling — from pixel-perfect frontends to resilient backend systems.

My toolkit spans React, Next.js, TypeScript, Node.js, PostgreSQL, Prisma, and cloud platforms. I care deeply about accessibility, SEO, clean architecture, and user experience. Whether leading a team or shipping solo, I bring a product mindset and an obsession for quality.

When I'm not coding, you'll find me mentoring developers, writing about engineering, or exploring the intersection of design and technology.`,
  shortBio:
    'Full Stack Engineer crafting scalable, accessible, and visually stunning web & mobile experiences.',
  email: 'hello@udehsamson.dev',
  phone: '+234 800 000 0000',
  location: 'Lagos, Nigeria',
  website: 'https://udehsamson.dev',
  github: 'https://github.com/udehsamson',
  linkedin: 'https://linkedin.com/in/udehsamson',
  x: 'https://x.com/udehsamson',
  whatsapp: 'https://wa.me/2348000000000',
  avatar: '/images/profile.jpg',
  cvUrl: '/resume.pdf',
};

const defaultProjects = [
  {
    title: 'FinTrack Pro',
    slug: 'fintrack-pro',
    description:
      'A real-time personal finance dashboard with multi-currency support, bank sync, and predictive analytics.',
    content: 'FinTrack Pro helps users take control of their finances through an intuitive dashboard.',
    images: ['/images/project-fintrack.jpg'],
    technologies: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'Redis', 'Tailwind CSS'],
    categories: ['SaaS', 'Fintech'],
    githubUrl: 'https://github.com/udehsamson/fintrack-pro',
    liveUrl: 'https://fintrack-pro.vercel.app',
    featured: true,
    completionDate: '2024-11-15',
    status: 'published',
    seoTitle: 'FinTrack Pro - Real-time Personal Finance Dashboard',
    seoDescription: 'A real-time personal finance dashboard with multi-currency support, bank sync, and predictive analytics.',
    challenges: 'Secure aggregation of sensitive bank data, unreliable third-party APIs, and real-time state sync.',
    solutions: 'OAuth2 bank connections, webhook reconciliation, Redis caching, and a robust Node.js service layer.',
    relatedProjectIds: [],
  },
  {
    title: 'Nexus Commerce',
    slug: 'nexus-commerce',
    description:
      'Headless e-commerce storefront with real-time inventory, AI search, and seamless checkout.',
    content: 'Nexus Commerce reimagines online retail with a headless architecture.',
    images: ['/images/project-nexus.jpg'],
    technologies: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'Stripe', 'Algolia', 'Tailwind CSS'],
    categories: ['E-commerce', 'SaaS'],
    githubUrl: 'https://github.com/udehsamson/nexus-commerce',
    liveUrl: 'https://nexus-commerce.vercel.app',
    featured: true,
    completionDate: '2024-08-20',
    status: 'published',
    seoTitle: 'Nexus Commerce - Headless E-commerce Platform',
    seoDescription: 'Headless e-commerce storefront with real-time inventory, AI search, and seamless checkout.',
    relatedProjectIds: [],
  },
  {
    title: 'TaskFlow AI',
    slug: 'taskflow-ai',
    description:
      'AI-assisted project management tool that auto-prioritizes tasks and predicts delivery dates.',
    content: 'TaskFlow AI combines kanban-style task management with natural language processing.',
    images: ['/images/project-taskflow.jpg'],
    technologies: ['React', 'Node.js', 'Python', 'PostgreSQL', 'OpenAI', 'Tailwind CSS'],
    categories: ['Productivity', 'AI'],
    githubUrl: 'https://github.com/udehsamson/taskflow-ai',
    liveUrl: 'https://taskflow-ai.vercel.app',
    featured: true,
    completionDate: '2024-05-10',
    status: 'published',
    seoTitle: 'TaskFlow AI - Intelligent Project Management',
    seoDescription: 'AI-assisted project management tool that auto-prioritizes tasks and predicts delivery dates.',
    relatedProjectIds: [],
  },
  {
    title: 'HealthSync',
    slug: 'healthsync',
    description:
      'Telehealth platform connecting patients and providers with video consultations and health records.',
    content: 'HealthSync simplifies remote care by combining appointment scheduling, video calls, and encrypted health records.',
    images: ['/images/project-healthsync.jpg'],
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'WebRTC', 'Tailwind CSS'],
    categories: ['HealthTech', 'SaaS'],
    githubUrl: 'https://github.com/udehsamson/healthsync',
    liveUrl: 'https://healthsync.vercel.app',
    featured: false,
    completionDate: '2023-12-01',
    status: 'published',
    seoTitle: 'HealthSync - Modern Telehealth Platform',
    seoDescription: 'Telehealth platform connecting patients and providers with video consultations and health records.',
    relatedProjectIds: [],
  },
];

const defaultBlogPosts = [
  {
    title: 'Scalable Next.js Architecture for Enterprise Apps',
    slug: 'scalable-nextjs-architecture',
    excerpt:
      'A deep dive into folder structure, server components, caching strategies, and deployment patterns.',
    content: '# Scalable Next.js Architecture for Enterprise Apps\n\nBuilding enterprise Next.js applications requires discipline.',
    coverImage: '/images/blog-architecture.jpg',
    categories: ['Engineering', 'Next.js'],
    tags: ['nextjs', 'architecture', 'performance', 'server-components'],
    featured: true,
    publishedAt: '2025-01-10',
    readingTime: 8,
    status: 'published',
    author: 'Udeh Samson',
  },
  {
    title: 'TypeScript Strict Patterns That Prevent Bugs',
    slug: 'typescript-strict-patterns',
    excerpt:
      'How strict TypeScript settings, branded types, and utility types can eliminate entire classes of runtime errors.',
    content: '# TypeScript Strict Patterns That Prevent Bugs\n\nStrict mode is just the beginning.',
    coverImage: '/images/blog-typescript.jpg',
    categories: ['TypeScript', 'Engineering'],
    tags: ['typescript', 'strict', 'types'],
    featured: false,
    publishedAt: '2024-12-05',
    readingTime: 6,
    status: 'published',
    author: 'Udeh Samson',
  },
];

const defaultSkills = [
  { name: 'React / Next.js', category: 'Frontend', proficiency: 98 },
  { name: 'TypeScript', category: 'Frontend', proficiency: 96 },
  { name: 'Tailwind CSS', category: 'Frontend', proficiency: 95 },
  { name: 'Node.js', category: 'Backend', proficiency: 94 },
  { name: 'PostgreSQL', category: 'Backend', proficiency: 92 },
  { name: 'Prisma', category: 'Backend', proficiency: 90 },
  { name: 'GraphQL / tRPC', category: 'Backend', proficiency: 88 },
  { name: 'Docker / CI/CD', category: 'DevOps', proficiency: 85 },
  { name: 'AWS / Vercel', category: 'DevOps', proficiency: 87 },
  { name: 'React Native', category: 'Mobile', proficiency: 82 },
];

const defaultExperiences = [
  {
    role: 'Senior Full Stack Engineer',
    company: 'TechVerse Solutions',
    location: 'Remote',
    startDate: '2022-03-01',
    endDate: '',
    current: true,
    description:
      'Leading frontend architecture for a multi-tenant SaaS platform, mentoring engineers, and driving performance initiatives that reduced page load times by 40%.',
  },
  {
    role: 'Full Stack Developer',
    company: 'Innovate Digital',
    location: 'Lagos, Nigeria',
    startDate: '2020-06-01',
    endDate: '2022-02-28',
    current: false,
    description:
      'Built and maintained customer-facing fintech applications using React, Node.js, and PostgreSQL, serving over 50,000 monthly active users.',
  },
  {
    role: 'Frontend Engineer',
    company: 'Creative Studio Labs',
    location: 'Lagos, Nigeria',
    startDate: '2018-09-01',
    endDate: '2020-05-31',
    current: false,
    description:
      'Developed responsive marketing sites and design systems for clients across e-commerce, health, and finance sectors.',
  },
];

const defaultTestimonials = [
  {
    name: 'Amara Okafor',
    role: 'Product Manager',
    company: 'TechVerse Solutions',
    content:
      'Samson is one of the most reliable engineers I have worked with. He combines technical depth with design sensibility and always ships on time.',
    avatar: '/images/avatar-1.jpg',
  },
  {
    name: 'David Chen',
    role: 'Engineering Lead',
    company: 'Innovate Digital',
    content:
      'His ability to break down complex requirements into clean, maintainable code is exceptional. A true full-stack partner.',
    avatar: '/images/avatar-2.jpg',
  },
  {
    name: 'Fatima Bello',
    role: 'Founder',
    company: 'Nexus Commerce',
    content:
      'Samson transformed our e-commerce vision into a fast, beautiful storefront. Sales increased significantly after launch.',
    avatar: '/images/avatar-3.jpg',
  },
];

const defaultPageViews = [
  { date: 'Mon', views: 420 },
  { date: 'Tue', views: 650 },
  { date: 'Wed', views: 540 },
  { date: 'Thu', views: 890 },
  { date: 'Fri', views: 720 },
  { date: 'Sat', views: 380 },
  { date: 'Sun', views: 460 },
];

async function seed() {
  try {
    await connectDB(process.env.MONGODB_URI);

    // Clear existing data
    await Promise.all([
      Profile.deleteMany({}),
      Project.deleteMany({}),
      BlogPost.deleteMany({}),
      Skill.deleteMany({}),
      Experience.deleteMany({}),
      Testimonial.deleteMany({}),
      Analytics.deleteMany({}),
    ]);

    // Insert default data
    await Profile.create(defaultProfile);
    await Project.insertMany(defaultProjects);
    await BlogPost.insertMany(defaultBlogPosts);
    await Skill.insertMany(defaultSkills);
    await Experience.insertMany(defaultExperiences);
    await Testimonial.insertMany(defaultTestimonials);

    // Create analytics with project views
    const projects = await Project.find();
    const projectViews = projects.map((p) => ({
      projectId: p._id.toString(),
      views: Math.floor(Math.random() * 1000) + 200,
    }));
    await Analytics.create({ pageViews: defaultPageViews, projectViews });

    console.log('Database seeded successfully!');
    console.log('- Profile: 1 document');
    console.log(`- Projects: ${defaultProjects.length} documents`);
    console.log(`- Blog Posts: ${defaultBlogPosts.length} documents`);
    console.log(`- Skills: ${defaultSkills.length} documents`);
    console.log(`- Experiences: ${defaultExperiences.length} documents`);
    console.log(`- Testimonials: ${defaultTestimonials.length} documents`);
    console.log('- Analytics: 1 document');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();