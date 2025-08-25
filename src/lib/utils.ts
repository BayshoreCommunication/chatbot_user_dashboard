import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Ensure HTTPS in production
export const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) {
    // If environment variable is set, use it
    return envUrl
  }
  
  // In production, default to HTTPS
  if (import.meta.env.PROD) {
    return 'https://api.bayshorecommunication.org'
  }
  
  // In development, use localhost
  return 'http://localhost:8000'
}
