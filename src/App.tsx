import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from '@/components/layout/layout';
import { Home } from '@/pages/Home';
import { About } from '@/pages/About';
import { Projects } from '@/pages/Projects';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { Blog } from '@/pages/Blogs';
import { BlogPost } from '@/pages/BlogPost';
import { ServicesPage } from '@/pages/Services';
import { Contact } from '@/pages/Contact';
import { Resume } from '@/pages/Resume';
import { AdminLogin } from '@/pages/AdminLogin';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NotFound } from '@/pages/NotFound';
import { AppLoader } from '@/components/common/AppLoader';
import { AppError } from '@/components/common/AppError';
import { useContentStore } from '@/hooks/useContentStore';

function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
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
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const { data, isHydrated, isLoading, loadError, loadData } = useContentStore();

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

  // Render portfolio after successful hydration
  return (
    <Layout>
      <AnimatedOutlet />
    </Layout>
  );
}
