import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useApiKey } from './useApiKey'

type ChatWidgetSettings = {
  name: string
  selectedColor: string
  avatarUrl: string
  leadCapture: boolean
  botBehavior: string
  is_bot_connected: boolean
  ai_behavior?: string
  auto_open?: boolean
  video_url?: string
  video_autoplay?: boolean
  video_duration?: number
  video_filename?: string
  apiKey?: string
}

export function useChatWidgetSettings() {
  const { apiKey } = useApiKey()

  return useQuery({
    queryKey: ['chatWidgetSettings'],
    queryFn: async (): Promise<ChatWidgetSettings> => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/chatbot/settings`,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      console.log(response.data, 'useChatWidgetSettings')

      if (response.data.status === 'success') {
        return {
          name: response.data.settings.name,
          selectedColor: response.data.settings.selectedColor,
          avatarUrl: response.data.settings.avatarUrl || '',
          leadCapture: response.data.settings.leadCapture || true,
          botBehavior: response.data.settings.botBehavior || '2',
          is_bot_connected: response.data.settings.is_bot_connected || false,
          ai_behavior: response.data.settings.ai_behavior,
          auto_open: response.data.settings.auto_open || false,
          video_url: response.data.settings.video_url || '',
          video_autoplay: response.data.settings.video_autoplay ?? true,
          video_duration: response.data.settings.video_duration || 10,
          video_filename: response.data.settings.video_filename || '',
          apiKey: apiKey,
        }
      }

      throw new Error('Failed to fetch chat widget settings')
    },
    enabled: !!apiKey, // Only run the query if we have an API key
    staleTime: 1000 * 60 * 5, // Consider the data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep the data in cache for 30 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

export function useUpdateChatWidgetSettings() {
  const { apiKey } = useApiKey()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: Partial<ChatWidgetSettings>) => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chatbot/save-settings`,
        settings,
        {
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to update settings')
      }

      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ['chatWidgetSettings'] })
    },
  })
}

export function useUploadVideo() {
  const { apiKey } = useApiKey()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chatbot/upload-video`,
        formData,
        {
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to upload video')
      }

      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ['chatWidgetSettings'] })
    },
  })
}

export function useDeleteVideo() {
  const { apiKey } = useApiKey()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/chatbot/video`,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to delete video')
      }

      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ['chatWidgetSettings'] })
    },
  })
}

export function useUpdateVideoSettings() {
  const { apiKey } = useApiKey()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: { autoplay: boolean; duration: number }) => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/chatbot/video-settings`,
        settings,
        {
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.status !== 'success') {
        throw new Error(
          response.data.message || 'Failed to update video settings'
        )
      }

      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ['chatWidgetSettings'] })
    },
  })
}

export function useUploadAvatar() {
  const { apiKey } = useApiKey()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!apiKey) {
        throw new Error('API key not found')
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/upload/upload-avatar`,
        formData,
        {
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to upload avatar')
      }

      return response.data
    },
    onSuccess: (data) => {
      // Update the settings with the new avatar URL
      queryClient.setQueryData(['chatWidgetSettings'], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            avatarUrl: data.url,
          }
        }
        return oldData
      })
      
      // Also invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['chatWidgetSettings'] })
    },
  })
}
