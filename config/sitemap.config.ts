/**
 * @file Sitemap configuration for Next.js 15+ applications
 * @description Provides configuration options for sitemap generation in Next.js applications.
 * This configuration is used to generate XML sitemaps that help search engines efficiently
 * crawl your website.
 *
 * @example
 * // Usage in sitemap.ts generation file
 * import { sitemapConfig } from '@/config/sitemap.config';
 *
 * export async function generateSitemaps() {
 *   // Use configuration values
 *   const { urlsPerSitemap, defaultChangeFreq } = sitemapConfig;
 *   // ... sitemap generation logic
 * }
 *
 * @example
 * // Custom configuration
 * const customConfig: SitemapConfig = {
 *   baseUrl: 'https://example.com',
 *   urlsPerSitemap: 10000,
 *   defaultChangeFreq: 'daily',
 *   defaultPriority: 0.8
 * };
 *
 * @see {@link https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps Next.js Sitemap Documentation}
 * @see {@link https://www.sitemaps.org/protocol.html Sitemap Protocol}
 */

import { BASE_URL } from '@/lib/utils';

/**
 * Configuration interface for sitemap generation
 * @interface SitemapConfig
 */
export interface SitemapConfig {
  /**
   * Base URL of your website
   * @example 'https://example.com'
   */
  baseUrl: string;

  /**
   * Maximum number of URLs per sitemap file
   * @remarks Google's limit is 50,000 URLs per sitemap
   * @default 45000
   */
  urlsPerSitemap: number;

  /**
   * Default change frequency for pages without specified frequency
   * @remarks This value indicates how frequently the content is likely to change
   * @default 'weekly'
   */
  defaultChangeFreq:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';

  /**
   * Default priority for pages without specified priority
   * @remarks Values range from 0.0 to 1.0, with 1.0 being highest priority
   * @default 0.7
   */
  defaultPriority: number;
}

/**
 * Default sitemap configuration
 * @type {SitemapConfig}
 *
 * @example
 * // Import in your sitemap generation logic
 * import { sitemapConfig } from './sitemap.config';
 *
 * // Access configuration values
 * console.log(sitemapConfig.baseUrl); // Your base URL
 * console.log(sitemapConfig.defaultPriority); // 0.7
 */
export const sitemapConfig: SitemapConfig = {
  baseUrl: (() => {
    const url = BASE_URL.toString();
    if (!url) throw new Error('BASE_URL must be defined');
    return url;
  })(),
  urlsPerSitemap: (() => {
    const limit = 45000;
    if (limit > 50000) {
      throw new Error("urlsPerSitemap cannot exceed 50,000 (Google's limit)");
    }
    return limit;
  })(),
  defaultChangeFreq: 'weekly',
  defaultPriority: (() => {
    const priority = 0.7;
    if (priority < 0 || priority > 1) {
      throw new Error('defaultPriority must be between 0.0 and 1.0');
    }
    return priority;
  })(),
};
