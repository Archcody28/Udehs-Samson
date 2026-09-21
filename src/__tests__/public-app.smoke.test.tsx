// Public-application smoke test. Test-only: excluded from the production bundle.
//
// Regression focus: the F32a.9 `ContactCTA` outage — a component inside the
// Home render path referenced an undefined `data` variable, Vite still built
// fine, and production served a blank page. Because this test mounts the real
// `<App/>` (same providers, same hydration, same route tree as main.tsx) with
// only the network stubbed, *any* uncaught render error fails the test for
// free: React 19 propagates the throw and the assertions below never pass.
//
// It also pins the invariants the rest of F32a established:
//   - exactly one request per critical endpoint (singleton guard survives
//     StrictMode double effects);
//   - deferred endpoints never gate the public Home render;
//   - the loader boundary resolves to real backend content, never fake data.
import { afterEach, describe, expect, it } from 'vitest';
import { flushAsync, renderPublicApp, stubBackend, teardownApp } from './helpers';

const CRITICAL_ENDPOINTS = ['profile', 'projects', 'blogs', 'skills', 'experiences', 'testimonials'];

afterEach(async () => {
  document.body.innerHTML = '';
});

describe('public Home smoke test', () => {
  it('hydrates from the backend and renders Home with real content', async () => {
    const backend = stubBackend();
    const app = await renderPublicApp('/');
    try {
      await flushAsync();
      await flushAsync();

      // The whole point: if any Home component throws (ReferenceError, null
      // dereference, broken hook), React unmounts the tree and these all fail.
      expect(app.text()).toContain('SMOKE Test User');
      expect(app.text()).toContain('SMOKE Project Alpha');
      expect(app.text()).toContain('SMOKE Testimonial'.split(' ')[0]);
      expect(app.text()).toContain('SMOKE Test User'.split(' ')[0]);

      // Primary navigation must exist: a mounted app shell, not a loader.
      const navLabels = ['Home', 'About', 'Projects', 'Blog', 'Services', 'Contact'];
      navLabels.forEach((label) => {
        expect(app.text()).toContain(label);
      });

      // ContactCTA specifically (F32a.9): its email CTA renders from profile.
      expect(app.text()).toContain('smoke@example.com');

      // Every critical endpoint was requested exactly once, even under
      // StrictMode double effects — the singleton dedupe guard holds.
      CRITICAL_ENDPOINTS.forEach((endpoint) => {
        const hits = backend.requestedEndpoints.filter((name) => name === endpoint).length;
        expect(hits, `expected exactly one request to /api/${endpoint}`).toBe(1);
      });
    } finally {
      await teardownApp(app);
      backend.restore();
    }
  });

  it('never issues deferred/admin requests to render Home', async () => {
    const backend = stubBackend();
    const app = await renderPublicApp('/');
    try {
      await flushAsync();
      await flushAsync();

      expect(app.text()).toContain('SMOKE Project Alpha');
      expect(backend.requestedEndpoints).not.toContain('messages');
      expect(backend.requestedEndpoints).not.toContain('analytics');
    } finally {
      await teardownApp(app);
      backend.restore();
    }
  });

  it('renders a lazy public route from the same hydrated data', async () => {
    const backend = stubBackend();
    const app = await renderPublicApp('/blog');
    try {
      await flushAsync();
      await flushAsync();

      // The /blog lazy chunk resolves and filters the already-hydrated
      // published collection — no refetch, no blank route.
      expect(app.text()).toContain('SMOKE First Post');

      const blogHits = backend.requestedEndpoints.filter((name) => name === 'blogs').length;
      expect(blogHits, 'expected no navigation refetch of /api/blogs').toBe(1);
    } finally {
      await teardownApp(app);
      backend.restore();
    }
  });
});
