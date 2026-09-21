// React 19 requires an explicit test-environment flag before `act()` works
// in a bare jsdom run (CRA/Vite templates usually get this from the bundler
// macro). Without it every state update warns and async hydration never
// flushes inside tests.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import { beforeEach } from 'vitest';
import { __resetContentStoreGuards } from '@/hooks/useContentStore';
import { clearGitHubCache } from '@/components/sections/GitHubActivity';

// Reset all module-level singleton state between tests so the ContentProvider
// dedupe guards, GitHub cache, and auth tokens do not bleed across test cases.
// (These are test-only resets — production behaviour is untouched.)
beforeEach(() => {
  __resetContentStoreGuards();
  clearGitHubCache();
});

// Shared DOM shims for the smoke tests.
// Nothing here touches production behaviour; it only makes jsdom provide the
// browser APIs that framer-motion / Helmet / analytics rely on.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

class IntersectionObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

const matchMediaStub = (query: string): MediaQueryList =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = matchMediaStub;
  }
  // jsdom's scrollTo is explicitly unimplemented; ScrollToTop calls it.
  window.scrollTo = () => {};
}
