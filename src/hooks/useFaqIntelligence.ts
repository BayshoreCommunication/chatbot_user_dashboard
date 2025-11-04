import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiKey } from './useApiKey'
import useAxiosPublic from './useAxiosPublic'

// Types for FAQ Intelligence
export interface FAQAlert {
  type: 'critical' | 'warning' | 'error' | 'info'
  category: string
  message: string
  action?: string
  suggestion?: string
  field?: string
}

export interface FAQSuggestion {
  type?: string
  question?: string
  answer?: string
  suggested_answer?: string // API returns this field
  priority?: 'high' | 'medium' | 'low'
  category?: string
  reasoning?: string
  source?: string
  message?: string
  action?: string
}

export interface AnalysisReport {
  organization_id: string
  analysis_type: 'full' | 'quick'
  readiness_score: number
  timestamp: string
  message?: string // Optional message from backend (e.g., "Quick check complete")
  alerts: FAQAlert[]
  suggestions: FAQSuggestion[]
  analysis?: {
    profile?: Record<string, unknown>
    faqs?: Record<string, unknown>
    website?: Record<string, unknown>
    documents?: Record<string, unknown>
    conversations?: Record<string, unknown>
  }
  stats: {
    profile_complete: boolean
    missing_fields?: string[]
    faq_count: number
    document_count: number
    website_url?: string | null
    trained_urls?: string[]
    url_count?: number
    has_website?: boolean
    conversation_count: number
  }
}

export interface AnalysisHistory {
  reports: AnalysisReport[]
  progress: {
    latest_score: number
    score_trend: 'improving' | 'declining' | 'stable'
    last_analysis_date: string
    total_analyses: number
  }
}

export interface ProgressTracking {
  timeline: Array<{
    date: string
    score: number
    type: string
    faq_count: number
    alert_count: number
  }>
  metrics: {
    first_score: number
    latest_score: number
    improvement: number
    average_score: number
    total_analyses: number
  }
  recommendations: string[]
}

export const useFaqIntelligence = () => {
  const axiosPublic = useAxiosPublic()
  const { apiKey } = useApiKey()
  const queryClient = useQueryClient()

  // Get latest analysis (loads last analysis on mount, or runs new analysis)
  const {
    data: latestAnalysis,
    isLoading: isLoadingAnalysis,
    error: analysisError,
  } = useQuery<AnalysisReport>({
    queryKey: ['faqIntelligence', 'latest'],
    queryFn: async () => {
      if (!apiKey) throw new Error('API key not found')

      const response = await axiosPublic.get('/api/faq-intelligence/latest', {
        headers: { 'X-API-Key': apiKey },
      })

      if (response.data.status === 'success') {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to load analysis')
    },
    enabled: !!apiKey, // Auto-load on mount
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })

  // Run new analysis (manual trigger)
  const runAnalysisMutation = useMutation({
    mutationFn: async () => {
      if (!apiKey) throw new Error('API key not found')

      const response = await axiosPublic.post(
        '/api/faq-intelligence/analyze',
        {},
        {
          headers: { 'X-API-Key': apiKey },
        }
      )

      if (response.data.status === 'success') {
        return response.data
      }
      throw new Error(response.data.message || 'Analysis failed')
    },
    onSuccess: () => {
      // Refresh all data
      queryClient.invalidateQueries({ queryKey: ['faqIntelligence'] })
    },
  })

  // Get analysis history (last 5 reports)
  const {
    data: history,
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery<AnalysisHistory>({
    queryKey: ['faqIntelligence', 'history'],
    queryFn: async () => {
      if (!apiKey) throw new Error('API key not found')

      const response = await axiosPublic.get('/api/faq-intelligence/history', {
        headers: { 'X-API-Key': apiKey },
      })

      if (response.data.status === 'success') {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to load history')
    },
    enabled: !!apiKey,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  })

  // Get progress tracking with timeline
  const {
    data: progress,
    isLoading: isLoadingProgress,
    error: progressError,
    refetch: refetchProgress,
  } = useQuery<ProgressTracking>({
    queryKey: ['faqIntelligence', 'progress'],
    queryFn: async () => {
      if (!apiKey) throw new Error('API key not found')

      const response = await axiosPublic.get('/api/faq-intelligence/progress', {
        headers: { 'X-API-Key': apiKey },
      })

      if (response.data.status === 'success') {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to load progress')
    },
    enabled: !!apiKey,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  })

  // Get available company types
  const { data: companyTypes, isLoading: isLoadingCompanyTypes } = useQuery<
    string[]
  >({
    queryKey: ['faqIntelligence', 'companyTypes'],
    queryFn: async () => {
      if (!apiKey) throw new Error('API key not found')

      const response = await axiosPublic.get(
        '/api/faq-intelligence/company-types',
        {
          headers: { 'X-API-Key': apiKey },
        }
      )

      if (response.data.status === 'success') {
        return response.data.company_types
      }
      throw new Error(response.data.message || 'Failed to load company types')
    },
    enabled: !!apiKey,
    staleTime: 1000 * 60 * 60, // 1 hour (rarely changes)
    gcTime: 1000 * 60 * 120, // 2 hours
  })

  // Clear history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!apiKey) throw new Error('API key not found')

      const response = await axiosPublic.delete(
        '/api/faq-intelligence/history',
        {
          headers: { 'X-API-Key': apiKey },
        }
      )

      if (response.data.status === 'success') {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to clear history')
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ['faqIntelligence', 'history'],
      })
      queryClient.invalidateQueries({
        queryKey: ['faqIntelligence', 'progress'],
      })
    },
  })

  return {
    // Latest analysis
    latestAnalysis,
    isLoadingAnalysis,
    analysisError,

    // Run new analysis
    runAnalysis: runAnalysisMutation.mutate,
    isAnalyzing: runAnalysisMutation.isPending,

    // History
    history,
    isLoadingHistory,
    historyError,
    refetchHistory,

    // Progress
    progress,
    isLoadingProgress,
    progressError,
    refetchProgress,

    // Company types
    companyTypes,
    isLoadingCompanyTypes,

    // Actions
    clearHistory: clearHistoryMutation.mutate,
    isClearingHistory: clearHistoryMutation.isPending,
  }
}
