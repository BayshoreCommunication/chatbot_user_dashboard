import { useEffect, useRef, useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, MoreVertical, Send, Paperclip, Wifi, WifiOff, Bell, BellOff, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/custom/loading-spinner';
import type { Socket } from 'socket.io-client';

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
    socket?: Socket | null; // Socket.IO instance
    incomingMessageLoading?: boolean; // New prop for typing animation
}

interface GroupedMessages {
    [date: string]: Message[];
}

// Notification sound (you can replace with your own sound file)
const playNotificationSound = () => {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmweCzF+1O/Adi0ALnzM6+2QQBAUYrXq8adVFAY+ltryxnkpBSl+zO/fgjAFL4TU9NyILB8DPZnY686KOQF2v+bvp1sTC0Os5O+zXiAFOpHY8siCKBAOVa7n77dfEQ9MpuL0u2sfBjOR2fDHeCUI'); // Basic beep sound
        audio.volume = 0.3;
        audio.play().catch(() => {
            // Ignore errors if sound can't be played
        });
    } catch (error) {
        // Ignore sound errors
    }
};

const getInitials = (name: string) => {
    if (!name || name.startsWith('Visitor')) {
        return 'V';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

// Typing animation component
const TypingAnimation = () => {
    return (
        <div className="flex items-end space-x-2 justify-start animate-fade-in">
            <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs">
                    AI
                </AvatarFallback>
            </Avatar>
            <div className="max-w-[70%] flex flex-col items-start">
                <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 rounded-bl-md border border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-1 items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                        ></div>
                    </div>
                </div>
                <span className="text-xs text-blue-500 dark:text-blue-400 mt-1 px-1 font-medium">
                    Assistant is thinking...
                </span>
            </div>
        </div>
    );
};

export function ChatPanel({ messages, isLoading, selectedSessionId, userInfo, socket, incomingMessageLoading }: ChatPanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState('');
    const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline');

    // Notification states
    const [isDocumentVisible, setIsDocumentVisible] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
    const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    setNotificationsEnabled(permission === 'granted');
                });
            } else {
                setNotificationsEnabled(Notification.permission === 'granted');
            }
        }
    }, []);

    // Track document visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            const isVisible = !document.hidden;
            setIsDocumentVisible(isVisible);

            // Mark messages as read when document becomes visible
            if (isVisible && messages.length > 0) {
                const latestMessage = messages[messages.length - 1];
                setLastSeenMessageId(latestMessage.id);
                setUnreadCount(0);
                setNewMessageIds(new Set());
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [messages]);

    // Track scroll position
    const handleScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isScrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
            setIsUserScrolledUp(!isScrolledToBottom);

            // Mark messages as read when user scrolls to bottom and document is visible
            if (isScrolledToBottom && isDocumentVisible && unreadCount > 0) {
                setUnreadCount(0);
                setNewMessageIds(new Set());
                if (messages.length > 0) {
                    setLastSeenMessageId(messages[messages.length - 1].id);
                }
            }
        }
    }, [isDocumentVisible, unreadCount, messages]);

    // Attach scroll listener
    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll);
            return () => scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    // Handle new messages
    useEffect(() => {
        if (messages.length > 0) {
            const latestMessage = messages[messages.length - 1];

            // Check if this is a new message
            if (lastSeenMessageId && latestMessage.id !== lastSeenMessageId) {
                const lastSeenIndex = messages.findIndex(msg => msg.id === lastSeenMessageId);
                const newMessages = messages.slice(lastSeenIndex + 1);

                if (newMessages.length > 0) {
                    // Add new message IDs for highlighting
                    setNewMessageIds(prev => {
                        const newSet = new Set(prev);
                        newMessages.forEach(msg => newSet.add(msg.id));
                        return newSet;
                    });

                    // Only show notifications for assistant messages
                    const newAssistantMessages = newMessages.filter(msg => msg.role === 'assistant');

                    if (newAssistantMessages.length > 0) {
                        // Update unread count only if document is not visible or user scrolled up
                        if (!isDocumentVisible || isUserScrolledUp) {
                            setUnreadCount(prev => prev + newAssistantMessages.length);
                        }

                        // Show browser notification if tab is not active
                        if (!isDocumentVisible && notificationsEnabled) {
                            const latestAssistantMessage = newAssistantMessages[newAssistantMessages.length - 1];
                            new Notification('New message from AI Assistant', {
                                body: latestAssistantMessage.content.substring(0, 100) + (latestAssistantMessage.content.length > 100 ? '...' : ''),
                                icon: '/favicon.ico',
                                tag: 'chat-message',
                                requireInteraction: false
                            });
                        }

                        // Play sound notification
                        if (soundEnabled && (!isDocumentVisible || isUserScrolledUp)) {
                            playNotificationSound();
                        }
                    }
                }
            }

            // Initialize lastSeenMessageId if not set
            if (!lastSeenMessageId && isDocumentVisible) {
                setLastSeenMessageId(latestMessage.id);
            }
        }
    }, [messages, lastSeenMessageId, isDocumentVisible, notificationsEnabled, soundEnabled, isUserScrolledUp]);

    // Auto-scroll to bottom when new messages arrive (only if user is at bottom or document is visible)
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!isUserScrolledUp || isDocumentVisible) {
            scrollToBottom();
        }
    }, [messages, incomingMessageLoading, isUserScrolledUp, isDocumentVisible]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current && (!isUserScrolledUp || isDocumentVisible)) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isUserScrolledUp, isDocumentVisible]);

    // Clear message highlighting after a delay
    useEffect(() => {
        if (newMessageIds.size > 0) {
            const timer = setTimeout(() => {
                setNewMessageIds(new Set());
            }, 3000); // Clear highlighting after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [newMessageIds]);

    // Monitor socket connection status
    useEffect(() => {
        if (socket) {
            const handleConnect = () => setConnectionStatus('online');
            const handleDisconnect = () => setConnectionStatus('offline');

            socket.on('connect', handleConnect);
            socket.on('disconnect', handleDisconnect);

            // Set initial status
            setConnectionStatus(socket.connected ? 'online' : 'offline');

            return () => {
                socket.off('connect', handleConnect);
                socket.off('disconnect', handleDisconnect);
            };
        } else {
            setConnectionStatus('offline');
        }
    }, [socket]);

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

    const scrollToBottomClick = () => {
        scrollToBottom();
        setUnreadCount(0);
        setNewMessageIds(new Set());
        if (messages.length > 0) {
            setLastSeenMessageId(messages[messages.length - 1].id);
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
                            {/* <p className="text-sm text-green-500">Online</p> */}
                        </div>

                        {/* Unread messages indicator */}
                        {unreadCount > 0 && (
                            <div className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 animate-pulse">
                                {unreadCount} new
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Notification Settings */}
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                soundEnabled
                                    ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                    : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                            title={soundEnabled ? "Disable sound notifications" : "Enable sound notifications"}
                        >
                            {soundEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                        </button>

                        {/* Connection Status Indicator */}
                        <div className={cn(
                            "flex items-center space-x-1 px-2 py-1 rounded-full text-xs",
                            connectionStatus === 'online'
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        )}>
                            {connectionStatus === 'online' ? (
                                <Wifi size={12} />
                            ) : (
                                <WifiOff size={12} />
                            )}
                            <span>{connectionStatus === 'online' ? 'Live' : 'Offline'}</span>
                        </div>

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
                className="overflow-hidden p-4 relative"
                style={{
                    height: selectedSessionId ? 'calc(100% - 10rem)' : '100%',
                    marginTop: selectedSessionId ? '5rem' : '0'
                }}
            >
                {/* Scroll to bottom button */}
                {(isUserScrolledUp || unreadCount > 0) && (
                    <button
                        onClick={scrollToBottomClick}
                        className="absolute bottom-4 right-8 z-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 transform hover:scale-110"
                        title={unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : 'Scroll to bottom'}
                    >
                        <div className="relative">
                            <ChevronDown size={20} />
                            {unreadCount > 0 && (
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </div>
                            )}
                        </div>
                    </button>
                )}

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
                                            const isNewMessage = newMessageIds.has(message.id);

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={cn(
                                                        "flex items-end space-x-2 transition-all duration-500",
                                                        isUser ? "justify-start items-center" : "justify-end items-start",
                                                        isNewMessage && "animate-pulse"
                                                    )}
                                                >
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

                                                    <div className={cn(
                                                        "max-w-[70%] flex flex-col",
                                                        isUser ? "items-end" : "items-start"
                                                    )}>
                                                        <div
                                                            className={cn(
                                                                "px-4 py-2 rounded-2xl relative transition-all duration-500",
                                                                isUser
                                                                    ? "bg-blue-500 text-white rounded-bl-md"
                                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-br-md",
                                                                isNewMessage && !isUser && "ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/20"
                                                            )}
                                                        >
                                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                                {message.content}
                                                            </p>
                                                            {isNewMessage && !isUser && (
                                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                                                            )}
                                                        </div>

                                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                                                            {formatTime(message.created_at)}
                                                        </span>
                                                    </div>

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
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Show typing animation when message is incoming */}
                            {incomingMessageLoading && (
                                <div className="mt-4">
                                    <TypingAnimation />
                                </div>
                            )}

                            {/* Scroll anchor */}
                            <div ref={messagesEndRef} />
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
                                disabled
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