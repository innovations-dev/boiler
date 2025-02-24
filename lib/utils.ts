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
