import { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, ExternalLink, Github } from 'lucide-react';
import { SEO } from '@/components/layout/SEO';
import { useContentStore } from '@/hooks/useContentStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, publishedProjects, recordProjectView } = useContentStore();

  const project = useMemo(
    () => data.projects.find((p) => p.slug === slug && p.status === 'published'),
    [data.projects, slug]
  );

  const related = useMemo(
    () =>
      publishedProjects.filter(
        (p) => p.id !== project?.id && project?.relatedProjectIds?.includes(p.id)
      ),
    [publishedProjects, project]
  );

  useEffect(() => {
    if (project) {
      recordProjectView(project.id);
    }
  }, [project, recordProjectView]);

  if (!project) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-32 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold">Project not found</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-6" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={project.seoTitle || project.title}
        description={project.seoDescription || project.description}
        pathname={`/projects/${project.slug}`}
        type="article"
        image={project.images[0]}
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
        >
          <div className="mb-8 flex flex-wrap gap-2">
            {project.categories.map((cat) => (
              <Badge key={cat} variant="primary">
                {cat}
              </Badge>
            ))}
          </div>

          <h1 className="font-display text-3xl font-bold sm:text-5xl">{project.title}</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-400">
            {project.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4" /> Completed {formatDate(project.completionDate)}
            </span>
            <div className="flex gap-3">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" leftIcon={<Github className="h-4 w-4" />}>
                    Source Code
                  </Button>
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer">
                  <Button size="sm" leftIcon={<ExternalLink className="h-4 w-4" />}>
                    Live Demo
                  </Button>
                </a>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 grid gap-8 lg:grid-cols-3"
        >
          <div className="lg:col-span-2 space-y-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <img
                src={project.images[0] || '/images/placeholder.jpg'}
                alt={project.title}
                className="w-full object-cover"
              />
            </div>

            {project.videoUrl && (
              <div className="aspect-video overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <video
                  src={project.videoUrl}
                  controls
                  className="h-full w-full"
                  poster={project.images[0]}
                />
              </div>
            )}

            <Card className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                {project.content}
              </div>
            </Card>

            {project.challenges && (
              <Card>
                <h3 className="mb-3 font-display text-xl font-semibold">Challenges</h3>
                <p className="text-slate-600 dark:text-slate-400">{project.challenges}</p>
              </Card>
            )}

            {project.solutions && (
              <Card>
                <h3 className="mb-3 font-display text-xl font-semibold">Solutions</h3>
                <p className="text-slate-600 dark:text-slate-400">{project.solutions}</p>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="mb-4 font-display text-lg font-semibold">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="default">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="mb-4 font-display text-lg font-semibold">Project Info</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Status</span>
                  <Badge variant={project.status === 'published' ? 'success' : 'warning'}>
                    {project.status}
                  </Badge>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Completed</span>
                  <span>{formatDate(project.completionDate)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Categories</span>
                  <span>{project.categories.join(', ')}</span>
                </li>
              </ul>
            </Card>

            {related.length > 0 && (
              <Card>
                <h3 className="mb-4 font-display text-lg font-semibold">Related Projects</h3>
                <div className="space-y-4">
                  {related.map((p) => (
                    <Link
                      key={p.id}
                      to={`/projects/${p.slug}`}
                      className="group flex items-center gap-3"
                    >
                      <img
                        src={p.images[0] || '/images/placeholder.jpg'}
                        alt={p.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {p.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {p.categories.join(', ')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
