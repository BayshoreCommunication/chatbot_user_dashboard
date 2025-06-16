import { Notifications, ActiveUsers } from '@/pages/dashboard/components/notifications';

export function RightSidebar() {
    return (
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-full overflow-y-auto">
            <div className="p-4 space-y-4">
                <Notifications />
                <ActiveUsers />
            </div>
        </div>
    );
} 