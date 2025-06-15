// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    analytics: `${API_BASE_URL}/api/analytics`,
    trafficSources: `${API_BASE_URL}/api/traffic-sources`,
    notifications: `${API_BASE_URL}/api/notifications`,
    activeUsers: `${API_BASE_URL}/api/active-users`,
} as const; 