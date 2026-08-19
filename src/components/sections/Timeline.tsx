import { motion } from 'framer-motion';
import { useContentStore } from '@/hooks/useContentStore';
import { formatDate } from '@/lib/utils';
import { Briefcase } from 'lucide-react';

export function Timeline() {
  const { data } = useContentStore();
  const { experiences } = data;

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Experience <span className="gradient-text">Timeline</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
            Roles that shaped my engineering, design, and leadership perspective.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 md:left-1/2" />

          {experiences.map((exp, idx) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative mb-12 flex items-start md:justify-center ${
                idx % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="hidden w-1/2 px-8 md:block" />
              <div className="absolute left-8 z-10 -translate-x-1/2 rounded-full border-4 border-white bg-blue-500 p-2 dark:border-slate-950 md:left-1/2">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <div className="ml-20 w-full md:ml-0 md:w-1/2 md:px-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-semibold">{exp.role}</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {exp.company} &middot; {exp.location}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {exp.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
