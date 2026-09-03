export interface Profile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  shortBio: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  x: string;
  whatsapp: string;
  avatar: string;
  cvUrl: string;
  yearsOfExperience: number;
  clientSatisfaction: number;
  projectsDelivered: number;
  happyClients: number;
  education: Education[];
  certifications: Certification[];
}

export type ContentStatus = 'draft' | 'published';

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  images: string[];
  videoUrl?: string;
  technologies: string[];
  categories: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  completionDate: string;
  status: ContentStatus;
  seoTitle?: string;
  seoDescription?: string;
  challenges?: string;
  solutions?: string;
  relatedProjectIds?: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  categories: string[];
  tags: string[];
  featured: boolean;
  publishedAt: string;
  readingTime: number;
  status: ContentStatus;
  author: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  url?: string;
}

export interface Achievement {
  id: string;
  title: string;
  year: string;
  description: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface PageView {
  date: string;
  views: number;
}

export interface ProjectView {
  projectId: string;
  views: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read';
}

export interface SiteAnalytics {
  pageViews: PageView[];
  projectViews: ProjectView[];
}

export interface PortfolioData {
  profile: Profile;
  projects: Project[];
  blogPosts: BlogPost[];
  skills: Skill[];
  experiences: Experience[];
  testimonials: Testimonial[];
  education: Education[];
  certifications: Certification[];
  achievements: Achievement[];
  messages: ContactMessage[];
  analytics: SiteAnalytics;
}
