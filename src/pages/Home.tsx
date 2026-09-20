import { Suspense, lazy } from 'react';
import { SEO } from '@/components/layout/SEO';
import { Hero } from '@/components/sections/Hero';
import { TechStack } from '@/components/sections/TechStack';
import { AboutIntro } from '@/components/sections/AboutIntro';
import { Skills } from '@/components/sections/Skills';
import { Projects } from '@/components/sections/Projects';
import { Blogs } from '@/components/sections/Blogs';
import { GitHubActivity } from '@/components/sections/GitHubActivity';
import { ContactCTA } from '@/components/sections/ContactCTA';

// Testimonials is the only consumer of `swiper` (its carousel). It sits
// below the fold on Home, so its section (and the swiper dependency) is
// loaded behind a lazy boundary instead of the initial bundle.
const Testimonials = lazy(() =>
  import('@/components/sections/Testimonials').then((m) => ({ default: m.Testimonials }))
);

export function Home() {
  return (
    <>
      <SEO />
      <Hero />
      <TechStack />
      <AboutIntro />
      <Skills />
      <Projects />
      <Blogs />
      <Suspense fallback={null}>
        <Testimonials />
      </Suspense>
      <GitHubActivity />
      <ContactCTA />
    </>
  );
}
