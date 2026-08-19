import { motion } from 'framer-motion';
import { Download, Printer } from 'lucide-react';
import { SEO } from '@/components/layout/SEO';
import { useContentStore } from '@/hooks/useContentStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export function Resume() {
  const { data } = useContentStore();
  const { profile, skills, experiences, education, certifications, achievements } = data;

  return (
    <>
      <SEO title="Resume" pathname="/resume" />
      <div className="mx-auto max-w-5xl px-4 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
        >
          <div>
            <h1 className="font-display text-4xl font-bold sm:text-5xl">Resume</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Download or print a copy of my professional resume.
            </p>
          </div>
          <div className="flex gap-3 no-print">
            <a href={profile.cvUrl} download>
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
                Download CV
              </Button>
            </a>
            <Button onClick={() => window.print()} leftIcon={<Printer className="h-4 w-4" />}>
              Print
            </Button>
          </div>
        </motion.div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-12">
          <header className="border-b border-slate-200 pb-8 dark:border-slate-800">
            <h2 className="font-display text-3xl font-bold">{profile.name}</h2>
            <p className="text-lg text-blue-600 dark:text-blue-400">{profile.title}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span>{profile.location}</span>
              <span>{profile.email}</span>
              <span>{profile.phone}</span>
              <span>{profile.website}</span>
            </div>
          </header>

          <section className="mt-8">
            <h3 className="mb-4 font-display text-xl font-semibold">Professional Summary</h3>
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">{profile.bio}</p>
          </section>

          <section className="mt-8">
            <h3 className="mb-4 font-display text-xl font-semibold">Experience</h3>
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                    <h4 className="font-semibold">{exp.role}</h4>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(exp.startDate)} - {exp.current ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {exp.company} &middot; {exp.location}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h3 className="mb-4 font-display text-xl font-semibold">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill.id} variant="default">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h3 className="mb-4 font-display text-xl font-semibold">Education</h3>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <h4 className="font-semibold">{edu.degree}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {edu.institution} &middot; {edu.year}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h3 className="mb-4 font-display text-xl font-semibold">Certifications</h3>
            <div className="space-y-4">
              {certifications.map((cert) => (
                <div key={cert.id}>
                  <h4 className="font-semibold">{cert.name}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {cert.issuer} &middot; {cert.year}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h3 className="mb-4 font-display text-xl font-semibold">Achievements</h3>
            <ul className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
              {achievements.map((a) => (
                <li key={a.id}>
                  <span className="font-medium">{a.title}</span> ({a.year}) - {a.description}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
