import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatHistoryProps {
  apiKey: string
  sessionId: string
}

export function ChatHistory({ apiKey, sessionId }: ChatHistoryProps) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    // Connect to socket server
    const socketInstance = io(
      import.meta.env.VITE_API_URL ||
        (import.meta.env.PROD
          ? 'https://api.bayshorecommunication.org'
          : 'http://localhost:8000'),
      {
        auth: {
          apiKey: apiKey,
        },
      }
    )

    // Join organization room
    socketInstance.emit('join_room', {
      room: `org_${apiKey}`,
    })

    // Listen for new messages
    socketInstance.on('new_message', (data) => {
      if (data.session_id === sessionId) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: data.message.role,
            content: data.message.content,
            timestamp: data.message.timestamp,
          },
        ])
      }
    })

    // setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [apiKey, sessionId])

  return (
    <Card className='flex h-[600px] flex-col p-4'>
      <h2 className='mb-4 text-xl font-bold'>Chat History</h2>
      <ScrollArea className='flex-1'>
        <div className='space-y-4'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className='h-8 w-8'>
                {message.role === 'user' ? (
                  <AvatarFallback>U</AvatarFallback>
                ) : (
                  <AvatarFallback>B</AvatarFallback>
                )}
              </Avatar>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <p className='text-sm'>{message.content}</p>
                <span className='mt-1 block text-xs opacity-70'>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
