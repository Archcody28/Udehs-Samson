import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Facebook,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Calendar,
  MessageCircle,
} from 'lucide-react';
import { SEO } from '@/components/layout/SEO';
import { useProfile, useContentActions } from '@/hooks/useContentStore';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

export function Contact() {
  const profile = useProfile();
  const { addMessage } = useContentActions();
  if (!profile) return null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (formData: FormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    addMessage(formData);
    toast.success('Message sent successfully! I will get back to you soon.');
    reset();
  };

  const contactLinks = [
    { icon: Mail, label: 'Email', href: `mailto:${profile.email}`, value: profile.email },
    { icon: Phone, label: 'Phone', href: `tel:${profile.phone.replace(/\s+/g, '')}`, value: profile.phone },
    { icon: MapPin, label: 'Location', href: '#', value: profile.location },
    { icon: Github, label: 'GitHub', href: profile.github, value: '@udehsamson' },
    { icon: Linkedin, label: 'LinkedIn', href: profile.linkedin, value: '/in/udehsamson' },
    { icon: Twitter, label: 'X', href: profile.x, value: '@udehsamson' },
    { icon: Facebook, label: 'Facebook', href: profile.facebook, value: 'Facebook' },
    { icon: MessageCircle, label: 'WhatsApp', href: profile.whatsapp, value: 'Chat on WhatsApp' },
    { icon: Calendar, label: 'Book a Call', href: 'https://calendly.com', value: 'Schedule time' },
  ];

  return (
    <>
      <SEO title="Contact" pathname="/contact" />
      <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Have a project, opportunity, or question? I'd love to hear from you.
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Input label="Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
              <Input
                label="Subject"
                placeholder="Project inquiry"
                error={errors.subject?.message}
                {...register('subject')}
              />
              <Textarea
                label="Message"
                rows={6}
                placeholder="Tell me about your project..."
                error={errors.message?.message}
                {...register('message')}
              />
              <Button type="submit" size="lg" isLoading={isSubmitting}>
                Send Message
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="font-display text-xl font-semibold">Contact Information</h2>
            {contactLinks.filter((link) => link.href).map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent"
              >
                <div className="rounded-xl bg-accent-soft p-2.5">
                  <link.icon className="h-5 w-5 text-accent-ink" />
                </div>
                <div>
                  <p className="text-xs text-subtle">{link.label}</p>
                  <p className="text-sm font-medium">{link.value}</p>
                </div>
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
