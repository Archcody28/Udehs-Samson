import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useProfile } from '@/hooks/useContentStore';

export function ContactCTA() {
  const profile = useProfile();

  if (!profile) return null;

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-5xl rounded-2xl border border-line bg-surface p-8 text-center sm:p-12 lg:p-16"
      >
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Let's Build Something Amazing Together
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          Have a project in mind? I'm always open to discussing new opportunities, creative ideas,
          or ways to help your team ship faster.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/contact">
            <Button
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Start a Conversation
            </Button>
          </Link>
          <a href={`mailto:${profile.email}`}>
            <Button
              size="lg"
              variant="outline"
              leftIcon={<Mail className="h-5 w-5" />}
            >
              {profile.email}
            </Button>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
