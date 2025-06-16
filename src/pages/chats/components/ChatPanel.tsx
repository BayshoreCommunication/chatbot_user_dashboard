import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, MoreVertical, Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/custom/loading-spinner';

interface Message {
    _id: string;
    id: string;
    organization_id: string;
    visitor_id: string;
    session_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    metadata?: {
        mode?: string;
    };
}

interface ChatPanelProps {
    messages: Message[];
    isLoading?: boolean;
    selectedSessionId?: string | null;
    userInfo?: {
        user_name?: string;
        user_email?: string;
    } | null;
}

interface GroupedMessages {
    [date: string]: Message[];
}

const getInitials = (name: string) => {
    if (!name || name.startsWith('Visitor')) {
        return 'V';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

export function ChatPanel({ messages, isLoading, selectedSessionId, userInfo }: ChatPanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState('');

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Group messages by date
    const groupMessagesByDate = (messages: Message[]): GroupedMessages => {
        const groups: GroupedMessages = {};

        messages.forEach(message => {
            const date = new Date(message.created_at);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let dateKey: string;
            if (date.toDateString() === today.toDateString()) {
                dateKey = 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                dateKey = 'Yesterday';
            } else {
                dateKey = date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(message);
        });

        return groups;
    };

    const groupedMessages = groupMessagesByDate(messages);

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            // TODO: Implement send message functionality
            console.log('Sending message:', newMessage);
            setNewMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const userName = userInfo?.user_name || `Visitor ${selectedSessionId?.slice(0, 8) || ''}`;
    const userEmail = userInfo?.user_email;

    // Show welcome state if no conversation is selected
    if (!selectedSessionId) {
        return (
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full relative">
                <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-gray-400"
                            >
                                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Welcome to Chat Management
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Loading conversations...
                            </p>
                        </div>
                        <LoadingSpinner size="sm" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full relative">
            {/* Fixed Header */}
            {selectedSessionId && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 absolute top-0 left-0 right-0 z-10 h-20">
                    <div className="flex items-center">
                        <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                                {getInitials(userName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {userName}
                            </h3>
                            {userEmail && userEmail !== 'anonymous@user.com' && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {userEmail}
                                </p>
                            )}
                            <p className="text-sm text-green-500">Online</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <Search size={18} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <MoreVertical size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Scrollable Messages Area */}
            <div
                className="overflow-hidden p-4"
                style={{
                    height: selectedSessionId ? 'calc(100% - 10rem)' : '100%',
                    marginTop: selectedSessionId ? '5rem' : '0'
                }}
            >
                <ScrollArea ref={scrollRef} className="h-full">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center space-y-4">
                                <LoadingSpinner size="sm" />
                                <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="32"
                                        height="32"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-gray-400"
                                    >
                                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                    </svg>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        No messages yet
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Start a conversation with {userName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                                <div key={date}>
                                    {/* Date Separator */}
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                {date}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Messages for this date */}
                                    <div className="space-y-4">
                                        {dateMessages.map((message, index) => {
                                            const isUser = message.role === 'user';
                                            const showAvatar = index === 0 || dateMessages[index - 1].role !== message.role;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={cn(
                                                        "flex items-end space-x-2",
                                                        isUser ? "justify-end" : "justify-start"
                                                    )}
                                                >
                                                    {!isUser && showAvatar && (
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs">
                                                                AI
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}

                                                    {!isUser && !showAvatar && (
                                                        <div className="w-8 h-8" />
                                                    )}

                                                    <div className={cn(
                                                        "max-w-[70%] flex flex-col",
                                                        isUser ? "items-end" : "items-start"
                                                    )}>
                                                        <div
                                                            className={cn(
                                                                "px-4 py-2 rounded-2xl relative",
                                                                isUser
                                                                    ? "bg-blue-500 text-white rounded-br-md"
                                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md"
                                                            )}
                                                        >
                                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                                {message.content}
                                                            </p>
                                                        </div>

                                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                                                            {formatTime(message.created_at)}
                                                        </span>
                                                    </div>

                                                    {isUser && showAvatar && (
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                                                                {getInitials(userName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}

                                                    {isUser && !showAvatar && (
                                                        <div className="w-8 h-8" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Fixed Message Input at Bottom */}
            {selectedSessionId && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 absolute bottom-0 left-0 right-0 h-20">
                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <Paperclip size={18} />
                        </button>

                        <div className="flex-1 relative">
                            <Input
                                type="text"
                                placeholder="Type your message here..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="pr-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg flex items-center justify-center transition-colors"
                                disabled={!newMessage.trim()}
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 