import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotifications } from '@/hooks/useNotifications'
import { useActiveUsers } from '@/hooks/useActiveUsers'
import { LoadingSpinner } from '@/components/custom/loading-spinner'

export function Notifications() {
    const { data: notifications, isLoading, error } = useNotifications();

    if (isLoading) {
        return (
            <Card className="w-full border-none shadow-sm dark:bg-gray-900/40">
                <CardHeader>
                    <CardTitle className="text-sm font-medium dark:text-gray-300">Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[200px]">
                        <LoadingSpinner size="lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full border-none shadow-sm dark:bg-gray-900/40">
                <CardHeader>
                    <CardTitle className="text-sm font-medium dark:text-gray-300">Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[200px] text-red-500">
                        Error loading notifications
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!notifications) {
        return null;
    }

    return (
        <Card className="w-full border-none shadow-sm dark:bg-gray-900/40">
            <CardHeader>
                <CardTitle className="text-sm font-medium dark:text-gray-300">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-5">
                    {notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-500 dark:text-blue-300">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M2.5 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4-12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4-12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4-12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium dark:text-gray-300">{notification.title}</p>
                                <p className="text-xs text-muted-foreground dark:text-gray-400">{notification.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function ActiveUsers() {
    const { data: users, isLoading, error } = useActiveUsers();

    if (isLoading) {
        return (
            <Card className="mt-6 border-none shadow-sm dark:bg-gray-900/40">
                <CardHeader>
                    <CardTitle className="text-sm font-medium dark:text-gray-300">Active</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[200px]">
                        <LoadingSpinner size="lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="mt-6 border-none shadow-sm dark:bg-gray-900/40">
                <CardHeader>
                    <CardTitle className="text-sm font-medium dark:text-gray-300">Active</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[200px] text-red-500">
                        Error loading active users
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!users) {
        return null;
    }

    return (
        <Card className="mt-6 border-none shadow-sm dark:bg-gray-900/40">
            <CardHeader>
                <CardTitle className="text-sm font-medium dark:text-gray-300">Active</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map((user) => (
                        <div key={user.id} className="flex items-center">
                            <div className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 w-8 h-8 rounded-full flex items-center justify-center">
                                {user.initials}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium dark:text-gray-300">{user.name}</p>
                            </div>
                            <div className="ml-auto">
                                <div className={`h-2 w-2 rounded-full ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
} 