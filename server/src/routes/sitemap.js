import express from 'express';
import Project from '../models/Project.js';
import BlogPost from '../models/BlogPost.js';

const router = express.Router();

const BASE_URL = 'https://udeh-samson.vercel.app';

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/projects', changefreq: 'weekly', priority: '0.9' },
  { path: '/blog', changefreq: 'weekly', priority: '0.9' },
  { path: '/services', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/resume', changefreq: 'monthly', priority: '0.7' },
];

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

router.get('/', async (req, res) => {
  try {
    const [projects, blogs] = await Promise.all([
      Project.find({ status: 'published' }).select('slug updatedAt'),
      BlogPost.find({ status: 'published' }).select('slug updatedAt'),
    ]);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const route of staticRoutes) {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}${escapeXml(route.path)}</loc>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    for (const project of projects) {
      if (!project.slug) continue;
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/projects/${escapeXml(project.slug)}</loc>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      if (project.updatedAt) {
        xml += `    <lastmod>${new Date(project.updatedAt).toISOString()}</lastmod>\n`;
      }
      xml += '  </url>\n';
    }

    for (const blog of blogs) {
      if (!blog.slug) continue;
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/blog/${escapeXml(blog.slug)}</loc>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      if (blog.updatedAt) {
        xml += `    <lastmod>${new Date(blog.updatedAt).toISOString()}</lastmod>\n`;
      }
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

export default router;