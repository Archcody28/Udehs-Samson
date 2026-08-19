import { motion } from 'framer-motion';
import { techStack } from '@/lib/data';

export function TechStack() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/50 py-12 dark:border-slate-800 dark:bg-slate-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Trusted Technologies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {techStack.map((tech, idx) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="text-lg font-semibold text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-600 dark:hover:text-slate-300"
            >
              {tech}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
