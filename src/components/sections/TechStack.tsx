import { motion } from 'framer-motion';
import { techStack } from '@/lib/data';

export function TechStack() {
  return (
    <section className="border-y border-line bg-surface/50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-subtle">
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
              className="text-lg font-semibold text-subtle transition-colors hover:text-ink"
            >
              {tech}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
