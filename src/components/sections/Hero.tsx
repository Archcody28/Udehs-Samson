import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Download, Facebook, Github, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { TypingText } from '@/components/ui/TypingText';
import { useProfile } from '@/hooks/useContentStore';

// Three.js canvas splits out of the critical Home chunk.
const ParticleField = lazy(() =>
  import('@/components/three/ParticleField').then((m) => ({ default: m.ParticleField }))
);

export function Hero() {
  const profile = useProfile();
  if (!profile) return null;

  const stats = [
    { value: profile.yearsOfExperience ?? 0, suffix: '+', label: 'Years Experience' },
    { value: profile.projectsDelivered ?? 0, suffix: '+', label: 'Projects Delivered' },
    { value: profile.happyClients ?? 0, suffix: '+', label: 'Happy Clients' },
    { value: profile.clientSatisfaction ?? 0, suffix: '%', label: 'Client Satisfaction' },
  ];

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden px-4 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <ParticleField />
      </Suspense>

      <div className="mx-auto grid max-w-7xl items-center gap-8 py-20 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-4 py-1.5 text-sm font-medium text-accent-ink">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            Available for freelance & full-time roles
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Hi, I'm {profile.name}
          </h1>

          <div className="mt-2 flex items-center gap-6">
            <span className="text-lg text-muted">
              <TypingText
                texts={['Full Stack Engineer', 'UI/UX Designer', 'Problem Solver', 'Tech Mentor']}
              />
            </span>
          </div>

          <p className="max-w-xl text-lg leading-relaxed text-muted mt-6">
            {profile.tagline}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/contact">
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Hire Me
              </Button>
            </Link>
            <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" leftIcon={<Download className="h-5 w-5" />}>
                Download CV
              </Button>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line p-3 text-muted transition-colors hover:border-accent hover:text-accent-ink"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-line p-3 text-muted transition-colors hover:border-accent hover:text-accent-ink"
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
                className="rounded-full border border-line p-3 text-muted transition-colors hover:border-accent hover:text-accent-ink"
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
                className="rounded-full border border-line p-3 text-muted transition-colors hover:border-accent hover:text-accent-ink"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto w-full max-w-[28rem] lg:max-w-[34rem]"
        >
          <div className="relative overflow-hidden rounded-2xl border border-line bg-elevated">
            <div className="relative aspect-square">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold text-ink sm:text-3xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-1 text-xs sm:text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
