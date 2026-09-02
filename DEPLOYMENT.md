# Deployment Guide

This project is a Vite + React portfolio designed for production deployment with static hosting and a serverless GitHub activity endpoint.

## Project Structure

```text
portfolio/
├── api/                  # Serverless API functions
├── public/               # Static assets and public pages
├── src/                  # React application
├── dist/                 # Production build output
├── .env                  # Local environment variables
├── .env.example          # Environment variable template
├── vercel.json           # Vercel configuration
└── package.json
```

## Requirements

Before deploying, make sure you have:

* Node.js installed
* npm installed
* A GitHub repository containing the project
* A Vercel account or another compatible hosting provider

## Local Setup

Clone the repository:

```bash
git clone https://github.com/Archcody28/portfolio.git
cd portfolio
```

Install dependencies:

```bash
npm install
```

Create a local `.env` file if GitHub activity integration is enabled:

```env
GITHUB_TOKEN=your_github_token
```

**Never commit `.env` to Git.**

The repository should contain an appropriate `.gitignore` entry:

```gitignore
.env
.env.local
.env.*.local
```

## Build

Create a production build:

```bash
npm run build
```

The compiled application will be generated in:

```text
dist/
```

To preview the production build locally:

```bash
npm run preview
```

## Deploying to Vercel

Vercel is the recommended deployment platform for this project because it supports both the Vite frontend and the serverless API used for GitHub activity.

### 1. Push the project to GitHub

Make sure your latest changes are committed and pushed:

```bash
git add .
git commit -m "Prepare portfolio for deployment"
git push origin main
```

### 2. Import the repository into Vercel

1. Sign in to Vercel.
2. Create a new project.
3. Import the GitHub repository.
4. Configure the project using the existing Vercel configuration.

### 3. Configure the build

Use:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 4. Configure environment variables

If GitHub activity integration is enabled, add:

```text
GITHUB_TOKEN
```

Set its value using the hosting provider's environment-variable settings.

**Do not place the token directly in frontend JavaScript or commit it to the repository.**

### 5. Deploy

Start the deployment from Vercel.

After deployment, open the generated URL and verify that the application loads correctly.

## GitHub Activity

The project can retrieve GitHub contribution information through:

```text
api/github-activity.ts
```

The GitHub token is handled by the server-side API rather than being exposed directly to the browser.

If the GitHub API is unavailable, the application can use its fallback behavior instead of preventing the portfolio from loading.

## Admin Dashboard

The current portfolio includes an admin interface for managing portfolio content.

Because the current implementation is intended for a personal portfolio, it should **not be considered a general-purpose production authentication system**.

The authentication system uses:
* Server-side authentication with bcrypt password hashing
* Bearer token sessions (no cookies, no localStorage)
* Server-side session storage in MongoDB with 24-hour TTL expiration
* Authorization checks via requireAdmin middleware
* Rate limiting on login attempts

Do not store passwords, authentication secrets, or private credentials in client-side code.

## Deploying to Other Platforms

The frontend can be deployed to most static hosting providers that support Vite applications.

Use:

```text
Build Command: npm run build
Publish Directory: dist
```

However, the GitHub activity endpoint requires serverless-function support.

If the selected hosting provider does not support the API implementation in `api/github-activity.ts`, either configure an equivalent serverless function for that platform or disable the live GitHub activity integration.

## Production Checklist

Before considering the deployment complete, verify:

* [ ] The production build completes successfully.
* [ ] The homepage loads correctly.
* [ ] All navigation links work.
* [ ] Images and assets load correctly.
* [ ] Light/dark mode works.
* [ ] Projects and blog sections work.
* [ ] Contact information is correct.
* [ ] Resume link works.
* [ ] GitHub activity works or falls back gracefully.
* [ ] Admin functionality works as intended.
* [ ] No secrets are present in the repository.
* [ ] Browser console contains no unexpected errors.
* [ ] The deployed site uses HTTPS.
* [ ] Mobile and desktop layouts work correctly.

## Security Checklist

Before pushing or deploying:

```bash
git status
```

Check that sensitive files are not included.

Never commit:

```text
.env
.env.local
private keys
API tokens
passwords
database credentials
service credentials
```

If a secret is accidentally committed, **revoke or rotate it immediately**. Removing the file in a later commit does not make the exposed secret safe.

## Production Environment

For production deployments:

* Store secrets using the hosting provider's environment-variable system.
* Keep `.env` files out of version control.
* Use HTTPS.
* Keep dependencies updated.
* Avoid exposing server-side credentials to the browser.
* Use proper server-side authentication for protected applications.
* Monitor deployment and runtime errors.

## Recommended Deployment

For the current project:

```text
Frontend: Vite + React
Hosting: Vercel
Build: npm run build
Output: dist/
API: Serverless function
Secrets: Vercel Environment Variables
Source Control: GitHub
```

This setup provides a simple deployment workflow while keeping the frontend lightweight and allowing server-side handling of sensitive API credentials.
