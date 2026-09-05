import type {
  PortfolioData,
  Project,
  BlogPost,
  Skill,
  Experience,
  Testimonial,
  Education,
  Certification,
  Achievement,
  PhilosophyItem,
  Service,
  ContactMessage,
} from '@/types';

export const defaultProfile: PortfolioData['profile'] = {
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
  facebook: '',
  avatar: '/images/profile.jpg',
  cvUrl: '/resume.pdf',
  achievements: [],
  philosophy: [],
};

export const defaultProjects: Project[] = [
  {
    id: 'p1',
    slug: 'fintrack-pro',
    title: 'FinTrack Pro',
    description:
      'A real-time personal finance dashboard with multi-currency support, bank sync, and predictive analytics.',
    content: `FinTrack Pro helps users take control of their finances through an intuitive dashboard. The platform aggregates transactions from multiple bank accounts, categorizes spending automatically, and surfaces actionable insights using machine learning.

## The Challenge
Building a secure, real-time financial aggregator meant handling sensitive data, unreliable bank APIs, and complex state synchronization across devices.

## The Solution
I architected a Next.js 15 frontend with server components for SEO and performance, backed by a Node.js microservices cluster. PostgreSQL and Prisma handled relational data, while Redis powered caching and real-time session management. Bank integrations used OAuth2 and webhook reconciliation to keep balances accurate without polling.`,
    images: ['/images/project-fintrack.jpg'],
    technologies: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'Redis', 'Tailwind CSS'],
    categories: ['SaaS', 'Fintech'],
    githubUrl: 'https://github.com/udehsamson/fintrack-pro',
    liveUrl: 'https://fintrack-pro.vercel.app',
    featured: true,
    completionDate: '2024-11-15',
    status: 'published',
    seoTitle: 'FinTrack Pro - Real-time Personal Finance Dashboard',
    seoDescription:
      'A real-time personal finance dashboard with multi-currency support, bank sync, and predictive analytics.',
    challenges:
      'Secure aggregation of sensitive bank data, unreliable third-party APIs, and real-time state sync.',
    solutions:
      'OAuth2 bank connections, webhook reconciliation, Redis caching, and a robust Node.js service layer.',
    relatedProjectIds: ['p2', 'p3'],
  },
  {
    id: 'p2',
    slug: 'nexus-commerce',
    title: 'Nexus Commerce',
    description:
      'Headless e-commerce storefront with real-time inventory, AI search, and seamless checkout.',
    content: `Nexus Commerce reimagines online retail with a headless architecture, sub-second page loads, and AI-powered product discovery. Merchants manage catalogs through a dedicated admin dashboard while customers enjoy a personalized shopping experience.

## The Challenge
Legacy monolithic platforms were slow, hard to customize, and expensive to scale during traffic spikes.

## The Solution
We built a decoupled storefront in Next.js, a Node.js order service, and PostgreSQL for inventory. Algolia handled search, Stripe handled payments, and Vercel Edge Network delivered globally cached pages.`,
    images: ['/images/project-nexus.jpg'],
    technologies: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'Stripe', 'Algolia', 'Tailwind CSS'],
    categories: ['E-commerce', 'SaaS'],
    githubUrl: 'https://github.com/udehsamson/nexus-commerce',
    liveUrl: 'https://nexus-commerce.vercel.app',
    featured: true,
    completionDate: '2024-08-20',
    status: 'published',
    seoTitle: 'Nexus Commerce - Headless E-commerce Platform',
    seoDescription:
      'Headless e-commerce storefront with real-time inventory, AI search, and seamless checkout.',
    relatedProjectIds: ['p1', 'p4'],
  },
  {
    id: 'p3',
    slug: 'taskflow-ai',
    title: 'TaskFlow AI',
    description:
      'AI-assisted project management tool that auto-prioritizes tasks and predicts delivery dates.',
    content: `TaskFlow AI combines kanban-style task management with natural language processing to help teams work smarter. Users describe goals in plain English and the system suggests tasks, estimates effort, and highlights risks.

## The Challenge
Teams waste hours planning and reprioritizing work. Existing tools are rigid and don't learn from past projects.

## The Solution
A React frontend, Node.js backend, and a Python ML service work together. PostgreSQL stores projects and tasks, while a fine-tuned model provides predictions via a REST API.`,
    images: ['/images/project-taskflow.jpg'],
    technologies: ['React', 'Node.js', 'Python', 'PostgreSQL', 'OpenAI', 'Tailwind CSS'],
    categories: ['Productivity', 'AI'],
    githubUrl: 'https://github.com/udehsamson/taskflow-ai',
    liveUrl: 'https://taskflow-ai.vercel.app',
    featured: true,
    completionDate: '2024-05-10',
    status: 'published',
    seoTitle: 'TaskFlow AI - Intelligent Project Management',
    seoDescription:
      'AI-assisted project management tool that auto-prioritizes tasks and predicts delivery dates.',
    relatedProjectIds: ['p1', 'p2'],
  },
  {
    id: 'p4',
    slug: 'healthsync',
    title: 'HealthSync',
    description:
      'Telehealth platform connecting patients and providers with video consultations and health records.',
    content: `HealthSync simplifies remote care by combining appointment scheduling, video calls, and encrypted health records in one HIPAA-aligned platform.

## The Challenge
Fragmented tools created friction for patients and providers, and compliance requirements were strict.

## The Solution
A Next.js application with role-based access control, WebRTC video via Daily.co, and encrypted PostgreSQL storage. Prisma migrations kept the schema auditable and type-safe.`,
    images: ['/images/project-healthsync.jpg'],
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'WebRTC', 'Tailwind CSS'],
    categories: ['HealthTech', 'SaaS'],
    githubUrl: 'https://github.com/udehsamson/healthsync',
    liveUrl: 'https://healthsync.vercel.app',
    featured: false,
    completionDate: '2023-12-01',
    status: 'published',
    seoTitle: 'HealthSync - Modern Telehealth Platform',
    seoDescription:
      'Telehealth platform connecting patients and providers with video consultations and health records.',
    relatedProjectIds: ['p2'],
  },
];

export const defaultBlogPosts: BlogPost[] = [
  {
    id: 'b1',
    slug: 'scalable-nextjs-architecture',
    title: 'Scalable Next.js Architecture for Enterprise Apps',
    excerpt:
      'A deep dive into folder structure, server components, caching strategies, and deployment patterns that keep large Next.js codebases maintainable.',
    content: `# Scalable Next.js Architecture for Enterprise Apps
\`\`\`tsx
// Example server component
async function DashboardPage() {
  const data = await getDashboardData();
  return <Dashboard data={data} />;
}
\`\`\`

Building enterprise Next.js applications requires discipline. In this post I share patterns for colocating features, isolating API clients, and optimizing rendering with the App Router.`,
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
    id: 'b2',
    slug: 'typescript-strict-patterns',
    title: 'TypeScript Strict Patterns That Prevent Bugs',
    excerpt:
      'How strict TypeScript settings, branded types, and utility types can eliminate entire classes of runtime errors.',
    content: `# TypeScript Strict Patterns That Prevent Bugs
\`\`\`ts
type UserId = string & { __brand: 'UserId' };
\`\`\`

Strict mode is just the beginning. Learn how branded types, exhaustive switches, and mapped types make your codebase self-documenting and safer.`,
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

export const defaultSkills: Skill[] = [
  { id: 's1', name: 'React / Next.js', category: 'Frontend', proficiency: 98 },
  { id: 's2', name: 'TypeScript', category: 'Frontend', proficiency: 96 },
  { id: 's3', name: 'Tailwind CSS', category: 'Frontend', proficiency: 95 },
  { id: 's4', name: 'Node.js', category: 'Backend', proficiency: 94 },
  { id: 's5', name: 'PostgreSQL', category: 'Backend', proficiency: 92 },
  { id: 's6', name: 'Prisma', category: 'Backend', proficiency: 90 },
  { id: 's7', name: 'GraphQL / tRPC', category: 'Backend', proficiency: 88 },
  { id: 's8', name: 'Docker / CI/CD', category: 'DevOps', proficiency: 85 },
  { id: 's9', name: 'AWS / Vercel', category: 'DevOps', proficiency: 87 },
  { id: 's10', name: 'React Native', category: 'Mobile', proficiency: 82 },
];

export const defaultExperiences: Experience[] = [
  {
    id: 'e1',
    role: 'Senior Full Stack Engineer',
    company: 'TechVerse Solutions',
    location: 'Remote',
    startDate: '2022-03-01',
    endDate: undefined,
    current: true,
    description:
      'Leading frontend architecture for a multi-tenant SaaS platform, mentoring engineers, and driving performance initiatives that reduced page load times by 40%.',
  },
  {
    id: 'e2',
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
    id: 'e3',
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

export const defaultTestimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Amara Okafor',
    role: 'Product Manager',
    company: 'TechVerse Solutions',
    content:
      'Samson is one of the most reliable engineers I have worked with. He combines technical depth with design sensibility and always ships on time.',
    avatar: '/images/avatar-1.jpg',
  },
  {
    id: 't2',
    name: 'David Chen',
    role: 'Engineering Lead',
    company: 'Innovate Digital',
    content:
      'His ability to break down complex requirements into clean, maintainable code is exceptional. A true full-stack partner.',
    avatar: '/images/avatar-2.jpg',
  },
  {
    id: 't3',
    name: 'Fatima Bello',
    role: 'Founder',
    company: 'Nexus Commerce',
    content:
      'Samson transformed our e-commerce vision into a fast, beautiful storefront. Sales increased significantly after launch.',
    avatar: '/images/avatar-3.jpg',
  },
];

export const defaultEducation: Education[] = [
  {
    id: 'ed1',
    degree: 'B.Sc. Computer Science',
    institution: 'University of Lagos',
    year: '2014 - 2018',
    description: 'First Class Honours. Focus on software engineering, algorithms, and databases.',
  },
];

export const defaultCertifications: Certification[] = [
  { id: 'c1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2023' },
  { id: 'c2', name: 'Google UX Design Certificate', issuer: 'Google', year: '2022' },
];

export const defaultAchievements: Achievement[] = [
  {
    id: 'a1',
    title: 'Open Source Contributor of the Year',
    year: '2024',
    description: 'Recognized by a leading React community for contributions to accessibility tooling.',
  },
  {
    id: 'a2',
    title: 'Hackathon Winner - FinTech Track',
    year: '2023',
    description: 'Built a real-time payment splitter that won first place at Lagos Tech Fest.',
  },
];

// Original philosophy cards previously hardcoded in src/pages/About.tsx.
// Preserved as seed content so existing profile data is never lost (icons are presentation-only).
export const defaultPhilosophy: PhilosophyItem[] = [
  {
    title: 'Product First',
    description:
      'Technology should serve the user. I start with the problem, validate solutions, and then choose the right tools.',
  },
  {
    title: 'Continuous Learning',
    description:
      'The best engineers are students for life. I invest in learning new patterns, languages, and design principles every week.',
  },
  {
    title: 'Craftsmanship',
    description:
      'Clean code, accessible interfaces, and robust architecture are not optional — they are the foundation of trust.',
  },
];

export const defaultServices: Service[] = [
  {
    id: 'sv1',
    title: 'Full Stack Development',
    description: 'End-to-end web and mobile applications using modern stacks and scalable architecture.',
    icon: 'Layers',
    features: ['React / Next.js frontend', 'Node.js / Python backend', 'PostgreSQL & Prisma ORM', 'Cloud deployment'],
  },
  {
    id: 'sv2',
    title: 'Frontend Engineering',
    description: 'Pixel-perfect, accessible, and animated interfaces that delight users and drive conversions.',
    icon: 'Monitor',
    features: ['Design system implementation', 'Performance optimization', 'Animation & micro-interactions', 'A11y & SEO'],
  },
  {
    id: 'sv3',
    title: 'Backend & API Development',
    description: 'Robust APIs, microservices, and data layers designed for security, speed, and growth.',
    icon: 'Server',
    features: ['REST & GraphQL APIs', 'Authentication & authorization', 'Database design', 'Caching & queues'],
  },
  {
    id: 'sv4',
    title: 'Mobile App Development',
    description: 'Cross-platform mobile experiences with React Native and Expo.',
    icon: 'Smartphone',
    features: ['iOS & Android', 'Offline-first architecture', 'Push notifications', 'App store deployment'],
  },
  {
    id: 'sv5',
    title: 'UI Implementation',
    description: 'Turn Figma designs into responsive, component-based code with design-to-dev precision.',
    icon: 'Palette',
    features: ['Figma to code', 'Tailwind / CSS-in-JS', 'Storybook documentation', 'Responsive layouts'],
  },
  {
    id: 'sv6',
    title: 'Consulting & Optimization',
    description: 'Technical audits, architecture reviews, and performance optimization for existing products.',
    icon: 'TrendingUp',
    features: ['Code audits', 'Performance tuning', 'Scalability planning', 'Team mentorship'],
  },
];

export const defaultPortfolioData: PortfolioData = {
  profile: defaultProfile,
  projects: defaultProjects,
  blogPosts: defaultBlogPosts,
  skills: defaultSkills,
  experiences: defaultExperiences,
  testimonials: defaultTestimonials,
  messages: [] as ContactMessage[],
  education: defaultEducation,
  certifications: defaultCertifications,
  achievements: defaultAchievements,
  analytics: {
    pageViews: [
      { date: 'Mon', views: 420 },
      { date: 'Tue', views: 650 },
      { date: 'Wed', views: 540 },
      { date: 'Thu', views: 890 },
      { date: 'Fri', views: 720 },
      { date: 'Sat', views: 380 },
      { date: 'Sun', views: 460 },
    ],
    projectViews: defaultProjects.map((p) => ({ projectId: p.id, views: Math.floor(Math.random() * 1000) + 200 })),
  },
};

export const techStack = [
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'PostgreSQL',
  'Prisma',
  'Tailwind CSS',
  'Framer Motion',
  'Three.js',
  'Docker',
];

export const siteConfig = {
  name: 'Udeh Samson',
  title: 'Full Stack Engineer & UI/UX Designer',
  description:
    'Portfolio of Udeh Samson, a Full Stack Engineer building scalable, accessible, and visually stunning digital products.',
  url: 'https://udeh-samson.vercel.app',
  twitter: '@udehsamson',
};
