import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { env } from '@/env';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BASE_URL = new URL(env.NEXT_PUBLIC_APP_URL || '');

/**
 * Get the base URL for the application
 * @returns {URL} The base URL for the application
 */
export const getBaseUrl = () =>
  env.VERCEL_APP_URL
    ? new URL('https://', env.VERCEL_APP_URL)
    : new URL(env.NEXT_PUBLIC_APP_URL || '');

/**
 * Converts a string into a URL-friendly slug.
 *
 * Transformations:
 * - Converts to lowercase
 * - Removes leading/trailing whitespace
 * - Normalizes unicode characters
 * - Removes diacritics
 * - Replaces non-alphanumeric characters with hyphens
 * - Removes duplicate hyphens
 * - Removes leading/trailing hyphens
 *
 * @param text - The string to be converted into a slug
 * @returns A URL-friendly slug string
 * @example
 * ```typescript
 * // Basic usage
 * slugify('Hello World!') // => 'hello-world'
 *
 * // With special characters
 * slugify('Café & Restaurant') // => 'cafe-restaurant'
 *
 * // With multiple spaces and special characters
 * slugify('  Web Development -- Best Practices  ') // => 'web-development-best-practices'
 * ```
 */

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFKD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
}

/**
 * Sanitizes input strings by trimming whitespace and removing special characters
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[^\w\s-]/g, '');
}

/**
 * Splits an array into chunks of specified size
 * @param arr Array to split
 * @param size Size of each chunk
 * @returns Array of chunks
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}
