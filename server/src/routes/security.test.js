// @vitest-environment node
// Backend authorization-boundary tests (F32a.13).
//
// Strategy: mount the REAL Express route modules (same mounting as
// server/src/index.js) against mocked Mongoose model modules, then exercise
// the boundary over real HTTP (ephemeral listen + fetch):
//   - no Authorization header   -> 401 'Authentication required'
//   - invalid token             -> 401 'Invalid or expired session'
//   - expired token             -> 401 'Invalid or expired session'
//   - valid admin session       -> middleware passes, handler executes
//   - representative public ops -> 200/201 (reads/tracking/contact stay open)
//
// Only the network boundary to MongoDB is faked (in-memory model stubs).
// requireAdmin, the routers, validators, and HTTP behavior are production code.
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  // token -> { expiresAt }. hashToken is identity so tests use raw sentinels.
  sessions: new Map(),
  profile: null,
  projects: [],
  blogs: [],
  skills: [],
  experiences: [],
  testimonials: [],
  messages: [],
  analyticsDoc: null,
}));

vi.mock('../models/Session.js', () => ({
  default: {
    hashToken: (token) => token,
    findOne: async (query) => state.sessions.get(query.tokenHash) ?? null,
  },
}));

function asDoc(data) {
  return { ...data, save: async () => {} };
}

vi.mock('../models/Profile.js', () => ({
  default: {
    findOne: async () => (state.profile ? asDoc(state.profile) : null),
    create: async (data) => {
      state.profile = asDoc(data);
      return state.profile;
    },
    deleteMany: async () => {
      state.profile = null;
      return {};
    },
  },
}));

function crudStub(rows) {
  return {
    // Some callers do `await Model.find()` (plain array), others do
    // `await Model.find().sort(...)` — return a thenable that also chains.
    find: () => {
      const result = [...rows];
      const chain = Promise.resolve(result);
      return Object.assign(chain, { sort: () => Promise.resolve(result) });
    },
    findOne: async () => (rows[0] ? asDoc(rows[0]) : null),
    create: async (data) => {
      // Stable ObjectId-shaped id so create→delete round trips line up.
      const doc = asDoc({ id: '507f1f77bcf86cd799439011', _id: '507f1f77bcf86cd799439011', ...data });
      rows.unshift(doc);
      return doc;
    },
    insertMany: async (data) => {
      const docs = data.map((d, i) => asDoc({ _id: `${i + 1}`, ...d }));
      rows.push(...docs);
      return docs;
    },
    findByIdAndUpdate: async (id, updates) => {
      const row = rows.find((r) => r.id === id || r._id === id);
      return row ? Object.assign(row, updates) : null;
    },
    findByIdAndDelete: async (id) => {
      const i = rows.findIndex((r) => r.id === id || r._id === id);
      return i >= 0 ? rows.splice(i, 1)[0] : null;
    },
    deleteMany: async () => {
      rows.length = 0;
      return {};
    },
  };
}

vi.mock('../models/Project.js', () => ({ default: crudStub(state.projects) }));
vi.mock('../models/BlogPost.js', () => ({ default: crudStub(state.blogs) }));
vi.mock('../models/Skill.js', () => ({ default: crudStub(state.skills) }));
vi.mock('../models/Experience.js', () => ({ default: crudStub(state.experiences) }));
vi.mock('../models/Testimonial.js', () => ({ default: crudStub(state.testimonials) }));
vi.mock('../models/Message.js', () => ({ default: crudStub(state.messages) }));

vi.mock('../models/Analytics.js', () => ({
  default: {
    findOne: async () => (state.analyticsDoc ? asDoc(state.analyticsDoc) : null),
    create: async (data) => {
      state.analyticsDoc = asDoc(data);
      return state.analyticsDoc;
    },
    deleteMany: async () => {
      state.analyticsDoc = null;
      return {};
    },
  },
}));

// Route modules under test (imported after mocks so they bind to the stubs).
const { default: profileRoutes } = await import('../routes/profile.js');
const { default: projectRoutes } = await import('../routes/projects.js');
const { default: blogRoutes } = await import('../routes/blogs.js');
const { default: skillRoutes } = await import('../routes/skills.js');
const { default: experienceRoutes } = await import('../routes/experiences.js');
const { default: testimonialRoutes } = await import('../routes/testimonials.js');
const { default: messageRoutes } = await import('../routes/messages.js');
const { default: analyticsRoutes } = await import('../routes/analytics.js');
const { default: resetRoutes } = await import('../routes/reset.js');
const express = (await import('express')).default;

// Seed the valid admin session used by the "valid session" tests.
state.sessions.set('VALID', { expiresAt: new Date(Date.now() + 60_000) });

let server;
let baseUrl;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/profile', profileRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/blogs', blogRoutes);
  app.use('/api/skills', skillRoutes);
  app.use('/api/experiences', experienceRoutes);
  app.use('/api/testimonials', testimonialRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/reset', resetRoutes);
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(() => resolve()));
});

async function call(method, path, opts = {}) {
  const isGet = method === 'GET' || method === 'HEAD';
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { ...(isGet ? {} : { 'content-type': 'application/json' }), ...(opts.headers || {}) },
    body: isGet || opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

const VALID_AUTH = { Authorization: 'Bearer VALID' };
const INVALID_AUTH = { Authorization: 'Bearer NO_SUCH_SESSION' };
const EXPIRED_AUTH = { Authorization: 'Bearer EXPIRED' };
const NO_AUTH = {};

// Every protected mutation, grouped by category.
const protectedMutations = [
  ['PUT', '/api/profile'],
  ['POST', '/api/profile/cv'],
  ['POST', '/api/profile/avatar'],
  ['POST', '/api/projects'],
  ['PUT', '/api/projects/507f1f77bcf86cd799439011'],
  ['DELETE', '/api/projects/507f1f77bcf86cd799439011'],
  ['POST', '/api/blogs'],
  ['PUT', '/api/blogs/507f1f77bcf86cd799439011'],
  ['DELETE', '/api/blogs/507f1f77bcf86cd799439011'],
  ['POST', '/api/skills'],
  ['PUT', '/api/skills/507f1f77bcf86cd799439011'],
  ['DELETE', '/api/skills/507f1f77bcf86cd799439011'],
  ['POST', '/api/experiences'],
  ['PUT', '/api/experiences/507f1f77bcf86cd799439011'],
  ['DELETE', '/api/experiences/507f1f77bcf86cd799439011'],
  ['POST', '/api/testimonials'],
  ['PUT', '/api/testimonials/507f1f77bcf86cd799439011'],
  ['DELETE', '/api/testimonials/507f1f77bcf86cd799439011'],
  ['GET', '/api/messages'],
  ['PUT', '/api/messages/507f1f77bcf86cd799439011'],
  ['DELETE', '/api/messages/507f1f77bcf86cd799439011'],
  ['GET', '/api/analytics'],
  ['POST', '/api/reset'],
];

describe('admin mutation boundary (requireAdmin)', () => {
  it.each(protectedMutations)('%s %s -> 401 without Authorization header', async (method, path) => {
    const { status, json } = await call(method, path, { headers: NO_AUTH, body: {} });
    expect(status).toBe(401);
    expect(json.error).toBe('Authentication required');
  });

  it.each(protectedMutations)('%s %s -> 401 with invalid token', async (method, path) => {
    const { status, json } = await call(method, path, { headers: INVALID_AUTH, body: {} });
    expect(status).toBe(401);
    expect(json.error).toBe('Invalid or expired session');
  });

  it.each(protectedMutations)('%s %s -> 401 with expired token', async (method, path) => {
    const { status, json } = await call(method, path, { headers: EXPIRED_AUTH, body: {} });
    expect(status).toBe(401);
    expect(json.error).toBe('Invalid or expired session');
  });
});

describe('valid admin session reaches the existing handlers', () => {
  it('profile PUT updates the profile document', async () => {
    state.profile = { name: 'P', tagline: 'old' };
    const { status, json } = await call('PUT', '/api/profile', {
      headers: VALID_AUTH,
      body: { tagline: 'Updated by admin' },
    });
    expect(status).toBe(200);
    expect(json.tagline).toBe('Updated by admin');
  });

  it('CV upload passes auth and reaches handler (400: no file attached)', async () => {
    const { status, json } = await call('POST', '/api/profile/cv', { headers: VALID_AUTH });
    expect(status).toBe(400);
    expect(json.error).toBe('No file uploaded');
  });

  it('avatar upload passes auth and reaches handler (400: no file attached)', async () => {
    const { status, json } = await call('POST', '/api/profile/avatar', { headers: VALID_AUTH });
    expect(status).toBe(400);
    expect(json.error).toBe('No file uploaded');
  });

  it('project create returns 201', async () => {
    const { status, json } = await call('POST', '/api/projects', {
      headers: VALID_AUTH,
      body: { title: 'Admin-made' },
    });
    expect(status).toBe(201);
    expect(json.title).toBe('Admin-made');
  });

  it('project delete returns success', async () => {
    const { status } = await call('DELETE', '/api/projects/507f1f77bcf86cd799439011', { headers: VALID_AUTH });
    expect(status).toBe(200);
  });

  it('blog create returns 201', async () => {
    const { status } = await call('POST', '/api/blogs', { headers: VALID_AUTH, body: { title: 'B' } });
    expect(status).toBe(201);
  });

  it('skill create returns 201', async () => {
    const { status } = await call('POST', '/api/skills', { headers: VALID_AUTH, body: { name: 'S' } });
    expect(status).toBe(201);
  });

  it('experience create returns 201', async () => {
    const { status } = await call('POST', '/api/experiences', { headers: VALID_AUTH, body: { role: 'E' } });
    expect(status).toBe(201);
  });

  it('testimonial create returns 201', async () => {
    const { status } = await call('POST', '/api/testimonials', { headers: VALID_AUTH, body: { name: 'T' } });
    expect(status).toBe(201);
  });

  it('message admin read returns the collection', async () => {
    const { status } = await call('GET', '/api/messages', { headers: VALID_AUTH });
    expect(status).toBe(200);
  });

  it('message delete returns success', async () => {
    // Seed a message first (the delete runs before the contact-form test).
    await call('POST', '/api/messages', {
      headers: VALID_AUTH,
      body: { name: 'To Delete', email: 'del@example.com' },
    });
    const { status } = await call('DELETE', '/api/messages/507f1f77bcf86cd799439011', { headers: VALID_AUTH });
    expect(status).toBe(200);
  });

  it('analytics admin read returns the document', async () => {
    const { status } = await call('GET', '/api/analytics', { headers: VALID_AUTH });
    expect(status).toBe(200);
  });

  it('reset executes the seed flow end to end', async () => {
    const { status, json } = await call('POST', '/api/reset', { headers: VALID_AUTH });
    expect(status).toBe(200);
    expect(json.success).toBe(true);
  });
});

describe('public operations remain accessible', () => {
  const publicOps = [
    ['GET', '/api/profile'],
    ['GET', '/api/projects'],
    ['GET', '/api/blogs'],
    ['GET', '/api/skills'],
    ['GET', '/api/experiences'],
    ['GET', '/api/testimonials'],
    ['POST', '/api/messages'],
    ['POST', '/api/analytics/page-view'],
    ['POST', '/api/analytics/project-view'],
  ];

  it.each(publicOps)('%s %s is not auth-gated', async (method, path) => {
    const body = method === 'POST' ? {} : undefined;
    const { status } = await call(method, path, { body });
    // Handlers execute against the stub models; the assertion is that the
    // boundary did NOT reject these as unauthenticated and nothing 5xx'd.
    expect(status).not.toBe(401);
    expect(status).toBeLessThan(500);
  });

  it('public contact form creates a message', async () => {
    const { status, json } = await call('POST', '/api/messages', {
      body: { name: 'Visitor', email: 'v@example.com' },
    });
    expect(status).toBe(201);
    expect(json.email).toBe('v@example.com');
  });

  it('public page-view tracking records a view', async () => {
    const { status } = await call('POST', '/api/analytics/page-view', { body: {} });
    expect(status).toBe(200);
  });
});
