import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface ChatHistoryProps {
    apiKey: string;
    sessionId: string;
}

export function ChatHistory({ apiKey, sessionId }: ChatHistoryProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Connect to socket server
        const socketInstance = io('http://localhost:8000', {
            auth: {
                apiKey: apiKey
            }
        });

        // Join organization room
        socketInstance.emit('join_room', {
            room: `org_${apiKey}`
        });

        // Listen for new messages
        socketInstance.on('new_message', (data) => {
            if (data.session_id === sessionId) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: data.message.role,
                    content: data.message.content,
                    timestamp: data.message.timestamp
                }]);
            }
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [apiKey, sessionId]);

    return (
        <Card className="p-4 h-[600px] flex flex-col">
            <h2 className="text-xl font-bold mb-4">Chat History</h2>
            <ScrollArea className="flex-1">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''
                                }`}
                        >
                            <Avatar className="h-8 w-8">
                                {message.role === 'user' ? (
                                    <AvatarFallback>U</AvatarFallback>
                                ) : (
                                    <AvatarFallback>B</AvatarFallback>
                                )}
                            </Avatar>
                            <div
                                className={`rounded-lg p-3 max-w-[80%] ${message.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800'
                                    }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                <span className="text-xs opacity-70 mt-1 block">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </Card>
    );
} 