import path from 'node:path';
import { globby } from 'globby';

interface StaticParam {
  slug: string[];
}

/**
 * Generate static params for MDX documentation pages
 */
export async function generateStaticParams(): Promise<StaticParam[]> {
  const contentDir = path.join(process.cwd(), 'content/docs');
  const files = await globby(['**/page.mdx', '!_*/**/page.mdx'], {
    cwd: contentDir,
  });

  return files.map((file) => ({
    slug: path.dirname(file).split('/').filter(Boolean),
  }));
}

/**
 * Get all possible doc paths for sitemap generation
 */
export async function getAllDocPaths(): Promise<string[]> {
  const params = await generateStaticParams();
  return params.map(({ slug }) => `/docs/${slug.join('/')}`);
}
