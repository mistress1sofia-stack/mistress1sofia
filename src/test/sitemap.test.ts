import { describe, expect, it } from 'vitest';
import { createRootRoute, createRoute, createRouter, createMemoryHistory } from '@tanstack/react-router';
import { sitemapStaticPaths, sitemapXML } from '@/lib/sitemap';

describe('public sitemap', () => {
  it('includes public pages but never owner sign-in or private descendants', () => {
    const root = createRootRoute({ staticData: { sitemap: false } });
    const pages = ['/', '/apply', '/book'].map(path => createRoute({ getParentRoute: () => root, path, staticData: { sitemap: true } }));
    const auth = createRoute({ getParentRoute: () => root, path: '/auth', staticData: { sitemap: false } });
    const privateLayout = createRoute({ getParentRoute: () => root, id: '_authenticated', staticData: { sitemap: 'exclude-subtree' } });
    const admin = createRoute({ getParentRoute: () => privateLayout, path: '/admin', staticData: { sitemap: true } });
    const router = createRouter({ routeTree: root.addChildren([...pages, auth, privateLayout.addChildren([admin])]), history: createMemoryHistory() });
    expect(sitemapStaticPaths(router)).toEqual(['/', '/apply', '/book']);
  });

  it('uses the public domain without fabricated modification dates', () => {
    const xml = sitemapXML('https://mistress-sofia-com.lovable.app', [{ path: '/' }, { path: '/book' }]);
    expect(xml).toContain('<loc>https://mistress-sofia-com.lovable.app/book</loc>');
    expect(xml).not.toContain('<lastmod>');
  });
});