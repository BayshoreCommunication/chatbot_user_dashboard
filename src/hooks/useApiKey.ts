import { useQuery } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'

interface UseApiKeyReturn {
    apiKey: string | null
    isLoading: boolean
    error: Error | null
    refetch: () => Promise<void>
}

const fetchApiKey = async () => {
    // Get user data from localStorage
    const userDataStr = localStorage.getItem('user')
    if (!userDataStr) {
        throw new Error('User data not found')
    }
    const userData = JSON.parse(userDataStr)

    // Fetch organization API key
    const orgCheckResponse = await fetch(`${import.meta.env.VITE_API_URL}/organization/user/${userData.id}`)
    if (!orgCheckResponse.ok) {
        throw new Error('Failed to fetch API key')
    }
    const orgData = await orgCheckResponse.json()

    if (!orgData.api_key) {
        throw new Error('API key not found')
    }

    return orgData.api_key
}

export function useApiKey(): UseApiKeyReturn {
    const { toast } = useToast()

    const { data: apiKey, isLoading, error, refetch } = useQuery({
        queryKey: ['apiKey'],
        queryFn: fetchApiKey,
        retry: false,
    })

    if (error) {
        toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive'
        })
    }

    return {
        apiKey: apiKey as string | null,
        isLoading,
        error: error as Error | null,
        refetch: async () => { await refetch() }
    }
} 