import { useCallback, useState } from 'react'
import useAxiosPublic from './useAxiosPublic'

interface UnknownQuestion {
  _id: string
  question: string
  ai_response: string
  question_category: string
  response_quality: string
  is_answered_well: boolean
  needs_human_review: boolean
  status: string
  frequency_count: number
  max_similarity: number
  created_at: string
  updated_at: string
  user_context: {
    name?: string
    email?: string
    mode?: string
    language?: string
  }
}

interface UnknownQuestionStats {
  total_unknown_questions: number
  new_questions: number
  reviewed_questions: number
  added_to_training: number
  ignored_questions: number
  good_ai_responses: number
  poor_ai_responses: number
  needs_improvement: number
  legal_questions: number
  appointment_questions: number
  general_questions: number
  other_questions: number
}

interface QuestionCategory {
  value: string
  label: string
  description: string
}

interface FetchQuestionsParams {
  page?: number
  limit?: number
  status?: string
  category?: string
  needs_review?: boolean
  answered_well?: boolean
  date_from?: string
  date_to?: string
  min_frequency?: number
  search?: string
}

interface ExportParams {
  format?: string
  status?: string
  category?: string
  date_from?: string
  date_to?: string
}

export const useUnknownQuestions = () => {
  const axiosPublic = useAxiosPublic()

  // State
  const [questions, setQuestions] = useState<UnknownQuestion[]>([])
  const [stats, setStats] = useState<UnknownQuestionStats | null>(null)
  const [categories, setCategories] = useState<QuestionCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total_count: 0,
    total_pages: 0,
  })

  // Fetch questions with filters
  const fetchQuestions = useCallback(
    async (params: FetchQuestionsParams = {}) => {
      setLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams()

        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.status) queryParams.append('status', params.status)
        if (params.category) queryParams.append('category', params.category)
        if (params.needs_review !== undefined)
          queryParams.append('needs_review', params.needs_review.toString())
        if (params.answered_well !== undefined)
          queryParams.append('answered_well', params.answered_well.toString())
        if (params.date_from) queryParams.append('date_from', params.date_from)
        if (params.date_to) queryParams.append('date_to', params.date_to)
        if (params.min_frequency)
          queryParams.append('min_frequency', params.min_frequency.toString())
        if (params.search) queryParams.append('search', params.search)

        const response = await axiosPublic.get(
          `/api/unknown-questions/?${queryParams.toString()}`
        )

        if (response.data.success) {
          setQuestions(response.data.data.questions)
          setPagination({
            page: response.data.data.page,
            limit: response.data.data.limit,
            total_count: response.data.data.total_count,
            total_pages: response.data.data.total_pages,
          })
        } else {
          throw new Error(response.data.message || 'Failed to fetch questions')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch unknown questions')
        console.error('Error fetching unknown questions:', err)
      } finally {
        setLoading(false)
      }
    },
    [axiosPublic]
  )

  // Fetch statistics
  const fetchStats = useCallback(
    async (days: number = 30) => {
      try {
        const response = await axiosPublic.get(
          `/api/unknown-questions/stats?days=${days}`
        )

        if (response.data.success) {
          setStats(response.data.data)
        } else {
          throw new Error(response.data.message || 'Failed to fetch stats')
        }
      } catch (err: any) {
        console.error('Error fetching stats:', err)
      }
    },
    [axiosPublic]
  )

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosPublic.get(
        '/api/unknown-questions/categories'
      )

      if (response.data.success) {
        setCategories(response.data.data)
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories')
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err)
    }
  }, [axiosPublic])

  // Update question
  const updateQuestion = useCallback(
    async (questionId: string, updateData: any) => {
      try {
        const response = await axiosPublic.put(
          `/api/unknown-questions/${questionId}`,
          updateData
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
    [axiosPublic]
  )

  // Delete question
  const deleteQuestion = useCallback(
    async (questionId: string) => {
      try {
        const response = await axiosPublic.delete(
          `/api/unknown-questions/${questionId}`
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
    [axiosPublic]
  )

  // Add question to training
  const addToTraining = useCallback(
    async (questionId: string, improvedAnswer?: string) => {
      try {
        const payload = improvedAnswer
          ? { improved_answer: improvedAnswer }
          : {}
        const response = await axiosPublic.post(
          `/api/unknown-questions/${questionId}/add-to-training`,
          payload
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
    [axiosPublic]
  )

  // Bulk actions
  const bulkAction = useCallback(
    async (questionIds: string[], action: string) => {
      try {
        const response = await axiosPublic.post(
          '/api/unknown-questions/bulk-action',
          {
            question_ids: questionIds,
            action: action,
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
    [axiosPublic]
  )

  // Export questions
  const exportQuestions = useCallback(
    async (params: ExportParams = {}) => {
      try {
        const queryParams = new URLSearchParams()

        if (params.format) queryParams.append('format', params.format)
        if (params.status) queryParams.append('status', params.status)
        if (params.category) queryParams.append('category', params.category)
        if (params.date_from) queryParams.append('date_from', params.date_from)
        if (params.date_to) queryParams.append('date_to', params.date_to)

        const response = await axiosPublic.get(
          `/api/unknown-questions/export?${queryParams.toString()}`
        )

        if (response.data.success) {
          // Create and download file
          const dataStr = JSON.stringify(response.data.data, null, 2)
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
    [axiosPublic]
  )

  return {
    // Data
    questions,
    stats,
    categories,
    pagination,
    loading,
    error,

    // Actions
    fetchQuestions,
    fetchStats,
    fetchCategories,
    updateQuestion,
    deleteQuestion,
    addToTraining,
    bulkAction,
    exportQuestions,

    // Utilities
    setCurrentPage: (page: number) => {
      fetchQuestions({
        page,
        search: '',
        status: '',
        category: '',
      })
    },
  }
}
