import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { SEO } from '@/components/layout/SEO';
import { defaultServices } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import * as LucideIcons from 'lucide-react';

export function ServicesPage() {
  return (
    <>
      <SEO title="Services" pathname="/services" />
      <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            My <span className="gradient-text">Services</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
            From concept to deployment, I help teams build fast, scalable, and delightful digital products.
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
                  <ul className="mb-6 space-y-2">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/contact">
                    <Button variant="outline" className="w-full" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Get Started
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
