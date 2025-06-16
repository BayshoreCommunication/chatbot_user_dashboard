import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
    apiKey: string;
    onSelectConversation: (sessionId: string) => void;
    selectedConversationId?: string;
}

export function ChatSidebar({ apiKey, onSelectConversation, selectedConversationId }: ChatSidebarProps) {
    const [conversations, setConversations] = useState<GroupedConversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Fetch conversations for the organization
        const fetchConversations = async () => {
            if (!apiKey) return;

            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/api/conversations`, {
                    headers: {
                        'X-API-Key': apiKey
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched conversations:', data);
                    setConversations(data);
                } else {
                    console.error('Failed to fetch conversations:', response.status);
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, [apiKey]);

    const filteredConversations = conversations.filter(conv =>
        conv.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
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

    if (isLoading) {
        return (
            <Card className="w-80 h-[600px] flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold mb-4">Conversations</h2>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                        Loading conversations...
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="w-80 h-[600px] flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold mb-4">Conversations</h2>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search conversations..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchQuery ? 'No conversations found' : 'No conversations yet'}
                        </div>
                    ) : (
                        filteredConversations.map((conversation) => (
                            <div
                                key={conversation.session_id}
                                className={`p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${selectedConversationId === conversation.session_id ? 'bg-accent' : ''
                                    }`}
                                onClick={() => onSelectConversation(conversation.session_id)}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {getInitials(conversation.user_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium truncate text-sm">
                                                {conversation.user_name}
                                            </p>
                                            <span className="text-xs text-muted-foreground ml-2">
                                                {formatTime(conversation.last_message_time)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-sm text-muted-foreground truncate flex-1">
                                                {conversation.last_message_role === 'user' ? '' : '🤖 '}
                                                {conversation.last_message}
                                            </p>
                                            {conversation.message_count > 1 && (
                                                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full ml-2">
                                                    {conversation.message_count}
                                                </span>
                                            )}
                                        </div>
                                        {conversation.user_email && (
                                            <p className="text-xs text-muted-foreground truncate mt-1">
                                                {conversation.user_email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </Card>
    );
} 