import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, GitCommit, GitPullRequest, Star, GitFork, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useContentStore } from '@/hooks/useContentStore';

const fallbackContributions = [
  1, 3, 2, 4, 0, 2, 5, 3, 4, 1, 0, 2, 3, 5, 4, 2, 1, 3, 4, 0, 2, 5, 3, 4,
  2, 1, 3, 0, 4, 5, 2, 3, 1, 4, 2, 0, 3, 5, 4, 2, 1, 3, 0, 4, 2, 5, 3, 1,
  4, 2, 0, 3, 1, 5, 4, 2, 3, 0, 1, 4, 2, 5, 3, 4, 1, 2, 0, 3, 4, 5, 2, 1,
];

type ContributionDay = {
  date: string;
  contributionCount: number;
  color: string;
};

type ContributionWeek = {
  contributionDays: ContributionDay[];
};

type GitHubRepo = {
  name: string;
  url: string;
  description: string | null;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage?: { name: string; color: string } | null;
};

type GitHubActivityData = {
  user: {
    login: string;
    name: string;
    url: string;
    avatarUrl: string;
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: ContributionWeek[];
      };
    };
    repositoriesContributedTo: {
      nodes: GitHubRepo[];
    };
    pinnedItems: {
      nodes: GitHubRepo[];
    };
  };
};

export function GitHubActivity() {
  const { data } = useContentStore();
  const [activity, setActivity] = useState<GitHubActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch('/api/github-activity?username=udehsamson');
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.error || 'Failed to load GitHub activity');
        }
        setActivity(json);
      } catch (err: any) {
        setError(err?.message ?? 'Unable to fetch GitHub activity');
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const contributionDays = useMemo(() => {
    if (!activity) return fallbackContributions;
    return activity.user.contributionsCollection.contributionCalendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        color: day.color,
      }))
    );
  }, [activity]);

  const totalContributions = activity?.user.contributionsCollection.contributionCalendar.totalContributions ?? 2847;
  const repoList = activity?.user.pinnedItems.nodes.length
    ? activity.user.pinnedItems.nodes
    : activity?.user.repositoriesContributedTo.nodes ?? [];
  const pinnedStars = activity
    ? activity.user.pinnedItems.nodes.reduce((sum, repo) => sum + repo.stargazerCount, 0)
    : 1289;
  const pinnedForks = activity
    ? activity.user.pinnedItems.nodes.reduce((sum, repo) => sum + repo.forkCount, 0)
    : 416;

  const stats = [
    { icon: GitCommit, label: 'Contributions', value: totalContributions },
    { icon: GitPullRequest, label: 'Repos Contributed', value: activity?.user.repositoriesContributedTo.nodes.length ?? 8 },
    { icon: Star, label: 'Pinned Stars', value: pinnedStars },
    { icon: GitFork, label: 'Forks', value: pinnedForks },
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
            GitHub <span className="gradient-text">Activity</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
            A snapshot of my open-source contributions and community impact.
          </p>
          {loading && <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading GitHub activity…</p>}
          {error && (
            <p className="mt-4 text-sm text-red-500 dark:text-red-400">
              Could not load real GitHub data. Showing fallback activity.
            </p>
          )}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display font-semibold">Contribution Graph</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {activity ? `${activity.user.name}'s real GitHub contribution calendar` : 'Fallback contribution graph'}
                </p>
              </div>
              <a
                href={data.profile.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                <Github className="h-4 w-4" /> View Profile
              </a>
            </div>
            <div className="grid grid-cols-12 gap-1 sm:grid-cols-18 md:grid-cols-24">
              {contributionDays.map((day, idx) => {
                const levelColor = activity ? day.color : ['bg-slate-100 dark:bg-slate-800', 'bg-emerald-200 dark:bg-emerald-900/40', 'bg-emerald-300 dark:bg-emerald-700/50', 'bg-emerald-400 dark:bg-emerald-600', 'bg-emerald-500 dark:bg-emerald-500'][day % 5];
                const title = activity ? `${day.count} contributions on ${day.date}` : `${day} contributions`;
                return (
                  <motion.div
                    key={activity ? day.date : idx}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: idx * 0.002 }}
                    className={`aspect-square rounded-sm ${levelColor}`}
                    title={title}
                  />
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="flex h-full flex-col items-center justify-center text-center">
                  <stat.icon className="mb-3 h-6 w-6 text-blue-500" />
                  <div className="font-display text-2xl font-bold">
                    <AnimatedCounter value={stat.value} suffix="+" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {repoList.length > 0 && (
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {repoList.slice(0, 3).map((repo) => (
              <Card key={repo.url} className="overflow-hidden">
                <a href={repo.url} target="_blank" rel="noreferrer" className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{repo.name}</p>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {repo.description ?? 'Open-source repository'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{repo.stargazerCount} stars</span>
                    <span>{repo.forkCount} forks</span>
                    {repo.primaryLanguage && <span>{repo.primaryLanguage.name}</span>}
                  </div>
                </a>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
