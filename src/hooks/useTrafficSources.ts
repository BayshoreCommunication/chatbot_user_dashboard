import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';

interface TrafficSource {
    name: string;
    percentage: number;
}

export function useTrafficSources() {
    const [sources, setSources] = useState<TrafficSource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.trafficSources);
                if (!response.ok) {
                    throw new Error('Failed to fetch traffic sources data');
                }
                const trafficData = await response.json();
                setSources(trafficData);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An error occurred'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return { sources, isLoading, error };
} 