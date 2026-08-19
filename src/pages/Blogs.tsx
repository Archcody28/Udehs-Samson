import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Search } from 'lucide-react';
import { SEO } from '@/components/layout/SEO';
import { useContentStore } from '@/hooks/useContentStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

export function Blog() {
  const { publishedBlogPosts } = useContentStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(publishedBlogPosts.flatMap((p) => p.categories)))],
    [publishedBlogPosts]
  );

  const filtered = useMemo(() => {
    return publishedBlogPosts.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === 'All' || p.categories.includes(category);
      return matchesSearch && matchesCategory;
    });
  }, [publishedBlogPosts, search, category]);

  const featured = publishedBlogPosts.find((p) => p.featured);

  return (
    <>
      <SEO title="Blog" pathname="/blog" />
      <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Blog & <span className="gradient-text">Insights</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
            Deep dives into engineering, design systems, and product development.
          </p>
        </motion.div>

        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <Link to={`/blog/${featured.slug}`}>
              <Card className="group grid overflow-hidden p-0 lg:grid-cols-2" hover>
                <div className="aspect-video overflow-hidden lg:aspect-auto">
                  <img
                    src={featured.coverImage || '/images/blog-placeholder.jpg'}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center p-8">
                  <Badge variant="primary" className="mb-4 w-fit">
                    Featured
                  </Badge>
                  <h2 className="mb-4 font-display text-2xl font-bold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 sm:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mb-6 text-slate-600 dark:text-slate-400">{featured.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span>{formatDate(featured.publishedAt)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {featured.readingTime} min read
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        )}

        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search articles, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
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

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-lg text-slate-500 dark:text-slate-400">No articles found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearch('');
                setCategory('All');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
