import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type {
  PortfolioData,
  Project,
  BlogPost,
  Skill,
  Experience,
  Testimonial,
  Profile,
  ContactMessage,
} from '@/types';
import { generateId, slugify } from '@/lib/utils';
import { defaultProfile, defaultPortfolioData, defaultAchievements, defaultPhilosophy } from '@/lib/data';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// In-memory auth token (cleared on page refresh — intentional)
let authToken: string | null = null;

// Subscription mechanism so all components share the same auth state
const authListeners = new Set<() => void>();

function subscribeToAuth(listener: () => void) {
  authListeners.add(listener);
  return () => { authListeners.delete(listener); };
}

function notifyAuthChange() {
  authListeners.forEach((listener) => listener());
}

function setAuthToken(token: string | null) {
  authToken = token;
  notifyAuthChange();
}

function getAuthToken() {
  return authToken;
}

// API helper - no auth required
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Seeds the recovered original content ONLY when the profile has no meaningful saved data.
// - field missing/undefined (pre-seed profile)  -> seed
// - `[]` (explicitly saved empty)              -> preserved as-is: an empty array is user data
// - array where every row is blank             -> artifact of the earlier broken save flow -> seed
// - array with at least one row with content   -> MongoDB is authoritative
function seededOrStored<T extends { title: string; description?: string; year?: string }>(
  items: T[] | undefined,
  seed: T[]
): T[] {
  if (!Array.isArray(items)) return seed;
  if (items.length === 0) return items;
  const hasContent = items.some(
    (item) => item.title.trim() !== '' || item.description?.trim() !== '' || item.year?.trim() !== ''
  );
  return hasContent ? items : seed;
}

// Fetch all portfolio data
async function fetchPortfolioData(): Promise<PortfolioData> {
  const [profile, projects, blogPosts, skills, experiences, testimonials, messages, analytics] =
    await Promise.all([
      apiFetch<Profile>('/api/profile'),
      apiFetch<Project[]>('/api/projects'),
      apiFetch<BlogPost[]>('/api/blogs'),
      apiFetch<Skill[]>('/api/skills'),
      apiFetch<Experience[]>('/api/experiences'),
      apiFetch<Testimonial[]>('/api/testimonials'),
      apiFetch<ContactMessage[]>('/api/messages'),
      apiFetch<{ pageViews: { date: string; views: number }[]; projectViews: { projectId: string; views: number }[] }>('/api/analytics'),
    ]);

  // Seed original content only when the profile has no meaningful saved data.
  // MongoDB is authoritative once real data exists (including an intentional empty array).
  const normalizedProfile: Profile = {
    ...profile,
    achievements: seededOrStored(profile.achievements, defaultAchievements),
    philosophy: seededOrStored(profile.philosophy, defaultPhilosophy),
  };

  return {
    profile: normalizedProfile,
    projects,
    blogPosts,
    skills,
    experiences,
    testimonials,
    messages,
    analytics,
    // These are not stored in DB but kept for type compatibility
    education: [],
    certifications: [],
    achievements: [],
  };
}

export function useContentStore() {
  const [data, setData] = useState<PortfolioData>({
    ...defaultPortfolioData,
    profile: defaultProfile,
    messages: [],
  });
  // Subscribe to module-level auth state so all components see the same value
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuth,
    () => !!authToken,
    () => false
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount (auth starts as logged out — token is memory-only)
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      const portfolioData = await fetchPortfolioData();
      setData(portfolioData);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Auth
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await apiFetch<{ authenticated: boolean; token: string }>(
        '/api/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      );
      if (result.authenticated && result.token) {
        setAuthToken(result.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout errors
    }
    setAuthToken(null);
  }, []);

  // Profile
  const updateProfile = useCallback(async (profile: Profile) => {
    try {
      const updated = await apiFetch<Profile>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      setData((prev) => ({ ...prev, profile: updated }));
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, []);

  // Projects
  const addProject = useCallback(async (project: Omit<Project, 'id' | 'slug'>) => {
    try {
      const newProject = await apiFetch<Project>('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ ...project, slug: slugify(project.title) }),
      });
      setData((prev) => ({
        ...prev,
        projects: [newProject, ...prev.projects],
      }));
      return newProject;
    } catch (error) {
      console.error('Failed to add project:', error);
      return undefined;
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const updated = await apiFetch<Project>(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...updates,
          slug: updates.title ? slugify(updates.title) : undefined,
        }),
      });
      setData((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updated } : p)),
      }));
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
      setData((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }, []);

  // Blog Posts
  const addBlogPost = useCallback(async (post: Omit<BlogPost, 'id' | 'slug' | 'readingTime'>) => {
    try {
      const readingTime = Math.max(1, Math.ceil(post.content.trim().split(/\s+/).length / 200));
      const newPost = await apiFetch<BlogPost>('/api/blogs', {
        method: 'POST',
        body: JSON.stringify({
          ...post,
          slug: slugify(post.title),
          readingTime,
        }),
      });
      setData((prev) => ({
        ...prev,
        blogPosts: [newPost, ...prev.blogPosts],
      }));
      return newPost;
    } catch (error) {
      console.error('Failed to add blog post:', error);
      return undefined;
    }
  }, []);

  const updateBlogPost = useCallback(async (id: string, updates: Partial<BlogPost>) => {
    try {
      const updated = await apiFetch<BlogPost>(`/api/blogs/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...updates,
          slug: updates.title ? slugify(updates.title) : undefined,
        }),
      });
      setData((prev) => ({
        ...prev,
        blogPosts: prev.blogPosts.map((b) => (b.id === id ? { ...b, ...updated } : b)),
      }));
    } catch (error) {
      console.error('Failed to update blog post:', error);
    }
  }, []);

  const deleteBlogPost = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/blogs/${id}`, { method: 'DELETE' });
      setData((prev) => ({
        ...prev,
        blogPosts: prev.blogPosts.filter((b) => b.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete blog post:', error);
    }
  }, []);

  // Skills
  const addSkill = useCallback(async (skill: Omit<Skill, 'id'>) => {
    try {
      const newSkill = await apiFetch<Skill>('/api/skills', {
        method: 'POST',
        body: JSON.stringify(skill),
      });
      setData((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
      return newSkill;
    } catch (error) {
      console.error('Failed to add skill:', error);
      return undefined;
    }
  }, []);

  const updateSkill = useCallback(async (id: string, updates: Partial<Skill>) => {
    try {
      const updated = await apiFetch<Skill>(`/api/skills/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setData((prev) => ({
        ...prev,
        skills: prev.skills.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }));
    } catch (error) {
      console.error('Failed to update skill:', error);
    }
  }, []);

  const deleteSkill = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/skills/${id}`, { method: 'DELETE' });
      setData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s.id !== id) }));
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  }, []);

  // Experiences
  const addExperience = useCallback(async (exp: Omit<Experience, 'id'>) => {
    try {
      const newExp = await apiFetch<Experience>('/api/experiences', {
        method: 'POST',
        body: JSON.stringify(exp),
      });
      setData((prev) => ({
        ...prev,
        experiences: [newExp, ...prev.experiences],
      }));
      return newExp;
    } catch (error) {
      console.error('Failed to add experience:', error);
      return undefined;
    }
  }, []);

  const updateExperience = useCallback(async (id: string, updates: Partial<Experience>) => {
    try {
      const updated = await apiFetch<Experience>(`/api/experiences/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setData((prev) => ({
        ...prev,
        experiences: prev.experiences.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      }));
    } catch (error) {
      console.error('Failed to update experience:', error);
    }
  }, []);

  const deleteExperience = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/experiences/${id}`, { method: 'DELETE' });
      setData((prev) => ({
        ...prev,
        experiences: prev.experiences.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete experience:', error);
    }
  }, []);

  // Testimonials
  const addTestimonial = useCallback(async (t: Omit<Testimonial, 'id'>) => {
    try {
      const newT = await apiFetch<Testimonial>('/api/testimonials', {
        method: 'POST',
        body: JSON.stringify(t),
      });
      setData((prev) => ({
        ...prev,
        testimonials: [newT, ...prev.testimonials],
      }));
      return newT;
    } catch (error) {
      console.error('Failed to add testimonial:', error);
      return undefined;
    }
  }, []);

  const updateTestimonial = useCallback(async (id: string, updates: Partial<Testimonial>) => {
    try {
      const updated = await apiFetch<Testimonial>(`/api/testimonials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setData((prev) => ({
        ...prev,
        testimonials: prev.testimonials.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
    } catch (error) {
      console.error('Failed to update testimonial:', error);
    }
  }, []);

  const deleteTestimonial = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      setData((prev) => ({
        ...prev,
        testimonials: prev.testimonials.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
    }
  }, []);

  // Messages
  const addMessage = useCallback(
    async (message: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => {
      try {
        const newMessage = await apiFetch<ContactMessage>('/api/messages', {
          method: 'POST',
          body: JSON.stringify({
            ...message,
            createdAt: new Date().toISOString(),
            status: 'new',
          }),
        });
        setData((prev) => ({
          ...prev,
          messages: [newMessage, ...prev.messages],
        }));
        return newMessage;
      } catch (error) {
        console.error('Failed to add message:', error);
        return undefined;
      }
    },
    []
  );

  const markMessageRead = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/messages/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'read' }),
      });
      setData((prev) => ({
        ...prev,
        messages: prev.messages.map((message) =>
          message.id === id ? { ...message, status: 'read' } : message
        ),
      }));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/messages/${id}`, { method: 'DELETE' });
      setData((prev) => ({
        ...prev,
        messages: prev.messages.filter((message) => message.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, []);

  // Analytics
  const recordProjectView = useCallback(async (projectId: string) => {
    try {
      await apiFetch('/api/analytics/project-view', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      });
      setData((prev) => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          projectViews: prev.analytics.projectViews.map((pv) =>
            pv.projectId === projectId ? { ...pv, views: pv.views + 1 } : pv
          ),
        },
      }));
    } catch (error) {
      console.error('Failed to record project view:', error);
    }
  }, []);

  const recordPageView = useCallback(async () => {
    try {
      await apiFetch('/api/analytics/page-view', { method: 'POST' });
      setData((prev) => {
        const views = [...prev.analytics.pageViews];
        const lastIndex = views.length - 1;
        if (views[lastIndex]) {
          views[lastIndex] = { ...views[lastIndex], views: views[lastIndex].views + 1 };
        }
        return { ...prev, analytics: { ...prev.analytics, pageViews: views } };
      });
    } catch (error) {
      console.error('Failed to record page view:', error);
    }
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    if (!confirm('This will replace all content with defaults. Continue?')) return;
    try {
      await apiFetch('/api/reset', { method: 'POST' });
      await loadData();
      toast.success('Data reset to defaults');
    } catch (error) {
      console.error('Failed to reset data:', error);
    }
  }, []);

  // Derived data
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
    isLoading,
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