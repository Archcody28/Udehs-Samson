import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { useContentStore } from '@/hooks/useContentStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

export function Blogs() {
  const { publishedBlogPosts } = useContentStore();
  const posts = publishedBlogPosts.slice(0, 3);

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Latest <span className="gradient-text">Articles</span>
            </h2>
            <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              Thoughts on engineering, design systems, and building products at scale.
            </p>
          </div>
          <Link to="/blog">
            <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Read All Articles
            </Button>
          </Link>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Link to={`/blog/${post.slug}`}>
                <Card className="group h-full overflow-hidden p-0" hover>
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={post.coverImage || '/images/blog-placeholder.jpg'}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readingTime} min read
                      </span>
                    </div>
                    <h3 className="mb-3 font-display text-lg font-semibold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {post.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="default">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
