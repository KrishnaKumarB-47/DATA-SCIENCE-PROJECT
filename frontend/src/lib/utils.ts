import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(d);
  }
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getPlantStatusColor(status: string): string {
  switch (status) {
    case 'healthy':
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
    case 'needs-attention':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    case 'sick':
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
    case 'dormant':
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'low':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    case 'high':
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
    case 'urgent':
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
  }
}

export function getCareTypeColor(type: string): string {
  switch (type) {
    case 'watering':
      return '#3b82f6';
    case 'fertilizing':
      return '#10b981';
    case 'repotting':
      return '#f59e0b';
    case 'pruning':
      return '#8b5cf6';
    case 'checkup':
      return '#06b6d4';
    default:
      return '#6b7280';
  }
}

export function getSunlightIcon(sunlightNeeds: string): string {
  switch (sunlightNeeds) {
    case 'low':
    case 'full-shade':
      return '☁️';
    case 'medium':
    case 'partial-shade':
      return '⛅';
    case 'high':
    case 'full-sun':
      return '☀️';
    default:
      return '🌤️';
  }
}

export function calculateDaysUntil(date: Date | string): number {
  const target = new Date(date);
  const now = new Date();
  const diffInMs = target.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

export function isOverdue(date: Date | string): boolean {
  return new Date(date) < new Date();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generatePlantId(): string {
  return Math.random().toString(36).substr(2, 9);
}
