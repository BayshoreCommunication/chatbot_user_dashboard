// API Configuration - Always use HTTPS
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://api.bayshorecommunication.org'

export const API_ENDPOINTS = {
  analytics: `${API_BASE_URL}/api/analytics`,
  trafficSources: `${API_BASE_URL}/api/traffic-sources`,
  notifications: `${API_BASE_URL}/api/notifications`,
  activeUsers: `${API_BASE_URL}/api/active-users`,
  leads: `${API_BASE_URL}/lead/leads`,
  leadsStats: `${API_BASE_URL}/lead/leads/stats`,
  unknownQuestions: `${API_BASE_URL}/api/unknown-questions`,
  unknownQuestionsStats: `${API_BASE_URL}/api/unknown-questions/stats`,
  unknownQuestionsCategories: `${API_BASE_URL}/api/unknown-questions/categories`,
  unknownQuestionsExport: `${API_BASE_URL}/api/unknown-questions/export`,
  unknownQuestionsBulk: `${API_BASE_URL}/api/unknown-questions/bulk-action`,
} as const
