import { useEffect, useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Github,
  GitCommit,
  GitPullRequest,
  Star,
  GitFork,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useProfile } from '@/hooks/useContentStore';

// Module-level in-memory cache for the GitHub activity response.
// Real data only: populated only after a successful backend response.
// Used across remounts/navigation so ordinary SPA navigation does not
// re-fetch GitHub activity during the cache lifetime.
let githubCache: {
  data: GitHubActivityData;
  fetchedAt: number;
} | null = null;

const GITHUB_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Raw GitHub GraphQL shape (contributionCount) is kept distinct from the
// derived render cell (count) so both are typed precisely.
type ApiContributionDay = {
  date: string;
  contributionCount: number;
  color: string;
};

type ContributionWeek = {
  contributionDays: ApiContributionDay[];
};

type ContributionDay = {
  date: string;
  count: number;
  color: string;
};

type GitHubRepo = {
  name: string;
  url: string;
  description: string | null;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage?: {
    name: string;
    color: string;
  } | null;
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

export function getCachedGitHubActivity(): GitHubActivityData | null {
  if (!githubCache) return null;
  if (Date.now() - githubCache.fetchedAt >= GITHUB_CACHE_TTL_MS) {
    githubCache = null;
    return null;
  }
  return githubCache.data;
}

// In-flight guard: a single request is shared by StrictMode's double-invoked
// effect and by any concurrent mount, mirroring the ContentProvider's dedupe
// pattern so ordinary mounting cannot fire duplicate GitHub requests.
let githubInFlight: Promise<GitHubActivityData> | null = null;

function loadGitHubActivity(): Promise<GitHubActivityData> {
  if (githubInFlight) return githubInFlight;

  githubInFlight = (async () => {
    try {
      const response = await fetch('/api/github-activity');
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Failed to load GitHub activity');
      }

      const data = json as GitHubActivityData;
      githubCache = { data, fetchedAt: Date.now() };
      return data;
    } finally {
      githubInFlight = null;
    }
  })();

  return githubInFlight;
}

export async function refreshGitHubActivity(): Promise<void> {
  await loadGitHubActivity();
}

export function clearGitHubCache(): void {
  githubCache = null;
  githubInFlight = null;
}

export function GitHubActivity() {
  // Profile-only subscription: independent GitHub fetch, no coupling to
  // other portfolio state changes.
  const profile = useProfile();
  const githubUrl = profile?.github;

  const [activity, setActivity] = useState<GitHubActivityData | null>(() => {
    // Reuse a recent real GitHub response already cached before this mount
    // (e.g. after returning to a route that remounts this section).
    return getCachedGitHubActivity();
  });
  const [loading, setLoading] = useState(() => !(githubCache && activity));
  const [error, setError] = useState<string | null>(null);

  // Start with the cached activity so the section never re-renders with
  // a different derived shape when the cache is already warm.
  const cachedRef = useRef<GitHubActivityData | null>(activity);

  useEffect(() => {
    // If a valid cache entry exists before the mount, respect it rather
    // than re-fetching the GitHub API on every remount.
    if (cachedRef.current) {
      setActivity(cachedRef.current);
      return;
    }

    let cancelled = false;

    // Shared loader: joins the in-flight request if one exists instead of
    // starting a second one (StrictMode double-invoke / concurrent mounts).
    loadGitHubActivity()
      .then((data) => {
        if (cancelled) return;
        cachedRef.current = data;
        setActivity(data);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err && typeof err === 'object' && 'message' in err
            ? (err as { message: string }).message
            : 'Unable to load GitHub activity';
        setError(message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cachedRef]);

  // No fabricated fallback: render nothing/empty until real GitHub data
  // arrives (or show the error state). The grid simply stays empty during
  // the brief fetch window.
  const contributionDays = useMemo<ContributionDay[]>(() => {
    if (!activity) {
      return [];
    }

    return activity.user.contributionsCollection.contributionCalendar.weeks.flatMap(
      (week) =>
        week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          color: day.color,
        }))
    );
  }, [activity]);

  const totalContributions =
    activity?.user.contributionsCollection.contributionCalendar
      .totalContributions ?? 0;

  const repoList = activity?.user.pinnedItems.nodes.length
    ? activity.user.pinnedItems.nodes
    : activity?.user.repositoriesContributedTo.nodes ?? [];

  const pinnedStars = activity
    ? activity.user.pinnedItems.nodes.reduce(
        (sum, repo) => sum + repo.stargazerCount,
        0
      )
    : 0;

  const pinnedForks = activity
    ? activity.user.pinnedItems.nodes.reduce(
        (sum, repo) => sum + repo.forkCount,
        0
      )
    : 0;

  const stats = [
    {
      icon: GitCommit,
      label: 'Contributions',
      value: totalContributions,
    },
    {
      icon: GitPullRequest,
      label: 'Repos Contributed',
      value:
        activity?.user.repositoriesContributedTo.nodes.length ?? 0,
    },
    {
      icon: Star,
      label: 'Pinned Stars',
      value: pinnedStars,
    },
    {
      icon: GitFork,
      label: 'Forks',
      value: pinnedForks,
    },
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
            GitHub Activity
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted">
            A snapshot of my open-source contributions and community impact.
          </p>

          {loading && (
            <p className="mt-4 text-sm text-subtle">
              Loading GitHub activity…
            </p>
          )}

          {error && (
            <p className="mt-4 text-sm text-danger-ink">
              Could not load GitHub activity.
            </p>
          )}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display font-semibold">
                  Contribution Graph
                </h3>

                <p className="text-sm text-subtle">
                  {activity
                    ? `${activity.user.name}'s GitHub contribution calendar`
                    : 'Loading contribution activity'}
                </p>
              </div>

              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-accent-ink hover:underline"
              >
                <Github className="h-4 w-4" />
                View Profile
              </a>
            </div>

            <div className="grid grid-cols-12 gap-1 sm:grid-cols-18 md:grid-cols-24">
              {contributionDays.map((day, idx) => {
                const backgroundColor = day.color;
                const title = `${day.count} contributions on ${day.date}`;

                return (
                  <motion.div
                    key={day.date}
                    initial={{
                      opacity: 0,
                      scale: 0,
                    }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.2,
                      delay: idx * 0.002,
                    }}
                    className="aspect-square rounded-sm"
                    style={{
                      backgroundColor,
                    }}
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
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.1,
                }}
              >
                <Card className="flex h-full flex-col items-center justify-center text-center">
                  <stat.icon className="mb-3 h-6 w-6 text-accent-ink" />

                  <div className="font-display text-2xl font-bold">
                    <AnimatedCounter
                      value={stat.value}
                      suffix="+"
                    />
                  </div>

                  <p className="text-xs text-subtle">
                    {stat.label}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {repoList.length > 0 && (
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {repoList.slice(0, 3).map((repo) => (
              <Card
                key={repo.url}
                className="overflow-hidden"
              >
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-ink">
                      {repo.name}
                    </p>

                    <ExternalLink className="h-4 w-4 text-subtle" />
                  </div>

                  <p className="text-sm leading-relaxed text-muted">
                    {repo.description ?? 'Open-source repository'}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs text-subtle">
                    <span>
                      {repo.stargazerCount} stars
                    </span>

                    <span>
                      {repo.forkCount} forks
                    </span>

                    {repo.primaryLanguage && (
                      <span>
                        {repo.primaryLanguage.name}
                      </span>
                    )}
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