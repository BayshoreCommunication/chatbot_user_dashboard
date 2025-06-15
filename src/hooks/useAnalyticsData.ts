import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';

interface AnalyticsData {
    name: string;
    thisYear: number;
    lastYear: number;
}

export function useAnalyticsData() {
    const [data, setData] = useState<AnalyticsData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.analytics);
                if (!response.ok) {
                    throw new Error('Failed to fetch analytics data');
                }
                const analyticsData = await response.json();
                setData(analyticsData);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An error occurred'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, isLoading, error };
} 