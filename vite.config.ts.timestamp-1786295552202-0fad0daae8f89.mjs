var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api/github-activity.ts
var github_activity_exports = {};
__export(github_activity_exports, {
  default: () => handler
});
async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "GITHUB_TOKEN is not configured." });
  }
  const username = typeof req.query.username === "string" && req.query.username.trim().length > 0 ? req.query.username.trim() : DEFAULT_USERNAME;
  const query = `
    query GitHubActivity($login: String!) {
      user(login: $login) {
        login
        name
        url
        avatarUrl
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
        repositoriesContributedTo(first: 8, orderBy: { field: PUSHED_AT, direction: DESC }) {
          nodes {
            name
            url
            description
            stargazerCount
            forkCount
            primaryLanguage {
              name
              color
            }
          }
        }
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              url
              description
              stargazerCount
              forkCount
              primaryLanguage {
                name
                color
              }
            }
          }
        }
      }
    }
  `;
  try {
    const response = await fetch(GITHUB_API, {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, variables: { login: username } })
    });
    const json = await response.json();
    if (!response.ok || json.errors) {
      const detail = json.errors ? json.errors.map((error) => error.message).join("; ") : response.statusText;
      return res.status(502).json({ error: "GitHub API request failed.", details: detail });
    }
    if (!json.data?.user) {
      return res.status(404).json({ error: "GitHub user not found." });
    }
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(json.data);
  } catch (error) {
    return res.status(500).json({ error: "Unable to fetch GitHub activity.", details: String(error) });
  }
}
var GITHUB_API, DEFAULT_USERNAME;
var init_github_activity = __esm({
  "api/github-activity.ts"() {
    GITHUB_API = "https://api.github.com/graphql";
    DEFAULT_USERNAME = "udehsamson";
  }
});

// src/lib/data.ts
var data_exports = {};
__export(data_exports, {
  defaultAchievements: () => defaultAchievements,
  defaultBlogPosts: () => defaultBlogPosts,
  defaultCertifications: () => defaultCertifications,
  defaultEducation: () => defaultEducation,
  defaultExperiences: () => defaultExperiences,
  defaultPortfolioData: () => defaultPortfolioData,
  defaultProfile: () => defaultProfile,
  defaultProjects: () => defaultProjects,
  defaultServices: () => defaultServices,
  defaultSkills: () => defaultSkills,
  defaultTestimonials: () => defaultTestimonials,
  siteConfig: () => siteConfig,
  techStack: () => techStack
});
var defaultProfile, defaultProjects, defaultBlogPosts, defaultSkills, defaultExperiences, defaultTestimonials, defaultEducation, defaultCertifications, defaultAchievements, defaultServices, defaultPortfolioData, techStack, siteConfig;
var init_data = __esm({
  "src/lib/data.ts"() {
    defaultProfile = {
      name: "Udeh Samson",
      title: "Full Stack Engineer",
      tagline: "Building scalable digital experiences that blend performance, design, and intelligence.",
      bio: `I'm Udeh Samson, a results-driven Full Stack Engineer with a passion for turning complex problems into elegant, high-performance web and mobile applications. Over the years I've architected products across fintech, e-commerce, SaaS, and AI tooling \u2014 from pixel-perfect frontends to resilient backend systems.

My toolkit spans React, Next.js, TypeScript, Node.js, PostgreSQL, Prisma, and cloud platforms. I care deeply about accessibility, SEO, clean architecture, and user experience. Whether leading a team or shipping solo, I bring a product mindset and an obsession for quality.

When I'm not coding, you'll find me mentoring developers, writing about engineering, or exploring the intersection of design and technology.`,
      shortBio: "Full Stack Engineer crafting scalable, accessible, and visually stunning web & mobile experiences.",
      email: "hello@udehsamson.dev",
      phone: "+234 800 000 0000",
      location: "Lagos, Nigeria",
      website: "https://udehsamson.dev",
      github: "https://github.com/udehsamson",
      linkedin: "https://linkedin.com/in/udehsamson",
      x: "https://x.com/udehsamson",
      whatsapp: "https://wa.me/2348000000000",
      avatar: "/images/profile.jpg",
      cvUrl: "/resume.pdf"
    };
    defaultProjects = [
      {
        id: "p1",
        slug: "fintrack-pro",
        title: "FinTrack Pro",
        description: "A real-time personal finance dashboard with multi-currency support, bank sync, and predictive analytics.",
        content: `FinTrack Pro helps users take control of their finances through an intuitive dashboard. The platform aggregates transactions from multiple bank accounts, categorizes spending automatically, and surfaces actionable insights using machine learning.

## The Challenge
Building a secure, real-time financial aggregator meant handling sensitive data, unreliable bank APIs, and complex state synchronization across devices.

## The Solution
I architected a Next.js 15 frontend with server components for SEO and performance, backed by a Node.js microservices cluster. PostgreSQL and Prisma handled relational data, while Redis powered caching and real-time session management. Bank integrations used OAuth2 and webhook reconciliation to keep balances accurate without polling.`,
        images: ["/images/project-fintrack.jpg"],
        technologies: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "Redis", "Tailwind CSS"],
        categories: ["SaaS", "Fintech"],
        githubUrl: "https://github.com/udehsamson/fintrack-pro",
        liveUrl: "https://fintrack-pro.vercel.app",
        featured: true,
        completionDate: "2024-11-15",
        status: "published",
        seoTitle: "FinTrack Pro - Real-time Personal Finance Dashboard",
        seoDescription: "A real-time personal finance dashboard with multi-currency support, bank sync, and predictive analytics.",
        challenges: "Secure aggregation of sensitive bank data, unreliable third-party APIs, and real-time state sync.",
        solutions: "OAuth2 bank connections, webhook reconciliation, Redis caching, and a robust Node.js service layer.",
        relatedProjectIds: ["p2", "p3"]
      },
      {
        id: "p2",
        slug: "nexus-commerce",
        title: "Nexus Commerce",
        description: "Headless e-commerce storefront with real-time inventory, AI search, and seamless checkout.",
        content: `Nexus Commerce reimagines online retail with a headless architecture, sub-second page loads, and AI-powered product discovery. Merchants manage catalogs through a dedicated admin dashboard while customers enjoy a personalized shopping experience.

## The Challenge
Legacy monolithic platforms were slow, hard to customize, and expensive to scale during traffic spikes.

## The Solution
We built a decoupled storefront in Next.js, a Node.js order service, and PostgreSQL for inventory. Algolia handled search, Stripe handled payments, and Vercel Edge Network delivered globally cached pages.`,
        images: ["/images/project-nexus.jpg"],
        technologies: ["Next.js", "React", "Node.js", "PostgreSQL", "Stripe", "Algolia", "Tailwind CSS"],
        categories: ["E-commerce", "SaaS"],
        githubUrl: "https://github.com/udehsamson/nexus-commerce",
        liveUrl: "https://nexus-commerce.vercel.app",
        featured: true,
        completionDate: "2024-08-20",
        status: "published",
        seoTitle: "Nexus Commerce - Headless E-commerce Platform",
        seoDescription: "Headless e-commerce storefront with real-time inventory, AI search, and seamless checkout.",
        relatedProjectIds: ["p1", "p4"]
      },
      {
        id: "p3",
        slug: "taskflow-ai",
        title: "TaskFlow AI",
        description: "AI-assisted project management tool that auto-prioritizes tasks and predicts delivery dates.",
        content: `TaskFlow AI combines kanban-style task management with natural language processing to help teams work smarter. Users describe goals in plain English and the system suggests tasks, estimates effort, and highlights risks.

## The Challenge
Teams waste hours planning and reprioritizing work. Existing tools are rigid and don't learn from past projects.

## The Solution
A React frontend, Node.js backend, and a Python ML service work together. PostgreSQL stores projects and tasks, while a fine-tuned model provides predictions via a REST API.`,
        images: ["/images/project-taskflow.jpg"],
        technologies: ["React", "Node.js", "Python", "PostgreSQL", "OpenAI", "Tailwind CSS"],
        categories: ["Productivity", "AI"],
        githubUrl: "https://github.com/udehsamson/taskflow-ai",
        liveUrl: "https://taskflow-ai.vercel.app",
        featured: true,
        completionDate: "2024-05-10",
        status: "published",
        seoTitle: "TaskFlow AI - Intelligent Project Management",
        seoDescription: "AI-assisted project management tool that auto-prioritizes tasks and predicts delivery dates.",
        relatedProjectIds: ["p1", "p2"]
      },
      {
        id: "p4",
        slug: "healthsync",
        title: "HealthSync",
        description: "Telehealth platform connecting patients and providers with video consultations and health records.",
        content: `HealthSync simplifies remote care by combining appointment scheduling, video calls, and encrypted health records in one HIPAA-aligned platform.

## The Challenge
Fragmented tools created friction for patients and providers, and compliance requirements were strict.

## The Solution
A Next.js application with role-based access control, WebRTC video via Daily.co, and encrypted PostgreSQL storage. Prisma migrations kept the schema auditable and type-safe.`,
        images: ["/images/project-healthsync.jpg"],
        technologies: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "WebRTC", "Tailwind CSS"],
        categories: ["HealthTech", "SaaS"],
        githubUrl: "https://github.com/udehsamson/healthsync",
        liveUrl: "https://healthsync.vercel.app",
        featured: false,
        completionDate: "2023-12-01",
        status: "published",
        seoTitle: "HealthSync - Modern Telehealth Platform",
        seoDescription: "Telehealth platform connecting patients and providers with video consultations and health records.",
        relatedProjectIds: ["p2"]
      }
    ];
    defaultBlogPosts = [
      {
        id: "b1",
        slug: "scalable-nextjs-architecture",
        title: "Scalable Next.js Architecture for Enterprise Apps",
        excerpt: "A deep dive into folder structure, server components, caching strategies, and deployment patterns that keep large Next.js codebases maintainable.",
        content: `# Scalable Next.js Architecture for Enterprise Apps
\`\`\`tsx
// Example server component
async function DashboardPage() {
  const data = await getDashboardData();
  return <Dashboard data={data} />;
}
\`\`\`

Building enterprise Next.js applications requires discipline. In this post I share patterns for colocating features, isolating API clients, and optimizing rendering with the App Router.`,
        coverImage: "/images/blog-architecture.jpg",
        categories: ["Engineering", "Next.js"],
        tags: ["nextjs", "architecture", "performance", "server-components"],
        featured: true,
        publishedAt: "2025-01-10",
        readingTime: 8,
        status: "published",
        author: "Udeh Samson"
      },
      {
        id: "b2",
        slug: "typescript-strict-patterns",
        title: "TypeScript Strict Patterns That Prevent Bugs",
        excerpt: "How strict TypeScript settings, branded types, and utility types can eliminate entire classes of runtime errors.",
        content: `# TypeScript Strict Patterns That Prevent Bugs
\`\`\`ts
type UserId = string & { __brand: 'UserId' };
\`\`\`

Strict mode is just the beginning. Learn how branded types, exhaustive switches, and mapped types make your codebase self-documenting and safer.`,
        coverImage: "/images/blog-typescript.jpg",
        categories: ["TypeScript", "Engineering"],
        tags: ["typescript", "strict", "types"],
        featured: false,
        publishedAt: "2024-12-05",
        readingTime: 6,
        status: "published",
        author: "Udeh Samson"
      }
    ];
    defaultSkills = [
      { id: "s1", name: "React / Next.js", category: "Frontend", proficiency: 98 },
      { id: "s2", name: "TypeScript", category: "Frontend", proficiency: 96 },
      { id: "s3", name: "Tailwind CSS", category: "Frontend", proficiency: 95 },
      { id: "s4", name: "Node.js", category: "Backend", proficiency: 94 },
      { id: "s5", name: "PostgreSQL", category: "Backend", proficiency: 92 },
      { id: "s6", name: "Prisma", category: "Backend", proficiency: 90 },
      { id: "s7", name: "GraphQL / tRPC", category: "Backend", proficiency: 88 },
      { id: "s8", name: "Docker / CI/CD", category: "DevOps", proficiency: 85 },
      { id: "s9", name: "AWS / Vercel", category: "DevOps", proficiency: 87 },
      { id: "s10", name: "React Native", category: "Mobile", proficiency: 82 }
    ];
    defaultExperiences = [
      {
        id: "e1",
        role: "Senior Full Stack Engineer",
        company: "TechVerse Solutions",
        location: "Remote",
        startDate: "2022-03-01",
        endDate: void 0,
        current: true,
        description: "Leading frontend architecture for a multi-tenant SaaS platform, mentoring engineers, and driving performance initiatives that reduced page load times by 40%."
      },
      {
        id: "e2",
        role: "Full Stack Developer",
        company: "Innovate Digital",
        location: "Lagos, Nigeria",
        startDate: "2020-06-01",
        endDate: "2022-02-28",
        current: false,
        description: "Built and maintained customer-facing fintech applications using React, Node.js, and PostgreSQL, serving over 50,000 monthly active users."
      },
      {
        id: "e3",
        role: "Frontend Engineer",
        company: "Creative Studio Labs",
        location: "Lagos, Nigeria",
        startDate: "2018-09-01",
        endDate: "2020-05-31",
        current: false,
        description: "Developed responsive marketing sites and design systems for clients across e-commerce, health, and finance sectors."
      }
    ];
    defaultTestimonials = [
      {
        id: "t1",
        name: "Amara Okafor",
        role: "Product Manager",
        company: "TechVerse Solutions",
        content: "Samson is one of the most reliable engineers I have worked with. He combines technical depth with design sensibility and always ships on time.",
        avatar: "/images/avatar-1.jpg"
      },
      {
        id: "t2",
        name: "David Chen",
        role: "Engineering Lead",
        company: "Innovate Digital",
        content: "His ability to break down complex requirements into clean, maintainable code is exceptional. A true full-stack partner.",
        avatar: "/images/avatar-2.jpg"
      },
      {
        id: "t3",
        name: "Fatima Bello",
        role: "Founder",
        company: "Nexus Commerce",
        content: "Samson transformed our e-commerce vision into a fast, beautiful storefront. Sales increased significantly after launch.",
        avatar: "/images/avatar-3.jpg"
      }
    ];
    defaultEducation = [
      {
        id: "ed1",
        degree: "B.Sc. Computer Science",
        institution: "University of Lagos",
        year: "2014 - 2018",
        description: "First Class Honours. Focus on software engineering, algorithms, and databases."
      }
    ];
    defaultCertifications = [
      { id: "c1", name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", year: "2023" },
      { id: "c2", name: "Google UX Design Certificate", issuer: "Google", year: "2022" }
    ];
    defaultAchievements = [
      {
        id: "a1",
        title: "Open Source Contributor of the Year",
        year: "2024",
        description: "Recognized by a leading React community for contributions to accessibility tooling."
      },
      {
        id: "a2",
        title: "Hackathon Winner - FinTech Track",
        year: "2023",
        description: "Built a real-time payment splitter that won first place at Lagos Tech Fest."
      }
    ];
    defaultServices = [
      {
        id: "sv1",
        title: "Full Stack Development",
        description: "End-to-end web and mobile applications using modern stacks and scalable architecture.",
        icon: "Layers",
        features: ["React / Next.js frontend", "Node.js / Python backend", "PostgreSQL & Prisma ORM", "Cloud deployment"]
      },
      {
        id: "sv2",
        title: "Frontend Engineering",
        description: "Pixel-perfect, accessible, and animated interfaces that delight users and drive conversions.",
        icon: "Monitor",
        features: ["Design system implementation", "Performance optimization", "Animation & micro-interactions", "A11y & SEO"]
      },
      {
        id: "sv3",
        title: "Backend & API Development",
        description: "Robust APIs, microservices, and data layers designed for security, speed, and growth.",
        icon: "Server",
        features: ["REST & GraphQL APIs", "Authentication & authorization", "Database design", "Caching & queues"]
      },
      {
        id: "sv4",
        title: "Mobile App Development",
        description: "Cross-platform mobile experiences with React Native and Expo.",
        icon: "Smartphone",
        features: ["iOS & Android", "Offline-first architecture", "Push notifications", "App store deployment"]
      },
      {
        id: "sv5",
        title: "UI Implementation",
        description: "Turn Figma designs into responsive, component-based code with design-to-dev precision.",
        icon: "Palette",
        features: ["Figma to code", "Tailwind / CSS-in-JS", "Storybook documentation", "Responsive layouts"]
      },
      {
        id: "sv6",
        title: "Consulting & Optimization",
        description: "Technical audits, architecture reviews, and performance optimization for existing products.",
        icon: "TrendingUp",
        features: ["Code audits", "Performance tuning", "Scalability planning", "Team mentorship"]
      }
    ];
    defaultPortfolioData = {
      profile: defaultProfile,
      projects: defaultProjects,
      blogPosts: defaultBlogPosts,
      skills: defaultSkills,
      experiences: defaultExperiences,
      testimonials: defaultTestimonials,
      messages: [],
      education: defaultEducation,
      certifications: defaultCertifications,
      achievements: defaultAchievements,
      analytics: {
        pageViews: [
          { date: "Mon", views: 420 },
          { date: "Tue", views: 650 },
          { date: "Wed", views: 540 },
          { date: "Thu", views: 890 },
          { date: "Fri", views: 720 },
          { date: "Sat", views: 380 },
          { date: "Sun", views: 460 }
        ],
        projectViews: defaultProjects.map((p) => ({ projectId: p.id, views: Math.floor(Math.random() * 1e3) + 200 }))
      }
    };
    techStack = [
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Prisma",
      "Tailwind CSS",
      "Framer Motion",
      "Three.js",
      "Docker"
    ];
    siteConfig = {
      name: "Udeh Samson",
      title: "Full Stack Engineer & UI/UX Designer",
      description: "Portfolio of Udeh Samson, a Full Stack Engineer building scalable, accessible, and visually stunning digital products.",
      url: "https://udehsamson.dev",
      twitter: "@udehsamson"
    };
  }
});

// vite.config.ts
import path from "path";
import { defineConfig, loadEnv } from "file:///C:/Users/ADMIN/Desktop/udeh/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/ADMIN/Desktop/udeh/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/ADMIN/Desktop/udeh/node_modules/@tailwindcss/vite/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\ADMIN\\Desktop\\udeh";
var vite_config_default = defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ["VITE_", "NEXT_PUBLIC_"]);
  if (env.VITE_GITHUB_TOKEN && !process.env.GITHUB_TOKEN) {
    process.env.GITHUB_TOKEN = env.VITE_GITHUB_TOKEN;
  }
  const plugins = [react(), tailwindcss()];
  try {
    const m = await import("./.vite-source-tags.js");
    plugins.push(m.sourceTags());
  } catch {
  }
  let githubApiHandler = null;
  try {
    const mod = await Promise.resolve().then(() => (init_github_activity(), github_activity_exports));
    githubApiHandler = mod.default;
  } catch {
  }
  let portfolioData = null;
  try {
    const dataMod = await Promise.resolve().then(() => (init_data(), data_exports));
    portfolioData = dataMod.defaultPortfolioData;
  } catch {
  }
  plugins.push({
    name: "vite:local-api-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const pathname = url.pathname;
        if (pathname.startsWith("/api/")) {
          if (pathname === "/api/github-activity") {
            req.query = Object.fromEntries(url.searchParams.entries());
            if (!githubApiHandler) {
              return next();
            }
            const enhancedRes = res;
            if (typeof enhancedRes.status !== "function") {
              enhancedRes.status = (code) => {
                enhancedRes.statusCode = code;
                return enhancedRes;
              };
            }
            if (typeof enhancedRes.json !== "function") {
              enhancedRes.json = (data) => {
                enhancedRes.setHeader("Content-Type", "application/json");
                enhancedRes.end(JSON.stringify(data));
              };
            }
            try {
              await githubApiHandler(req, enhancedRes, next);
            } catch (error) {
              next(error);
            }
            return;
          }
          if (portfolioData) {
            const payloads = {
              "/api/projects": portfolioData.projects,
              "/api/blogs": portfolioData.blogPosts,
              "/api/skills": portfolioData.skills,
              "/api/testimonials": portfolioData.testimonials,
              "/api/experience": portfolioData.experiences,
              "/api/education": portfolioData.education,
              "/api/certifications": portfolioData.certifications,
              "/api/services": portfolioData.services ?? portfolioData.services
            };
            const payload = payloads[pathname];
            if (payload !== void 0) {
              res.setHeader("Content-Type", "application/json");
              res.statusCode = 200;
              res.end(JSON.stringify(payload));
              return;
            }
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `Unknown API route: ${pathname}` }));
            return;
          }
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 503;
          res.end(JSON.stringify({ error: "API data source is unavailable in local dev" }));
          return;
        }
        return next();
      });
    }
  });
  const processEnvDefines = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }
  return {
    plugins,
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],
    define: processEnvDefines,
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBpL2dpdGh1Yi1hY3Rpdml0eS50cyIsICJzcmMvbGliL2RhdGEudHMiLCAidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBRE1JTlxcXFxEZXNrdG9wXFxcXHVkZWhcXFxcYXBpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBRE1JTlxcXFxEZXNrdG9wXFxcXHVkZWhcXFxcYXBpXFxcXGdpdGh1Yi1hY3Rpdml0eS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQURNSU4vRGVza3RvcC91ZGVoL2FwaS9naXRodWItYWN0aXZpdHkudHNcIjtjb25zdCBHSVRIVUJfQVBJID0gJ2h0dHBzOi8vYXBpLmdpdGh1Yi5jb20vZ3JhcGhxbCc7XHJcbmNvbnN0IERFRkFVTFRfVVNFUk5BTUUgPSAndWRlaHNhbXNvbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcTogYW55LCByZXM6IGFueSkge1xyXG4gIGNvbnN0IHRva2VuID0gcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOIHx8IHByb2Nlc3MuZW52LlZJVEVfR0lUSFVCX1RPS0VOIHx8IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX0dJVEhVQl9UT0tFTjtcclxuICBpZiAoIXRva2VuKSB7XHJcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0dJVEhVQl9UT0tFTiBpcyBub3QgY29uZmlndXJlZC4nIH0pO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdXNlcm5hbWUgPSB0eXBlb2YgcmVxLnF1ZXJ5LnVzZXJuYW1lID09PSAnc3RyaW5nJyAmJiByZXEucXVlcnkudXNlcm5hbWUudHJpbSgpLmxlbmd0aCA+IDBcclxuICAgID8gcmVxLnF1ZXJ5LnVzZXJuYW1lLnRyaW0oKVxyXG4gICAgOiBERUZBVUxUX1VTRVJOQU1FO1xyXG5cclxuICBjb25zdCBxdWVyeSA9IGBcclxuICAgIHF1ZXJ5IEdpdEh1YkFjdGl2aXR5KCRsb2dpbjogU3RyaW5nISkge1xyXG4gICAgICB1c2VyKGxvZ2luOiAkbG9naW4pIHtcclxuICAgICAgICBsb2dpblxyXG4gICAgICAgIG5hbWVcclxuICAgICAgICB1cmxcclxuICAgICAgICBhdmF0YXJVcmxcclxuICAgICAgICBjb250cmlidXRpb25zQ29sbGVjdGlvbiB7XHJcbiAgICAgICAgICBjb250cmlidXRpb25DYWxlbmRhciB7XHJcbiAgICAgICAgICAgIHRvdGFsQ29udHJpYnV0aW9uc1xyXG4gICAgICAgICAgICB3ZWVrcyB7XHJcbiAgICAgICAgICAgICAgY29udHJpYnV0aW9uRGF5cyB7XHJcbiAgICAgICAgICAgICAgICBkYXRlXHJcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25Db3VudFxyXG4gICAgICAgICAgICAgICAgY29sb3JcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmVwb3NpdG9yaWVzQ29udHJpYnV0ZWRUbyhmaXJzdDogOCwgb3JkZXJCeTogeyBmaWVsZDogUFVTSEVEX0FULCBkaXJlY3Rpb246IERFU0MgfSkge1xyXG4gICAgICAgICAgbm9kZXMge1xyXG4gICAgICAgICAgICBuYW1lXHJcbiAgICAgICAgICAgIHVybFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvblxyXG4gICAgICAgICAgICBzdGFyZ2F6ZXJDb3VudFxyXG4gICAgICAgICAgICBmb3JrQ291bnRcclxuICAgICAgICAgICAgcHJpbWFyeUxhbmd1YWdlIHtcclxuICAgICAgICAgICAgICBuYW1lXHJcbiAgICAgICAgICAgICAgY29sb3JcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBwaW5uZWRJdGVtcyhmaXJzdDogNiwgdHlwZXM6IFJFUE9TSVRPUlkpIHtcclxuICAgICAgICAgIG5vZGVzIHtcclxuICAgICAgICAgICAgLi4uIG9uIFJlcG9zaXRvcnkge1xyXG4gICAgICAgICAgICAgIG5hbWVcclxuICAgICAgICAgICAgICB1cmxcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvblxyXG4gICAgICAgICAgICAgIHN0YXJnYXplckNvdW50XHJcbiAgICAgICAgICAgICAgZm9ya0NvdW50XHJcbiAgICAgICAgICAgICAgcHJpbWFyeUxhbmd1YWdlIHtcclxuICAgICAgICAgICAgICAgIG5hbWVcclxuICAgICAgICAgICAgICAgIGNvbG9yXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgYDtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goR0lUSFVCX0FQSSwge1xyXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgIEF1dGhvcml6YXRpb246IGBiZWFyZXIgJHt0b2tlbn1gLFxyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgIH0sXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgcXVlcnksIHZhcmlhYmxlczogeyBsb2dpbjogdXNlcm5hbWUgfSB9KSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGpzb24gPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rIHx8IGpzb24uZXJyb3JzKSB7XHJcbiAgICAgIGNvbnN0IGRldGFpbCA9IGpzb24uZXJyb3JzID8ganNvbi5lcnJvcnMubWFwKChlcnJvcjogYW55KSA9PiBlcnJvci5tZXNzYWdlKS5qb2luKCc7ICcpIDogcmVzcG9uc2Uuc3RhdHVzVGV4dDtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAyKS5qc29uKHsgZXJyb3I6ICdHaXRIdWIgQVBJIHJlcXVlc3QgZmFpbGVkLicsIGRldGFpbHM6IGRldGFpbCB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWpzb24uZGF0YT8udXNlcikge1xyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0dpdEh1YiB1c2VyIG5vdCBmb3VuZC4nIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcy5zZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnLCAncy1tYXhhZ2U9MzAwLCBzdGFsZS13aGlsZS1yZXZhbGlkYXRlPTYwMCcpO1xyXG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKGpzb24uZGF0YSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnVW5hYmxlIHRvIGZldGNoIEdpdEh1YiBhY3Rpdml0eS4nLCBkZXRhaWxzOiBTdHJpbmcoZXJyb3IpIH0pO1xyXG4gIH1cclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFETUlOXFxcXERlc2t0b3BcXFxcdWRlaFxcXFxzcmNcXFxcbGliXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBRE1JTlxcXFxEZXNrdG9wXFxcXHVkZWhcXFxcc3JjXFxcXGxpYlxcXFxkYXRhLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BRE1JTi9EZXNrdG9wL3VkZWgvc3JjL2xpYi9kYXRhLnRzXCI7aW1wb3J0IHR5cGUge1xyXG4gIFBvcnRmb2xpb0RhdGEsXHJcbiAgUHJvamVjdCxcclxuICBCbG9nUG9zdCxcclxuICBTa2lsbCxcclxuICBFeHBlcmllbmNlLFxyXG4gIFRlc3RpbW9uaWFsLFxyXG4gIEVkdWNhdGlvbixcclxuICBDZXJ0aWZpY2F0aW9uLFxyXG4gIEFjaGlldmVtZW50LFxyXG4gIFNlcnZpY2UsXHJcbiAgQ29udGFjdE1lc3NhZ2UsXHJcbn0gZnJvbSAnQC90eXBlcyc7XHJcblxyXG5leHBvcnQgY29uc3QgZGVmYXVsdFByb2ZpbGU6IFBvcnRmb2xpb0RhdGFbJ3Byb2ZpbGUnXSA9IHtcclxuICBuYW1lOiAnVWRlaCBTYW1zb24nLFxyXG4gIHRpdGxlOiAnRnVsbCBTdGFjayBFbmdpbmVlcicsXHJcbiAgdGFnbGluZTogJ0J1aWxkaW5nIHNjYWxhYmxlIGRpZ2l0YWwgZXhwZXJpZW5jZXMgdGhhdCBibGVuZCBwZXJmb3JtYW5jZSwgZGVzaWduLCBhbmQgaW50ZWxsaWdlbmNlLicsXHJcbiAgYmlvOiBgSSdtIFVkZWggU2Ftc29uLCBhIHJlc3VsdHMtZHJpdmVuIEZ1bGwgU3RhY2sgRW5naW5lZXIgd2l0aCBhIHBhc3Npb24gZm9yIHR1cm5pbmcgY29tcGxleCBwcm9ibGVtcyBpbnRvIGVsZWdhbnQsIGhpZ2gtcGVyZm9ybWFuY2Ugd2ViIGFuZCBtb2JpbGUgYXBwbGljYXRpb25zLiBPdmVyIHRoZSB5ZWFycyBJJ3ZlIGFyY2hpdGVjdGVkIHByb2R1Y3RzIGFjcm9zcyBmaW50ZWNoLCBlLWNvbW1lcmNlLCBTYWFTLCBhbmQgQUkgdG9vbGluZyBcdTIwMTQgZnJvbSBwaXhlbC1wZXJmZWN0IGZyb250ZW5kcyB0byByZXNpbGllbnQgYmFja2VuZCBzeXN0ZW1zLlxyXG5cclxuTXkgdG9vbGtpdCBzcGFucyBSZWFjdCwgTmV4dC5qcywgVHlwZVNjcmlwdCwgTm9kZS5qcywgUG9zdGdyZVNRTCwgUHJpc21hLCBhbmQgY2xvdWQgcGxhdGZvcm1zLiBJIGNhcmUgZGVlcGx5IGFib3V0IGFjY2Vzc2liaWxpdHksIFNFTywgY2xlYW4gYXJjaGl0ZWN0dXJlLCBhbmQgdXNlciBleHBlcmllbmNlLiBXaGV0aGVyIGxlYWRpbmcgYSB0ZWFtIG9yIHNoaXBwaW5nIHNvbG8sIEkgYnJpbmcgYSBwcm9kdWN0IG1pbmRzZXQgYW5kIGFuIG9ic2Vzc2lvbiBmb3IgcXVhbGl0eS5cclxuXHJcbldoZW4gSSdtIG5vdCBjb2RpbmcsIHlvdSdsbCBmaW5kIG1lIG1lbnRvcmluZyBkZXZlbG9wZXJzLCB3cml0aW5nIGFib3V0IGVuZ2luZWVyaW5nLCBvciBleHBsb3JpbmcgdGhlIGludGVyc2VjdGlvbiBvZiBkZXNpZ24gYW5kIHRlY2hub2xvZ3kuYCxcclxuICBzaG9ydEJpbzpcclxuICAgICdGdWxsIFN0YWNrIEVuZ2luZWVyIGNyYWZ0aW5nIHNjYWxhYmxlLCBhY2Nlc3NpYmxlLCBhbmQgdmlzdWFsbHkgc3R1bm5pbmcgd2ViICYgbW9iaWxlIGV4cGVyaWVuY2VzLicsXHJcbiAgZW1haWw6ICdoZWxsb0B1ZGVoc2Ftc29uLmRldicsXHJcbiAgcGhvbmU6ICcrMjM0IDgwMCAwMDAgMDAwMCcsXHJcbiAgbG9jYXRpb246ICdMYWdvcywgTmlnZXJpYScsXHJcbiAgd2Vic2l0ZTogJ2h0dHBzOi8vdWRlaHNhbXNvbi5kZXYnLFxyXG4gIGdpdGh1YjogJ2h0dHBzOi8vZ2l0aHViLmNvbS91ZGVoc2Ftc29uJyxcclxuICBsaW5rZWRpbjogJ2h0dHBzOi8vbGlua2VkaW4uY29tL2luL3VkZWhzYW1zb24nLFxyXG4gIHg6ICdodHRwczovL3guY29tL3VkZWhzYW1zb24nLFxyXG4gIHdoYXRzYXBwOiAnaHR0cHM6Ly93YS5tZS8yMzQ4MDAwMDAwMDAwJyxcclxuICBhdmF0YXI6ICcvaW1hZ2VzL3Byb2ZpbGUuanBnJyxcclxuICBjdlVybDogJy9yZXN1bWUucGRmJyxcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBkZWZhdWx0UHJvamVjdHM6IFByb2plY3RbXSA9IFtcclxuICB7XHJcbiAgICBpZDogJ3AxJyxcclxuICAgIHNsdWc6ICdmaW50cmFjay1wcm8nLFxyXG4gICAgdGl0bGU6ICdGaW5UcmFjayBQcm8nLFxyXG4gICAgZGVzY3JpcHRpb246XHJcbiAgICAgICdBIHJlYWwtdGltZSBwZXJzb25hbCBmaW5hbmNlIGRhc2hib2FyZCB3aXRoIG11bHRpLWN1cnJlbmN5IHN1cHBvcnQsIGJhbmsgc3luYywgYW5kIHByZWRpY3RpdmUgYW5hbHl0aWNzLicsXHJcbiAgICBjb250ZW50OiBgRmluVHJhY2sgUHJvIGhlbHBzIHVzZXJzIHRha2UgY29udHJvbCBvZiB0aGVpciBmaW5hbmNlcyB0aHJvdWdoIGFuIGludHVpdGl2ZSBkYXNoYm9hcmQuIFRoZSBwbGF0Zm9ybSBhZ2dyZWdhdGVzIHRyYW5zYWN0aW9ucyBmcm9tIG11bHRpcGxlIGJhbmsgYWNjb3VudHMsIGNhdGVnb3JpemVzIHNwZW5kaW5nIGF1dG9tYXRpY2FsbHksIGFuZCBzdXJmYWNlcyBhY3Rpb25hYmxlIGluc2lnaHRzIHVzaW5nIG1hY2hpbmUgbGVhcm5pbmcuXHJcblxyXG4jIyBUaGUgQ2hhbGxlbmdlXHJcbkJ1aWxkaW5nIGEgc2VjdXJlLCByZWFsLXRpbWUgZmluYW5jaWFsIGFnZ3JlZ2F0b3IgbWVhbnQgaGFuZGxpbmcgc2Vuc2l0aXZlIGRhdGEsIHVucmVsaWFibGUgYmFuayBBUElzLCBhbmQgY29tcGxleCBzdGF0ZSBzeW5jaHJvbml6YXRpb24gYWNyb3NzIGRldmljZXMuXHJcblxyXG4jIyBUaGUgU29sdXRpb25cclxuSSBhcmNoaXRlY3RlZCBhIE5leHQuanMgMTUgZnJvbnRlbmQgd2l0aCBzZXJ2ZXIgY29tcG9uZW50cyBmb3IgU0VPIGFuZCBwZXJmb3JtYW5jZSwgYmFja2VkIGJ5IGEgTm9kZS5qcyBtaWNyb3NlcnZpY2VzIGNsdXN0ZXIuIFBvc3RncmVTUUwgYW5kIFByaXNtYSBoYW5kbGVkIHJlbGF0aW9uYWwgZGF0YSwgd2hpbGUgUmVkaXMgcG93ZXJlZCBjYWNoaW5nIGFuZCByZWFsLXRpbWUgc2Vzc2lvbiBtYW5hZ2VtZW50LiBCYW5rIGludGVncmF0aW9ucyB1c2VkIE9BdXRoMiBhbmQgd2ViaG9vayByZWNvbmNpbGlhdGlvbiB0byBrZWVwIGJhbGFuY2VzIGFjY3VyYXRlIHdpdGhvdXQgcG9sbGluZy5gLFxyXG4gICAgaW1hZ2VzOiBbJy9pbWFnZXMvcHJvamVjdC1maW50cmFjay5qcGcnXSxcclxuICAgIHRlY2hub2xvZ2llczogWydOZXh0LmpzJywgJ1R5cGVTY3JpcHQnLCAnTm9kZS5qcycsICdQb3N0Z3JlU1FMJywgJ1ByaXNtYScsICdSZWRpcycsICdUYWlsd2luZCBDU1MnXSxcclxuICAgIGNhdGVnb3JpZXM6IFsnU2FhUycsICdGaW50ZWNoJ10sXHJcbiAgICBnaXRodWJVcmw6ICdodHRwczovL2dpdGh1Yi5jb20vdWRlaHNhbXNvbi9maW50cmFjay1wcm8nLFxyXG4gICAgbGl2ZVVybDogJ2h0dHBzOi8vZmludHJhY2stcHJvLnZlcmNlbC5hcHAnLFxyXG4gICAgZmVhdHVyZWQ6IHRydWUsXHJcbiAgICBjb21wbGV0aW9uRGF0ZTogJzIwMjQtMTEtMTUnLFxyXG4gICAgc3RhdHVzOiAncHVibGlzaGVkJyxcclxuICAgIHNlb1RpdGxlOiAnRmluVHJhY2sgUHJvIC0gUmVhbC10aW1lIFBlcnNvbmFsIEZpbmFuY2UgRGFzaGJvYXJkJyxcclxuICAgIHNlb0Rlc2NyaXB0aW9uOlxyXG4gICAgICAnQSByZWFsLXRpbWUgcGVyc29uYWwgZmluYW5jZSBkYXNoYm9hcmQgd2l0aCBtdWx0aS1jdXJyZW5jeSBzdXBwb3J0LCBiYW5rIHN5bmMsIGFuZCBwcmVkaWN0aXZlIGFuYWx5dGljcy4nLFxyXG4gICAgY2hhbGxlbmdlczpcclxuICAgICAgJ1NlY3VyZSBhZ2dyZWdhdGlvbiBvZiBzZW5zaXRpdmUgYmFuayBkYXRhLCB1bnJlbGlhYmxlIHRoaXJkLXBhcnR5IEFQSXMsIGFuZCByZWFsLXRpbWUgc3RhdGUgc3luYy4nLFxyXG4gICAgc29sdXRpb25zOlxyXG4gICAgICAnT0F1dGgyIGJhbmsgY29ubmVjdGlvbnMsIHdlYmhvb2sgcmVjb25jaWxpYXRpb24sIFJlZGlzIGNhY2hpbmcsIGFuZCBhIHJvYnVzdCBOb2RlLmpzIHNlcnZpY2UgbGF5ZXIuJyxcclxuICAgIHJlbGF0ZWRQcm9qZWN0SWRzOiBbJ3AyJywgJ3AzJ10sXHJcbiAgfSxcclxuICB7XHJcbiAgICBpZDogJ3AyJyxcclxuICAgIHNsdWc6ICduZXh1cy1jb21tZXJjZScsXHJcbiAgICB0aXRsZTogJ05leHVzIENvbW1lcmNlJyxcclxuICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAnSGVhZGxlc3MgZS1jb21tZXJjZSBzdG9yZWZyb250IHdpdGggcmVhbC10aW1lIGludmVudG9yeSwgQUkgc2VhcmNoLCBhbmQgc2VhbWxlc3MgY2hlY2tvdXQuJyxcclxuICAgIGNvbnRlbnQ6IGBOZXh1cyBDb21tZXJjZSByZWltYWdpbmVzIG9ubGluZSByZXRhaWwgd2l0aCBhIGhlYWRsZXNzIGFyY2hpdGVjdHVyZSwgc3ViLXNlY29uZCBwYWdlIGxvYWRzLCBhbmQgQUktcG93ZXJlZCBwcm9kdWN0IGRpc2NvdmVyeS4gTWVyY2hhbnRzIG1hbmFnZSBjYXRhbG9ncyB0aHJvdWdoIGEgZGVkaWNhdGVkIGFkbWluIGRhc2hib2FyZCB3aGlsZSBjdXN0b21lcnMgZW5qb3kgYSBwZXJzb25hbGl6ZWQgc2hvcHBpbmcgZXhwZXJpZW5jZS5cclxuXHJcbiMjIFRoZSBDaGFsbGVuZ2VcclxuTGVnYWN5IG1vbm9saXRoaWMgcGxhdGZvcm1zIHdlcmUgc2xvdywgaGFyZCB0byBjdXN0b21pemUsIGFuZCBleHBlbnNpdmUgdG8gc2NhbGUgZHVyaW5nIHRyYWZmaWMgc3Bpa2VzLlxyXG5cclxuIyMgVGhlIFNvbHV0aW9uXHJcbldlIGJ1aWx0IGEgZGVjb3VwbGVkIHN0b3JlZnJvbnQgaW4gTmV4dC5qcywgYSBOb2RlLmpzIG9yZGVyIHNlcnZpY2UsIGFuZCBQb3N0Z3JlU1FMIGZvciBpbnZlbnRvcnkuIEFsZ29saWEgaGFuZGxlZCBzZWFyY2gsIFN0cmlwZSBoYW5kbGVkIHBheW1lbnRzLCBhbmQgVmVyY2VsIEVkZ2UgTmV0d29yayBkZWxpdmVyZWQgZ2xvYmFsbHkgY2FjaGVkIHBhZ2VzLmAsXHJcbiAgICBpbWFnZXM6IFsnL2ltYWdlcy9wcm9qZWN0LW5leHVzLmpwZyddLFxyXG4gICAgdGVjaG5vbG9naWVzOiBbJ05leHQuanMnLCAnUmVhY3QnLCAnTm9kZS5qcycsICdQb3N0Z3JlU1FMJywgJ1N0cmlwZScsICdBbGdvbGlhJywgJ1RhaWx3aW5kIENTUyddLFxyXG4gICAgY2F0ZWdvcmllczogWydFLWNvbW1lcmNlJywgJ1NhYVMnXSxcclxuICAgIGdpdGh1YlVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS91ZGVoc2Ftc29uL25leHVzLWNvbW1lcmNlJyxcclxuICAgIGxpdmVVcmw6ICdodHRwczovL25leHVzLWNvbW1lcmNlLnZlcmNlbC5hcHAnLFxyXG4gICAgZmVhdHVyZWQ6IHRydWUsXHJcbiAgICBjb21wbGV0aW9uRGF0ZTogJzIwMjQtMDgtMjAnLFxyXG4gICAgc3RhdHVzOiAncHVibGlzaGVkJyxcclxuICAgIHNlb1RpdGxlOiAnTmV4dXMgQ29tbWVyY2UgLSBIZWFkbGVzcyBFLWNvbW1lcmNlIFBsYXRmb3JtJyxcclxuICAgIHNlb0Rlc2NyaXB0aW9uOlxyXG4gICAgICAnSGVhZGxlc3MgZS1jb21tZXJjZSBzdG9yZWZyb250IHdpdGggcmVhbC10aW1lIGludmVudG9yeSwgQUkgc2VhcmNoLCBhbmQgc2VhbWxlc3MgY2hlY2tvdXQuJyxcclxuICAgIHJlbGF0ZWRQcm9qZWN0SWRzOiBbJ3AxJywgJ3A0J10sXHJcbiAgfSxcclxuICB7XHJcbiAgICBpZDogJ3AzJyxcclxuICAgIHNsdWc6ICd0YXNrZmxvdy1haScsXHJcbiAgICB0aXRsZTogJ1Rhc2tGbG93IEFJJyxcclxuICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAnQUktYXNzaXN0ZWQgcHJvamVjdCBtYW5hZ2VtZW50IHRvb2wgdGhhdCBhdXRvLXByaW9yaXRpemVzIHRhc2tzIGFuZCBwcmVkaWN0cyBkZWxpdmVyeSBkYXRlcy4nLFxyXG4gICAgY29udGVudDogYFRhc2tGbG93IEFJIGNvbWJpbmVzIGthbmJhbi1zdHlsZSB0YXNrIG1hbmFnZW1lbnQgd2l0aCBuYXR1cmFsIGxhbmd1YWdlIHByb2Nlc3NpbmcgdG8gaGVscCB0ZWFtcyB3b3JrIHNtYXJ0ZXIuIFVzZXJzIGRlc2NyaWJlIGdvYWxzIGluIHBsYWluIEVuZ2xpc2ggYW5kIHRoZSBzeXN0ZW0gc3VnZ2VzdHMgdGFza3MsIGVzdGltYXRlcyBlZmZvcnQsIGFuZCBoaWdobGlnaHRzIHJpc2tzLlxyXG5cclxuIyMgVGhlIENoYWxsZW5nZVxyXG5UZWFtcyB3YXN0ZSBob3VycyBwbGFubmluZyBhbmQgcmVwcmlvcml0aXppbmcgd29yay4gRXhpc3RpbmcgdG9vbHMgYXJlIHJpZ2lkIGFuZCBkb24ndCBsZWFybiBmcm9tIHBhc3QgcHJvamVjdHMuXHJcblxyXG4jIyBUaGUgU29sdXRpb25cclxuQSBSZWFjdCBmcm9udGVuZCwgTm9kZS5qcyBiYWNrZW5kLCBhbmQgYSBQeXRob24gTUwgc2VydmljZSB3b3JrIHRvZ2V0aGVyLiBQb3N0Z3JlU1FMIHN0b3JlcyBwcm9qZWN0cyBhbmQgdGFza3MsIHdoaWxlIGEgZmluZS10dW5lZCBtb2RlbCBwcm92aWRlcyBwcmVkaWN0aW9ucyB2aWEgYSBSRVNUIEFQSS5gLFxyXG4gICAgaW1hZ2VzOiBbJy9pbWFnZXMvcHJvamVjdC10YXNrZmxvdy5qcGcnXSxcclxuICAgIHRlY2hub2xvZ2llczogWydSZWFjdCcsICdOb2RlLmpzJywgJ1B5dGhvbicsICdQb3N0Z3JlU1FMJywgJ09wZW5BSScsICdUYWlsd2luZCBDU1MnXSxcclxuICAgIGNhdGVnb3JpZXM6IFsnUHJvZHVjdGl2aXR5JywgJ0FJJ10sXHJcbiAgICBnaXRodWJVcmw6ICdodHRwczovL2dpdGh1Yi5jb20vdWRlaHNhbXNvbi90YXNrZmxvdy1haScsXHJcbiAgICBsaXZlVXJsOiAnaHR0cHM6Ly90YXNrZmxvdy1haS52ZXJjZWwuYXBwJyxcclxuICAgIGZlYXR1cmVkOiB0cnVlLFxyXG4gICAgY29tcGxldGlvbkRhdGU6ICcyMDI0LTA1LTEwJyxcclxuICAgIHN0YXR1czogJ3B1Ymxpc2hlZCcsXHJcbiAgICBzZW9UaXRsZTogJ1Rhc2tGbG93IEFJIC0gSW50ZWxsaWdlbnQgUHJvamVjdCBNYW5hZ2VtZW50JyxcclxuICAgIHNlb0Rlc2NyaXB0aW9uOlxyXG4gICAgICAnQUktYXNzaXN0ZWQgcHJvamVjdCBtYW5hZ2VtZW50IHRvb2wgdGhhdCBhdXRvLXByaW9yaXRpemVzIHRhc2tzIGFuZCBwcmVkaWN0cyBkZWxpdmVyeSBkYXRlcy4nLFxyXG4gICAgcmVsYXRlZFByb2plY3RJZHM6IFsncDEnLCAncDInXSxcclxuICB9LFxyXG4gIHtcclxuICAgIGlkOiAncDQnLFxyXG4gICAgc2x1ZzogJ2hlYWx0aHN5bmMnLFxyXG4gICAgdGl0bGU6ICdIZWFsdGhTeW5jJyxcclxuICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAnVGVsZWhlYWx0aCBwbGF0Zm9ybSBjb25uZWN0aW5nIHBhdGllbnRzIGFuZCBwcm92aWRlcnMgd2l0aCB2aWRlbyBjb25zdWx0YXRpb25zIGFuZCBoZWFsdGggcmVjb3Jkcy4nLFxyXG4gICAgY29udGVudDogYEhlYWx0aFN5bmMgc2ltcGxpZmllcyByZW1vdGUgY2FyZSBieSBjb21iaW5pbmcgYXBwb2ludG1lbnQgc2NoZWR1bGluZywgdmlkZW8gY2FsbHMsIGFuZCBlbmNyeXB0ZWQgaGVhbHRoIHJlY29yZHMgaW4gb25lIEhJUEFBLWFsaWduZWQgcGxhdGZvcm0uXHJcblxyXG4jIyBUaGUgQ2hhbGxlbmdlXHJcbkZyYWdtZW50ZWQgdG9vbHMgY3JlYXRlZCBmcmljdGlvbiBmb3IgcGF0aWVudHMgYW5kIHByb3ZpZGVycywgYW5kIGNvbXBsaWFuY2UgcmVxdWlyZW1lbnRzIHdlcmUgc3RyaWN0LlxyXG5cclxuIyMgVGhlIFNvbHV0aW9uXHJcbkEgTmV4dC5qcyBhcHBsaWNhdGlvbiB3aXRoIHJvbGUtYmFzZWQgYWNjZXNzIGNvbnRyb2wsIFdlYlJUQyB2aWRlbyB2aWEgRGFpbHkuY28sIGFuZCBlbmNyeXB0ZWQgUG9zdGdyZVNRTCBzdG9yYWdlLiBQcmlzbWEgbWlncmF0aW9ucyBrZXB0IHRoZSBzY2hlbWEgYXVkaXRhYmxlIGFuZCB0eXBlLXNhZmUuYCxcclxuICAgIGltYWdlczogWycvaW1hZ2VzL3Byb2plY3QtaGVhbHRoc3luYy5qcGcnXSxcclxuICAgIHRlY2hub2xvZ2llczogWydOZXh0LmpzJywgJ1R5cGVTY3JpcHQnLCAnUG9zdGdyZVNRTCcsICdQcmlzbWEnLCAnV2ViUlRDJywgJ1RhaWx3aW5kIENTUyddLFxyXG4gICAgY2F0ZWdvcmllczogWydIZWFsdGhUZWNoJywgJ1NhYVMnXSxcclxuICAgIGdpdGh1YlVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS91ZGVoc2Ftc29uL2hlYWx0aHN5bmMnLFxyXG4gICAgbGl2ZVVybDogJ2h0dHBzOi8vaGVhbHRoc3luYy52ZXJjZWwuYXBwJyxcclxuICAgIGZlYXR1cmVkOiBmYWxzZSxcclxuICAgIGNvbXBsZXRpb25EYXRlOiAnMjAyMy0xMi0wMScsXHJcbiAgICBzdGF0dXM6ICdwdWJsaXNoZWQnLFxyXG4gICAgc2VvVGl0bGU6ICdIZWFsdGhTeW5jIC0gTW9kZXJuIFRlbGVoZWFsdGggUGxhdGZvcm0nLFxyXG4gICAgc2VvRGVzY3JpcHRpb246XHJcbiAgICAgICdUZWxlaGVhbHRoIHBsYXRmb3JtIGNvbm5lY3RpbmcgcGF0aWVudHMgYW5kIHByb3ZpZGVycyB3aXRoIHZpZGVvIGNvbnN1bHRhdGlvbnMgYW5kIGhlYWx0aCByZWNvcmRzLicsXHJcbiAgICByZWxhdGVkUHJvamVjdElkczogWydwMiddLFxyXG4gIH0sXHJcbl07XHJcblxyXG5leHBvcnQgY29uc3QgZGVmYXVsdEJsb2dQb3N0czogQmxvZ1Bvc3RbXSA9IFtcclxuICB7XHJcbiAgICBpZDogJ2IxJyxcclxuICAgIHNsdWc6ICdzY2FsYWJsZS1uZXh0anMtYXJjaGl0ZWN0dXJlJyxcclxuICAgIHRpdGxlOiAnU2NhbGFibGUgTmV4dC5qcyBBcmNoaXRlY3R1cmUgZm9yIEVudGVycHJpc2UgQXBwcycsXHJcbiAgICBleGNlcnB0OlxyXG4gICAgICAnQSBkZWVwIGRpdmUgaW50byBmb2xkZXIgc3RydWN0dXJlLCBzZXJ2ZXIgY29tcG9uZW50cywgY2FjaGluZyBzdHJhdGVnaWVzLCBhbmQgZGVwbG95bWVudCBwYXR0ZXJucyB0aGF0IGtlZXAgbGFyZ2UgTmV4dC5qcyBjb2RlYmFzZXMgbWFpbnRhaW5hYmxlLicsXHJcbiAgICBjb250ZW50OiBgIyBTY2FsYWJsZSBOZXh0LmpzIEFyY2hpdGVjdHVyZSBmb3IgRW50ZXJwcmlzZSBBcHBzXHJcblxcYFxcYFxcYHRzeFxyXG4vLyBFeGFtcGxlIHNlcnZlciBjb21wb25lbnRcclxuYXN5bmMgZnVuY3Rpb24gRGFzaGJvYXJkUGFnZSgpIHtcclxuICBjb25zdCBkYXRhID0gYXdhaXQgZ2V0RGFzaGJvYXJkRGF0YSgpO1xyXG4gIHJldHVybiA8RGFzaGJvYXJkIGRhdGE9e2RhdGF9IC8+O1xyXG59XHJcblxcYFxcYFxcYFxyXG5cclxuQnVpbGRpbmcgZW50ZXJwcmlzZSBOZXh0LmpzIGFwcGxpY2F0aW9ucyByZXF1aXJlcyBkaXNjaXBsaW5lLiBJbiB0aGlzIHBvc3QgSSBzaGFyZSBwYXR0ZXJucyBmb3IgY29sb2NhdGluZyBmZWF0dXJlcywgaXNvbGF0aW5nIEFQSSBjbGllbnRzLCBhbmQgb3B0aW1pemluZyByZW5kZXJpbmcgd2l0aCB0aGUgQXBwIFJvdXRlci5gLFxyXG4gICAgY292ZXJJbWFnZTogJy9pbWFnZXMvYmxvZy1hcmNoaXRlY3R1cmUuanBnJyxcclxuICAgIGNhdGVnb3JpZXM6IFsnRW5naW5lZXJpbmcnLCAnTmV4dC5qcyddLFxyXG4gICAgdGFnczogWyduZXh0anMnLCAnYXJjaGl0ZWN0dXJlJywgJ3BlcmZvcm1hbmNlJywgJ3NlcnZlci1jb21wb25lbnRzJ10sXHJcbiAgICBmZWF0dXJlZDogdHJ1ZSxcclxuICAgIHB1Ymxpc2hlZEF0OiAnMjAyNS0wMS0xMCcsXHJcbiAgICByZWFkaW5nVGltZTogOCxcclxuICAgIHN0YXR1czogJ3B1Ymxpc2hlZCcsXHJcbiAgICBhdXRob3I6ICdVZGVoIFNhbXNvbicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBpZDogJ2IyJyxcclxuICAgIHNsdWc6ICd0eXBlc2NyaXB0LXN0cmljdC1wYXR0ZXJucycsXHJcbiAgICB0aXRsZTogJ1R5cGVTY3JpcHQgU3RyaWN0IFBhdHRlcm5zIFRoYXQgUHJldmVudCBCdWdzJyxcclxuICAgIGV4Y2VycHQ6XHJcbiAgICAgICdIb3cgc3RyaWN0IFR5cGVTY3JpcHQgc2V0dGluZ3MsIGJyYW5kZWQgdHlwZXMsIGFuZCB1dGlsaXR5IHR5cGVzIGNhbiBlbGltaW5hdGUgZW50aXJlIGNsYXNzZXMgb2YgcnVudGltZSBlcnJvcnMuJyxcclxuICAgIGNvbnRlbnQ6IGAjIFR5cGVTY3JpcHQgU3RyaWN0IFBhdHRlcm5zIFRoYXQgUHJldmVudCBCdWdzXHJcblxcYFxcYFxcYHRzXHJcbnR5cGUgVXNlcklkID0gc3RyaW5nICYgeyBfX2JyYW5kOiAnVXNlcklkJyB9O1xyXG5cXGBcXGBcXGBcclxuXHJcblN0cmljdCBtb2RlIGlzIGp1c3QgdGhlIGJlZ2lubmluZy4gTGVhcm4gaG93IGJyYW5kZWQgdHlwZXMsIGV4aGF1c3RpdmUgc3dpdGNoZXMsIGFuZCBtYXBwZWQgdHlwZXMgbWFrZSB5b3VyIGNvZGViYXNlIHNlbGYtZG9jdW1lbnRpbmcgYW5kIHNhZmVyLmAsXHJcbiAgICBjb3ZlckltYWdlOiAnL2ltYWdlcy9ibG9nLXR5cGVzY3JpcHQuanBnJyxcclxuICAgIGNhdGVnb3JpZXM6IFsnVHlwZVNjcmlwdCcsICdFbmdpbmVlcmluZyddLFxyXG4gICAgdGFnczogWyd0eXBlc2NyaXB0JywgJ3N0cmljdCcsICd0eXBlcyddLFxyXG4gICAgZmVhdHVyZWQ6IGZhbHNlLFxyXG4gICAgcHVibGlzaGVkQXQ6ICcyMDI0LTEyLTA1JyxcclxuICAgIHJlYWRpbmdUaW1lOiA2LFxyXG4gICAgc3RhdHVzOiAncHVibGlzaGVkJyxcclxuICAgIGF1dGhvcjogJ1VkZWggU2Ftc29uJyxcclxuICB9LFxyXG5dO1xyXG5cclxuZXhwb3J0IGNvbnN0IGRlZmF1bHRTa2lsbHM6IFNraWxsW10gPSBbXHJcbiAgeyBpZDogJ3MxJywgbmFtZTogJ1JlYWN0IC8gTmV4dC5qcycsIGNhdGVnb3J5OiAnRnJvbnRlbmQnLCBwcm9maWNpZW5jeTogOTggfSxcclxuICB7IGlkOiAnczInLCBuYW1lOiAnVHlwZVNjcmlwdCcsIGNhdGVnb3J5OiAnRnJvbnRlbmQnLCBwcm9maWNpZW5jeTogOTYgfSxcclxuICB7IGlkOiAnczMnLCBuYW1lOiAnVGFpbHdpbmQgQ1NTJywgY2F0ZWdvcnk6ICdGcm9udGVuZCcsIHByb2ZpY2llbmN5OiA5NSB9LFxyXG4gIHsgaWQ6ICdzNCcsIG5hbWU6ICdOb2RlLmpzJywgY2F0ZWdvcnk6ICdCYWNrZW5kJywgcHJvZmljaWVuY3k6IDk0IH0sXHJcbiAgeyBpZDogJ3M1JywgbmFtZTogJ1Bvc3RncmVTUUwnLCBjYXRlZ29yeTogJ0JhY2tlbmQnLCBwcm9maWNpZW5jeTogOTIgfSxcclxuICB7IGlkOiAnczYnLCBuYW1lOiAnUHJpc21hJywgY2F0ZWdvcnk6ICdCYWNrZW5kJywgcHJvZmljaWVuY3k6IDkwIH0sXHJcbiAgeyBpZDogJ3M3JywgbmFtZTogJ0dyYXBoUUwgLyB0UlBDJywgY2F0ZWdvcnk6ICdCYWNrZW5kJywgcHJvZmljaWVuY3k6IDg4IH0sXHJcbiAgeyBpZDogJ3M4JywgbmFtZTogJ0RvY2tlciAvIENJL0NEJywgY2F0ZWdvcnk6ICdEZXZPcHMnLCBwcm9maWNpZW5jeTogODUgfSxcclxuICB7IGlkOiAnczknLCBuYW1lOiAnQVdTIC8gVmVyY2VsJywgY2F0ZWdvcnk6ICdEZXZPcHMnLCBwcm9maWNpZW5jeTogODcgfSxcclxuICB7IGlkOiAnczEwJywgbmFtZTogJ1JlYWN0IE5hdGl2ZScsIGNhdGVnb3J5OiAnTW9iaWxlJywgcHJvZmljaWVuY3k6IDgyIH0sXHJcbl07XHJcblxyXG5leHBvcnQgY29uc3QgZGVmYXVsdEV4cGVyaWVuY2VzOiBFeHBlcmllbmNlW10gPSBbXHJcbiAge1xyXG4gICAgaWQ6ICdlMScsXHJcbiAgICByb2xlOiAnU2VuaW9yIEZ1bGwgU3RhY2sgRW5naW5lZXInLFxyXG4gICAgY29tcGFueTogJ1RlY2hWZXJzZSBTb2x1dGlvbnMnLFxyXG4gICAgbG9jYXRpb246ICdSZW1vdGUnLFxyXG4gICAgc3RhcnREYXRlOiAnMjAyMi0wMy0wMScsXHJcbiAgICBlbmREYXRlOiB1bmRlZmluZWQsXHJcbiAgICBjdXJyZW50OiB0cnVlLFxyXG4gICAgZGVzY3JpcHRpb246XHJcbiAgICAgICdMZWFkaW5nIGZyb250ZW5kIGFyY2hpdGVjdHVyZSBmb3IgYSBtdWx0aS10ZW5hbnQgU2FhUyBwbGF0Zm9ybSwgbWVudG9yaW5nIGVuZ2luZWVycywgYW5kIGRyaXZpbmcgcGVyZm9ybWFuY2UgaW5pdGlhdGl2ZXMgdGhhdCByZWR1Y2VkIHBhZ2UgbG9hZCB0aW1lcyBieSA0MCUuJyxcclxuICB9LFxyXG4gIHtcclxuICAgIGlkOiAnZTInLFxyXG4gICAgcm9sZTogJ0Z1bGwgU3RhY2sgRGV2ZWxvcGVyJyxcclxuICAgIGNvbXBhbnk6ICdJbm5vdmF0ZSBEaWdpdGFsJyxcclxuICAgIGxvY2F0aW9uOiAnTGFnb3MsIE5pZ2VyaWEnLFxyXG4gICAgc3RhcnREYXRlOiAnMjAyMC0wNi0wMScsXHJcbiAgICBlbmREYXRlOiAnMjAyMi0wMi0yOCcsXHJcbiAgICBjdXJyZW50OiBmYWxzZSxcclxuICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAnQnVpbHQgYW5kIG1haW50YWluZWQgY3VzdG9tZXItZmFjaW5nIGZpbnRlY2ggYXBwbGljYXRpb25zIHVzaW5nIFJlYWN0LCBOb2RlLmpzLCBhbmQgUG9zdGdyZVNRTCwgc2VydmluZyBvdmVyIDUwLDAwMCBtb250aGx5IGFjdGl2ZSB1c2Vycy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6ICdlMycsXHJcbiAgICByb2xlOiAnRnJvbnRlbmQgRW5naW5lZXInLFxyXG4gICAgY29tcGFueTogJ0NyZWF0aXZlIFN0dWRpbyBMYWJzJyxcclxuICAgIGxvY2F0aW9uOiAnTGFnb3MsIE5pZ2VyaWEnLFxyXG4gICAgc3RhcnREYXRlOiAnMjAxOC0wOS0wMScsXHJcbiAgICBlbmREYXRlOiAnMjAyMC0wNS0zMScsXHJcbiAgICBjdXJyZW50OiBmYWxzZSxcclxuICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAnRGV2ZWxvcGVkIHJlc3BvbnNpdmUgbWFya2V0aW5nIHNpdGVzIGFuZCBkZXNpZ24gc3lzdGVtcyBmb3IgY2xpZW50cyBhY3Jvc3MgZS1jb21tZXJjZSwgaGVhbHRoLCBhbmQgZmluYW5jZSBzZWN0b3JzLicsXHJcbiAgfSxcclxuXTtcclxuXHJcbmV4cG9ydCBjb25zdCBkZWZhdWx0VGVzdGltb25pYWxzOiBUZXN0aW1vbmlhbFtdID0gW1xyXG4gIHtcclxuICAgIGlkOiAndDEnLFxyXG4gICAgbmFtZTogJ0FtYXJhIE9rYWZvcicsXHJcbiAgICByb2xlOiAnUHJvZHVjdCBNYW5hZ2VyJyxcclxuICAgIGNvbXBhbnk6ICdUZWNoVmVyc2UgU29sdXRpb25zJyxcclxuICAgIGNvbnRlbnQ6XHJcbiAgICAgICdTYW1zb24gaXMgb25lIG9mIHRoZSBtb3N0IHJlbGlhYmxlIGVuZ2luZWVycyBJIGhhdmUgd29ya2VkIHdpdGguIEhlIGNvbWJpbmVzIHRlY2huaWNhbCBkZXB0aCB3aXRoIGRlc2lnbiBzZW5zaWJpbGl0eSBhbmQgYWx3YXlzIHNoaXBzIG9uIHRpbWUuJyxcclxuICAgIGF2YXRhcjogJy9pbWFnZXMvYXZhdGFyLTEuanBnJyxcclxuICB9LFxyXG4gIHtcclxuICAgIGlkOiAndDInLFxyXG4gICAgbmFtZTogJ0RhdmlkIENoZW4nLFxyXG4gICAgcm9sZTogJ0VuZ2luZWVyaW5nIExlYWQnLFxyXG4gICAgY29tcGFueTogJ0lubm92YXRlIERpZ2l0YWwnLFxyXG4gICAgY29udGVudDpcclxuICAgICAgJ0hpcyBhYmlsaXR5IHRvIGJyZWFrIGRvd24gY29tcGxleCByZXF1aXJlbWVudHMgaW50byBjbGVhbiwgbWFpbnRhaW5hYmxlIGNvZGUgaXMgZXhjZXB0aW9uYWwuIEEgdHJ1ZSBmdWxsLXN0YWNrIHBhcnRuZXIuJyxcclxuICAgIGF2YXRhcjogJy9pbWFnZXMvYXZhdGFyLTIuanBnJyxcclxuICB9LFxyXG4gIHtcclxuICAgIGlkOiAndDMnLFxyXG4gICAgbmFtZTogJ0ZhdGltYSBCZWxsbycsXHJcbiAgICByb2xlOiAnRm91bmRlcicsXHJcbiAgICBjb21wYW55OiAnTmV4dXMgQ29tbWVyY2UnLFxyXG4gICAgY29udGVudDpcclxuICAgICAgJ1NhbXNvbiB0cmFuc2Zvcm1lZCBvdXIgZS1jb21tZXJjZSB2aXNpb24gaW50byBhIGZhc3QsIGJlYXV0aWZ1bCBzdG9yZWZyb250LiBTYWxlcyBpbmNyZWFzZWQgc2lnbmlmaWNhbnRseSBhZnRlciBsYXVuY2guJyxcclxuICAgIGF2YXRhcjogJy9pbWFnZXMvYXZhdGFyLTMuanBnJyxcclxuICB9LFxyXG5dO1xyXG5cclxuZXhwb3J0IGNvbnN0IGRlZmF1bHRFZHVjYXRpb246IEVkdWNhdGlvbltdID0gW1xyXG4gIHtcclxuICAgIGlkOiAnZWQxJyxcclxuICAgIGRlZ3JlZTogJ0IuU2MuIENvbXB1dGVyIFNjaWVuY2UnLFxyXG4gICAgaW5zdGl0dXRpb246ICdVbml2ZXJzaXR5IG9mIExhZ29zJyxcclxuICAgIHllYXI6ICcyMDE0IC0gMjAxOCcsXHJcbiAgICBkZXNjcmlwdGlvbjogJ0ZpcnN0IENsYXNzIEhvbm91cnMuIEZvY3VzIG9uIHNvZnR3YXJlIGVuZ2luZWVyaW5nLCBhbGdvcml0aG1zLCBhbmQgZGF0YWJhc2VzLicsXHJcbiAgfSxcclxuXTtcclxuXHJcbmV4cG9ydCBjb25zdCBkZWZhdWx0Q2VydGlmaWNhdGlvbnM6IENlcnRpZmljYXRpb25bXSA9IFtcclxuICB7IGlkOiAnYzEnLCBuYW1lOiAnQVdTIENlcnRpZmllZCBTb2x1dGlvbnMgQXJjaGl0ZWN0JywgaXNzdWVyOiAnQW1hem9uIFdlYiBTZXJ2aWNlcycsIHllYXI6ICcyMDIzJyB9LFxyXG4gIHsgaWQ6ICdjMicsIG5hbWU6ICdHb29nbGUgVVggRGVzaWduIENlcnRpZmljYXRlJywgaXNzdWVyOiAnR29vZ2xlJywgeWVhcjogJzIwMjInIH0sXHJcbl07XHJcblxyXG5leHBvcnQgY29uc3QgZGVmYXVsdEFjaGlldmVtZW50czogQWNoaWV2ZW1lbnRbXSA9IFtcclxuICB7XHJcbiAgICBpZDogJ2ExJyxcclxuICAgIHRpdGxlOiAnT3BlbiBTb3VyY2UgQ29udHJpYnV0b3Igb2YgdGhlIFllYXInLFxyXG4gICAgeWVhcjogJzIwMjQnLFxyXG4gICAgZGVzY3JpcHRpb246ICdSZWNvZ25pemVkIGJ5IGEgbGVhZGluZyBSZWFjdCBjb21tdW5pdHkgZm9yIGNvbnRyaWJ1dGlvbnMgdG8gYWNjZXNzaWJpbGl0eSB0b29saW5nLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBpZDogJ2EyJyxcclxuICAgIHRpdGxlOiAnSGFja2F0aG9uIFdpbm5lciAtIEZpblRlY2ggVHJhY2snLFxyXG4gICAgeWVhcjogJzIwMjMnLFxyXG4gICAgZGVzY3JpcHRpb246ICdCdWlsdCBhIHJlYWwtdGltZSBwYXltZW50IHNwbGl0dGVyIHRoYXQgd29uIGZpcnN0IHBsYWNlIGF0IExhZ29zIFRlY2ggRmVzdC4nLFxyXG4gIH0sXHJcbl07XHJcblxyXG5leHBvcnQgY29uc3QgZGVmYXVsdFNlcnZpY2VzOiBTZXJ2aWNlW10gPSBbXHJcbiAge1xyXG4gICAgaWQ6ICdzdjEnLFxyXG4gICAgdGl0bGU6ICdGdWxsIFN0YWNrIERldmVsb3BtZW50JyxcclxuICAgIGRlc2NyaXB0aW9uOiAnRW5kLXRvLWVuZCB3ZWIgYW5kIG1vYmlsZSBhcHBsaWNhdGlvbnMgdXNpbmcgbW9kZXJuIHN0YWNrcyBhbmQgc2NhbGFibGUgYXJjaGl0ZWN0dXJlLicsXHJcbiAgICBpY29uOiAnTGF5ZXJzJyxcclxuICAgIGZlYXR1cmVzOiBbJ1JlYWN0IC8gTmV4dC5qcyBmcm9udGVuZCcsICdOb2RlLmpzIC8gUHl0aG9uIGJhY2tlbmQnLCAnUG9zdGdyZVNRTCAmIFByaXNtYSBPUk0nLCAnQ2xvdWQgZGVwbG95bWVudCddLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6ICdzdjInLFxyXG4gICAgdGl0bGU6ICdGcm9udGVuZCBFbmdpbmVlcmluZycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ1BpeGVsLXBlcmZlY3QsIGFjY2Vzc2libGUsIGFuZCBhbmltYXRlZCBpbnRlcmZhY2VzIHRoYXQgZGVsaWdodCB1c2VycyBhbmQgZHJpdmUgY29udmVyc2lvbnMuJyxcclxuICAgIGljb246ICdNb25pdG9yJyxcclxuICAgIGZlYXR1cmVzOiBbJ0Rlc2lnbiBzeXN0ZW0gaW1wbGVtZW50YXRpb24nLCAnUGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uJywgJ0FuaW1hdGlvbiAmIG1pY3JvLWludGVyYWN0aW9ucycsICdBMTF5ICYgU0VPJ10sXHJcbiAgfSxcclxuICB7XHJcbiAgICBpZDogJ3N2MycsXHJcbiAgICB0aXRsZTogJ0JhY2tlbmQgJiBBUEkgRGV2ZWxvcG1lbnQnLFxyXG4gICAgZGVzY3JpcHRpb246ICdSb2J1c3QgQVBJcywgbWljcm9zZXJ2aWNlcywgYW5kIGRhdGEgbGF5ZXJzIGRlc2lnbmVkIGZvciBzZWN1cml0eSwgc3BlZWQsIGFuZCBncm93dGguJyxcclxuICAgIGljb246ICdTZXJ2ZXInLFxyXG4gICAgZmVhdHVyZXM6IFsnUkVTVCAmIEdyYXBoUUwgQVBJcycsICdBdXRoZW50aWNhdGlvbiAmIGF1dGhvcml6YXRpb24nLCAnRGF0YWJhc2UgZGVzaWduJywgJ0NhY2hpbmcgJiBxdWV1ZXMnXSxcclxuICB9LFxyXG4gIHtcclxuICAgIGlkOiAnc3Y0JyxcclxuICAgIHRpdGxlOiAnTW9iaWxlIEFwcCBEZXZlbG9wbWVudCcsXHJcbiAgICBkZXNjcmlwdGlvbjogJ0Nyb3NzLXBsYXRmb3JtIG1vYmlsZSBleHBlcmllbmNlcyB3aXRoIFJlYWN0IE5hdGl2ZSBhbmQgRXhwby4nLFxyXG4gICAgaWNvbjogJ1NtYXJ0cGhvbmUnLFxyXG4gICAgZmVhdHVyZXM6IFsnaU9TICYgQW5kcm9pZCcsICdPZmZsaW5lLWZpcnN0IGFyY2hpdGVjdHVyZScsICdQdXNoIG5vdGlmaWNhdGlvbnMnLCAnQXBwIHN0b3JlIGRlcGxveW1lbnQnXSxcclxuICB9LFxyXG4gIHtcclxuICAgIGlkOiAnc3Y1JyxcclxuICAgIHRpdGxlOiAnVUkgSW1wbGVtZW50YXRpb24nLFxyXG4gICAgZGVzY3JpcHRpb246ICdUdXJuIEZpZ21hIGRlc2lnbnMgaW50byByZXNwb25zaXZlLCBjb21wb25lbnQtYmFzZWQgY29kZSB3aXRoIGRlc2lnbi10by1kZXYgcHJlY2lzaW9uLicsXHJcbiAgICBpY29uOiAnUGFsZXR0ZScsXHJcbiAgICBmZWF0dXJlczogWydGaWdtYSB0byBjb2RlJywgJ1RhaWx3aW5kIC8gQ1NTLWluLUpTJywgJ1N0b3J5Ym9vayBkb2N1bWVudGF0aW9uJywgJ1Jlc3BvbnNpdmUgbGF5b3V0cyddLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6ICdzdjYnLFxyXG4gICAgdGl0bGU6ICdDb25zdWx0aW5nICYgT3B0aW1pemF0aW9uJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnVGVjaG5pY2FsIGF1ZGl0cywgYXJjaGl0ZWN0dXJlIHJldmlld3MsIGFuZCBwZXJmb3JtYW5jZSBvcHRpbWl6YXRpb24gZm9yIGV4aXN0aW5nIHByb2R1Y3RzLicsXHJcbiAgICBpY29uOiAnVHJlbmRpbmdVcCcsXHJcbiAgICBmZWF0dXJlczogWydDb2RlIGF1ZGl0cycsICdQZXJmb3JtYW5jZSB0dW5pbmcnLCAnU2NhbGFiaWxpdHkgcGxhbm5pbmcnLCAnVGVhbSBtZW50b3JzaGlwJ10sXHJcbiAgfSxcclxuXTtcclxuXHJcbmV4cG9ydCBjb25zdCBkZWZhdWx0UG9ydGZvbGlvRGF0YTogUG9ydGZvbGlvRGF0YSA9IHtcclxuICBwcm9maWxlOiBkZWZhdWx0UHJvZmlsZSxcclxuICBwcm9qZWN0czogZGVmYXVsdFByb2plY3RzLFxyXG4gIGJsb2dQb3N0czogZGVmYXVsdEJsb2dQb3N0cyxcclxuICBza2lsbHM6IGRlZmF1bHRTa2lsbHMsXHJcbiAgZXhwZXJpZW5jZXM6IGRlZmF1bHRFeHBlcmllbmNlcyxcclxuICB0ZXN0aW1vbmlhbHM6IGRlZmF1bHRUZXN0aW1vbmlhbHMsXHJcbiAgbWVzc2FnZXM6IFtdIGFzIENvbnRhY3RNZXNzYWdlW10sXHJcbiAgZWR1Y2F0aW9uOiBkZWZhdWx0RWR1Y2F0aW9uLFxyXG4gIGNlcnRpZmljYXRpb25zOiBkZWZhdWx0Q2VydGlmaWNhdGlvbnMsXHJcbiAgYWNoaWV2ZW1lbnRzOiBkZWZhdWx0QWNoaWV2ZW1lbnRzLFxyXG4gIGFuYWx5dGljczoge1xyXG4gICAgcGFnZVZpZXdzOiBbXHJcbiAgICAgIHsgZGF0ZTogJ01vbicsIHZpZXdzOiA0MjAgfSxcclxuICAgICAgeyBkYXRlOiAnVHVlJywgdmlld3M6IDY1MCB9LFxyXG4gICAgICB7IGRhdGU6ICdXZWQnLCB2aWV3czogNTQwIH0sXHJcbiAgICAgIHsgZGF0ZTogJ1RodScsIHZpZXdzOiA4OTAgfSxcclxuICAgICAgeyBkYXRlOiAnRnJpJywgdmlld3M6IDcyMCB9LFxyXG4gICAgICB7IGRhdGU6ICdTYXQnLCB2aWV3czogMzgwIH0sXHJcbiAgICAgIHsgZGF0ZTogJ1N1bicsIHZpZXdzOiA0NjAgfSxcclxuICAgIF0sXHJcbiAgICBwcm9qZWN0Vmlld3M6IGRlZmF1bHRQcm9qZWN0cy5tYXAoKHApID0+ICh7IHByb2plY3RJZDogcC5pZCwgdmlld3M6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDApICsgMjAwIH0pKSxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHRlY2hTdGFjayA9IFtcclxuICAnUmVhY3QnLFxyXG4gICdOZXh0LmpzJyxcclxuICAnVHlwZVNjcmlwdCcsXHJcbiAgJ05vZGUuanMnLFxyXG4gICdQb3N0Z3JlU1FMJyxcclxuICAnUHJpc21hJyxcclxuICAnVGFpbHdpbmQgQ1NTJyxcclxuICAnRnJhbWVyIE1vdGlvbicsXHJcbiAgJ1RocmVlLmpzJyxcclxuICAnRG9ja2VyJyxcclxuXTtcclxuXHJcbmV4cG9ydCBjb25zdCBzaXRlQ29uZmlnID0ge1xyXG4gIG5hbWU6ICdVZGVoIFNhbXNvbicsXHJcbiAgdGl0bGU6ICdGdWxsIFN0YWNrIEVuZ2luZWVyICYgVUkvVVggRGVzaWduZXInLFxyXG4gIGRlc2NyaXB0aW9uOlxyXG4gICAgJ1BvcnRmb2xpbyBvZiBVZGVoIFNhbXNvbiwgYSBGdWxsIFN0YWNrIEVuZ2luZWVyIGJ1aWxkaW5nIHNjYWxhYmxlLCBhY2Nlc3NpYmxlLCBhbmQgdmlzdWFsbHkgc3R1bm5pbmcgZGlnaXRhbCBwcm9kdWN0cy4nLFxyXG4gIHVybDogJ2h0dHBzOi8vdWRlaHNhbXNvbi5kZXYnLFxyXG4gIHR3aXR0ZXI6ICdAdWRlaHNhbXNvbicsXHJcbn07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQURNSU5cXFxcRGVza3RvcFxcXFx1ZGVoXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBRE1JTlxcXFxEZXNrdG9wXFxcXHVkZWhcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FETUlOL0Rlc2t0b3AvdWRlaC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJ1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhhc3luYyAoeyBtb2RlIH0pID0+IHtcclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksIFsnVklURV8nLCAnTkVYVF9QVUJMSUNfJ10pO1xyXG4gIGlmIChlbnYuVklURV9HSVRIVUJfVE9LRU4gJiYgIXByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTikge1xyXG4gICAgcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOID0gZW52LlZJVEVfR0lUSFVCX1RPS0VOO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcGx1Z2lucyA9IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXTtcclxuICB0cnkge1xyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgY29uc3QgbSA9IGF3YWl0IGltcG9ydCgnLi8udml0ZS1zb3VyY2UtdGFncy5qcycpO1xyXG4gICAgcGx1Z2lucy5wdXNoKG0uc291cmNlVGFncygpKTtcclxuICB9IGNhdGNoIHt9XHJcblxyXG4gIGxldCBnaXRodWJBcGlIYW5kbGVyOiBhbnkgPSBudWxsO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBtb2QgPSBhd2FpdCBpbXBvcnQoJy4vYXBpL2dpdGh1Yi1hY3Rpdml0eS50cycpO1xyXG4gICAgZ2l0aHViQXBpSGFuZGxlciA9IG1vZC5kZWZhdWx0O1xyXG4gIH0gY2F0Y2gge31cclxuXHJcbiAgbGV0IHBvcnRmb2xpb0RhdGE6IGFueSA9IG51bGw7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGRhdGFNb2QgPSBhd2FpdCBpbXBvcnQoJy4vc3JjL2xpYi9kYXRhLnRzJyk7XHJcbiAgICBwb3J0Zm9saW9EYXRhID0gZGF0YU1vZC5kZWZhdWx0UG9ydGZvbGlvRGF0YTtcclxuICB9IGNhdGNoIHt9XHJcblxyXG4gIHBsdWdpbnMucHVzaCh7XHJcbiAgICBuYW1lOiAndml0ZTpsb2NhbC1hcGktbWlkZGxld2FyZScsXHJcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XHJcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsID8/ICcvJywgJ2h0dHA6Ly9sb2NhbGhvc3QnKTtcclxuICAgICAgICBjb25zdCBwYXRobmFtZSA9IHVybC5wYXRobmFtZTtcclxuXHJcbiAgICAgICAgaWYgKHBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9hcGkvJykpIHtcclxuICAgICAgICAgIGlmIChwYXRobmFtZSA9PT0gJy9hcGkvZ2l0aHViLWFjdGl2aXR5Jykge1xyXG4gICAgICAgICAgICAocmVxIGFzIGFueSkucXVlcnkgPSBPYmplY3QuZnJvbUVudHJpZXModXJsLnNlYXJjaFBhcmFtcy5lbnRyaWVzKCkpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFnaXRodWJBcGlIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgZW5oYW5jZWRSZXMgPSByZXMgYXMgYW55O1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGVuaGFuY2VkUmVzLnN0YXR1cyAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgIGVuaGFuY2VkUmVzLnN0YXR1cyA9IChjb2RlOiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGVuaGFuY2VkUmVzLnN0YXR1c0NvZGUgPSBjb2RlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVuaGFuY2VkUmVzO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBlbmhhbmNlZFJlcy5qc29uICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgZW5oYW5jZWRSZXMuanNvbiA9IChkYXRhOiB1bmtub3duKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlbmhhbmNlZFJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgICAgICBlbmhhbmNlZFJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgYXdhaXQgZ2l0aHViQXBpSGFuZGxlcihyZXEsIGVuaGFuY2VkUmVzLCBuZXh0KTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICBuZXh0KGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKHBvcnRmb2xpb0RhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgcGF5bG9hZHM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge1xyXG4gICAgICAgICAgICAgICcvYXBpL3Byb2plY3RzJzogcG9ydGZvbGlvRGF0YS5wcm9qZWN0cyxcclxuICAgICAgICAgICAgICAnL2FwaS9ibG9ncyc6IHBvcnRmb2xpb0RhdGEuYmxvZ1Bvc3RzLFxyXG4gICAgICAgICAgICAgICcvYXBpL3NraWxscyc6IHBvcnRmb2xpb0RhdGEuc2tpbGxzLFxyXG4gICAgICAgICAgICAgICcvYXBpL3Rlc3RpbW9uaWFscyc6IHBvcnRmb2xpb0RhdGEudGVzdGltb25pYWxzLFxyXG4gICAgICAgICAgICAgICcvYXBpL2V4cGVyaWVuY2UnOiBwb3J0Zm9saW9EYXRhLmV4cGVyaWVuY2VzLFxyXG4gICAgICAgICAgICAgICcvYXBpL2VkdWNhdGlvbic6IHBvcnRmb2xpb0RhdGEuZWR1Y2F0aW9uLFxyXG4gICAgICAgICAgICAgICcvYXBpL2NlcnRpZmljYXRpb25zJzogcG9ydGZvbGlvRGF0YS5jZXJ0aWZpY2F0aW9ucyxcclxuICAgICAgICAgICAgICAnL2FwaS9zZXJ2aWNlcyc6IHBvcnRmb2xpb0RhdGEuc2VydmljZXMgPz8gcG9ydGZvbGlvRGF0YS5zZXJ2aWNlcyxcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBwYXlsb2Fkc1twYXRobmFtZV07XHJcbiAgICAgICAgICAgIGlmIChwYXlsb2FkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkocGF5bG9hZCkpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDQ7XHJcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogYFVua25vd24gQVBJIHJvdXRlOiAke3BhdGhuYW1lfWAgfSkpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAzO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnQVBJIGRhdGEgc291cmNlIGlzIHVuYXZhaWxhYmxlIGluIGxvY2FsIGRldicgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5leHQoKTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICBjb25zdCBwcm9jZXNzRW52RGVmaW5lczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xyXG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGVudikpIHtcclxuICAgIHByb2Nlc3NFbnZEZWZpbmVzW2Bwcm9jZXNzLmVudi4ke2tleX1gXSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBwbHVnaW5zLFxyXG4gICAgZW52UHJlZml4OiBbJ1ZJVEVfJywgJ05FWFRfUFVCTElDXyddLFxyXG4gICAgZGVmaW5lOiBwcm9jZXNzRW52RGVmaW5lcyxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9O1xyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBR0EsZUFBTyxRQUErQixLQUFVLEtBQVU7QUFDeEQsUUFBTSxRQUFRLFFBQVEsSUFBSSxnQkFBZ0IsUUFBUSxJQUFJLHFCQUFxQixRQUFRLElBQUk7QUFDdkYsTUFBSSxDQUFDLE9BQU87QUFDVixXQUFPLElBQUksT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sa0NBQWtDLENBQUM7QUFBQSxFQUMxRTtBQUVBLFFBQU0sV0FBVyxPQUFPLElBQUksTUFBTSxhQUFhLFlBQVksSUFBSSxNQUFNLFNBQVMsS0FBSyxFQUFFLFNBQVMsSUFDMUYsSUFBSSxNQUFNLFNBQVMsS0FBSyxJQUN4QjtBQUVKLFFBQU0sUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFB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
