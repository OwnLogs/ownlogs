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
