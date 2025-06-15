import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';

interface Notification {
    id: number;
    icon: string;
    title: string;
    time: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.notifications);
                if (!response.ok) {
                    throw new Error('Failed to fetch notifications');
                }
                const notificationsData = await response.json();
                setNotifications(notificationsData);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An error occurred'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return { notifications, isLoading, error };
} 