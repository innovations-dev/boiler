---
title: Search Engine Optimization
description: Learn how to optimize your site for search engines
date: 2025-02-23
published: true
---

# Search Engine Optimization

## Introduction

Search Engine Optimization (SEO) is crucial for improving your site's visibility in search results. This boilerplate implements a comprehensive SEO strategy using Next.js 13+ metadata API with centralized configuration management through our `meta.config.ts` helper.

## Core Configuration

### Centralized Metadata Management

The boilerplate uses a centralized metadata configuration system in `config/meta.config.ts`. This provides:

1. Type-safe metadata configuration
2. Consistent metadata across pages
3. Easy customization through a single configuration object

```typescript
// config/meta.config.ts
interface MetaConfig {
  default: Metadata;
  templateTitle: string;
}

export const siteConfig: MetaConfig = {
  default: {
    title: {
      default: 'Your Site Name',
      template: '%s | Your Site Name',
    },
    description: 'Your site description...',
    // ... other default metadata
  },
  templateTitle: '%s | Your Site Name',
};
```

### Dynamic Metadata Generation

The boilerplate provides a powerful `generateMetadata` helper that handles:

1. Dynamic title and description generation
2. Automatic OG image generation
3. SEO-friendly robots configuration
4. Canonical URL management
5. Site verification
6. Parent metadata inheritance

```typescript
// Example usage in any page
export async function generateMetadata() {
  return meta({
    title: 'Page Title',
    description: 'Page Description',
    image: '/custom-og.jpg', // Optional
    noIndex: false, // Control indexing
    path: '/current-path' // For canonical URLs
  });
}
```

### Root Layout Configuration

The root layout (`app/layout.tsx`) establishes base metadata that applies across your entire application:

```typescript
// app/layout.tsx
export async function generateMetadata() {
  return meta({
    title: 'Boiler15 002',
    description: 'Build anything, fast.',
  });
}
```

## SEO Features

### Robots.txt Management

Unlike traditional robots.txt files, this boilerplate manages robot directives through metadata configuration:

```typescript
// Automatically generated from meta.config.ts
robots: {
  index: true,
  follow: true,
  nocache: process.env.NODE_ENV !== 'production',
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}
```

You can control indexing per-page using the `noIndex` parameter:

```typescript
export async function generateMetadata() {
  return meta({
    title: 'Private Page',
    noIndex: true, // Prevents indexing for this page
  });
}
```

### Open Graph Image Generation

The boilerplate includes a dynamic OG image generator at `app/api/og/route.tsx`:

1. **Default Template**: Automatically generates OG images using page metadata
2. **Customization**: Supports custom titles and descriptions via URL parameters
3. **Error Handling**: Includes robust error handling and logging

```typescript
// Example of custom OG image generation
export async function generateMetadata() {
  return meta({
    title: 'Custom Page',
    description: 'Custom description',
    image: '/custom-image.jpg' // Override default OG image
  });
}
```

### Canonical URLs

Canonical URLs are automatically managed:

```typescript
alternates: {
  canonical: path
    ? new URL(path, BASE_URL.toString()).toString()
    : BASE_URL.toString(),
}
```

## Best Practices Implementation

### 1. Metadata Structure

The boilerplate enforces SEO best practices through its configuration:

- Unique titles and descriptions per page
- Proper meta tag hierarchy
- Automatic template handling
- Parent metadata inheritance

### 2. Performance Optimization

Built-in performance features:

- Edge runtime for OG image generation
- Automatic image optimization
- Proper font loading with `next/font`
- Hydration optimization

### 3. Technical SEO

Automated technical SEO features:

- Structured data support
- Automatic canonical URL generation
- Mobile-friendly configuration
- Search engine verification handling

## Customization Guide

### 1. Site Configuration

Update `config/meta.config.ts`:

```typescript
export const siteConfig: MetaConfig = {
  default: {
    title: {
      default: 'Your Site Name',
      template: '%s | Your Site Name',
    },
    description: 'Your description',
    // ... customize other defaults
  }
};
```

### 2. Page-Specific SEO

In any page file:

```typescript
import { generateMetadata as meta } from '@/config/meta.config';

export async function generateMetadata() {
  return meta({
    title: 'Custom Page',
    description: 'Custom description',
    image: '/custom-og.jpg',
    noIndex: false,
    path: '/custom-path'
  });
}
```

### 3. Custom OG Images

Modify `app/api/og/route.tsx` to customize the OG image template:

```typescript
return new ImageResponse(
  (
    <div style={{
      // Customize your OG image template
    }}>
      {title}
    </div>
  ),
  {
    width: 1200,
    height: 630,
  }
);
```

## Troubleshooting

### Common Issues

1. **Metadata Not Updating**

   - Clear Next.js cache: `pnpm dev --clear`
   - Verify metadata generation in page source
   - Check parent metadata inheritance

2. **OG Images Not Generating**

   - Verify Edge runtime configuration
   - Check image dimensions (1200x630px)
   - Validate URL parameters

3. **SEO Issues**
   - Use Chrome's "View Page Source" to verify metadata
   - Test with Google's Mobile-Friendly Test
   - Validate structured data with Schema.org

## Resources

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Edge Runtime Documentation](https://nextjs.org/docs/app/api-reference/edge)
- [Google Search Console](https://search.google.com/search-console)
- [Schema.org](https://schema.org/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
