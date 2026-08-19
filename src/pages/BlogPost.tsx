import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { SEO } from '@/components/layout/SEO';
import { useContentStore } from '@/hooks/useContentStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

function parseMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let codeBlock: string[] | null = null;
  let codeLang = '';

  lines.forEach((line, idx) => {
    if (line.startsWith('```')) {
      if (!codeBlock) {
        codeBlock = [];
        codeLang = line.replace(/```/g, '').trim();
      } else {
        elements.push(
          <pre
            key={idx}
            className="my-6 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100"
          >
            <code>{codeBlock.join('\n')}</code>
          </pre>
        );
        codeBlock = null;
        codeLang = '';
      }
      return;
    }

    if (codeBlock) {
      codeBlock.push(line);
      return;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={idx} id={line.slice(2).toLowerCase().replace(/\s+/g, '-')} className="mb-6 mt-10 text-3xl font-bold">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      const title = line.slice(3);
      const id = title.toLowerCase().replace(/\s+/g, '-');
      elements.push(
        <h2 key={idx} id={id} className="mb-4 mt-10 text-2xl font-bold">
          {title}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="mb-3 mt-8 text-xl font-bold">
          {line.slice(4)}
        </h3>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={idx} className="h-4" />);
    } else {
      elements.push(
        <p key={idx} className="leading-relaxed text-slate-700 dark:text-slate-300">
          {line}
        </p>
      );
    }
  });

  return elements;
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data } = useContentStore();

  const post = useMemo(
    () => data.blogPosts.find((p) => p.slug === slug && p.status === 'published'),
    [data.blogPosts, slug]
  );

  const toc = useMemo(() => {
    if (!post) return [];
    return post.content
      .split('\n')
      .filter((line) => line.startsWith('## '))
      .map((line) => line.slice(3).trim());
  }, [post]);

  if (!post) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-32 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold">Article not found</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-6" onClick={() => navigate('/blog')}>
          Back to Blog
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        pathname={`/blog/${post.slug}`}
        type="article"
      />
      <div className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <div className="mb-6 flex flex-wrap gap-2">
            {post.categories.map((cat) => (
              <Badge key={cat} variant="primary">
                {cat}
              </Badge>
            ))}
          </div>

          <h1 className="font-display text-3xl font-bold sm:text-5xl">{post.title}</h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" /> {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {post.readingTime} min read
            </span>
          </div>

          {post.coverImage && (
            <div className="my-10 overflow-hidden rounded-2xl">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full object-cover"
              />
            </div>
          )}

          {toc.length > 0 && (
            <div className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="mb-4 font-display font-semibold">Table of Contents</h3>
              <ul className="space-y-2">
                {toc.map((heading) => (
                  <li key={heading}>
                    <a
                      href={`#${heading.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      {heading}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <article className="prose prose-lg max-w-none dark:prose-invert">
            {parseMarkdown(post.content)}
          </article>

          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="default">
                #{tag}
              </Badge>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
