import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://udehsamson.dev';
const staticRoutes = ['/', '/about', '/projects', '/blog', '/services', '/contact', '/resume'];
const projectSlugs = ['fintrack-pro', 'nexus-commerce', 'taskflow-ai', 'healthsync'];
const blogSlugs = ['scalable-nextjs-architecture', 'typescript-strict-patterns'];
const routes = [
  ...staticRoutes,
  ...projectSlugs.map((slug) => `/projects/${slug}`),
  ...blogSlugs.map((slug) => `/blog/${slug}`),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const outDir = process.argv[2] || 'dist';
const outputPath = path.resolve(outDir, 'sitemap.xml');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, sitemap);

console.log(`Sitemap generated at ${outputPath}`);
