import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge tailwind classes properly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility functions for Shitter Social
 */

/**
 * Format a date to a relative time string (like X/Twitter)
 * "2m", "1h", "3d", "Jan 15"
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) {
    return 'now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else if (diffDays < 7) {
    return `${diffDays}d`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}w`;
  } else if (diffMonths < 12) {
    return `${diffMonths}mo`;
  } else {
    // For older dates, show "Jan 15"
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Truncate a wallet address for display
 * "0x1234567890abcdef...12345678"
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format SOL balance for display
 */
export function formatSOL(balance: number | string): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (num >= 1000) {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (num >= 1) {
    return num.toFixed(2);
  } else {
    return num.toFixed(3);
  }
}

/**
 * Generate a color from a string (for identicons/avatars)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}
