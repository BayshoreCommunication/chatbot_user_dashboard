import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './useAxiosPublic';
import { useApiKey } from './useApiKey';

interface UsageData {
    api_calls: number;
    vector_embeddings: number;
    storage_used: number;
    documents: number;
    total_users: number;
    total_conversations: number;
    last_updated: string;
}

interface UsageResponse {
    status: string;
    usage: UsageData;
}

export function useOrganizationUsage() {
    const axiosPublic = useAxiosPublic();
    const { apiKey } = useApiKey();

    const fetchUsageData = async () => {
        const response = await axiosPublic.get<UsageResponse>('/organization/usage', {
            headers: {
                'X-API-Key': apiKey,
            }
        });
        return response.data.usage;
    };

    return useQuery({
        queryKey: ['organizationUsage', apiKey],
        queryFn: fetchUsageData,
        staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
        enabled: !!apiKey, // Only run query if apiKey exists
    });
} 