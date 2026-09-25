import { Link } from 'react-router-dom';
import { Code2, Facebook, Github, Linkedin, Twitter } from 'lucide-react';
import { useProfile } from '@/hooks/useContentStore';

export function Footer() {
  const profile = useProfile();
  if (!profile) return null;

  return (
    <footer className="border-t border-line bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <Code2 className="h-7 w-7 text-accent-ink" />
              <span className="font-display">{profile.name}</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted">
              {profile.tagline || profile.shortBio}
            </p>
            <div className="flex gap-3">
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-2 text-subtle transition-colors hover:bg-elevated hover:text-ink"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-2 text-subtle transition-colors hover:bg-elevated hover:text-ink"
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
                  className="rounded-lg p-2 text-subtle transition-colors hover:bg-elevated hover:text-ink"
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
                  className="rounded-lg p-2 text-subtle transition-colors hover:bg-elevated hover:text-ink"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link to="/" className="transition-colors hover:text-accent-ink">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition-colors hover:text-accent-ink">
                  About
                </Link>
              </li>
              <li>
                <Link to="/projects" className="transition-colors hover:text-accent-ink">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/blog" className="transition-colors hover:text-accent-ink">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition-colors hover:text-accent-ink">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-accent-ink">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">Services</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link to="/services" className="transition-colors hover:text-accent-ink">
                  Full Stack Development
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition-colors hover:text-accent-ink">
                  Frontend Engineering
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition-colors hover:text-accent-ink">
                  API Development
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition-colors hover:text-accent-ink">
                  Mobile Apps
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">Admin</h4>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-medium transition-colors hover:bg-elevated"
            >
              Open Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-8 text-center text-sm text-subtle">
          &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
