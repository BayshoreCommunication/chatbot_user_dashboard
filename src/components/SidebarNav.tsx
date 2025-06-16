import { useState } from 'react';
import { Home, MessageSquare, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
    activeItem?: string;
    onItemClick?: (item: string) => void;
}

export function SidebarNav({ activeItem = 'messages', onItemClick }: SidebarNavProps) {
    const [active, setActive] = useState(activeItem);

    const handleItemClick = (item: string) => {
        setActive(item);
        onItemClick?.(item);
    };

    const navItems = [
        { id: 'dashboard', icon: Home, label: 'Dashboard' },
        { id: 'messages', icon: MessageSquare, label: 'Messages' },
        { id: 'users', icon: User, label: 'Users' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="w-20 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col items-center py-6 space-y-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item.id)}
                            className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors relative group",
                                active === item.id
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                        >
                            <Icon size={20} />
                            {active === item.id && (
                                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l-full" />
                            )}
                            {/* Tooltip */}
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {item.label}
                            </div>
                        </button>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">U</span>
                </div>
            </div>
        </div>
    );
} 