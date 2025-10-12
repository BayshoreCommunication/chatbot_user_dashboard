import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useApiKey } from './useApiKey'
import useAxiosPublic from './useAxiosPublic'

// Types are now handled by React Query

interface ExportParams {
  format?: string
  status?: string
  category?: string
  date_from?: string
  date_to?: string
}

export const useUnknownQuestions = () => {
  const axiosPublic = useAxiosPublic()
  const { apiKey } = useApiKey()

  // State for manual operations
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total_count: 0,
    total_pages: 0,
  })

  // React Query for fetching questions
  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError,
    refetch: refetchQuestions,
  } = useQuery({
    queryKey: ['unknownQuestions'],
    queryFn: async () => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      const response = await axiosPublic.get(
        `/api/unknown-questions/?page=1&limit=20`,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      if (response.data.success) {
        setPagination({
          page: response.data.data.page || 1,
          limit: response.data.data.limit || 20,
          total_count: response.data.data.total_count || 0,
          total_pages: response.data.data.total_pages || 0,
        })
        return response.data.data.questions || []
      }
      throw new Error(response.data.message || 'Failed to fetch questions')
    },
    enabled: !!apiKey,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })

  // React Query for fetching stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['unknownQuestionsStats'],
    queryFn: async () => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      const response = await axiosPublic.get(
        `/api/unknown-questions/stats?days=30`,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch stats')
    },
    enabled: !!apiKey,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  })

  // React Query for fetching categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['unknownQuestionsCategories'],
    queryFn: async () => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      const response = await axiosPublic.get(
        '/api/unknown-questions/categories',
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      if (response.data.success) {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch categories')
    },
    enabled: !!apiKey,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })

  // Update question
  const updateQuestion = useCallback(
    async (questionId: string, updateData: any) => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      try {
        const response = await axiosPublic.put(
          `/api/unknown-questions/${questionId}`,
          updateData,
          {
            headers: {
              'X-API-Key': apiKey,
            },
          }
        )

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to update question')
        }

        return response.data
      } catch (err: any) {
        throw new Error(
          err.response?.data?.detail ||
            err.message ||
            'Failed to update question'
        )
      }
    },
    [axiosPublic, apiKey]
  )

  // Delete question
  const deleteQuestion = useCallback(
    async (questionId: string) => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      try {
        const response = await axiosPublic.delete(
          `/api/unknown-questions/${questionId}`,
          {
            headers: {
              'X-API-Key': apiKey,
            },
          }
        )

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to delete question')
        }

        return response.data
      } catch (err: any) {
        throw new Error(
          err.response?.data?.detail ||
            err.message ||
            'Failed to delete question'
        )
      }
    },
    [axiosPublic, apiKey]
  )

  // Add question to training
  const addToTraining = useCallback(
    async (questionId: string, improvedAnswer?: string) => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      try {
        const payload = improvedAnswer
          ? { improved_answer: improvedAnswer }
          : {}
        const response = await axiosPublic.post(
          `/api/unknown-questions/${questionId}/add-to-training`,
          payload,
          {
            headers: {
              'X-API-Key': apiKey,
            },
          }
        )

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to add to training')
        }

        return response.data
      } catch (err: any) {
        throw new Error(
          err.response?.data?.detail ||
            err.message ||
            'Failed to add to training'
        )
      }
    },
    [axiosPublic, apiKey]
  )

  // Bulk actions
  const bulkAction = useCallback(
    async (questionIds: string[], action: string) => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      try {
        const response = await axiosPublic.post(
          '/api/unknown-questions/bulk-action',
          {
            question_ids: questionIds,
            action: action,
          },
          {
            headers: {
              'X-API-Key': apiKey,
            },
          }
        )

        if (!response.data.success) {
          throw new Error(
            response.data.message || 'Failed to perform bulk action'
          )
        }

        return response.data
      } catch (err: any) {
        throw new Error(
          err.response?.data?.detail ||
            err.message ||
            'Failed to perform bulk action'
        )
      }
    },
    [axiosPublic, apiKey]
  )

  // Export questions
  const exportQuestions = useCallback(
    async (params: ExportParams = {}) => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      try {
        const queryParams = new URLSearchParams()

        if (params.format) queryParams.append('format', params.format)
        if (params.status) queryParams.append('status', params.status)
        if (params.category) queryParams.append('category', params.category)
        if (params.date_from) queryParams.append('date_from', params.date_from)
        if (params.date_to) queryParams.append('date_to', params.date_to)

        const response = await axiosPublic.get(
          `/api/unknown-questions/export?${queryParams.toString()}`,
          {
            headers: {
              'X-API-Key': apiKey,
            },
          }
        )

        if (response.data.success) {
          // Create and download file
          const dataStr = JSON.stringify(response.data.data || [], null, 2)
          const dataBlob = new Blob([dataStr], { type: 'application/json' })
          const url = URL.createObjectURL(dataBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = `unknown-questions-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        } else {
          throw new Error(response.data.message || 'Failed to export questions')
        }
      } catch (err: any) {
        throw new Error(
          err.response?.data?.detail ||
            err.message ||
            'Failed to export questions'
        )
      }
    },
    [axiosPublic, apiKey]
  )

  return {
    // Data
    questions: questionsData || [],
    stats,
    categories: categories || [],
    pagination,
    loading: questionsLoading || statsLoading || categoriesLoading,
    error:
      questionsError?.message ||
      statsError?.message ||
      categoriesError?.message ||
      null,

    // Actions
    fetchQuestions: refetchQuestions,
    fetchStats: refetchStats,
    fetchCategories: refetchCategories,
    updateQuestion,
    deleteQuestion,
    addToTraining,
    bulkAction,
    exportQuestions,

    // Utilities
    setCurrentPage: () => {
      refetchQuestions()
    },
  }
}
