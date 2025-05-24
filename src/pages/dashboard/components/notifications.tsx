
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Notification = {
    id: number;
    icon: React.ReactNode;
    title: string;
    time: string;
}

export function Notifications() {
    const notifications: Notification[] = [
        {
            id: 1,
            icon: (
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-500 dark:text-blue-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M2.5 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4-12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4-12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4-12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                    </svg>
                </div>
            ),
            title: "New SMS from Sadit Ahsan",
            time: "Just now"
        },
        {
            id: 2,
            icon: (
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center text-gray-500 dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                    </svg>
                </div>
            ),
            title: "New user registered.",
            time: "59 minutes ago"
        },
        {
            id: 3,
            icon: (
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-500 dark:text-green-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                </div>
            ),
            title: "You fixed a bug.",
            time: "12 hours ago"
        },
        {
            id: 4,
            icon: (
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-500 dark:text-blue-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                </div>
            ),
            title: "Andi Lane subscribed to you.",
            time: "Today, 11:59 AM"
        }
    ];

    return (
        <Card className="w-full border-none shadow-sm dark:bg-gray-900/40">
            <CardHeader>
                <CardTitle className="text-sm font-medium dark:text-gray-300">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-5">
                    {notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start">
                            {notification.icon}
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
    const users = [
        { id: 1, name: "Natali Craig", avatar: "/avatars/01.png", status: "online", initials: "NC" },
        { id: 2, name: "Drew Cano", avatar: "/avatars/02.png", status: "online", initials: "DC" },
        { id: 3, name: "Andi Lane", avatar: "/avatars/03.png", status: "online", initials: "AL" },
        { id: 4, name: "Koray Okumus", avatar: "/avatars/04.png", status: "online", initials: "KO" },
        { id: 5, name: "Kate Morrison", avatar: "/avatars/05.png", status: "online", initials: "KM" },
        { id: 6, name: "Melody Macy", avatar: "/avatars/06.png", status: "online", initials: "MM" },
    ];

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
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
} 