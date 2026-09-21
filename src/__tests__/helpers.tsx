// Shared render + backend-stub helpers for the public smoke tests. Test-only:
// nothing here is imported by application code, so none of it reaches the
// production bundle.
//
// The stub network layer sits at the only boundary the tests are allowed to
// fake: `global.fetch`. The store, its guards, hydration lifecycle, routing,
// and every page/section render untouched production code.
import { act } from 'react';
import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ContentProvider } from '@/hooks/useContentStore';
import { ThemeProvider } from '@/hooks/useTheme';
import App from '@/App';
import type {
  BlogPost,
  ContactMessage,
  Experience,
  Profile,
  Project,
  SiteAnalytics,
  Skill,
  Testimonial,
} from '@/types';
import {
  smokeAnalytics,
  smokeBlogPost,
  smokeExperience,
  smokeGitHubActivity,
  smokeMessages,
  smokeProfile,
  smokeProject,
  smokeSkill,
  smokeTestimonial,
} from './fixtures';

export interface StubBackendOptions {
  profile?: Profile;
  projects?: Project[];
  blogs?: BlogPost[];
  skills?: Skill[];
  experiences?: Experience[];
  testimonials?: Testimonial[];
  messages?: ContactMessage[];
  analytics?: SiteAnalytics;
  githubActivity?: unknown;
  failEndpoints?: string[];
  neverResolveEndpoints?: string[];
}

interface StubBackend {
  requestedEndpoints: string[];
  restore: () => void;
}

export function jsonResponse(body: unknown, ok = true): Promise<Response> {
  return Promise.resolve({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(body),
  } as Response);
}

// Install a deterministic fetch stub and record the endpoint tail of every
// request so tests can assert on exact request patterns.
export function stubBackend(options: StubBackendOptions = {}): StubBackend {
  const {
    profile = smokeProfile,
    projects = [smokeProject],
    blogs = [smokeBlogPost],
    skills = [smokeSkill],
    experiences = [smokeExperience],
    testimonials = [smokeTestimonial],
    messages = smokeMessages,
    analytics = smokeAnalytics,
    githubActivity = smokeGitHubActivity,
    failEndpoints = [],
    neverResolveEndpoints = [],
  } = options;

  const bodies: Record<string, unknown> = {
    profile,
    projects,
    blogs,
    skills,
    experiences,
    testimonials,
    messages,
    analytics,
    'github-activity': githubActivity,
  };

  const requestedEndpoints: string[] = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
    const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(raw, 'http://localhost/');
    const match = url.pathname.match(/\/api\/([^/?#]+)/);
    const endpoint = match ? match[1] : url.pathname;
    requestedEndpoints.push(endpoint);

    if (neverResolveEndpoints.includes(endpoint)) {
      // Lets tests hold the provider at "initial loading" forever without
      // resolving, so the AppLoader boundary itself is what gets asserted.
      return new Promise<Response>(() => {});
    }

    if (failEndpoints.includes(endpoint)) {
      return jsonResponse({ error: `stubbed ${endpoint} failure` }, false);
    }

    if (!(endpoint in bodies)) {
      // Non-CRUD helper calls (page-view/project-view POSTs) succeed with a
      // neutral payload instead of exploding with an unhandled rejection.
      return jsonResponse({});
    }

    return jsonResponse(bodies[endpoint]);
  }) as typeof fetch;

  return {
    requestedEndpoints,
    restore: () => {
      globalThis.fetch = originalFetch;
    },
  };
}

// Flush pending promises/microtasks. `act` needs the async form because the
// store resolves hydration across several promise hops after the fetch stub.
// Covers: immediate fetch resolution + provider state update + lazy page
// chunk resolution + Suspense commit + effect-driven updates.
export async function flushAsync(): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

export interface RenderedApp {
  container: HTMLElement;
  root: Root;
  text: () => string;
}

// Mirror main.tsx's provider nesting, but with MemoryRouter so the smoke
// tests control the initial route without a real browser location.
export async function renderPublicApp(initialPath = '/'): Promise<RenderedApp> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <StrictMode>
        <HelmetProvider>
          <MemoryRouter initialEntries={[initialPath]}>
            <ThemeProvider>
              <ContentProvider>
                <App />
              </ContentProvider>
            </ThemeProvider>
          </MemoryRouter>
        </HelmetProvider>
      </StrictMode>
    );
  });
  const text = () => container.textContent ?? '';
  return { container, root, text };
}

export async function teardownApp(app: RenderedApp): Promise<void> {
  await act(async () => {
    app.root.unmount();
  });
  app.container.remove();
}
