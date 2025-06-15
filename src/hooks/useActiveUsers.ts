import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';

interface ActiveUser {
    id: number;
    name: string;
    avatar: string;
    status: 'online' | 'offline';
    initials: string;
}

export function useActiveUsers() {
    const [users, setUsers] = useState<ActiveUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.activeUsers);
                if (!response.ok) {
                    throw new Error('Failed to fetch active users');
                }
                const usersData = await response.json();
                setUsers(usersData);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An error occurred'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return { users, isLoading, error };
} 