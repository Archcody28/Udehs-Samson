// Hydration-boundary smoke test. Test-only: excluded from the production bundle.
//
// Pins the F32a.3 invariant under both stuck and failed hydration:
//   - initial loading renders the AppLoader boundary — never fake portfolio
//     content;
//   - a critical failure renders the AppError boundary, never fake defaults.
import { afterEach, describe, expect, it } from 'vitest';
import {
  defaultBlogPosts,
  defaultProfile,
  defaultProjects,
  defaultTestimonials,
} from '@/lib/data';
import { flushAsync, renderPublicApp, stubBackend, teardownApp } from './helpers';

// Seed strings that live only in `src/lib/data.ts` and appear in no static
// markup, so they can never reach the DOM before real hydration succeeds.
// If one of them does, the store has regressed to serving its pre-F32a.3
// default dataset as if it were backend content.
const SEED_MARKERS: string[] = [
  ...defaultProjects.slice(0, 4).map((project) => project.title),
  defaultBlogPosts[0]?.title,
  defaultTestimonials[0]?.name,
  defaultProfile.tagline,
  defaultProfile.shortBio,
  defaultProfile.email,
].filter((marker): marker is string => Boolean(marker));

const hasFakeMarkers = (text: string): boolean =>
  SEED_MARKERS.some((marker) => text.includes(marker));

afterEach(async () => {
  document.body.innerHTML = '';
});

describe('hydration boundary smoke test', () => {
  it('shows the loading boundary and never fake content while hydrating', async () => {
    const backend = stubBackend({ neverResolveEndpoints: ['profile'] });
    const app = await renderPublicApp('/');
    try {
      await flushAsync();

      expect(app.text()).toContain('Loading');
      expect(hasFakeMarkers(app.text())).toBe(false);
    } finally {
      await teardownApp(app);
      backend.restore();
    }
  });

  it('surfaces the error boundary when critical hydration fails', async () => {
    const backend = stubBackend({ failEndpoints: ['profile'] });
    const app = await renderPublicApp('/');
    try {
      await flushAsync();
      await flushAsync();

      // AppError renders with retry affordance, not a blank shell.
      expect(app.text()).toContain('Unable to load portfolio');
      expect(hasFakeMarkers(app.text())).toBe(false);
    } finally {
      await teardownApp(app);
      backend.restore();
    }
  });

  it('deferred failures cannot block public hydration', async () => {
    const backend = stubBackend({ failEndpoints: ['messages', 'analytics'] });
    const app = await renderPublicApp('/');
    try {
      await flushAsync();
      await flushAsync();

      // Critical hydration wins: real content renders even though the two
      // deferred endpoints failed.
      expect(app.text()).toContain('SMOKE Project Alpha');
    } finally {
      await teardownApp(app);
      backend.restore();
    }
  });
});
