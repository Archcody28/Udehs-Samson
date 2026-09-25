import { motion } from 'framer-motion';
import { defaultServices } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Check, Layers, Monitor, Server, Smartphone, Palette, TrendingUp } from 'lucide-react';

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Monitor,
  Server,
  Smartphone,
  Palette,
  TrendingUp,
};

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
            What I Offer
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            End-to-end engineering services tailored to help startups and enterprises scale.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {defaultServices.map((service, idx) => {
            const Icon = serviceIcons[service.icon];
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="h-full" hover>
                  <div className="mb-5 inline-flex rounded-2xl bg-accent-soft p-4">
                    {Icon ? (
                      <Icon className="h-7 w-7 text-accent-ink" />
                    ) : (
                      <div className="h-7 w-7" />
                    )}
                  </div>
                  <h3 className="mb-3 font-display text-xl font-semibold">{service.title}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-muted">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-ink">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-ink" />
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
