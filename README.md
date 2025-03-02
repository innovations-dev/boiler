This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Organization Schema Optimization

### Key Features

- **Single Source of Truth**: All organization schema definitions are centralized in `lib/db/_schema/index.ts`, creating a base schema with derived schemas for various operations.
- **Type Safety**: Consistent validation rules, automatic transformation of date fields from strings to Date objects, and proper handling of nullable fields.
- **Simplified API Integration**: Flexible schema to handle variations in API responses, schema-based transformations, and enhanced error handling.
- **Better Code Organization**: Clear separation between base and derived schemas, consistent naming conventions, and documented approach.
- **Reduced Duplication**: Eliminated redundant schema definitions, centralized transformation logic, and reused schemas across the application.

### Schema Structure

```typescript
// Base schema defines the core structure
const organizationBaseSchema = createSelectSchema(organization, {
  createdAt: dateTransformer,
  updatedAt: dateTransformer,
});

// Main schema for API responses
export const organizationSchema = organizationBaseSchema.extend({
  // Additional fields or overrides
});

// Input schemas for specific operations
export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50).nullable(),
  // ...
});
```

### Usage Examples

**Creating an Organization**:

```typescript
import { createOrganizationSchema } from '@/lib/db/_schema';

// Validate input
const input = createOrganizationSchema.parse({
  name: 'My Organization',
  slug: 'my-org',
});
```

**Processing API Response**:

```typescript
import { organizationSchema } from '@/lib/db/_schema';

// Automatically transforms string dates to Date objects
const organization = organizationSchema.parse(apiResponse);
console.log(organization.createdAt instanceof Date); // true
```
