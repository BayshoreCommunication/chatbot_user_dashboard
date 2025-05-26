import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useApiKey } from './useApiKey'

interface ChatWidgetSettings {
    name: string
    selectedColor: string
    avatarUrl: string
}

export function useChatWidgetSettings() {
    const { apiKey } = useApiKey()

    return useQuery({
        queryKey: ['chatWidgetSettings'],
        queryFn: async (): Promise<ChatWidgetSettings> => {
            if (!apiKey) {
                throw new Error('API key not found')
            }

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/chatbot/settings`, {
                headers: {
                    'X-API-Key': apiKey
                }
            })

            if (response.data.status === 'success') {
                return {
                    name: response.data.settings.name,
                    selectedColor: response.data.settings.selectedColor,
                    avatarUrl: response.data.settings.avatarUrl || ''
                }
            }

            throw new Error('Failed to fetch chat widget settings')
        },
        enabled: !!apiKey, // Only run the query if we have an API key
        staleTime: 1000 * 60 * 5, // Consider the data fresh for 5 minutes
        gcTime: 1000 * 60 * 30, // Keep the data in cache for 30 minutes
    })
} 