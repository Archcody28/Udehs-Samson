import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
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
import { slugify } from '@/lib/utils';
import { defaultAchievements, defaultPhilosophy } from '@/lib/data';
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

/** Exposed for authenticated multipart uploads (avatar/CV) that bypass apiFetch. */
export function getAuthToken(): string | null {
  return authToken;
}

// API helper - attaches the admin Bearer token when present; public reads are
// unaffected (no header sent when logged out). FormData bodies keep their
// browser-generated multipart content type.
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
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
// Critical public content hydrates the app; messages/analytics are deferred
// (admin-only) and must never block or fail public hydration. The critical
// response carries real-but-empty placeholders for the two deferred
// collections so consumers always see a complete PortfolioData shape.
type DeferredData = Pick<PortfolioData, 'messages' | 'analytics'>;

async function fetchCriticalData(): Promise<PortfolioData> {
  const [profile, projects, blogPosts, skills, experiences, testimonials] =
    await Promise.all([
      apiFetch<Profile>('/api/profile'),
      apiFetch<Project[]>('/api/projects'),
      apiFetch<BlogPost[]>('/api/blogs'),
      apiFetch<Skill[]>('/api/skills'),
      apiFetch<Experience[]>('/api/experiences'),
      apiFetch<Testimonial[]>('/api/testimonials'),
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
    // Deferred placeholders: real messages/analytics merge in later via
    // loadDeferredData(). Never block public hydration on admin-only data.
    messages: [],
    analytics: { pageViews: [], projectViews: [] },
    // Canonical profile-owned collections (match Mongoose Profile shape).
    // Top-level copies mirror profile so legacy readers stay consistent.
    education: normalizedProfile.education ?? [],
    certifications: normalizedProfile.certifications ?? [],
    achievements: normalizedProfile.achievements ?? [],
  };
}

async function fetchDeferredData(): Promise<DeferredData> {
  const [messages, analytics] = await Promise.all([
    apiFetch<ContactMessage[]>('/api/messages'),
    apiFetch<{ pageViews: { date: string; views: number }[]; projectViews: { projectId: string; views: number }[] }>('/api/analytics'),
  ]);
  return { messages, analytics };
}

// Module-level fetch guards: exactly one hydration request cycle per page load,
// shared by every consumer. Covers StrictMode double-mount and N-instance mounts.
// Critical and deferred cycles each have their own guard.
let criticalPromise: Promise<PortfolioData> | null = null;
let criticalStarted = false;
let deferredPromise: Promise<DeferredData> | null = null;
let deferredStarted = false;

export interface ContentStoreValue {
  /** Null until the first successful hydration — never fictitious defaults. */
  data: PortfolioData | null;
  isLoading: boolean;
  isHydrated: boolean;
  loadError: string | null;
  loadData: (force?: boolean) => Promise<void>;
  /** Admin-only content: loads independently, never blocks public hydration. */
  isDeferredLoading: boolean;
  isDeferredLoaded: boolean;
  deferredError: string | null;
  loadDeferredData: (force?: boolean) => Promise<void>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profile: Profile, options?: { avatarUrl?: string }) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'slug'>) => Promise<Project | undefined>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addBlogPost: (post: Omit<BlogPost, 'id' | 'slug' | 'readingTime'>) => Promise<BlogPost | undefined>;
  updateBlogPost: (id: string, updates: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  addSkill: (skill: Omit<Skill, 'id'>) => Promise<Skill | undefined>;
  updateSkill: (id: string, updates: Partial<Skill>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  addExperience: (exp: Omit<Experience, 'id'>) => Promise<Experience | undefined>;
  updateExperience: (id: string, updates: Partial<Experience>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  addTestimonial: (t: Omit<Testimonial, 'id'>) => Promise<Testimonial | undefined>;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  addMessage: (message: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => Promise<ContactMessage | undefined>;
  markMessageRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  recordProjectView: (projectId: string) => Promise<void>;
  recordPageView: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
  publishedProjects: Project[];
  featuredProjects: Project[];
  publishedBlogPosts: BlogPost[];
  unreadMessageCount: number;
}

const ContentContext = createContext<ContentStoreValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  // Explicitly unloaded: no fictitious projects/profile/blogs/skills/etc.
  // updateData applies a patch only once real data exists (CRUD/analytics),
  // guarding every setData updater below against the null pre-hydration state.
  const [data, setData] = useState<PortfolioData | null>(null);
  const updateData = useCallback((patch: (prev: PortfolioData) => PortfolioData) => {
    setData((prev) => (prev ? patch(prev) : prev));
  }, []);
  // Subscribe to module-level auth state so all components see the same value
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuth,
    () => !!authToken,
    () => false
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const hydratedRef = useRef(false);
  const deferredLoadedRef = useRef(false);
  const [isDeferredLoading, setIsDeferredLoading] = useState(false);
  const [isDeferredLoaded, setIsDeferredLoaded] = useState(false);
  const [deferredError, setDeferredError] = useState<string | null>(null);

  // Stable, guarded critical loader: concurrent callers share one in-flight
  // promise. force=true (retry / reset) starts a fresh cycle.
  const loadData = useCallback(async (force = false) => {
    if (criticalPromise && !force) {
      try {
        const portfolioData = await criticalPromise;
        setData(portfolioData);
        setIsHydrated(true);
        hydratedRef.current = true;
      } catch {
        // Error state already recorded by the owning cycle; keep flags as-is.
      }
      return;
    }
    if (criticalStarted && hydratedRef.current && !force) return;
    criticalStarted = true;
    setIsLoading(true);
    setLoadError(null);
    const cycle = fetchCriticalData();
    criticalPromise = cycle;
    try {
      const portfolioData = await cycle;
      setData(portfolioData);
      setIsHydrated(true);
      hydratedRef.current = true;
    } catch (error) {
      // Allow retry after failure.
      criticalPromise = null;
      criticalStarted = false;
      const message = error instanceof Error ? error.message : 'Failed to load portfolio data';
      console.error('Failed to load portfolio data:', error);
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Deferred (admin-only) loader: messages + analytics merge into the existing
  // critical data. Failures are isolated — public hydration never depends on
  // this cycle. Concurrent callers share one in-flight promise.
  const loadDeferredData = useCallback(async (force = false) => {
    if (deferredPromise && !force) {
      try {
        const deferred = await deferredPromise;
        updateData((prev) => ({ ...prev, messages: deferred.messages, analytics: deferred.analytics }));
        setIsDeferredLoaded(true);
        deferredLoadedRef.current = true;
      } catch {
        // Deferred error already recorded; public data untouched.
      }
      return;
    }
    if (deferredStarted && deferredLoadedRef.current && !force) return;
    deferredStarted = true;
    setIsDeferredLoading(true);
    setDeferredError(null);
    const cycle = fetchDeferredData();
    deferredPromise = cycle;
    try {
      const deferred = await cycle;
      updateData((prev) => ({ ...prev, messages: deferred.messages, analytics: deferred.analytics }));
      deferredLoadedRef.current = true;
      setIsDeferredLoaded(true);
    } catch (error) {
      // Allow retry; never touch critical data or public hydration flags.
      deferredPromise = null;
      deferredStarted = false;
      const message = error instanceof Error ? error.message : 'Failed to load messages/analytics';
      console.error('Failed to load deferred content:', error);
      setDeferredError(message);
    } finally {
      setIsDeferredLoading(false);
    }
  }, []);

  // Single hydration kickoff for the whole app (StrictMode-safe via guards).
  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Manual refresh entry points (retry button, admin reset) bypass the guard.
  const reloadData = useCallback(() => loadData(true), [loadData]);

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
  const updateProfile = useCallback(async (profile: Profile, options: { avatarUrl?: string } = {}) => {
    // The avatar owns its own upload path (POST /api/profile/avatar) and is
    // never sent inline here — this keeps base64 out of the profile write.
    // A freshly uploaded URL can be merged locally via options.avatarUrl.
    const { avatar: _currentAvatar, ...profileWithoutAvatar } = profile;
    void _currentAvatar;
    try {
      const updated = await apiFetch<Profile>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profileWithoutAvatar),
      });
      updateData((prev) => ({
        ...prev,
        profile: options.avatarUrl ? { ...updated, avatar: options.avatarUrl } : updated,
        // Keep top-level mirrors consistent with canonical profile collections.
        education: updated.education ?? [],
        certifications: updated.certifications ?? [],
        achievements: updated.achievements ?? [],
      }));
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
      updateData((prev) => ({
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
      updateData((prev) => ({
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
      updateData((prev) => ({
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
      updateData((prev) => ({
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
      updateData((prev) => ({
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
      updateData((prev) => ({
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
      updateData((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
      return newSkill;
    } catch (error) {
      console.error('Failed to add skill:', error);
      return undefined;
    }
  }, []);

  const updateSkill = useCallback(async (id: string, updates: Partial<Skill>) => {
    try {
      await apiFetch<Skill>(`/api/skills/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      updateData((prev) => ({
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
      updateData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s.id !== id) }));
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
      updateData((prev) => ({
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
      await apiFetch<Experience>(`/api/experiences/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      updateData((prev) => ({
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
      updateData((prev) => ({
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
      updateData((prev) => ({
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
      await apiFetch<Testimonial>(`/api/testimonials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      updateData((prev) => ({
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
      updateData((prev) => ({
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
        updateData((prev) => ({
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
      updateData((prev) => ({
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
      updateData((prev) => ({
        ...prev,
        messages: prev.messages.filter((message) => message.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, []);

  // Analytics (write-through; safe when analytics not yet deferred-loaded)
  const recordProjectView = useCallback(async (projectId: string) => {
    try {
      await apiFetch('/api/analytics/project-view', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      });
      updateData((prev) => ({
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
      updateData((prev) => {
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
      await loadData(true);
      // Re-merge admin-only content after reset; isolated from public flags.
      await loadDeferredData(true);
      toast.success('Data reset to defaults');
    } catch (error) {
      console.error('Failed to reset data:', error);
    }
  }, [loadData, loadDeferredData]);

  // Derived data (empty until hydration — never fake defaults)
  // Deps target the specific collections so unrelated state changes (e.g.
  // deferred messages/analytics merge) do not recompute these.
  const projectsCollection = data?.projects;
  const blogPostsCollection = data?.blogPosts;
  const messagesCollection = data?.messages;
  const publishedProjects = useMemo(
    () => projectsCollection?.filter((p) => p.status === 'published') ?? [],
    [projectsCollection]
  );
  const featuredProjects = useMemo(
    () => publishedProjects.filter((p) => p.featured),
    [publishedProjects]
  );
  const publishedBlogPosts = useMemo(
    () => blogPostsCollection?.filter((b) => b.status === 'published') ?? [],
    [blogPostsCollection]
  );
  const unreadMessageCount = useMemo(
    () => messagesCollection?.filter((message) => message.status === 'new').length ?? 0,
    [messagesCollection]
  );

  const value = useMemo(
    () => ({
      data,
      isLoading,
      isHydrated,
      loadError,
      loadData: reloadData,
      isDeferredLoading,
      isDeferredLoaded,
      deferredError,
      loadDeferredData,
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
    }),
    [
      data,
      isLoading,
      isHydrated,
      loadError,
      reloadData,
      isDeferredLoading,
      isDeferredLoaded,
      deferredError,
      loadDeferredData,
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
    ]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

// Compatibility API: every consumer reads the single provider-owned state.
// No local useState/useEffect/fetch here — mounting never refetches.
export function useContentStore(): ContentStoreValue {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error('useContentStore must be used within <ContentProvider>');
  }
  return ctx;
}

/* ---------------------------------------------------------------------------
 * Focused read hooks (F32a.6)
 *
 * Each hook subscribes to the smallest slice a component needs. Because the
 * provider memoizes its context value, returning slices of it keeps referential
 * stability while narrowing what a component's re-render depends on in intent.
 * Presentation components should prefer these over useContentStore().
 * ------------------------------------------------------------------------- */

/** Hydration/lifecycle flags only (App shell, loading boundaries). */
export function useContentStatus() {
  const { data, isLoading, isHydrated, loadError, loadData } = useContentStore();
  return { data, isLoading, isHydrated, loadError, loadData };
}

/** Profile only (Hero, Footer, SEO, AboutIntro, About, Resume, Contact). */
export function useProfile(): Profile | null {
  return useContentStore().data?.profile ?? null;
}

/** Skills collection. */
export function useSkills(): Skill[] {
  return useContentStore().data?.skills ?? [];
}

/** Experiences collection (Timeline, Resume). */
export function useExperiences(): Experience[] {
  return useContentStore().data?.experiences ?? [];
}

/** Testimonials collection. */
export function useTestimonials(): Testimonial[] {
  return useContentStore().data?.testimonials ?? [];
}

/** Authoritative published projects (public pages). */
export function usePublishedProjects(): Project[] {
  return useContentStore().publishedProjects;
}

/** Featured subset of published projects (Home Projects section). */
export function useFeaturedProjects(): Project[] {
  return useContentStore().featuredProjects;
}

/** Authoritative published blog posts (public pages). */
export function usePublishedBlogPosts(): BlogPost[] {
  return useContentStore().publishedBlogPosts;
}

/** Profile-owned canonical education/certifications/achievements. */
export function useProfileCollections() {
  const profile = useProfile();
  return {
    education: profile?.education ?? [],
    certifications: profile?.certifications ?? [],
    achievements: profile?.achievements ?? [],
    philosophy: profile?.philosophy ?? [],
  };
}

/* ---------------------------------------------------------------------------
 * Write/admin hook (F32a.6)
 *
 * Mutation capabilities are requested explicitly. Public presentation
 * components never receive these. The exception is addMessage: visitors
 * submit the contact form, so it is intentionally part of the public write
 * surface — expose it via useContentActions() where needed.
 * ------------------------------------------------------------------------- */

export interface ContentActions {
  /** Public write: visitor contact-form submission. */
  addMessage: ContentStoreValue['addMessage'];
  /** Analytics writes (fire-and-forget side effects). */
  recordProjectView: ContentStoreValue['recordProjectView'];
  recordPageView: ContentStoreValue['recordPageView'];
  /** Admin-only content mutations. */
  updateProfile: ContentStoreValue['updateProfile'];
  addProject: ContentStoreValue['addProject'];
  updateProject: ContentStoreValue['updateProject'];
  deleteProject: ContentStoreValue['deleteProject'];
  addBlogPost: ContentStoreValue['addBlogPost'];
  updateBlogPost: ContentStoreValue['updateBlogPost'];
  deleteBlogPost: ContentStoreValue['deleteBlogPost'];
  addSkill: ContentStoreValue['addSkill'];
  updateSkill: ContentStoreValue['updateSkill'];
  deleteSkill: ContentStoreValue['deleteSkill'];
  addExperience: ContentStoreValue['addExperience'];
  updateExperience: ContentStoreValue['updateExperience'];
  deleteExperience: ContentStoreValue['deleteExperience'];
  addTestimonial: ContentStoreValue['addTestimonial'];
  updateTestimonial: ContentStoreValue['updateTestimonial'];
  deleteTestimonial: ContentStoreValue['deleteTestimonial'];
  markMessageRead: ContentStoreValue['markMessageRead'];
  deleteMessage: ContentStoreValue['deleteMessage'];
  /** Admin lifecycle: deferred hydration + full reset. */
  loadDeferredData: ContentStoreValue['loadDeferredData'];
  resetToDefaults: ContentStoreValue['resetToDefaults'];
}

export function useContentActions(): ContentActions {
  const s = useContentStore();
  return {
    addMessage: s.addMessage,
    recordProjectView: s.recordProjectView,
    recordPageView: s.recordPageView,
    updateProfile: s.updateProfile,
    addProject: s.addProject,
    updateProject: s.updateProject,
    deleteProject: s.deleteProject,
    addBlogPost: s.addBlogPost,
    updateBlogPost: s.updateBlogPost,
    deleteBlogPost: s.deleteBlogPost,
    addSkill: s.addSkill,
    updateSkill: s.updateSkill,
    deleteSkill: s.deleteSkill,
    addExperience: s.addExperience,
    updateExperience: s.updateExperience,
    deleteExperience: s.deleteExperience,
    addTestimonial: s.addTestimonial,
    updateTestimonial: s.updateTestimonial,
    deleteTestimonial: s.deleteTestimonial,
    markMessageRead: s.markMessageRead,
    deleteMessage: s.deleteMessage,
    loadDeferredData: s.loadDeferredData,
    resetToDefaults: s.resetToDefaults,
  };
}

/** Test-only: resets all module-level hydration guards and auth state so each
 * test starts with a clean singleton (no stale promises / flags carried over).
 * Not called in production — only invoked from the vitest setup `beforeEach`. */
export function __resetContentStoreGuards(): void {
  criticalPromise = null;
  criticalStarted = false;
  deferredPromise = null;
  deferredStarted = false;
  authToken = null;
  authListeners.clear();
}
