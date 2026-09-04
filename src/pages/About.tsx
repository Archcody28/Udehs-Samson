import { motion } from 'framer-motion';
import { SEO } from '@/components/layout/SEO';
import { AboutIntro } from '@/components/sections/AboutIntro';
import { Timeline } from '@/components/sections/Timeline';
import { Skills } from '@/components/sections/Skills';
import { useContentStore } from '@/hooks/useContentStore';
import { Card } from '@/components/ui/Card';
import { Award, BookOpen, GraduationCap, Lightbulb } from 'lucide-react';

export function About() {
  const { data } = useContentStore();

  return (
    <>
      <SEO title="About" pathname="/about" />
      <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            About <span className="gradient-text">Me</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
            Engineer, designer, and lifelong learner passionate about building impactful products.
          </p>
        </motion.div>
      </div>

      <AboutIntro />
      <Timeline />
      <Skills />

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Education & <span className="gradient-text">Credentials</span>
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold">
                <GraduationCap className="h-6 w-6 text-blue-500" /> Education
              </h3>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <Card key={edu.id} hover>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{edu.year}</p>
                    <h4 className="font-display text-lg font-semibold">{edu.degree}</h4>
                    <p className="text-slate-600 dark:text-slate-400">{edu.institution}</p>
                    {edu.description && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{edu.description}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold">
                <BookOpen className="h-6 w-6 text-purple-500" /> Certifications
              </h3>
              <div className="space-y-4">
                {data.certifications.map((cert) => (
                  <Card key={cert.id} hover>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">{cert.year}</p>
                    <h4 className="font-display text-lg font-semibold">{cert.name}</h4>
                    <p className="text-slate-600 dark:text-slate-400">{cert.issuer}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Achievements & <span className="gradient-text">Philosophy</span>
            </h2>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold">
                <Award className="h-6 w-6 text-emerald-500" /> Achievements
              </h3>
              <Card className="h-full" hover>
                <p className="text-slate-700 dark:text-slate-300">
                  {data.profile.achievement || 'No achievements listed yet.'}
                </p>
              </Card>
            </div>

            <div>
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold">
                <Lightbulb className="h-6 w-6 text-amber-500" /> Philosophy
              </h3>
              <Card className="h-full" hover>
                <p className="text-slate-700 dark:text-slate-300">
                  {data.profile.philosophy || 'No philosophy listed yet.'}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
