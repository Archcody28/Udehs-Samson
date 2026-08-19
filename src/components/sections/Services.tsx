import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { defaultServices } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Check } from 'lucide-react';

export function Services() {
  return (
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
            What I <span className="gradient-text">Offer</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
            End-to-end engineering services tailored to help startups and enterprises scale.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {defaultServices.map((service, idx) => {
            const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[
              service.icon
            ];
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="h-full" hover>
                  <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4">
                    {Icon ? (
                      <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <div className="h-7 w-7" />
                    )}
                  </div>
                  <h3 className="mb-3 font-display text-xl font-semibold">{service.title}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
