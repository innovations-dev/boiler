/**
 * @fileoverview Unified sitemap generation for Next.js application
 * @module app/sitemap
 */

import fs from 'fs/promises';
import path from 'path';
import { MetadataRoute } from 'next';
import { globby } from 'globby';

import { sitemapConfig } from '@/config/sitemap.config';
import { BASE_URL } from '@/lib/utils';

/**
 * Configuration interface for a sitemap route
 * @interface RouteConfig
 * @property {string} url - The URL path for the route
 * @property {Date} lastModified - Last modification date
 * @property {string} [changeFrequency] - How frequently the page is likely to change
 * @property {number} [priority] - Priority of this URL relative to other URLs (0.0 to 1.0)
 */
interface RouteConfig {
  url: string;
  lastModified: Date;
  changeFrequency?: typeof sitemapConfig.defaultChangeFreq;
  priority?: number;
}

/**
 * Static routes with predefined configurations
 * @constant {RouteConfig[]}
 */
const staticRoutes: RouteConfig[] = [
  {
    url: '/',
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    url: '/about',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: '/docs',
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
];

/**
 * Determines if a documentation page should be included in the sitemap
 * @param {string} filePath - Path to the MDX file
 * @returns {Promise<boolean>} Whether the page should be included
 *
 * @remarks
 * - Checks for 'published' frontmatter field in MDX files
 * - Always includes pages in development environment
 * - Defaults to true if published status cannot be determined
 *
 * @example
 * ```ts
 * const include = await shouldIncludePage('/content/docs/getting-started/page.mdx')
 * // Returns true if page is published or in development
 * ```
 */
async function shouldIncludePage(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const publishedMatch = content.match(/published:\s*(true|false)/);
    const published = publishedMatch ? publishedMatch[1] === 'true' : true;

    return process.env.NODE_ENV === 'development' || published;
  } catch (error) {
    console.warn(
      `Warning: Could not read published status for ${filePath}`,
      error
    );
    return process.env.NODE_ENV === 'development';
  }
}

/**
 * Generates routes for all documentation pages
 * @returns {Promise<RouteConfig[]>} Array of route configurations for documentation pages
 *
 * @remarks
 * - Scans content/docs directory for MDX files
 * - Excludes files in directories starting with _
 * - Checks publication status of each page
 * - Generates URL paths and configurations
 *
 * @example
 * ```ts
 * const routes = await getDocumentationRoutes()
 * // Returns array of route configs for doc pages
 * ```
 */
async function getDocumentationRoutes(): Promise<RouteConfig[]> {
  const contentDir = path.join(process.cwd(), 'content/docs');

  // Get all MDX pages in the docs directory
  const docsPages = await globby(['**/page.mdx', '!_*/**/page.mdx'], {
    cwd: contentDir,
  });

  const routes: RouteConfig[] = [];

  for (const page of docsPages) {
    const filePath = path.join(contentDir, page);
    const shouldInclude = await shouldIncludePage(filePath);

    if (shouldInclude) {
      const url = `/docs/${page.replace('/page.mdx', '')}`;
      routes.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return routes;
}

/**
 * Generates sitemap segments for large sites
 * @returns {Promise<Array<{id: number}>>} Array of sitemap segment identifiers
 *
 * @remarks
 * Currently returns a single segment, but can be expanded for larger sites
 * that need multiple sitemap files
 */
export async function generateSitemaps() {
  const docRoutes = await getDocumentationRoutes();
  const totalRoutes = staticRoutes.length + docRoutes.length;

  // Calculate number of segments needed based on config
  const segments = Math.ceil(totalRoutes / sitemapConfig.urlsPerSitemap);

  return Array.from({ length: segments }, (_, i) => ({ id: i }));
}

/**
 * Generates the complete sitemap for the application
 * @param {Object} params - Parameters for sitemap generation
 * @param {number} params.id - Sitemap segment identifier
 * @returns {Promise<MetadataRoute.Sitemap>} Complete sitemap configuration
 *
 * @remarks
 * - Combines static and documentation routes
 * - Applies base URL to all routes
 * - Uses default change frequency and priority from config if not specified
 *
 * @example
 * ```ts
 * const sitemapConfig = await sitemap({ id: 0 })
 * // Returns complete sitemap configuration
 * ```
 */
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  // Get documentation routes
  const docRoutes = await getDocumentationRoutes();
  const allRoutes = [...staticRoutes, ...docRoutes];

  // Calculate slice for current segment
  const start = id * sitemapConfig.urlsPerSitemap;
  const end = start + sitemapConfig.urlsPerSitemap;
  const segmentRoutes = allRoutes.slice(start, end);

  // Transform routes to sitemap format with proper typing
  return segmentRoutes.map((route): MetadataRoute.Sitemap[number] => ({
    url: `${BASE_URL.toString()}${route.url}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency ?? sitemapConfig.defaultChangeFreq,
    priority: route.priority ?? sitemapConfig.defaultPriority,
  }));
}
