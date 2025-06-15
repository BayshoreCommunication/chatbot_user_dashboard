import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/api';

interface ActiveUser {
    id: number;
    name: string;
    avatar: string;
    status: 'online' | 'offline';
    initials: string;
}

export function useActiveUsers() {
    return useQuery({
        queryKey: ['activeUsers'],
        queryFn: async () => {
            const response = await fetch(API_ENDPOINTS.activeUsers);
            if (!response.ok) {
                throw new Error('Failed to fetch active users');
            }
            return response.json() as Promise<ActiveUser[]>;
        }
    });
} 