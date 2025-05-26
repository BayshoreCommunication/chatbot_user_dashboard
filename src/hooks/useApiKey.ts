import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface UseApiKeyReturn {
    apiKey: string | null
    isLoading: boolean
    error: Error | null
    refetch: () => Promise<void>
}

export function useApiKey(): UseApiKeyReturn {
    const [apiKey, setApiKey] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const { toast } = useToast()

    const fetchApiKey = async () => {
        setIsLoading(true)
        setError(null)
        try {
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

            setApiKey(orgData.api_key)
            return orgData.api_key
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch API key')
            setError(error)
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            })
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchApiKey()
    }, [])

    return {
        apiKey,
        isLoading,
        error,
        refetch: fetchApiKey
    }
} 