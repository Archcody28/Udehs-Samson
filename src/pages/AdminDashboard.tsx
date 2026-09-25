import { useState, useEffect, type ChangeEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Wrench,
  Briefcase,
  MessageSquare,
  Mail,
  User,
  BarChart3,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { SEO } from '@/components/layout/SEO';
import { useContentStore, getAuthToken, type ContentStoreValue } from '@/hooks/useContentStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getBase64Image, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type {
  Project,
  BlogPost,
  Skill,
  Experience,
  Testimonial,
} from '@/types';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const projectSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  content: z.string().min(10),
  categories: z.string().min(1),
  technologies: z.string().min(1),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  completionDate: z.string().min(1),
  featured: z.boolean().optional(),
  status: z.enum(['draft', 'published']),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  challenges: z.string().optional(),
  solutions: z.string().optional(),
});

type ProjectForm = z.infer<typeof projectSchema>;

const blogSchema = z.object({
  title: z.string().min(2),
  excerpt: z.string().min(10),
  content: z.string().min(10),
  categories: z.string().min(1),
  tags: z.string().min(1),
  featured: z.boolean().optional(),
  status: z.enum(['draft', 'published']),
  publishedAt: z.string().min(1),
  author: z.string().min(1),
});

type BlogForm = z.infer<typeof blogSchema>;

const skillSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  proficiency: z.coerce.number().min(0).max(100),
});

type SkillForm = z.infer<typeof skillSchema>;

const experienceSchema = z.object({
  role: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().min(10),
});

type ExperienceForm = z.infer<typeof experienceSchema>;

const testimonialSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  company: z.string().min(1),
  content: z.string().min(10),
});

type TestimonialForm = z.infer<typeof testimonialSchema>;

const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  bio: z.string().min(10),
  shortBio: z.string().min(10),
  email: z.string().email(),
  phone: z.string().min(1),
  location: z.string().min(1),
  website: z.string().url(),
  github: z.string().url(),
  linkedin: z.union([z.string().url(), z.literal('')]),
  x: z.union([z.string().url(), z.literal('')]),
  whatsapp: z.string().url(),
  facebook: z.union([z.string().url(), z.literal('')]),
  avatar: z.string().optional(),
  cvUrl: z.string().optional(),
  achievements: z.array(z.object({
    id: z.string().optional(),
    title: z.string().default(''),
    year: z.string().default(''),
    description: z.string().default(''),
  })).default([]),
  philosophy: z.array(z.object({
    id: z.string().optional(),
    title: z.string().default(''),
    description: z.string().default(''),
  })).default([]),
  yearsOfExperience: z.coerce.number().min(0).default(0),
  clientSatisfaction: z.coerce.number().min(0).max(100).default(0),
  projectsDelivered: z.coerce.number().min(0).default(0),
  happyClients: z.coerce.number().min(0).default(0),
  education: z.array(z.object({
    id: z.string().optional(),
    degree: z.string().default(''),
    institution: z.string().default(''),
    year: z.string().default(''),
    description: z.string().default(''),
  })).default([]),
  certifications: z.array(z.object({
    id: z.string().optional(),
    name: z.string().default(''),
    issuer: z.string().default(''),
    year: z.string().default(''),
    url: z.string().default(''),
  })).default([]),
});

type ProfileForm = z.infer<typeof profileSchema>;

type LoadedStore = ContentStoreValue & { data: NonNullable<ContentStoreValue['data']> };

// Profile subdocuments (achievements/philosophy/education/certifications) are
// Mongoose subdocuments whose `_id` maps to `id` on the client. The form schema
// keeps `id` optional so new rows can be added; merging back onto the profile
// must therefore always yield a concrete `id`, reusing the previous id at the
// same position when the row is not brand new.
function withStableIds<T extends { id?: string }>(items: T[], previous: { id?: string }[]) {
  return items.map((item, index) => ({ ...item, id: item.id ?? previous[index]?.id ?? '' }));
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const store = useContentStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [modal, setModal] = useState<{ type: string; data?: unknown } | null>(null);

  const { loadDeferredData } = store;
  // Admin needs deferred (admin-only) content: trigger it on mount.
  // Guarded + shared: concurrent mounts await one in-flight promise.
  useEffect(() => {
    void loadDeferredData();
  }, [loadDeferredData]);

  if (!store.isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Admin reads the same hydrated singleton; never fabricate defaults.
  // Narrow once here so every tab below receives non-null data.
  if (!store.data) {
    if (store.loadError) {
      return (
        <div className="mx-auto max-w-xl px-4 pt-32 text-center">
          <p className="text-sm text-danger-ink">Failed to load content: {store.loadError}</p>
          <Button className="mt-4" onClick={() => void store.loadData(true)}>
            Retry
          </Button>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-xl px-4 pt-32 text-center text-sm text-subtle">
        Loading content…
      </div>
    );
  }
  const content = store.data;
  const adminStore = { ...store, data: content };

  const handleLogout = async () => {
    await store.logout();
    navigate('/admin/login');
  };

  const parseList = (str: string) =>
    str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  return (
    <>
      <SEO title="Admin Dashboard" noindex />
      <div className="flex min-h-[calc(100vh-5rem)] flex-col md:flex-row">
        <aside className="border-b border-line bg-surface p-4 md:w-64 md:border-b-0 md:border-r">
          <div className="mb-6 flex items-center justify-between md:block">
            <h2 className="font-display text-lg font-bold">Admin</h2>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="md:mt-4 md:w-full">
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
          <nav className="flex gap-2 overflow-x-auto md:flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-accent text-white' : 'text-muted hover:bg-elevated'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'messages' && store.unreadMessageCount > 0 ? (
                  <span className="ml-auto rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-semibold text-danger-ink">
                    {store.unreadMessageCount}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && <OverviewTab store={adminStore} setModal={setModal} />}
          {activeTab === 'projects' && <ProjectsTab store={adminStore} setModal={setModal} />}
          {activeTab === 'blog' && <BlogTab store={adminStore} setModal={setModal} />}
          {activeTab === 'skills' && <SkillsTab store={adminStore} setModal={setModal} />}
          {activeTab === 'experience' && <ExperienceTab store={adminStore} setModal={setModal} />}
          {activeTab === 'testimonials' && <TestimonialsTab store={adminStore} setModal={setModal} />}
          {activeTab === 'profile' && <ProfileTab store={adminStore} />}
          {activeTab === 'messages' && <MessagesTab store={adminStore} />}
          {activeTab === 'analytics' && <AnalyticsTab store={adminStore} />}
        </main>
      </div>

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.type ? modal.type.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : ''}
        className="max-w-3xl"
      >
        {modal?.type === 'project' && (
          <ProjectFormModal
            data={modal.data as Project | undefined}
            onClose={() => setModal(null)}
            store={adminStore}
            parseList={parseList}
          />
        )}
        {modal?.type === 'blog' && (
          <BlogFormModal
            data={modal.data as BlogPost | undefined}
            onClose={() => setModal(null)}
            store={adminStore}
            parseList={parseList}
          />
        )}
        {modal?.type === 'skill' && (
          <SkillFormModal data={modal.data as Skill | undefined} onClose={() => setModal(null)} store={adminStore} />
        )}
        {modal?.type === 'experience' && (
          <ExperienceFormModal
            data={modal.data as Experience | undefined}
            onClose={() => setModal(null)}
            store={adminStore}
          />
        )}
        {modal?.type === 'testimonial' && (
          <TestimonialFormModal
            data={modal.data as Testimonial | undefined}
            onClose={() => setModal(null)}
            store={adminStore}
          />
        )}
      </Modal>
    </>
  );
}

function OverviewTab({
  store,
  setModal,
}: {
  store: LoadedStore;
  setModal: (m: { type: string; data?: unknown } | null) => void;
}) {
  const stats = [
    { label: 'Projects', value: store.data.projects.length },
    { label: 'Published', value: store.publishedProjects.length },
    { label: 'Featured', value: store.featuredProjects.length },
    { label: 'Blog Posts', value: store.data.blogPosts.length },
    { label: 'Skills', value: store.data.skills.length },
    { label: 'Messages', value: store.data.messages.length },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Dashboard Overview</h2>
        <Button variant="outline" size="sm" onClick={store.resetToDefaults}>
          Reset Defaults
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-line bg-surface p-6"
          >
            <p className="text-sm text-subtle">{stat.label}</p>
            <p className="font-display text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display font-semibold">Recent Projects</h3>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModal({ type: 'project' })}>
              Add Project
            </Button>
          </div>
          <div className="space-y-3">
            {store.data.projects.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-line bg-surface p-4"
              >
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-subtle">
                    {p.status} &middot; {p.categories.join(', ')}
                  </p>
                </div>
                <div className="flex gap-1">
                  {p.featured && <Star className="h-4 w-4 text-warning-ink" />}
                  <button
                    onClick={() => setModal({ type: 'project', data: p })}
                    className="rounded-lg p-2 text-subtle hover:bg-elevated"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display font-semibold">Recent Blog Posts</h3>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModal({ type: 'blog' })}>
              Add Post
            </Button>
          </div>
          <div className="space-y-3">
            {store.data.blogPosts.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-line bg-surface p-4"
              >
                <div>
                  <p className="font-medium">{b.title}</p>
                  <p className="text-xs text-subtle">
                    {b.status} &middot; {formatDate(b.publishedAt)}
                  </p>
                </div>
                <button
                  onClick={() => setModal({ type: 'blog', data: b })}
                  className="rounded-lg p-2 text-subtle hover:bg-elevated"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsTab({
  store,
  setModal,
}: {
  store: LoadedStore;
  setModal: (m: { type: string; data?: unknown }) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Projects</h2>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModal({ type: 'project' })}>
          Add Project
        </Button>
      </div>
      <div className="grid gap-4">
        {store.data.projects.map((p) => (
          <div
            key={p.id}
            className="flex flex-col justify-between gap-4 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{p.title}</p>
                {p.featured && <Star className="h-4 w-4 text-warning-ink" />}
              </div>
              <p className="text-xs text-subtle">
                {p.status} &middot; {p.categories.join(', ')} &middot; {formatDate(p.completionDate)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => store.updateProject(p.id, { featured: !p.featured })}
                className="rounded-lg border border-line p-2 text-subtle hover:bg-elevated"
                title="Toggle featured"
              >
                <Star className={`h-4 w-4 ${p.featured ? 'fill-warning text-warning-ink' : 'text-subtle'}`} />
              </button>
              <button
                onClick={() => setModal({ type: 'project', data: p })}
                className="rounded-lg border border-line p-2 text-subtle hover:bg-elevated"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this project?')) store.deleteProject(p.id);
                }}
                className="rounded-lg border border-line p-2 text-danger-ink hover:bg-danger-soft"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogTab({
  store,
  setModal,
}: {
  store: LoadedStore;
  setModal: (m: { type: string; data?: unknown }) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Blog Posts</h2>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModal({ type: 'blog' })}>
          Add Post
        </Button>
      </div>
      <div className="grid gap-4">
        {store.data.blogPosts.map((b) => (
          <div
            key={b.id}
            className="flex flex-col justify-between gap-4 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{b.title}</p>
                {b.featured && <Star className="h-4 w-4 text-warning-ink" />}
              </div>
              <p className="text-xs text-subtle">
                {b.status} &middot; {formatDate(b.publishedAt)} &middot; {b.readingTime} min read
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => store.updateBlogPost(b.id, { featured: !b.featured })}
                className="rounded-lg border border-line p-2 text-subtle hover:bg-elevated"
              >
                <Star className={`h-4 w-4 ${b.featured ? 'fill-warning text-warning-ink' : 'text-subtle'}`} />
              </button>
              <button
                onClick={() => setModal({ type: 'blog', data: b })}
                className="rounded-lg border border-line p-2 text-subtle hover:bg-elevated"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this post?')) store.deleteBlogPost(b.id);
                }}
                className="rounded-lg border border-line p-2 text-danger-ink hover:bg-danger-soft"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsTab({
  store,
  setModal,
}: {
  store: LoadedStore;
  setModal: (m: { type: string; data?: unknown }) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Skills</h2>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModal({ type: 'skill' })}>
          Add Skill
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {store.data.skills.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-line bg-surface p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-subtle">{s.category}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setModal({ type: 'skill', data: s })}
                  className="rounded-lg p-1.5 text-subtle hover:bg-elevated"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this skill?')) store.deleteSkill(s.id);
                  }}
                  className="rounded-lg p-1.5 text-danger-ink hover:bg-danger-soft"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${s.proficiency}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperienceTab({
  store,
  setModal,
}: {
  store: LoadedStore;
  setModal: (m: { type: string; data?: unknown }) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Experience</h2>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModal({ type: 'experience' })}>
          Add Experience
        </Button>
      </div>
      <div className="grid gap-4">
        {store.data.experiences.map((e) => (
          <div
            key={e.id}
            className="flex flex-col justify-between gap-4 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-medium">
                {e.role} {e.current && <Badge variant="success">Current</Badge>}
              </p>
              <p className="text-xs text-subtle">
                {e.company} &middot; {e.location} &middot; {formatDate(e.startDate)} -{' '}
                {e.current ? 'Present' : e.endDate ? formatDate(e.endDate) : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setModal({ type: 'experience', data: e })}
                className="rounded-lg border border-line p-2 text-subtle hover:bg-elevated"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this experience?')) store.deleteExperience(e.id);
                }}
                className="rounded-lg border border-line p-2 text-danger-ink hover:bg-danger-soft"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesTab({ store }: { store: LoadedStore }) {
  const deferredNote = !store.isDeferredLoaded ? (
    <p className="text-xs text-subtle">
      {store.isDeferredLoading ? 'Loading messages…' : store.deferredError ?? 'Messages unavailable.'}{' '}
      <button
        type="button"
        className="underline hover:text-accent-ink"
        onClick={() => void store.loadDeferredData(true)}
      >
        Retry
      </button>
    </p>
  ) : null;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Messages</h2>
          <p className="text-sm text-subtle">
            Visitor inquiries submitted through the contact form.
          </p>
          {deferredNote}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm('Mark all messages as read?')) {
              store.data.messages.forEach((message) => {
                if (message.status === 'new') store.markMessageRead(message.id);
              });
            }
          }}
        >
          Mark all read
        </Button>
      </div>

      <div className="grid gap-4">
        {store.data.messages.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-subtle">
            No messages yet. Visitor submissions will appear here.
          </div>
        ) : (
          store.data.messages.map((message) => (
            <div
              key={message.id}
              className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-muted/40"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-ink">{message.subject}</p>
                    <span className="rounded-full bg-elevated px-2 py-1 text-xs font-semibold uppercase tracking-wide text-subtle">
                      {message.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-subtle">
                    From <span className="font-medium text-ink">{message.name}</span> ·{' '}
                    <a href={`mailto:${message.email}`} className="text-accent-ink hover:underline">
                      {message.email}
                    </a>
                  </p>
                </div>
                <div className="space-y-2 text-right sm:text-left">
                  <p className="text-xs uppercase tracking-[0.2em] text-subtle">Received</p>
                  <p className="text-sm font-medium text-ink">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-surface p-4 text-sm text-ink">
                {message.message}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={message.status === 'new' ? 'primary' : 'ghost'}
                  onClick={() => store.markMessageRead(message.id)}
                >
                  {message.status === 'new' ? 'Mark as read' : 'Read'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (confirm('Delete this message?')) {
                      store.deleteMessage(message.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TestimonialsTab({
  store,
  setModal,
}: {
  store: LoadedStore;
  setModal: (m: { type: string; data?: unknown }) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Testimonials</h2>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModal({ type: 'testimonial' })}>
          Add Testimonial
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {store.data.testimonials.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-line bg-surface p-4"
          >
            <p className="text-sm italic text-muted">"{t.content}"</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-subtle">
                  {t.role}, {t.company}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setModal({ type: 'testimonial', data: t })}
                  className="rounded-lg p-1.5 text-subtle hover:bg-elevated"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this testimonial?')) store.deleteTestimonial(t.id);
                  }}
                  className="rounded-lg p-1.5 text-danger-ink hover:bg-danger-soft"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ store }: { store: LoadedStore }) {
  const { profile } = store.data;
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      title: profile.title,
      tagline: profile.tagline,
      bio: profile.bio,
      shortBio: profile.shortBio,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      website: profile.website,
      github: profile.github,
      linkedin: profile.linkedin,
      x: profile.x,
      whatsapp: profile.whatsapp,
      facebook: profile.facebook || '',
      avatar: profile.avatar,
      cvUrl: profile.cvUrl || '',
      achievements: profile.achievements || [],
      philosophy: profile.philosophy || [],
      yearsOfExperience: profile.yearsOfExperience || 0,
      clientSatisfaction: profile.clientSatisfaction || 0,
      projectsDelivered: profile.projectsDelivered || 0,
      happyClients: profile.happyClients || 0,
      education: profile.education || [],
      certifications: profile.certifications || [],
    },
  });

  // Reactive subscriptions so Add/Edit/Remove re-render the sections immediately
  const watchedAchievements = useWatch({ control, name: 'achievements' });
  const watchedPhilosophy = useWatch({ control, name: 'philosophy' });

  // Sync form when profile data loads/changes
  useEffect(() => {
    reset({
      name: profile.name,
      title: profile.title,
      tagline: profile.tagline,
      bio: profile.bio,
      shortBio: profile.shortBio,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      website: profile.website,
      github: profile.github,
      linkedin: profile.linkedin,
      x: profile.x,
      whatsapp: profile.whatsapp,
      facebook: profile.facebook || '',
      avatar: profile.avatar,
      cvUrl: profile.cvUrl || '',
      achievements: profile.achievements || [],
      philosophy: profile.philosophy || [],
      yearsOfExperience: profile.yearsOfExperience || 0,
      clientSatisfaction: profile.clientSatisfaction || 0,
      projectsDelivered: profile.projectsDelivered || 0,
      happyClients: profile.happyClients || 0,
      education: profile.education || [],
      certifications: profile.certifications || [],
    });
    setAvatarPreview(profile.avatar);
  }, [profile, reset]);

  // Education handlers
  const addEducation = () => {
    const current = getValues('education');
    setValue('education', [...current, { degree: '', institution: '', year: '', description: '' }]);
  };

  const removeEducation = (index: number) => {
    const current = getValues('education');
    setValue('education', current.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const current = getValues('education');
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setValue('education', updated);
  };

  // Certification handlers
  const addCertification = () => {
    const current = getValues('certifications');
    setValue('certifications', [...current, { name: '', issuer: '', year: '', url: '' }]);
  };

  const removeCertification = (index: number) => {
    const current = getValues('certifications');
    setValue('certifications', current.filter((_, i) => i !== index));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const current = getValues('certifications');
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setValue('certifications', updated);
  };

  // Achievement handlers
  const addAchievement = () => {
    const current = getValues('achievements');
    setValue('achievements', [...current, { title: '', year: '', description: '' }]);
  };

  const removeAchievement = (index: number) => {
    const current = getValues('achievements');
    setValue('achievements', current.filter((_, i) => i !== index));
  };

  const updateAchievement = (index: number, field: string, value: string) => {
    const current = getValues('achievements');
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setValue('achievements', updated);
  };

  // Philosophy handlers
  const addPhilosophy = () => {
    const current = getValues('philosophy');
    setValue('philosophy', [...current, { title: '', description: '' }]);
  };

  const removePhilosophy = (index: number) => {
    const current = getValues('philosophy');
    setValue('philosophy', current.filter((_, i) => i !== index));
  };

  const updatePhilosophy = (index: number, field: string, value: string) => {
    const current = getValues('philosophy');
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setValue('philosophy', updated);
  };

  // CV upload handler — uploads the PDF to Cloudinary via the backend endpoint
  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/profile/cv`, {
        method: 'POST',
        headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const updatedProfile = await response.json();
      setValue('cvUrl', updatedProfile.cvUrl);
      toast.success('CV uploaded successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to upload CV';
      toast.error(message);
      console.error('CV upload error:', error);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const compressed = await new Promise<Blob | null>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const maxSize = 400;
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7);
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
      });
      // Preview stays instant; the canonical persisted avatar is the hosted URL
      // returned by the authenticated upload route (never a data: URI).
      const previousPreview = avatarPreview.startsWith('blob:') ? avatarPreview : null;
      const localPreview = compressed ? URL.createObjectURL(compressed) : dataUrl;
      setAvatarPreview(localPreview);
      if (previousPreview && previousPreview !== localPreview) URL.revokeObjectURL(previousPreview);
      const uploadBody: Blob | null = compressed;
      if (!uploadBody) {
        // Compression failed: roll back to the last known-good avatar value.
        if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
        setAvatarPreview(profile.avatar);
        toast.error('Could not process that image');
        return;
      }
      const formData = new FormData();
      formData.append('avatar', uploadBody, 'avatar.jpg');
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/profile/avatar`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) {
        // The persisted document is untouched on upload failure: every return
        // below rolls the preview back onto the last known-good avatar value.
        const errorData = await response.json().catch(() => ({}));
        if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
        setAvatarPreview(profile.avatar);
        throw new Error(errorData.error || 'Avatar upload failed');
      }
      const updatedProfile = await response.json();
      const avatarUrl = updatedProfile.avatar as string;
      if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
      setAvatarPreview(avatarUrl);
      setValue('avatar', avatarUrl, { shouldDirty: true });
      toast.success('Avatar uploaded');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload avatar';
      toast.error(message);
      console.error('Avatar upload error:', error);
    }
  };

  const onSubmit = async (formData: ProfileForm) => {
    try {
      // Avatar uploads persist immediately via POST /api/profile/avatar.
      // Merge that URL locally so saving other fields never clobbers it.
      const avatarUrl = formData.avatar ?? profile.avatar;
      await store.updateProfile(
        {
          ...profile,
          ...formData,
          avatar: avatarUrl,
          achievements: withStableIds(formData.achievements, profile.achievements),
          philosophy: withStableIds(formData.philosophy, profile.philosophy),
          education: withStableIds(formData.education, profile.education),
          certifications: withStableIds(formData.certifications, profile.certifications),
        },
        { avatarUrl },
      );
      toast.success('Profile updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-ink">Profile picture</label>
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-elevated text-sm text-subtle">
                No image
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
        <Input label="Tagline" error={errors.tagline?.message} {...register('tagline')} className="md:col-span-2" />
        <Textarea label="Bio" error={errors.bio?.message} {...register('bio')} className="md:col-span-2" />
        <Textarea label="Short Bio" error={errors.shortBio?.message} {...register('shortBio')} className="md:col-span-2" />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
        <Input label="Location" error={errors.location?.message} {...register('location')} />
        <Input label="Website" error={errors.website?.message} {...register('website')} />
        <Input label="GitHub" error={errors.github?.message} {...register('github')} />
        <Input label="LinkedIn" error={errors.linkedin?.message} {...register('linkedin')} />
        <Input label="X / Twitter" error={errors.x?.message} {...register('x')} />
        <Input label="WhatsApp Link" error={errors.whatsapp?.message} {...register('whatsapp')} />
        <Input label="Facebook URL" error={errors.facebook?.message} {...register('facebook')} />
        <Input label="CV URL" error={errors.cvUrl?.message} {...register('cvUrl')} className="md:col-span-2" />
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-ink">Upload CV (PDF)</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleCvUpload}
            className="block w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          {watch('cvUrl') && (
            <p className="mt-1 text-xs text-subtle">Current: {watch('cvUrl')}</p>
          )}
        </div>

      {/* Professional Statistics */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="mb-4 font-display text-lg font-semibold">Professional Statistics</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Years of Experience" type="number" error={errors.yearsOfExperience?.message} {...register('yearsOfExperience')} />
          <Input label="Client Satisfaction (%)" type="number" error={errors.clientSatisfaction?.message} {...register('clientSatisfaction')} />
          <Input label="Projects Delivered" type="number" error={errors.projectsDelivered?.message} {...register('projectsDelivered')} />
          <Input label="Happy Clients" type="number" error={errors.happyClients?.message} {...register('happyClients')} />
        </div>
      </div>

      {/* Education */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Education</h3>
          <Button type="button" variant="outline" size="sm" onClick={addEducation}>Add Education</Button>
        </div>
        <div className="space-y-4">
          {getValues('education').map((_, index) => (
            <div key={index} className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted">Education #{index + 1}</span>
                <button type="button" onClick={() => removeEducation(index)} className="text-danger-ink hover:text-danger-ink">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input placeholder="Degree" value={getValues(`education.${index}.degree`)} onChange={(e) => updateEducation(index, 'degree', e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm bg-surface" />
                <input placeholder="Institution" value={getValues(`education.${index}.institution`)} onChange={(e) => updateEducation(index, 'institution', e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm bg-surface" />
                <input placeholder="Year" value={getValues(`education.${index}.year`)} onChange={(e) => updateEducation(index, 'year', e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm bg-surface" />
                <input placeholder="Description" value={getValues(`education.${index}.description`)} onChange={(e) => updateEducation(index, 'description', e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm bg-surface" />
              </div>
            </div>
          ))}
          {getValues('education').length === 0 && (
            <p className="text-center text-sm text-subtle">No education records. Click "Add Education" to add one.</p>
          )}
        </div>
      </div>

      {/* Certifications */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Certifications</h3>
          <Button type="button" variant="outline" size="sm" onClick={addCertification}>Add Certification</Button>
        </div>
        <div className="space-y-4">
          {getValues('certifications').map((_, index) => (
            <div key={index} className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted">Certification #{index + 1}</span>
                <button type="button" onClick={() => removeCertification(index)} className="text-danger-ink hover:text-danger-ink">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input placeholder="Name" value={getValues(`certifications.${index}.name`)} onChange={(e) => updateCertification(index, 'name', e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm bg-surface" />
                <input placeholder="Issuer" value={getValues(`certifications.${index}.issuer`)} onChange={(e) => updateCertification(index, 'issuer', e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm bg-surface" />
                <input placeholder="Year" value={getValues(`certifications.${index}.year`)} onChange={(e) => updateCertification(index, 'year', e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm bg-surface" />
                <input placeholder="URL" value={getValues(`certifications.${index}.url`)} onChange={(e) => updateCertification(index, 'url', e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm bg-surface" />
              </div>
            </div>
          ))}
          {getValues('certifications').length === 0 && (
            <p className="text-center text-sm text-subtle">No certifications. Click "Add Certification" to add one.</p>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Achievements</h3>
          <Button type="button" variant="outline" size="sm" onClick={addAchievement}>Add Achievement</Button>
        </div>
        <div className="space-y-4">
          {(watchedAchievements ?? []).map((achievement, index) => (
            <div key={index} className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted">Achievement #{index + 1}</span>
                <button type="button" onClick={() => removeAchievement(index)} className="text-danger-ink hover:text-danger-ink" aria-label="Remove achievement">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input placeholder="Title" value={achievement.title} onChange={(e) => updateAchievement(index, 'title', e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm bg-surface" />
                <input placeholder="Year" value={achievement.year} onChange={(e) => updateAchievement(index, 'year', e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm bg-surface" />
                <input placeholder="Description" value={achievement.description} onChange={(e) => updateAchievement(index, 'description', e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm sm:col-span-2 bg-surface" />
              </div>
            </div>
          ))}
          {(watchedAchievements ?? []).length === 0 && (
            <p className="text-center text-sm text-subtle">No achievements added yet. Click "Add Achievement" to add one.</p>
          )}
        </div>
      </div>

      {/* Philosophy */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Philosophy</h3>
          <Button type="button" variant="outline" size="sm" onClick={addPhilosophy}>Add Philosophy</Button>
        </div>
        <div className="space-y-4">
          {(watchedPhilosophy ?? []).map((item, index) => (
            <div key={index} className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted">Philosophy #{index + 1}</span>
                <button type="button" onClick={() => removePhilosophy(index)} className="text-danger-ink hover:text-danger-ink" aria-label="Remove philosophy item">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input placeholder="Title" value={item.title} onChange={(e) => updatePhilosophy(index, 'title', e.target.value)} className="w-full rounded-lg border border-line px-3 py-2 text-sm bg-surface" />
                <textarea placeholder="Description" rows={3} value={item.description} onChange={(e) => updatePhilosophy(index, 'description', e.target.value)} className="w-full rounded-lg border border-line px-3 py-2 text-sm bg-surface" />
              </div>
            </div>
          ))}
          {(watchedPhilosophy ?? []).length === 0 && (
            <p className="text-center text-sm text-subtle">No philosophy items added yet. Click "Add Philosophy" to add one.</p>
          )}
        </div>
      </div>

      <div className="md:col-span-2">
        <Button type="submit" isLoading={isSubmitting}>
          Save Profile
        </Button>
      </div>
      </form>
    </div>
  );
}

function AnalyticsTab({ store }: { store: LoadedStore }) {
  if (!store.isDeferredLoaded) {
    return (
      <div className="space-y-8">
        <h2 className="font-display text-2xl font-bold">Analytics</h2>
        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="text-sm text-subtle">
            {store.isDeferredLoading ? 'Loading analytics…' : store.deferredError ?? 'Analytics unavailable.'}
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => void store.loadDeferredData(true)}>
            Retry
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold">Analytics</h2>
      <div className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="mb-6 font-display font-semibold">Page Views (Last 7 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={store.data.analytics.pageViews}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" opacity={0.6} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="mb-6 font-display font-semibold">Project Views</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={store.data.analytics.projectViews.map((pv) => ({
                name:
                  store.data.projects.find((p) => p.id === pv.projectId)?.title ?? pv.projectId,
                views: pv.views,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" opacity={0.6} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ImageUpload({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const base64s = await Promise.all(Array.from(files).map(getBase64Image));
    onChange([...images, ...base64s]);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink">Images</label>
      <div className="flex flex-wrap gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative h-20 w-20 overflow-hidden rounded-lg">
            <img src={img} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, i) => i !== idx))}
              className="absolute right-0 top-0 rounded-bl-lg bg-danger-soft p-1 text-danger-ink"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-line text-subtle hover:bg-surface">
          <Plus className="h-6 w-6" />
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
        </label>
      </div>
    </div>
  );
}

function ProjectFormModal({
  data,
  onClose,
  store,
  parseList,
}: {
  data?: Project;
  onClose: () => void;
  store: LoadedStore;
  parseList: (str: string) => string[];
}) {
  const [images, setImages] = useState<string[]>(data?.images ?? []);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: data
      ? {
          ...data,
          categories: data.categories.join(', '),
          technologies: data.technologies.join(', '),
        }
      : {
          title: '',
          description: '',
          content: '',
          categories: '',
          technologies: '',
          githubUrl: '',
          liveUrl: '',
          completionDate: new Date().toISOString().split('T')[0],
          featured: false,
          status: 'published',
          seoTitle: '',
          seoDescription: '',
          challenges: '',
          solutions: '',
        },
  });

  const onSubmit = async (formData: ProjectForm) => {
    const payload = {
      ...formData,
      featured: formData.featured ?? false,
      categories: parseList(formData.categories),
      technologies: parseList(formData.technologies),
      images,
    };
    if (data) {
      await store.updateProject(data.id, payload);
      toast.success('Project updated');
    } else {
      await store.addProject(payload);
      toast.success('Project created');
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <Textarea label="Description" error={errors.description?.message} {...register('description')} />
      <Textarea label="Content" rows={6} error={errors.content?.message} {...register('content')} />
      <Input label="Categories (comma separated)" error={errors.categories?.message} {...register('categories')} />
      <Input label="Technologies (comma separated)" error={errors.technologies?.message} {...register('technologies')} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="GitHub URL" {...register('githubUrl')} />
        <Input label="Live URL" {...register('liveUrl')} />
      </div>
      <Input label="Completion Date" type="date" error={errors.completionDate?.message} {...register('completionDate')} />
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Status"
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
          ]}
          {...register('status')}
        />
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" {...register('featured')} className="h-4 w-4 rounded border-line" />
          Featured project
        </label>
      </div>
      <Input label="SEO Title" {...register('seoTitle')} />
      <Textarea label="SEO Description" {...register('seoDescription')} />
      <Textarea label="Challenges" {...register('challenges')} />
      <Textarea label="Solutions" {...register('solutions')} />
      <ImageUpload images={images} onChange={setImages} />
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {data ? 'Update' : 'Create'} Project
        </Button>
      </div>
    </form>
  );
}

function BlogFormModal({
  data,
  onClose,
  store,
  parseList,
}: {
  data?: BlogPost;
  onClose: () => void;
  store: LoadedStore;
  parseList: (str: string) => string[];
}) {
  const [coverImage, setCoverImage] = useState<string | undefined>(data?.coverImage);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BlogForm>({
    resolver: zodResolver(blogSchema),
    defaultValues: data
      ? {
          ...data,
          categories: data.categories.join(', '),
          tags: data.tags.join(', '),
        }
      : {
          title: '',
          excerpt: '',
          content: '',
          categories: '',
          tags: '',
          featured: false,
          status: 'draft',
          publishedAt: new Date().toISOString().split('T')[0],
          author: 'Udeh Samson',
        },
  });

  const onSubmit = async (formData: BlogForm) => {
    const payload = {
      ...formData,
      featured: formData.featured ?? false,
      categories: parseList(formData.categories),
      tags: parseList(formData.tags),
      coverImage,
    };
    if (data) {
      await store.updateBlogPost(data.id, payload);
      toast.success('Blog post updated');
    } else {
      await store.addBlogPost(payload);
      toast.success('Blog post created');
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <Textarea label="Excerpt" error={errors.excerpt?.message} {...register('excerpt')} />
      <Textarea label="Content" rows={8} error={errors.content?.message} {...register('content')} />
      <Input label="Categories (comma separated)" error={errors.categories?.message} {...register('categories')} />
      <Input label="Tags (comma separated)" error={errors.tags?.message} {...register('tags')} />
      <Input label="Author" error={errors.author?.message} {...register('author')} />
      <Input label="Published At" type="date" error={errors.publishedAt?.message} {...register('publishedAt')} />
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Status"
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
          ]}
          {...register('status')}
        />
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" {...register('featured')} className="h-4 w-4 rounded border-line" />
          Featured post
        </label>
      </div>
      <ImageUpload images={coverImage ? [coverImage] : []} onChange={(imgs) => setCoverImage(imgs[0])} />
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {data ? 'Update' : 'Create'} Post
        </Button>
      </div>
    </form>
  );
}

function SkillFormModal({
  data,
  onClose,
  store,
}: {
  data?: Skill;
  onClose: () => void;
  store: LoadedStore;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SkillForm>({
    resolver: zodResolver(skillSchema),
    defaultValues: data ?? { name: '', category: '', proficiency: 50 },
  });

  const onSubmit = async (formData: SkillForm) => {
    if (data) {
      await store.updateSkill(data.id, formData);
      toast.success('Skill updated');
    } else {
      await store.addSkill(formData);
      toast.success('Skill created');
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" error={errors.name?.message} {...register('name')} />
      <Input label="Category" error={errors.category?.message} {...register('category')} />
      <Input
        label="Proficiency (0-100)"
        type="number"
        error={errors.proficiency?.message}
        {...register('proficiency')}
      />
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {data ? 'Update' : 'Create'} Skill
        </Button>
      </div>
    </form>
  );
}

function ExperienceFormModal({
  data,
  onClose,
  store,
}: {
  data?: Experience;
  onClose: () => void;
  store: LoadedStore;
}) {
  const [current, setCurrent] = useState(data?.current ?? false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceForm>({
    resolver: zodResolver(experienceSchema),
    defaultValues: data ?? {
      role: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    },
  });

  const onSubmit = async (formData: ExperienceForm) => {
    const payload = { ...formData, current };
    if (data) {
      await store.updateExperience(data.id, payload);
      toast.success('Experience updated');
    } else {
      await store.addExperience(payload);
      toast.success('Experience created');
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Role" error={errors.role?.message} {...register('role')} />
      <Input label="Company" error={errors.company?.message} {...register('company')} />
      <Input label="Location" error={errors.location?.message} {...register('location')} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Start Date" type="date" error={errors.startDate?.message} {...register('startDate')} />
        <Input label="End Date" type="date" disabled={current} {...register('endDate')} />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={current}
          onChange={(e) => setCurrent(e.target.checked)}
          className="h-4 w-4 rounded border-line"
        />
        Current role
      </label>
      <Textarea label="Description" error={errors.description?.message} {...register('description')} />
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {data ? 'Update' : 'Create'} Experience
        </Button>
      </div>
    </form>
  );
}

function TestimonialFormModal({
  data,
  onClose,
  store,
}: {
  data?: Testimonial;
  onClose: () => void;
  store: LoadedStore;
}) {
  const [avatar, setAvatar] = useState<string | undefined>(data?.avatar);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: data ?? { name: '', role: '', company: '', content: '' },
  });

  const onSubmit = async (formData: TestimonialForm) => {
    const payload = { ...formData, avatar };
    if (data) {
      await store.updateTestimonial(data.id, payload);
      toast.success('Testimonial updated');
    } else {
      await store.addTestimonial(payload);
      toast.success('Testimonial created');
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" error={errors.name?.message} {...register('name')} />
      <Input label="Role" error={errors.role?.message} {...register('role')} />
      <Input label="Company" error={errors.company?.message} {...register('company')} />
      <Textarea label="Content" error={errors.content?.message} {...register('content')} />
      <ImageUpload images={avatar ? [avatar] : []} onChange={(imgs) => setAvatar(imgs[0])} />
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {data ? 'Update' : 'Create'} Testimonial
        </Button>
      </div>
    </form>
  );
}
