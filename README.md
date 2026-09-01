# Udeh Samson Portfolio

A full-stack portfolio website for Udeh Samson — Full Stack Engineer. Features a public-facing portfolio with animated sections, project showcases, blog, and a protected admin dashboard for content management.

## Project Overview

This portfolio showcases projects, skills, experience, testimonials, and blog posts. It includes a secure admin dashboard that allows authenticated administrators to manage all content through a rich interface. All content is stored in MongoDB and served via a custom Express API.

The public site features animated sections powered by Framer Motion, 3D particle effects with Three.js, GitHub activity integration, dark/light theme support, and responsive design with Tailwind CSS.

## Features

### Public Portfolio
- Hero section with animated text and particle background
- About section with bio and highlight cards
- Projects showcase with filtering and detail views
- Blog with article listings and individual post pages
- Skills display with proficiency indicators
- Work experience timeline
- Testimonials carousel
- Services section
- GitHub activity integration (contributions graph, pinned repos)
- Contact form with message storage
- Resume page
- Dark/light theme toggle
- SEO meta tags and structured data
- Fully responsive design

### Admin Dashboard
- Secure authentication with bcrypt password hashing
- Projects management (create, edit, delete)
- Blog post management (create, edit, delete)
- Skills management (create, edit, delete)
- Experience management (create, edit, delete)
- Testimonials management (create, edit, delete)
- Profile management (update personal info, bio, links)
- Messages inbox (view, mark as read, delete)
- Analytics dashboard (page views, project views)
- Database reset to seed defaults
- Logout functionality

## Security

- **bcrypt password hashing** — Admin passwords are hashed with bcrypt (cost factor 12)
- **HTTP-only cookies** — Session token stored in `httpOnly`, `secure`, `sameSite: strict` cookie
- **Server-side sessions** — Sessions stored in MongoDB with 24-hour TTL expiration
- **Cryptographic session IDs** — Generated using `crypto.randomBytes(32)`
- **Rate-limited login** — Maximum 10 login attempts per 15 minutes per IP
- **Server-side authorization** — `requireAdmin` middleware validates session on every protected request
- **Protected admin APIs** — All state-changing operations require valid admin session
- **ObjectId validation** — Route parameters validated as MongoDB ObjectIds
- **Mass-assignment protection** — Profile updates use explicit field whitelist
- **CORS configuration** — Restricted to specific origin with credentials
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Strict-Transport-Security` (production)
- **Environment-based secrets** — All secrets loaded from environment variables

## Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 5 | Build tool and dev server |
| Tailwind CSS 4 | Utility-first styling |
| Framer Motion 11 | Animations and transitions |
| React Router 6 | Client-side routing |
| Three.js + React Three Fiber | 3D particle effects |
| Lucide React | Icon library |
| React Hook Form + Zod | Form handling and validation |
| Recharts | Analytics data visualization |
| Swiper | Touch-enabled carousels |
| React Helmet Async | SEO meta tag management |
| React Hot Toast | Toast notifications |
| clsx + tailwind-merge | Conditional class utilities |

### Backend
| Technology | Purpose |
|---|---|
| Express 4 | HTTP server framework |
| Mongoose 8 | MongoDB ODM |
| bcrypt | Password hashing |
| cookie-parser | Cookie parsing |
| express-rate-limit | Rate limiting |
| cors | Cross-origin resource sharing |
| dotenv | Environment variable loading |

### Database
| Technology | Purpose |
|---|---|
| MongoDB | Document database |

### Authentication
| Technology | Purpose |
|---|---|
| bcrypt | Password verification |
| crypto (Node.js) | Secure session ID generation |
| HTTP-only cookies | Session token transport |
| MongoDB TTL indexes | Automatic session expiration |

### Build and Development
| Technology | Purpose |
|---|---|
| Vite | Frontend build and dev server |
| @vitejs/plugin-react | React Fast Refresh |
| @tailwindcss/vite | Tailwind CSS integration |
| npm | Package management |

## Project Structure

```
udeh-samson-portfolio/
├── index.html                 # Vite entry HTML
├── vite.config.ts             # Vite configuration
├── vercel.json                # Vercel deployment config
├── package.json               # Frontend dependencies and scripts
├── src/
│   ├── main.tsx               # React entry point
│   ├── App.tsx                 # Route definitions
│   ├── index.css              # Global styles
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── hooks/
│   │   ├── useContentStore.ts # State management and API calls
│   │   ├── useScrollReveal.ts # Scroll-based reveal hook
│   │   └── useTheme.tsx       # Dark/light theme
│   ├── lib/
│   │   ├── data.ts            # Default seed data
│   │   └── utils.ts           # Utility functions
│   ├── pages/
│   │   ├── Home.tsx           # Home page
│   │   ├── About.tsx          # About page
│   │   ├── Projects.tsx       # Projects listing
│   │   ├── ProjectDetail.tsx  # Single project view
│   │   ├── Blogs.tsx          # Blog listing
│   │   ├── BlogPost.tsx       # Single blog post
│   │   ├── Services.tsx       # Services page
│   │   ├── Contact.tsx        # Contact page
│   │   ├── Resume.tsx         # Resume page
│   │   ├── AdminLogin.tsx     # Admin login page
│   │   ├── AdminDashboard.tsx # Admin dashboard
│   │   └── NotFound.tsx       # 404 page
│   ├── components/
│   │   ├── layout/            # Layout, Navbar, Footer, SEO
│   │   ├── sections/          # Page sections (Hero, About, Projects, etc.)
│   │   ├── ui/                # Reusable UI components
│   │   ├── three/             # Three.js particle field
│   │   └── ProtectedRoute.tsx # Auth-guarded route wrapper
│   └── ...
├── server/
│   ├── package.json           # Server dependencies and scripts
│   ├── .env.example           # Environment variable template
│   ├── src/
│   │   ├── index.js           # Express server entry
│   │   ├── config/
│   │   │   └── db.js          # MongoDB connection
│   │   ├── middleware/
│   │   │   ├── auth.js        # requireAdmin middleware
│   │   │   └── validate.js    # ObjectId validation
│   ├── models/
│   │   ├── Profile.js         # Profile schema
│   │   ├── Project.js         # Project schema
│   │   ├── BlogPost.js        # Blog post schema
│   │   ├── Skill.js           # Skill schema
│   │   ├── Experience.js      # Experience schema
│   │   ├── Testimonial.js     # Testimonial schema
│   │   ├── Message.js         # Contact message schema
│   │   ├── Analytics.js       # Analytics schema
│   │   └── Session.js         # Session schema with TTL
│   ├── routes/
│   │   ├── auth.js            # Login, logout, check
│   │   ├── profile.js         # Profile CRUD
│   │   ├── projects.js        # Projects CRUD
│   │   ├── blogs.js           # Blog CRUD
│   │   ├── skills.js          # Skills CRUD
│   │   ├── experiences.js     # Experience CRUD
│   │   ├── testimonials.js    # Testimonials CRUD
│   │   ├── messages.js        # Messages CRUD
│   │   ├── analytics.js       # Analytics tracking
│   │   ├── github-activity.js # GitHub API proxy
│   │   └── reset.js           # Database reset to defaults
│   ├── scripts/
│   │   └── generate-hash.js   # bcrypt hash generator
│   └── seed.js                # Database seeder
└── ...
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local instance or MongoDB Atlas)
- npm

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/Archcody28/Udehs-Samson.git
cd udeh-samson-portfolio

# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
```

### Environment Variables

Create a `.env` file in the `server/` directory using the provided template:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your values (see [Environment Variables](#environment-variables) below).

### Admin Password Setup

Generate a bcrypt hash for your admin password:

```bash
cd server
npm run generate-hash
```

Enter your desired password when prompted. Copy the generated hash into your `server/.env` file as `ADMIN_PASSWORD_HASH`.

### Database Setup

Ensure MongoDB is running locally or update `MONGODB_URI` in `server/.env` to point to your MongoDB instance.

To seed the database with default content:

```bash
cd server
npm run seed
```

Or use the admin dashboard reset feature after logging in.

### Development

Run the backend and frontend in separate terminals:

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

The frontend dev server proxies `/api` requests to `http://localhost:5000`.

Visit `http://localhost:5173` for the portfolio and `http://localhost:5173/admin/login` for the admin dashboard.

### Production Build

```bash
npm run build
```

Output is generated in the `dist/` directory.

## Environment Variables

Create `server/.env` with the following variables:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/udeh_samson_portfolio` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password | `$2b$12$LJ3m4ys3...` |
| `CLIENT_URL` | Allowed CORS origin (frontend URL) | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` or `production` |

The frontend reads `VITE_API_URL` from the environment to configure the API proxy target (defaults to `http://localhost:5000`).

## Available Scripts

### Frontend

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend

```bash
cd server
npm run dev          # Start server with auto-reload
npm start            # Start server
npm run seed         # Seed database with defaults
npm run generate-hash # Generate bcrypt password hash
```

## API Overview

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile` | Get profile |
| GET | `/api/projects` | List all projects |
| GET | `/api/blogs` | List all blog posts |
| GET | `/api/skills` | List all skills |
| GET | `/api/experiences` | List all experiences |
| GET | `/api/testimonials` | List all testimonials |
| POST | `/api/messages` | Submit contact message |
| GET | `/api/github-activity` | Get GitHub activity data |
| POST | `/api/analytics/page-view` | Record page view |
| POST | `/api/analytics/project-view` | Record project view |
| GET | `/api/health` | Health check |

### Admin-Protected Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate (rate limited) |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/auth/check` | Check auth status |
| PUT | `/api/profile` | Update profile |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/blogs` | Create blog post |
| PUT | `/api/blogs/:id` | Update blog post |
| DELETE | `/api/blogs/:id` | Delete blog post |
| POST | `/api/skills` | Create skill |
| PUT | `/api/skills/:id` | Update skill |
| DELETE | `/api/skills/:id` | Delete skill |
| POST | `/api/experiences` | Create experience |
| PUT | `/api/experiences/:id` | Update experience |
| DELETE | `/api/experiences/:id` | Delete experience |
| POST | `/api/testimonials` | Create testimonial |
| PUT | `/api/testimonials/:id` | Update testimonial |
| DELETE | `/api/testimonials/:id` | Delete testimonial |
| GET | `/api/messages` | List all messages |
| PUT | `/api/messages/:id` | Update message (mark read) |
| DELETE | `/api/messages/:id` | Delete message |
| GET | `/api/analytics` | Get analytics data |
| POST | `/api/reset` | Reset database to defaults |

## Authentication Flow

```
Admin Login
    ↓
Server validates password
    ↓
bcrypt verification (bcrypt.compare)
    ↓
Session created in MongoDB (crypto.randomBytes token, 24h TTL)
    ↓
HTTP-only, Secure, SameSite=Strict cookie returned
    ↓
Protected API requests include cookie automatically
    ↓
Server-side requireAdmin middleware validates session
    ↓
Authorization granted or denied
```

### Session Lifecycle

1. **Login** — Password verified against bcrypt hash. Session token generated and stored in MongoDB.
2. **Requests** — Browser sends `sid` cookie automatically. Server validates token against MongoDB.
3. **Expiration** — MongoDB TTL index automatically removes sessions after 24 hours.
4. **Logout** — Session deleted from MongoDB. Cookie cleared from browser.

## Deployment

### Production Requirements

- **HTTPS required** — `secure: true` cookie flag is set when `NODE_ENV=production`
- **MongoDB authentication** — Use a connection string with credentials (e.g., MongoDB Atlas)
- **CORS origin** — Set `CLIENT_URL` to the production frontend URL
- **Reverse proxy** — If behind Nginx/cloud proxy, the `trust proxy` setting is configured to `1` (one proxy hop). Adjust if your deployment uses multiple proxy layers.
- **Environment variables** — All secrets must be configured in the deployment environment

### Deployment Architecture

The application is a two-part deployment:
- **Frontend**: Static files (Vite `dist/`) served via CDN or static host
- **Backend**: Node.js Express server running with MongoDB connection

The frontend and backend are designed to be deployed to the same origin in production. The Vite dev server proxy (`/api` → backend) handles local development.

## Development Notes

- The frontend uses an Agon Element Picker script injected in `index.html` for development-time element inspection (Alt+Shift+I). This is a development tool and does not affect production builds.
- The `useContentStore` hook is the central state manager, handling all API communication with HTTP-only cookie-based auth.
- Route protection on the frontend (`ProtectedRoute`) is a UX layer only. All authorization is enforced server-side.
- Session tokens are never exposed to client-side JavaScript (HTTP-only cookie).
- The `generate-hash` script uses bcrypt with cost factor 12.

## License

This project currently has no declared license.

## Author

**Udeh Samson** — Full Stack Engineer
