import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTimestamp = (timestamp: Date) => {
  if (!(timestamp instanceof Date)) {
    timestamp = new Date(timestamp);
  }

  return timestamp.toLocaleString();
};

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes == 0) return '0 Bytes';
  const k = 1024,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

export function urlStartsWith(url: string, path: string | string[]): boolean {
  if (!url || !path) return false;
  if (path instanceof Array) return path.some((p) => urlStartsWith(url, p));
  // For the `/` path
  if (path.length === 1) return url.at(-1) === path;

  return url.startsWith(path);
}

export const isEmailValid = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
