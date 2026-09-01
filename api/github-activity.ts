
const GITHUB_API = 'https://api.github.com/graphql';
const DEFAULT_USERNAME = 'Archcody28';

function fallbackGitHubPayload() {
  const startDate = new Date('2026-01-04T00:00:00.000Z');

  const weeks = Array.from({ length: 53 }, (_, weekIndex) => {
    const contributionDays = Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(startDate);

      date.setDate(
        startDate.getDate() + weekIndex * 7 + dayIndex
      );

      return {
        date: date.toISOString().slice(0, 10),
        contributionCount: (weekIndex + dayIndex) % 5,
        color: '#ebedf0',
      };
    });

    return { contributionDays };
  });

  return {
    user: {
      login: DEFAULT_USERNAME,
      name: 'Udeh Samson',
      url: `https://github.com/${DEFAULT_USERNAME}`,
      avatarUrl: 'https://github.com/Archcody28.png',

      contributionsCollection: {
        contributionCalendar: {
          totalContributions: 2847,
          weeks,
        },
      },

      repositoriesContributedTo: {
        nodes: [],
      },

      pinnedItems: {
        nodes: [],
      },
    },
  };
}

export default async function handler(req: any, res: any) {
  const token = process.env.GITHUB_TOKEN;

<<<<<<< HEAD
  // Use fallback data when no GitHub token is configured.
  if (!token) {
    res.setHeader(
      'Cache-Control',
      's-maxage=300, stale-while-revalidate=600'
    );

    return res.status(200).json(fallbackGitHubPayload());
  }

<<<<<<< HEAD
  // The portfolio only exposes the configured GitHub account.
  const username = DEFAULT_USERNAME;

  const query = `
    query GitHubActivity($login: String!) {
      user(login: $login) {
        login
        name
        url
        avatarUrl

        contributionsCollection {
          contributionCalendar {
            totalContributions

            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }

        repositoriesContributedTo(
          first: 8
          orderBy: {
            field: PUSHED_AT
            direction: DESC
          }
        ) {
          nodes {
            name
            url
            description
            stargazerCount
            forkCount

            primaryLanguage {
              name
              color
            }
          }
        }

        pinnedItems(
          first: 6
          types: REPOSITORY
        ) {
          nodes {
            ... on Repository {
              name
              url
              description
              stargazerCount
              forkCount

              primaryLanguage {
                name
                color
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GITHUB_API, {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },

      body: JSON.stringify({
        query,
        variables: {
          login: username,
        },
      }),
    });

    const json = await response.json();

    if (!response.ok || json.errors) {
      const detail = json.errors
        ? json.errors
            .map((error: any) => error.message)
            .join('; ')
        : response.statusText;

      return res.status(502).json({
        error: 'GitHub API request failed.',
        details: detail,
      });
    }

    if (!json.data?.user) {
      return res.status(404).json({
        error: 'GitHub user not found.',
      });
    }

    res.setHeader(
      'Cache-Control',
      's-maxage=300, stale-while-revalidate=600'
    );

    return res.status(200).json(json.data);
  } catch (error) {
    console.error('GitHub activity error:', error);

    return res.status(500).json({
      error: 'Unable to fetch GitHub activity.',
    });
  }
}

