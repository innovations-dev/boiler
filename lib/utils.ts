import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// TODO: move to @t3oss/env config
export const BASE_URL = new URL(process.env.NEXT_PUBLIC_BASE_URL || '');
