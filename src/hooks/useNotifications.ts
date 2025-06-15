import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/api';

interface Notification {
    id: number;
    icon: string;
    title: string;
    time: string;
}

export function useNotifications() {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await fetch(API_ENDPOINTS.notifications);
            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }
            return response.json() as Promise<Notification[]>;
        }
    });
} 