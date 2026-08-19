import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  if (env.VITE_GITHUB_TOKEN && !process.env.GITHUB_TOKEN) {
    process.env.GITHUB_TOKEN = env.VITE_GITHUB_TOKEN;
  }

  const plugins = [react(), tailwindcss()];
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}

  let githubApiHandler: any = null;
  try {
    const mod = await import('./api/github-activity.ts');
    githubApiHandler = mod.default;
  } catch {}

  let portfolioData: any = null;
  try {
    const dataMod = await import('./src/lib/data.ts');
    portfolioData = dataMod.defaultPortfolioData;
  } catch {}

  plugins.push({
    name: 'vite:local-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        const pathname = url.pathname;

        if (pathname.startsWith('/api/')) {
          if (pathname === '/api/github-activity') {
            (req as any).query = Object.fromEntries(url.searchParams.entries());

            if (!githubApiHandler) {
              return next();
            }

            const enhancedRes = res as any;
            if (typeof enhancedRes.status !== 'function') {
              enhancedRes.status = (code: number) => {
                enhancedRes.statusCode = code;
                return enhancedRes;
              };
            }
            if (typeof enhancedRes.json !== 'function') {
              enhancedRes.json = (data: unknown) => {
                enhancedRes.setHeader('Content-Type', 'application/json');
                enhancedRes.end(JSON.stringify(data));
              };
            }

            try {
              await githubApiHandler(req, enhancedRes, next);
            } catch (error) {
              next(error);
            }
            return;
          }

          if (portfolioData) {
            const payloads: Record<string, unknown> = {
              '/api/projects': portfolioData.projects,
              '/api/blogs': portfolioData.blogPosts,
              '/api/skills': portfolioData.skills,
              '/api/testimonials': portfolioData.testimonials,
              '/api/experience': portfolioData.experiences,
              '/api/education': portfolioData.education,
              '/api/certifications': portfolioData.certifications,
              '/api/services': portfolioData.services ?? portfolioData.services,
            };

            const payload = payloads[pathname];
            if (payload !== undefined) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(payload));
              return;
            }

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `Unknown API route: ${pathname}` }));
            return;
          }

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 503;
          res.end(JSON.stringify({ error: 'API data source is unavailable in local dev' }));
          return;
        }

        return next();
      });
    },
  });

  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    plugins,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
})
