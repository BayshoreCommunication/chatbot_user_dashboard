import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { LoadingSpinner } from '@/components/custom/loading-spinner';
import { cn } from '@/lib/utils';

interface GroupedConversation {
    session_id: string;
    visitor_id: string;
    user_name: string;
    user_email?: string;
    last_message: string;
    last_message_role: string;
    last_message_time: string;
    message_count: number;
    created_at: string;
}

interface ChatSidebarProps {
    conversations: GroupedConversation[];
    isLoading: boolean;
    onSelectConversation: (sessionId: string) => void;
    selectedConversationId: string | null;
}

export function ChatSidebar({ conversations, isLoading, onSelectConversation, selectedConversationId }: ChatSidebarProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Sort conversations based on sortBy state
    const sortedConversations = [...conversations].sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        } else {
            return new Date(a.last_message_time).getTime() - new Date(b.last_message_time).getTime();
        }
    });

    // Filter conversations based on search term
    const filteredConversations = sortedConversations.filter(conversation =>
        conversation.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.last_message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

            if (diffInHours < 1) {
                return 'Just now';
            } else if (diffInHours < 24) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
                return date.toLocaleDateString();
            }
        } catch (error) {
            return 'Unknown';
        }
    };

    const getInitials = (name: string) => {
        if (!name || name.startsWith('Visitor')) {
            return 'V';
        }
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full relative">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 absolute top-0 left-0 right-0 bg-white dark:bg-gray-900 z-10 h-40">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Messages</h2>

                {/* Search Bar */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Sort by</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-24 h-8 text-sm border-none bg-transparent">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Conversations List */}
            <div
                className="overflow-hidden p-2"
                style={{
                    height: 'calc(100% - 10rem)',
                    marginTop: '10rem'
                }}
            >
                <ScrollArea className="h-full">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <LoadingSpinner size="sm" />
                        </div>
                    ) : (
                        <div>
                            {filteredConversations.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    {searchTerm ? 'No conversations found' : 'No conversations yet'}
                                </div>
                            ) : (
                                filteredConversations.map((conversation) => (
                                    <div
                                        key={conversation.session_id}
                                        className={cn(
                                            "flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-1",
                                            selectedConversationId === conversation.session_id && "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500"
                                        )}
                                        onClick={() => onSelectConversation(conversation.session_id)}
                                    >
                                        <div className="relative">
                                            <Avatar className="w-12 h-12">
                                                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                                                    {getInitials(conversation.user_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {/* Mock online status - you can implement real online status later */}
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                                        </div>

                                        <div className="ml-3 flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                    {conversation.user_name}
                                                </h3>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                    {formatTime(conversation.last_message_time)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                                                    {conversation.last_message_role === 'user' ? '' : '🤖 '}
                                                    {conversation.last_message}
                                                </p>

                                                {conversation.message_count > 1 && (
                                                    <div className="ml-2 flex items-center">
                                                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                            {conversation.message_count}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {conversation.user_email && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                    {conversation.user_email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
} 