import { motion } from 'framer-motion';
import { useContentStore } from '@/hooks/useContentStore';
import { Card } from '@/components/ui/Card';
import { Award, Briefcase, GraduationCap, Users } from 'lucide-react';

export function AboutIntro() {
  const { data } = useContentStore();
  const { profile, education, experiences, testimonials } = data;

  const highlights = [
    { icon: Briefcase, label: 'Years Experience', value: '7+' },
    { icon: Users, label: 'Clients Served', value: '30+' },
    { icon: Award, label: 'Certifications', value: `${data.certifications.length}+` },
    { icon: GraduationCap, label: 'Education', value: education[0]?.institution ?? 'University' },
  ];

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
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
            A glimpse into my journey, values, and the expertise I bring to every project.
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="prose prose-lg max-w-none text-slate-700 dark:prose-invert dark:text-slate-300">
              {profile.bio.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-6 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            {highlights.map((item, idx) => (
              <Card key={item.label} className="flex items-center gap-4" hover>
                <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
                  <item.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="font-display font-semibold">{item.value}</p>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
