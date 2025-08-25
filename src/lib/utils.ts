import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Always use production backend URL since it's live
export const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) {
    // If environment variable is set, use it
    return envUrl
  }

  // Always default to production URL since backend is live
  return 'https://api.bayshorecommunication.org'
}
