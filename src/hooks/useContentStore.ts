import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Profile,
  ContactMessage,
} from '@/types';
import { generateId, slugify } from '@/lib/utils';
import { defaultPortfolioData } from '@/lib/data';

const STORAGE_KEY = 'udeh_samson_portfolio_v1';
const AUTH_KEY = 'udeh_samson_admin_session';

const ADMIN_PASSWORD =
  typeof import.meta.env !== 'undefined' && import.meta.env.VITE_ADMIN_PASSWORD
    ? import.meta.env.VITE_ADMIN_PASSWORD
    : 'tomoscodo';

function loadData(): PortfolioData {
  if (typeof window === 'undefined') return defaultPortfolioData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPortfolioData;
    const parsed = JSON.parse(raw) as PortfolioData;
    return { ...defaultPortfolioData, ...parsed };
  } catch {
    return defaultPortfolioData;
  }
}

function saveData(data: PortfolioData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function checkSession(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return false;
  try {
    const session = JSON.parse(raw) as { expiry: number };
    return session.expiry > Date.now();
  } catch {
    return false;
  }
}

function createSession() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ expiry: Date.now() + 1000 * 60 * 60 * 24 }) // 24h
  );
}

function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

export function useContentStore() {
  const [data, setData] = useState<PortfolioData>(loadData);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkSession);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const login = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      createSession();
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setIsAuthenticated(false);
  }, []);

  const updateProfile = useCallback((profile: Profile) => {
    setData((prev) => ({ ...prev, profile }));
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id' | 'slug'>) => {
    const newProject: Project = {
      ...project,
      id: generateId('p'),
      slug: slugify(project.title),
    };
    setData((prev) => ({
      ...prev,
      projects: [newProject, ...prev.projects],
    }));
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id
          ? { ...p, ...updates, slug: updates.title ? slugify(updates.title) : p.slug }
          : p
      ),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  }, []);

  const addBlogPost = useCallback((post: Omit<BlogPost, 'id' | 'slug' | 'readingTime'>) => {
    const newPost: BlogPost = {
      ...post,
      id: generateId('b'),
      slug: slugify(post.title),
      readingTime: Math.max(1, Math.ceil(post.content.trim().split(/\s+/).length / 200)),
    };
    setData((prev) => ({
      ...prev,
      blogPosts: [newPost, ...prev.blogPosts],
    }));
    return newPost;
  }, []);

  const updateBlogPost = useCallback((id: string, updates: Partial<BlogPost>) => {
    setData((prev) => ({
      ...prev,
      blogPosts: prev.blogPosts.map((b) => {
        if (b.id !== id) return b;
        const content = updates.content ?? b.content;
        return {
          ...b,
          ...updates,
          slug: updates.title ? slugify(updates.title) : b.slug,
          readingTime: Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200)),
        };
      }),
    }));
  }, []);

  const deleteBlogPost = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      blogPosts: prev.blogPosts.filter((b) => b.id !== id),
    }));
  }, []);

  const addSkill = useCallback((skill: Omit<Skill, 'id'>) => {
    const newSkill: Skill = { ...skill, id: generateId('s') };
    setData((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
    return newSkill;
  }, []);

  const updateSkill = useCallback((id: string, updates: Partial<Skill>) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const deleteSkill = useCallback((id: string) => {
    setData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s.id !== id) }));
  }, []);

  const addExperience = useCallback((exp: Omit<Experience, 'id'>) => {
    const newExp: Experience = { ...exp, id: generateId('e') };
    setData((prev) => ({
      ...prev,
      experiences: [newExp, ...prev.experiences],
    }));
    return newExp;
  }, []);

  const updateExperience = useCallback((id: string, updates: Partial<Experience>) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  }, []);

  const deleteExperience = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== id),
    }));
  }, []);

  const addTestimonial = useCallback((t: Omit<Testimonial, 'id'>) => {
    const newT: Testimonial = { ...t, id: generateId('t') };
    setData((prev) => ({
      ...prev,
      testimonials: [newT, ...prev.testimonials],
    }));
    return newT;
  }, []);

  const updateTestimonial = useCallback((id: string, updates: Partial<Testimonial>) => {
    setData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const deleteTestimonial = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id),
    }));
  }, []);

  const addMessage = useCallback(
    (message: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => {
      const newMessage: ContactMessage = {
        ...message,
        id: generateId('m'),
        createdAt: new Date().toISOString(),
        status: 'new',
      };
      setData((prev) => ({
        ...prev,
        messages: [newMessage, ...prev.messages],
      }));
      return newMessage;
    },
    []
  );

  const markMessageRead = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      messages: prev.messages.map((message) =>
        message.id === id ? { ...message, status: 'read' } : message
      ),
    }));
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      messages: prev.messages.filter((message) => message.id !== id),
    }));
  }, []);

  const recordProjectView = useCallback((projectId: string) => {
    setData((prev) => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        projectViews: prev.analytics.projectViews.map((pv) =>
          pv.projectId === projectId ? { ...pv, views: pv.views + 1 } : pv
        ),
      },
    }));
  }, []);

  const recordPageView = useCallback(() => {
    setData((prev) => {
      const views = [...prev.analytics.pageViews];
      const lastIndex = views.length - 1;
      views[lastIndex] = { ...views[lastIndex], views: views[lastIndex].views + 1 };
      return { ...prev, analytics: { ...prev.analytics, pageViews: views } };
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    if (confirm('This will replace all content with defaults. Continue?')) {
      setData(defaultPortfolioData);
    }
  }, []);

  const publishedProjects = useMemo(
    () => data.projects.filter((p) => p.status === 'published'),
    [data.projects]
  );
  const featuredProjects = useMemo(
    () => publishedProjects.filter((p) => p.featured),
    [publishedProjects]
  );
  const publishedBlogPosts = useMemo(
    () => data.blogPosts.filter((b) => b.status === 'published'),
    [data.blogPosts]
  );

  const unreadMessageCount = useMemo(
    () => data.messages.filter((message) => message.status === 'new').length,
    [data.messages]
  );

  return {
    data,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    addProject,
    updateProject,
    deleteProject,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    addSkill,
    updateSkill,
    deleteSkill,
    addExperience,
    updateExperience,
    deleteExperience,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    addMessage,
    markMessageRead,
    deleteMessage,
    recordProjectView,
    recordPageView,
    resetToDefaults,
    publishedProjects,
    featuredProjects,
    publishedBlogPosts,
    unreadMessageCount,
  };
}
