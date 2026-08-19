import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useContentStore } from '@/hooks/useContentStore';

export function ContactCTA() {
  const { data } = useContentStore();

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-blue-600 to-purple-700 p-8 text-center text-white shadow-2xl shadow-blue-500/25 sm:p-12 lg:p-16"
      >
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Let's Build Something Amazing Together
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-blue-100">
          Have a project in mind? I'm always open to discussing new opportunities, creative ideas,
          or ways to help your team ship faster.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/contact">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Start a Conversation
            </Button>
          </Link>
          <a href={`mailto:${data.profile.email}`}>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              leftIcon={<Mail className="h-5 w-5" />}
            >
              {data.profile.email}
            </Button>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
