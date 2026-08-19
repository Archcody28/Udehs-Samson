# Deployment Guide

This project is a Vite + React portfolio site designed for static hosting, with a serverless GitHub activity endpoint and a protected admin dashboard.

## Project layout

- Frontend app: `src/`
- Production build output: `dist/`
- Vercel config: `vercel.json`
- Serverless API: `api/github-activity.ts`
- Admin panel: `public/admin/index.html`

## Build status

This project is verified to build successfully with:

```bash
npm install
npm run build
```

The production build output is generated to `dist/` and is compatible with Vercel static hosting.

## Required environment variables

This project uses a local `.env` file for development, and the repo is configured to ignore it in Git.

Create or update the project root `.env` file with:

```bash
GITHUB_TOKEN=ghp_your_personal_access_token
```

Notes:
- The GitHub token is used by `api/github-activity.ts` to fetch live contribution data from the GitHub GraphQL API.
- If the token is missing, the app falls back to demo contribution data instead of failing.
- The token should never be exposed in the frontend.
- `.env` is excluded from version control via `.gitignore`.

For local setup, you can also keep a template in `.env.example` if you want to document the expected variables without committing secrets.

## Admin password configuration

The admin dashboard stores a SHA-256 hash and compares it to the entered password. You must update the hash in `public/admin/index.html` before deployment.

To generate a hash:

```bash
echo -n 'your-new-password' | sha256sum
```

Then replace the `ADMIN_HASH` value with the generated hash.

## Deploying to Vercel

This repository already includes a Vercel configuration:

- Build command: `npm run build`
- Output directory: `dist`
- Framework: `null` (static site)

### Steps

1. Push the project to GitHub.
2. Open Vercel and click “Add Project”.
3. Import the repository.
4. Keep the existing build settings for this project:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add the environment variable:
   - `GITHUB_TOKEN`
6. Deploy the project.

### Vercel settings to confirm

In Project Settings → Build and Output Settings, confirm:

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Deploying to Netlify or other static hosts

This app can also be deployed to static hosting providers that support environment variables and static uploads.

### Recommended settings

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `GITHUB_TOKEN`

### Important note

The GitHub activity API route is a Vercel-style serverless function in `api/github-activity.ts`. If you deploy to a host that does not support serverless functions, you should either:

- use a host with serverless support, or
- disable the live GitHub activity widget and keep the fallback data only

## Production checks after deployment

After the app is live, confirm the following:

- Home page loads without errors
- Theme, animations, and sections render correctly
- Projects and blog pages load
- Admin page loads at `/admin/`
- GitHub activity widget loads or falls back gracefully
- Contact and resume pages display correctly
- No broken asset paths or missing CSS/JS files appear in the browser console

## Troubleshooting

### Build fails

Check:
- Node.js and npm versions are compatible
- Dependencies installed successfully
- No missing environment variables for the GitHub API

### GitHub activity is empty or broken

- Confirm `GITHUB_TOKEN` is set in the host environment
- Verify the token has access to the GitHub GraphQL API
- Ensure the serverless function is deployed and enabled on the platform

### Admin login does not work

- Ensure `ADMIN_HASH` in `public/admin/index.html` matches the correct SHA-256 hash
- Clear browser storage if testing previous credentials

## Recommended production setup

- Host on Vercel for the best compatibility with the existing config
- Store `GITHUB_TOKEN` in the hosting provider’s environment variables
- Keep the admin dashboard protected behind a strong password hash
- Use HTTPS-enabled hosting
- Keep the actual secrets in `.env` locally and in your hosting provider’s secret manager, never in Git

## Summary

This project is ready for a lightweight static deployment on Vercel or similar hosting. The only required runtime-sensitive configuration for the live app is the GitHub token for the activity feed, plus the admin password hash for the dashboard. Local secrets stay in `.env`, and `.gitignore` keeps them out of version control.
