// Deterministic backend fixture payloads for the smoke tests. Test-only:
// excluded from the production bundle.
//
// These payloads mirror the *shape* of the real backend documents just well
// enough for every Home section to render. They are deliberately tiny and
// use marker strings (SMOKE-*) so assertions can distinguish real hydration
// output from the AppLoader boundary or any fictitious render fallback.
import type {
  BlogPost,
  ContactMessage,
  Experience,
  Profile,
  Project,
  SiteAnalytics,
  Skill,
  Testimonial,
} from '@/types';

export const smokeProfile: Profile = {
  name: 'SMOKE Test User',
  title: 'Smoke Engineer',
  tagline: 'A deterministic smoke-test profile.',
  bio: 'First paragraph.\n\nSecond paragraph.',
  shortBio: 'Smoke short bio.',
  email: 'smoke@example.com',
  phone: '+1 555 0100',
  location: 'Smoke City',
  website: 'https://smoke.example.com',
  github: 'https://github.com/smoke',
  linkedin: 'https://linkedin.com/in/smoke',
  x: 'https://x.com/smoke',
  whatsapp: 'https://wa.me/15550100',
  facebook: '',
  avatar: '/images/smoke-profile.jpg',
  cvUrl: '/smoke-resume.pdf',
  achievements: [
    { id: 'smoke-a1', title: 'SMOKE Achievement', year: '2026', description: 'Achieved smoke.' },
  ],
  philosophy: [{ id: 'smoke-p1', title: 'SMOKE Philosophy', description: 'Smoke deliberately.' }],
  yearsOfExperience: 3,
  clientSatisfaction: 99,
  projectsDelivered: 12,
  happyClients: 9,
  education: [
    {
      id: 'smoke-e1',
      degree: 'SMOKE Degree',
      institution: 'Smoke University',
      year: '2024',
      description: 'Studied smoke.',
    },
  ],
  certifications: [
    { id: 'smoke-c1', name: 'SMOKE Certified', issuer: 'Smoke Board', year: '2025' },
  ],
};

export const smokeProject: Project = {
  id: 'smoke-project-1',
  slug: 'smoke-project',
  title: 'SMOKE Project Alpha',
  description: 'A smoke-test project description.',
  content: 'Smoke project content.',
  images: ['/images/smoke-project.jpg'],
  technologies: ['SMOKE Stack'],
  categories: ['Smoke'],
  githubUrl: 'https://github.com/smoke/alpha',
  liveUrl: 'https://smoke-alpha.example.com',
  featured: true,
  completionDate: '2026-01-15',
  status: 'published',
  seoTitle: 'SMOKE Project Alpha',
  seoDescription: 'A smoke-test project description.',
  challenges: 'Smoke challenges.',
  solutions: 'Smoke solutions.',
  relatedProjectIds: [],
};

export const smokeBlogPost: BlogPost = {
  id: 'smoke-blog-1',
  slug: 'smoke-first-post',
  title: 'SMOKE First Post',
  excerpt: 'A smoke-test excerpt.',
  content: 'Smoke post content.\n\n## SMOKE Section\n\nMore smoke.',
  coverImage: '/images/smoke-blog.jpg',
  categories: ['Smoke'],
  tags: ['smoke'],
  featured: false,
  publishedAt: '2026-02-01',
  readingTime: 4,
  status: 'published',
  author: 'SMOKE Test User',
};

export const smokeSkill: Skill = {
  id: 'smoke-skill-1',
  name: 'SMOKE Skill',
  category: 'Smoke',
  proficiency: 90,
};

export const smokeExperience: Experience = {
  id: 'smoke-exp-1',
  role: 'SMOKE Engineer',
  company: 'Smoke Labs',
  location: 'Smoke City',
  startDate: '2023-01-01',
  current: true,
  description: 'Smoke experience.',
};

export const smokeTestimonial: Testimonial = {
  id: 'smoke-t-1',
  name: 'Smoke Client',
  role: 'SMOKE Reviewer',
  company: 'Smoke Corp',
  content: 'Excellent smoke.',
};

export const smokeMessages: ContactMessage[] = [];

export const smokeAnalytics: SiteAnalytics = {
  pageViews: [{ date: '2026-01-01', views: 7 }],
  projectViews: [{ projectId: 'smoke-project-1', views: 3 }],
};

// Minimal GitHub activity payload matching the section's data contract.
export const smokeGitHubActivity = {
  user: {
    login: 'smoke',
    name: 'SMOKE Test User',
    url: 'https://github.com/smoke',
    avatarUrl: 'https://github.com/smoke.png',
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: 11,
        weeks: [
          {
            contributionDays: [
              { date: '2026-01-05', contributionCount: 2, color: '#9be9a8' },
              { date: '2026-01-06', contributionCount: 0, color: '#ebedf0' },
            ],
          },
        ],
      },
    },
    repositoriesContributedTo: {
      nodes: [
        {
          name: 'smoke-repo',
          url: 'https://github.com/smoke/smoke-repo',
          description: 'A smoke repository.',
          stargazerCount: 5,
          forkCount: 1,
          primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
        },
      ],
    },
    pinnedItems: { nodes: [] },
  },
};
