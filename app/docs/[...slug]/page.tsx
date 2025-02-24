import { Metadata } from "next";
import { notFound } from "next/navigation";

import { generateMetadata as baseGenerateMetadata } from "@/config/meta.config";
import { generateStaticParams } from "../_utils/generate-static-params";

export { generateStaticParams };

// Enable static generation
export const dynamic = "force-static";
export const revalidate = false;

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  try {
    const { metadata } = await import(
      `@/content/docs/${resolvedParams.slug.join("/")}/page.mdx`
    );

    return baseGenerateMetadata({
      title: metadata?.title,
      description: metadata?.description,
      path: `/docs/${resolvedParams.slug.join("/")}`,
    });
  } catch (error) {
    return baseGenerateMetadata({
      title: "Documentation",
      description: "Nextjs v15 Boilerplate Documentation",
      path: `/docs/${resolvedParams.slug.join("/")}`,
    });
  }
}

export default async function DocPage({ params }: PageProps) {
  const resolvedParams = await params;

  if (!resolvedParams?.slug?.length) {
    notFound();
  }

  try {
    const { default: MDXContent, metadata } = await import(
      `@/content/docs/${resolvedParams.slug.join("/")}/page.mdx`
    );

    return (
      <article className="prose prose-gray dark:prose-invert max-w-none">
        {metadata?.title && (
          <h1 className="mb-6 text-3xl font-bold">{metadata.title}</h1>
        )}
        <MDXContent />
      </article>
    );
  } catch (error) {
    console.error("Failed to import MDX:", error);
    notFound();
  }
}
