import { Link } from 'react-router-dom';
import { Code2, Facebook, Github, Linkedin, Twitter } from 'lucide-react';
import { useContentStore } from '@/hooks/useContentStore';

const footerLinks = [
  {
    title: 'Navigation',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Projects', href: '/projects' },
      { label: 'Blog', href: '/blog' },
      { label: 'Services', href: '/services' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Full Stack Development', href: '/services' },
      { label: 'Frontend Engineering', href: '/services' },
      { label: 'API Development', href: '/services' },
      { label: 'Mobile Apps', href: '/services' },
    ],
  },
];

export function Footer() {
  const { data } = useContentStore();
  const { profile } = data;

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <Code2 className="h-7 w-7 text-blue-500" />
              <span className="font-display">{profile.name}</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {profile.tagline || profile.shortBio}
            </p>
            <div className="flex gap-3">
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {profile.x && (
                <a
                  href={profile.x}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="X"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {profile.facebook && (
                <a
                  href={profile.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  About
                </Link>
              </li>
              <li>
                <Link to="/projects" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/blog" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">Services</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/services" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  Full Stack Development
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  Frontend Engineering
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  API Development
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  Mobile Apps
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">Admin</h4>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Open Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
