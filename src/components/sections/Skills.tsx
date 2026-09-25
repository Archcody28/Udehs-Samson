import { motion } from 'framer-motion';
import { useSkills } from '@/hooks/useContentStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function Skills() {
  const skills = useSkills();

  const categories = Array.from(new Set(skills.map((s) => s.category)));

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
            Technical Skills
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Tools and technologies I use to build scalable, performant products.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, cidx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: cidx * 0.1 }}
            >
              <Card className="h-full">
                <h3 className="mb-6 font-display text-lg font-semibold">{category}</h3>
                <div className="space-y-5">
                  {skills
                    .filter((s) => s.category === category)
                    .map((skill) => (
                      <div key={skill.id}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium">{skill.name}</span>
                          <Badge variant="primary">{skill.proficiency}%</Badge>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-elevated">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.proficiency}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full bg-accent"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
