# Udeh Samson — Portfolio

Personal portfolio website for **Udeh Samson**, a Full Stack Developer focused on building modern, reliable, and maintainable web applications.

## Live Website

The portfolio is deployed and available online.

## Overview

This portfolio showcases my:

* Projects and software development work
* Technical skills
* Professional experience
* Services
* Blog posts
* Resume
* GitHub activity
* Contact information

The site is fully responsive and includes light/dark mode, project and blog filtering, animations, SEO metadata, and an administrative interface for managing portfolio content.

## Tech Stack

* HTML5
* CSS
* Tailwind CSS
* JavaScript
* React
* TypeScript
* Vite
* GitHub API
* LocalStorage

## Features

* Responsive portfolio design
* Light and dark themes
* Animated hero section
* Project showcase with filtering
* Blog section
* Skills and experience sections
* Services and testimonials
* GitHub activity integration
* Resume section
* Contact section
* SEO and Open Graph metadata
* Sitemap and robots.txt
* Custom 404 page
* Admin interface for portfolio content

## Security

No API credentials, private keys, or environment secrets are committed to this repository.

GitHub API credentials, when required, should be provided through environment variables and handled on the server side rather than exposed in client-side code.

The admin interface is intended for this portfolio deployment and should not be treated as a production-grade authentication system. For a larger deployment, authentication and content management should be moved to a proper server-side system with secure password hashing, session management, authorization, and database-backed storage.

## Getting Started

### Prerequisites

* Node.js
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/Archcody28/portfolio.git
cd portfolio
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

To create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Environment Variables

If GitHub activity integration is enabled, configure the required credentials through environment variables.

Example:

```env
GITHUB_TOKEN=your_github_token
```

**Never commit `.env` files or expose private tokens in client-side code.**

## Project Structure

```text
portfolio/
├── public/
├── src/
├── api/
├── package.json
├── vite.config.*
└── README.md
```

## Author

**Udeh Samson**

Full Stack Developer

Building web applications, software products, and digital solutions.

## License

This project is primarily a personal portfolio. Please do not reuse the content, branding, personal information, or project materials without permission.
