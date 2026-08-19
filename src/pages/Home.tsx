import { SEO } from '@/components/layout/SEO';
import { Hero } from '@/components/sections/Hero';
import { TechStack } from '@/components/sections/TechStack';
import { AboutIntro } from '@/components/sections/AboutIntro';
import { Skills } from '@/components/sections/Skills';
import { Projects } from '@/components/sections/Projects';
import { Blogs } from '@/components/sections/Blogs';
import { Testimonials } from '@/components/sections/Testimonials';
import { GitHubActivity } from '@/components/sections/GitHubActivity';
import { ContactCTA } from '@/components/sections/ContactCTA';

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
      <Testimonials />
      <GitHubActivity />
      <ContactCTA />
    </>
  );
}
