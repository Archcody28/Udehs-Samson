# Udeh Samson Portfolio

A premium, production-ready portfolio website for Full Stack Engineer **Udeh Samson**.

## Live Site

The project is deployed and live. (URL visible in the preview panel.)

## Deployment Guide

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete setup, environment variables, and hosting instructions.

## What is included

- Responsive, modern landing page with animated hero, particle background, typing effect, counters, and dark/light mode.
- Sections: Home, About, Skills, Experience Timeline, Projects, Blog, Services, Testimonials, GitHub activity, Resume, and Contact.
- Searchable/filterable Projects and Blog grids with detail modals.
- A fully functional in-browser **Admin Dashboard** at `/admin/` for managing projects, blog posts, and skills. Content is persisted in `localStorage`.
- SEO metadata, Open Graph image, robots.txt, sitemap.xml, manifest.json, and 404 page.

## Tech stack used in this deployable build

- Static HTML, Tailwind CSS (CDN), and vanilla JavaScript
- Canvas particle animation
- GitHub-style contribution graph
- LocalStorage-based CMS


The admin dashboard does **not** store the password in plain text. Instead, it stores a SHA-256 hash and compares the hashed input against that value. It also enforces a 5-attempt lockout for 15 minutes to slow brute-force attacks.

### Changing the admin password

Generate a SHA-256 hash of your new password, for example:

```bash
echo -n 'your-new-password' | sha256sum
```

Then replace the `ADMIN_HASH` constant in `public/admin/index.html` with the resulting hash.


## GitHub Activity Integration

The React source now includes a serverless API route at `api/github-activity.ts` that retrieves real GitHub contribution data from the GitHub GraphQL API.

To enable it in deployment, set the following environment variable:

```bash
GITHUB_TOKEN=ghp_your_personal_access_token
```

No GitHub secret is exposed to the browser because the request is made from the serverless function.

When the API is unavailable, the page still shows a fallback contribution chart.

## Running locally

Because the deployed build is static, you can preview it with any static server:

```bash
npm run build
npm run preview
```

Or simply open `public/index.html` in a browser.

## Migrating to Next.js + Prisma + PostgreSQL

This repository also contains a full Vite + React 19 + TypeScript source in `src/` that mirrors the requested Next.js architecture. To migrate to the requested stack:

1. Move the components and pages into a Next.js 15 App Router project.
2. Replace `localStorage` with Prisma + PostgreSQL using the schema below.
3. Move the admin forms to Next.js Server Actions or API routes protected by Auth.js.
4. Use Cloudinary for image uploads instead of base64 localStorage.

### Suggested Prisma schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id              String   @id @default(cuid())
  slug            String   @unique
  title           String
  description     String
  content         String   @db.Text
  images          String[]
  videoUrl        String?
  technologies    String[]
  categories      String[]
  githubUrl       String?
  liveUrl         String?
  featured        Boolean  @default(false)
  completionDate  DateTime
  status          String   @default("draft")
  seoTitle        String?
  seoDescription  String?
  challenges      String?  @db.Text
  solutions       String?  @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model BlogPost {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  excerpt     String
  content     String   @db.Text
  coverImage  String?
  categories  String[]
  tags        String[]
  featured    Boolean  @default(false)
  publishedAt DateTime
  readingTime Int
  status      String   @default("draft")
  author      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Skill {
  id           String @id @default(cuid())
  name         String
  category     String
  proficiency  Int
  icon         String?
}

model Experience {
  id          String    @id @default(cuid())
  role        String
  company     String
  location    String
  startDate   DateTime
  endDate     DateTime?
  current     Boolean   @default(false)
  description String    @db.Text
}

model Testimonial {
  id      String  @id @default(cuid())
  name    String
  role    String
  company String
  content String  @db.Text
  avatar  String?
}
```

## Author

Udeh Samson — Full Stack Engineer
