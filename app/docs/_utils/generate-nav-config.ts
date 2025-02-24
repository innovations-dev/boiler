/**
 * @fileoverview Generates navigation configuration for documentation pages by recursively scanning MDX files
 * @module lib/docs/generate-nav
 */

import path from 'node:path';
import { cache } from 'react';
import { globby } from 'globby';

import { NavItem } from '@/app/docs/_types';

import { DocsConfig } from '../_types';

/**
 * Metadata interface for documentation pages
 * @interface DocMetadata
 * @property {string} title - The page title
 * @property {string} [description] - Optional page description
 * @property {number} [order] - Optional ordering value for navigation
 */
// interface DocMetadata {
//   title: string;
//   description?: string;
//   order?: number;
// }

/**
 * Formats a kebab-case or snake_case string to Title Case
 * @param {string} str - The string to format
 * @returns {string} The formatted string in Title Case
 * @example
 * ```ts
 * formatTitle('hello-world') // returns 'Hello World'
 * formatTitle('hello_world') // returns 'Hello World'
 * ```
 */
function formatTitle(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Recursively builds navigation structure from MDX files in a directory
 * @param {string} dir - The directory to scan
 * @param {string} [basePath=""] - The base path for URL generation
 * @returns {Promise<NavItem[]>} Array of navigation items with nested structure
 *
 * @remarks
 * - Scans for page.mdx files in directories
 * - Excludes directories starting with _
 * - Supports nested directory structures
 * - Reads metadata from MDX files for titles and ordering
 * - Falls back to formatted directory names if no title specified
 *
 * @example
 * ```ts
 * const nav = await buildNavigation('/content/docs')
 * // Returns:
 * // [
 * //   {
 * //     id: 'getting-started',
 * //     name: 'Getting Started',
 * //     href: '/docs/getting-started',
 * //     children: [...]
 * //   },
 * //   ...
 * // ]
 * ```
 */
async function buildNavigation(
  dir: string,
  basePath: string = ''
): Promise<NavItem[]> {
  const sections: NavItem[] = [];

  // Find all MDX files in the directory
  const mdxFiles = await globby(['**/page.mdx', '!_*'], {
    cwd: dir,
    onlyFiles: true,
  });

  // Find all directories (excluding those starting with _)
  const directories = await globby(['*/'], {
    cwd: dir,
    onlyDirectories: true,
    deep: 1,
  });

  // Filter out directories starting with _
  const validDirectories = directories.filter(
    (directory) => !path.basename(directory).startsWith('_')
  );

  for (const directory of validDirectories) {
    const dirName = path.basename(directory);
    const fullPath = path.join(dir, directory);
    const relativePath = path.join(basePath, dirName);
    const href = `/docs/${relativePath}`;

    // Check if directory has a page.mdx
    const hasMdx = mdxFiles.includes(path.join(directory, 'page.mdx'));

    if (hasMdx) {
      // Dynamic import for metadata
      const { metadata = {} } = await import(
        `@/content/docs/${relativePath}/page.mdx`
      );

      const section: NavItem = {
        id: dirName,
        name: metadata?.title || formatTitle(dirName),
        href,
        ...(metadata?.order && { order: metadata.order }),
        children: await buildNavigation(fullPath, relativePath),
      };

      sections.push(section);
    } else {
      const section: NavItem = {
        id: dirName,
        name: formatTitle(dirName),
        href,
        children: await buildNavigation(fullPath, relativePath),
      };

      sections.push(section);
    }
  }

  // Sort sections by order if specified
  return sections.sort((a, b) => {
    if (a.order && b.order) return a.order - b.order;
    if (a.order) return -1;
    if (b.order) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Generates the complete documentation navigation configuration
 * @returns {Promise<{sidebarNav: NavItem[]}>} Navigation configuration object
 *
 * @remarks
 * - Cached using React cache() to prevent unnecessary rebuilds
 * - Scans from the content/docs directory at project root
 * - Returns a configuration object with sidebar navigation
 *
 * @example
 * ```ts
 * const config = await getDocsConfig()
 * // Returns:
 * // {
 * //   sidebarNav: [
 * //     {
 * //       id: 'section',
 * //       name: 'Section',
 * //       href: '/docs/section',
 * //       children: [...]
 * //     }
 * //   ]
 * // }
 * ```
 */
export const getDocsConfig = cache(async () => {
  const contentDir = path.join(process.cwd(), 'content/docs');
  const nav = await buildNavigation(contentDir);

  return {
    sidebarNav: nav,
  };
});

// Mark this function as server-only
export async function getNavConfig(): Promise<DocsConfig> {
  return getDocsConfig();
}
