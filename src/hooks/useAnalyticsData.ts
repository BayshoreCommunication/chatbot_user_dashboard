import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/api';
import { useApiKey } from './useApiKey';

interface AnalyticsData {
    name: string;
    thisYear: number;
    lastYear: number;
    visitorThisYear: number;
    visitorLastYear: number;
}

export function useAnalyticsData() {
    const { apiKey } = useApiKey();

    return useQuery({
        queryKey: ['analytics'],
        queryFn: async () => {
            if (!apiKey) {
                throw new Error('API key not found');
            }

            const response = await fetch(API_ENDPOINTS.analytics, {
                headers: {
                    'X-API-Key': apiKey
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics data');
            }

            return response.json() as Promise<AnalyticsData[]>;
        },
        enabled: !!apiKey,
    });
} 