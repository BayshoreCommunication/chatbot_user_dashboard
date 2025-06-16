import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useApiKey } from './useApiKey'

type ChatWidgetSettings = {
    name: string;
    selectedColor: string;
    avatarUrl: string;
    leadCapture: boolean;
    botBehavior: string;
    is_bot_connected: boolean;
    ai_behavior?: string;
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

            console.log(response.data, 'useChatWidgetSettings')

            if (response.data.status === 'success') {
                return {
                    name: response.data.settings.name,
                    selectedColor: response.data.settings.selectedColor,
                    avatarUrl: response.data.settings.avatarUrl || '',
                    leadCapture: response.data.settings.leadCapture || true,
                    botBehavior: response.data.settings.botBehavior || '2',
                    is_bot_connected: response.data.settings.is_bot_connected || false,
                    ai_behavior: response.data.settings.ai_behavior
                }
            }

            throw new Error('Failed to fetch chat widget settings')
        },
        enabled: !!apiKey, // Only run the query if we have an API key
        staleTime: 1000 * 60 * 5, // Consider the data fresh for 5 minutes
        gcTime: 1000 * 60 * 30, // Keep the data in cache for 30 minutes
    })
} 