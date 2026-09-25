import { motion } from 'framer-motion';
import { SEO } from '@/components/layout/SEO';
import { AboutIntro } from '@/components/sections/AboutIntro';
import { Timeline } from '@/components/sections/Timeline';
import { Skills } from '@/components/sections/Skills';
import { useProfile, useProfileCollections } from '@/hooks/useContentStore';
import { Card } from '@/components/ui/Card';
import { Award, BookOpen, GraduationCap, Lightbulb, Target } from 'lucide-react';

// Presentation-only icon/color styling for philosophy cards (matches original design)
const philosophyStyles = [
  { Icon: Target, bg: 'bg-accent-soft', text: 'text-accent-ink' },
  { Icon: Lightbulb, bg: 'bg-accent-soft', text: 'text-accent-ink' },
  { Icon: Award, bg: 'bg-success-soft', text: 'text-success-ink' },
];

export function About() {
  const profile = useProfile();
  const { education, certifications, achievements, philosophy } = useProfileCollections();
  if (!profile) return null;

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
            About Me
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
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
              Education & Credentials
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold">
                <GraduationCap className="h-6 w-6 text-accent-ink" /> Education
              </h3>
              <div className="space-y-4">
                {education.map((edu) => (
                  <Card key={edu.id} hover>
                    <p className="text-sm font-medium text-accent-ink">{edu.year}</p>
                    <h4 className="font-display text-lg font-semibold">{edu.degree}</h4>
                    <p className="text-muted">{edu.institution}</p>
                    {edu.description && (
                      <p className="mt-2 text-sm text-muted">{edu.description}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold">
                <BookOpen className="h-6 w-6 text-accent-ink" /> Certifications
              </h3>
              <div className="space-y-4">
                {certifications.map((cert) => (
                  <Card key={cert.id} hover>
                    <p className="text-sm font-medium text-accent-ink">{cert.year}</p>
                    <h4 className="font-display text-lg font-semibold">{cert.name}</h4>
                    <p className="text-muted">{cert.issuer}</p>
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
              Achievements & Philosophy
            </h2>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold">
                <Award className="h-6 w-6 text-success-ink" /> Achievements
              </h3>
              {achievements.map((achievement, index) => (
                <Card key={`${achievement.title}-${index}`} hover>
                  <p className="text-sm font-medium text-success-ink">
                    {achievement.year}
                  </p>
                  <h4 className="font-display text-lg font-semibold">{achievement.title}</h4>
                  <p className="text-muted">{achievement.description}</p>
                </Card>
              ))}
              {achievements.length === 0 && (
                <Card hover>
                  <p className="text-sm text-subtle">No achievements added yet.</p>
                </Card>
              )}
            </div>

            <div>
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold">
                <Lightbulb className="h-6 w-6 text-warning-ink" /> Philosophy
              </h3>
              <div className="space-y-4">
                {philosophy.map((item, index) => {
                  const style = philosophyStyles[index % philosophyStyles.length];
                  return (
                    <Card key={`${item.title}-${index}`} hover>
                      <div className="flex gap-4">
                        <div className={`rounded-xl p-3 ${style.bg}`}>
                          <style.Icon className={`h-6 w-6 ${style.text}`} />
                        </div>
                        <div>
                          <h4 className="font-display font-semibold">{item.title}</h4>
                          <p className="text-sm text-muted">{item.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                {philosophy.length === 0 && (
                  <Card hover>
                    <p className="text-sm text-subtle">No philosophy items added yet.</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
