interface MDXLayoutProps {
  children: React.ReactNode;
  metadata?: {
    title?: string;
    description?: string;
    section?: string;
    order?: number;
  };
}

export function MDXLayout({ children, metadata }: MDXLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl py-10">
      {metadata?.title && (
        // adds title from nextjs mdx metadata to the page
        <h1 className="mb-6 text-3xl font-bold">{metadata.title}</h1>
      )}
      <div className="prose dark:prose-invert max-w-none">{children}</div>
    </div>
  );
}
