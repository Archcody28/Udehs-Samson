import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/layout';
import { Home } from '@/pages/Home';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NotFound } from '@/pages/NotFound';
import { AppLoader } from '@/components/common/AppLoader';
import { AppError } from '@/components/common/AppError';
import { useContentStatus } from '@/hooks/useContentStore';

// Home stays eager (critical first paint). Everything else splits into
// on-demand route chunks so the admin stack (react-hook-form/zod/recharts)
// never enters the initial public bundle.
const About = lazy(() => import('@/pages/About').then((m) => ({ default: m.About })));
const Projects = lazy(() => import('@/pages/Projects').then((m) => ({ default: m.Projects })));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail').then((m) => ({ default: m.ProjectDetail })));
const Blog = lazy(() => import('@/pages/Blogs').then((m) => ({ default: m.Blog })));
const BlogPost = lazy(() => import('@/pages/BlogPost').then((m) => ({ default: m.BlogPost })));
const ServicesPage = lazy(() => import('@/pages/Services').then((m) => ({ default: m.ServicesPage })));
const Contact = lazy(() => import('@/pages/Contact').then((m) => ({ default: m.Contact })));
const Resume = lazy(() => import('@/pages/Resume').then((m) => ({ default: m.Resume })));
const AdminLogin = lazy(() => import('@/pages/AdminLogin').then((m) => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() =>
  import('@/pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

function RouteFallback() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-32 text-center text-sm text-slate-500 dark:text-slate-400"
      role="status"
      aria-live="polite"
    >
      Loading page…
    </div>
  );
}

// Scroll restoration: PUSH navigations start at top; POP (back/forward)
// leaves browser behavior alone.
function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    if (navType === 'PUSH') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, navType]);
  return null;
}

// Lightweight enter transition per route content. No AnimatePresence
// mode="wait" and no pathname-keyed <Routes>: the destination mounts
// immediately without a blank exit/enter serialization.
function PageTransition() {
  const { pathname } = useLocation();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Outlet />
    </motion.div>
  );
}

function LayoutRoute() {
  return (
    <Layout>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <PageTransition />
      </Suspense>
    </Layout>
  );
}

export default function App() {
  const { data, isHydrated, isLoading, loadError, loadData } = useContentStatus();

  // Loading boundary: public tree renders only with real hydrated data.
  // data is null until the first successful hydration — never fake defaults.
  if ((!isHydrated || !data) && isLoading) {
    return <AppLoader />;
  }

  // Show error if initial hydration failed
  if ((!isHydrated || !data) && loadError) {
    return <AppError message={loadError} onRetry={loadData} />;
  }

  // Defensive: never render portfolio without real data.
  if (!data) {
    return <AppLoader />;
  }

  // Render portfolio after successful hydration.
  // Stable layout route: Layout/Navbar/Footer stay mounted; only the
  // Outlet content swaps per route. No pathname-keyed <Routes>.
  return (
    <Routes>
      <Route element={<LayoutRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
