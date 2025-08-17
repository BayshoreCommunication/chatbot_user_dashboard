import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApiKey } from '@/hooks/useApiKey'
import { cn } from '@/lib/utils'
import {
  Bell,
  BellOff,
  Bot,
  ChevronDown,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'

interface Message {
  _id: string
  id: string
  organization_id: string
  visitor_id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  metadata?: {
    mode?: string
  }
}

interface ChatPanelProps {
  messages: Message[]
  isLoading?: boolean
  selectedSessionId?: string | null
  userInfo?: {
    user_name?: string
    user_email?: string
  } | null
  socket?: Socket | null // Socket.IO instance
  incomingMessageLoading?: boolean // New prop for typing animation
}

interface GroupedMessages {
  [date: string]: Message[]
}

// Notification sound (you can replace with your own sound file)
const playNotificationSound = () => {
  try {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmweCzF+1O/Adi0ALnzM6+2QQBAUYrXq8adVFAY+ltryxnkpBSl+zO/fgjAFL4TU9NyILB8DPZnY686KOQF2v+bvp1sTC0Os5O+zXiAFOpHY8siCKBAOVa7n77dfEQ9MpuL0u2sfBjOR2fDHeCUI'
    ) // Basic beep sound
    audio.volume = 0.3
    audio.play().catch(() => {
      // Ignore errors if sound can't be played
    })
  } catch (error) {
    // Ignore sound errors
  }
}

const getInitials = (name: string) => {
  if (!name || name.startsWith('Visitor')) {
    return 'V'
  }
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Typing animation component
const TypingAnimation = () => {
  return (
    <div className='animate-fade-in flex items-end justify-start space-x-2'>
      <Avatar className='h-8 w-8'>
        <AvatarFallback className='bg-blue-100 text-xs text-blue-600 dark:bg-blue-900 dark:text-blue-300'>
          AI
        </AvatarFallback>
      </Avatar>
      <div className='flex max-w-[70%] flex-col items-start'>
        <div className='rounded-2xl rounded-bl-md border border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center space-x-1'>
            <div className='h-2 w-2 animate-bounce rounded-full bg-blue-500'></div>
            <div
              className='h-2 w-2 animate-bounce rounded-full bg-blue-500'
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className='h-2 w-2 animate-bounce rounded-full bg-blue-500'
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
        <span className='mt-1 px-1 text-xs font-medium text-blue-500 dark:text-blue-400'>
          Assistant is thinking...
        </span>
      </div>
    </div>
  )
}

export function ChatPanel({
  messages,
  isLoading,
  selectedSessionId,
  userInfo,
  socket,
  incomingMessageLoading,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [newMessage, setNewMessage] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<
    'online' | 'offline'
  >('offline')
  const [agentMode, setAgentMode] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const { apiKey } = useApiKey()

  // Notification states
  const [isDocumentVisible, setIsDocumentVisible] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(
    null
  )
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set())

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          setNotificationsEnabled(permission === 'granted')
        })
      } else {
        setNotificationsEnabled(Notification.permission === 'granted')
      }
    }
  }, [])

  // Track document visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden
      setIsDocumentVisible(isVisible)

      // Mark messages as read when document becomes visible
      if (isVisible && messages.length > 0) {
        const latestMessage = messages[messages.length - 1]
        setLastSeenMessageId(latestMessage.id)
        setUnreadCount(0)
        setNewMessageIds(new Set())
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [messages])

  // Track scroll position
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const isScrolledToBottom =
        Math.abs(scrollHeight - scrollTop - clientHeight) < 10
      setIsUserScrolledUp(!isScrolledToBottom)

      // Mark messages as read when user scrolls to bottom and document is visible
      if (isScrolledToBottom && isDocumentVisible && unreadCount > 0) {
        setUnreadCount(0)
        setNewMessageIds(new Set())
        if (messages.length > 0) {
          setLastSeenMessageId(messages[messages.length - 1].id)
        }
      }
    }
  }, [isDocumentVisible, unreadCount, messages])

  // Attach scroll listener
  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll)
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Handle new messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1]

      // Check if this is a new message
      if (lastSeenMessageId && latestMessage.id !== lastSeenMessageId) {
        const lastSeenIndex = messages.findIndex(
          (msg) => msg.id === lastSeenMessageId
        )
        const newMessages = messages.slice(lastSeenIndex + 1)

        if (newMessages.length > 0) {
          // Add new message IDs for highlighting
          setNewMessageIds((prev) => {
            const newSet = new Set(prev)
            newMessages.forEach((msg) => newSet.add(msg.id))
            return newSet
          })

          // Only show notifications for assistant messages
          const newAssistantMessages = newMessages.filter(
            (msg) => msg.role === 'assistant'
          )

          if (newAssistantMessages.length > 0) {
            // Update unread count only if document is not visible or user scrolled up
            if (!isDocumentVisible || isUserScrolledUp) {
              setUnreadCount((prev) => prev + newAssistantMessages.length)
            }

            // Show browser notification if tab is not active
            if (!isDocumentVisible && notificationsEnabled) {
              const latestAssistantMessage =
                newAssistantMessages[newAssistantMessages.length - 1]
              new Notification('New message from AI Assistant', {
                body:
                  latestAssistantMessage.content.substring(0, 100) +
                  (latestAssistantMessage.content.length > 100 ? '...' : ''),
                icon: '/favicon.ico',
                tag: 'chat-message',
                requireInteraction: false,
              })
            }

            // Play sound notification
            if (soundEnabled && (!isDocumentVisible || isUserScrolledUp)) {
              playNotificationSound()
            }
          }
        }
      }

      // Initialize lastSeenMessageId if not set
      if (!lastSeenMessageId && isDocumentVisible) {
        setLastSeenMessageId(latestMessage.id)
      }
    }
  }, [
    messages,
    lastSeenMessageId,
    isDocumentVisible,
    notificationsEnabled,
    soundEnabled,
    isUserScrolledUp,
  ])

  // Auto-scroll to bottom when new messages arrive (only if user is at bottom or document is visible)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!isUserScrolledUp || isDocumentVisible) {
      scrollToBottom()
    }
  }, [messages, incomingMessageLoading, isUserScrolledUp, isDocumentVisible])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && (!isUserScrolledUp || isDocumentVisible)) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isUserScrolledUp, isDocumentVisible])

  // Clear message highlighting after a delay
  useEffect(() => {
    if (newMessageIds.size > 0) {
      const timer = setTimeout(() => {
        setNewMessageIds(new Set())
      }, 3000) // Clear highlighting after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [newMessageIds])

  // Monitor socket connection status and agent mode events
  useEffect(() => {
    if (socket) {
      const handleConnect = () => setConnectionStatus('online')
      const handleDisconnect = () => setConnectionStatus('offline')

      const handleAgentTakeover = (data: any) => {
        if (data.session_id === selectedSessionId) {
          setAgentMode(true)
        }
      }

      const handleAgentRelease = (data: any) => {
        if (data.session_id === selectedSessionId) {
          setAgentMode(false)
        }
      }

      socket.on('connect', handleConnect)
      socket.on('disconnect', handleDisconnect)
      socket.on('agent_takeover', handleAgentTakeover)
      socket.on('agent_release', handleAgentRelease)

      // Set initial status
      setConnectionStatus(socket.connected ? 'online' : 'offline')

      return () => {
        socket.off('connect', handleConnect)
        socket.off('disconnect', handleDisconnect)
        socket.off('agent_takeover', handleAgentTakeover)
        socket.off('agent_release', handleAgentRelease)
      }
    } else {
      setConnectionStatus('offline')
    }
  }, [socket, selectedSessionId])

  // Reset agent mode when switching conversations
  useEffect(() => {
    setAgentMode(false)
  }, [selectedSessionId])

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]): GroupedMessages => {
    const groups: GroupedMessages = {}

    messages.forEach((message) => {
      const date = new Date(message.created_at)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let dateKey: string
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday'
      } else {
        dateKey = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })

    return groups
  }

  const groupedMessages = groupMessagesByDate(messages)

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSendMessage = async () => {
    if (
      newMessage.trim() &&
      agentMode &&
      apiKey &&
      selectedSessionId &&
      !sendingMessage
    ) {
      setSendingMessage(true)
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chatbot/send-agent-message`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': apiKey,
            },
            body: JSON.stringify({
              session_id: selectedSessionId,
              message: newMessage,
              agent_id: 'dashboard-agent', // You can make this dynamic
            }),
          }
        )

        if (response.ok) {
          setNewMessage('')
        } else {
          console.error('Failed to send agent message')
        }
      } catch (error) {
        console.error('Error sending agent message:', error)
      } finally {
        setSendingMessage(false)
      }
    }
  }

  const handleAgentTakeover = async () => {
    if (!apiKey || !selectedSessionId) return

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chatbot/agent-takeover`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
          },
          body: JSON.stringify({
            session_id: selectedSessionId,
            agent_id: 'dashboard-agent',
          }),
        }
      )

      if (response.ok) {
        setAgentMode(true)
      } else {
        console.error('Failed to take over conversation')
      }
    } catch (error) {
      console.error('Error taking over conversation:', error)
    }
  }

  const handleAgentRelease = async () => {
    if (!apiKey || !selectedSessionId) return

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chatbot/agent-release`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
          },
          body: JSON.stringify({
            session_id: selectedSessionId,
            agent_id: 'dashboard-agent',
          }),
        }
      )

      if (response.ok) {
        setAgentMode(false)
      } else {
        console.error('Failed to release conversation')
      }
    } catch (error) {
      console.error('Error releasing conversation:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const scrollToBottomClick = () => {
    scrollToBottom()
    setUnreadCount(0)
    setNewMessageIds(new Set())
    if (messages.length > 0) {
      setLastSeenMessageId(messages[messages.length - 1].id)
    }
  }

  const userName =
    userInfo?.user_name || `Visitor ${selectedSessionId?.slice(0, 8) || ''}`
  const userEmail = userInfo?.user_email

  // Show welcome state if no conversation is selected
  if (!selectedSessionId) {
    return (
      <div className='relative flex h-full flex-1 flex-col bg-white dark:bg-gray-900'>
        <div className='flex h-full items-center justify-center'>
          <div className='space-y-4 text-center'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='32'
                height='32'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-gray-400'
              >
                <path d='M7.9 20A9 9 0 1 0 4 16.1L2 22Z' />
              </svg>
            </div>
            <div className='space-y-2'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                Welcome to Chat Management
              </h3>
              <p className='text-gray-500 dark:text-gray-400'>
                Loading conversations...
              </p>
            </div>
            <LoadingSpinner size='sm' />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='relative flex h-full flex-1 flex-col bg-white dark:bg-gray-900'>
      {/* Fixed Header */}
      {selectedSessionId && (
        <div className='absolute left-0 right-0 top-0 z-10 flex h-20 items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900'>
          <div className='flex items-center'>
            <Avatar className='h-10 w-10'>
              <AvatarFallback className='bg-gray-200 font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300'>
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className='ml-3'>
              <h3 className='font-semibold text-gray-900 dark:text-white'>
                {userName}
              </h3>
              {userEmail && userEmail !== 'anonymous@user.com' && (
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {userEmail}
                </p>
              )}
              {/* <p className="text-sm text-green-500">Online</p> */}
            </div>

            {/* Unread messages indicator */}
            {unreadCount > 0 && (
              <div className='ml-2 animate-pulse rounded-full bg-red-500 px-2 py-1 text-xs text-white'>
                {unreadCount} new
              </div>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            {/* Agent Mode Toggle */}
            {agentMode ? (
              <div className='flex items-center space-x-2'>
                <div className='flex items-center space-x-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300'>
                  <User size={12} />
                  <span>Agent Mode</span>
                </div>
                <Button
                  onClick={handleAgentRelease}
                  size='sm'
                  variant='outline'
                  className='h-7 text-xs'
                >
                  <Bot size={12} className='mr-1' />
                  Back to AI
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleAgentTakeover}
                size='sm'
                variant='outline'
                className='h-7 text-xs'
              >
                <MessageSquare size={12} className='mr-1' />
                Take Over
              </Button>
            )}

            {/* Notification Settings */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                'rounded-lg p-2 transition-colors',
                soundEnabled
                  ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              title={
                soundEnabled
                  ? 'Disable sound notifications'
                  : 'Enable sound notifications'
              }
            >
              {soundEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </button>

            {/* Connection Status Indicator */}
            <div
              className={cn(
                'flex items-center space-x-1 rounded-full px-2 py-1 text-xs',
                connectionStatus === 'online'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              )}
            >
              {connectionStatus === 'online' ? (
                <Wifi size={12} />
              ) : (
                <WifiOff size={12} />
              )}
              <span>{connectionStatus === 'online' ? 'Live' : 'Offline'}</span>
            </div>

            <button className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800'>
              <Search size={18} />
            </button>
            <button className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800'>
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Messages Area */}
      <div
        className='relative overflow-hidden p-4'
        style={{
          height: selectedSessionId ? 'calc(100% - 10rem)' : '100%',
          marginTop: selectedSessionId ? '5rem' : '0',
        }}
      >
        {/* Scroll to bottom button */}
        {(isUserScrolledUp || unreadCount > 0) && (
          <button
            onClick={scrollToBottomClick}
            className='absolute bottom-4 right-8 z-20 transform rounded-full bg-blue-500 p-3 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-600'
            title={
              unreadCount > 0
                ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}`
                : 'Scroll to bottom'
            }
          >
            <div className='relative'>
              <ChevronDown size={20} />
              {unreadCount > 0 && (
                <div className='absolute -right-2 -top-2 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-red-500 text-xs text-white'>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
          </button>
        )}

        <ScrollArea ref={scrollRef} className='h-full'>
          {isLoading ? (
            <div className='flex h-full items-center justify-center'>
              <div className='space-y-4 text-center'>
                <LoadingSpinner size='sm' />
                <div className='text-gray-500 dark:text-gray-400'>
                  Loading messages...
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className='flex h-full items-center justify-center'>
              <div className='space-y-4 text-center'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='32'
                    height='32'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='text-gray-400'
                  >
                    <path d='M7.9 20A9 9 0 1 0 4 16.1L2 22Z' />
                  </svg>
                </div>
                <div className='space-y-2'>
                  <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                    No messages yet
                  </h3>
                  <p className='text-gray-500 dark:text-gray-400'>
                    Start a conversation with {userName}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className='mb-4 flex items-center justify-center'>
                    <div className='rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800'>
                      <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
                        {date}
                      </span>
                    </div>
                  </div>

                  {/* Messages for this date */}
                  <div className='space-y-4'>
                    {dateMessages.map((message, index) => {
                      const isUser = message.role === 'user'
                      const showAvatar =
                        index === 0 ||
                        dateMessages[index - 1].role !== message.role
                      const isNewMessage = newMessageIds.has(message.id)

                      return (
                        <div
                          key={message.id}
                          className={cn(
                            'flex items-end space-x-2 transition-all duration-500',
                            isUser
                              ? 'items-center justify-start'
                              : 'items-start justify-end',
                            isNewMessage && 'animate-pulse'
                          )}
                        >
                          {isUser && showAvatar && (
                            <Avatar className='h-8 w-8'>
                              <AvatarFallback className='bg-blue-500 text-xs text-white'>
                                {getInitials(userName)}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          {isUser && !showAvatar && <div className='h-8 w-8' />}

                          <div
                            className={cn(
                              'flex max-w-[70%] flex-col',
                              isUser ? 'items-end' : 'items-start'
                            )}
                          >
                            <div
                              className={cn(
                                'relative rounded-2xl px-4 py-2 transition-all duration-500',
                                isUser
                                  ? 'rounded-bl-md bg-blue-500 text-white'
                                  : 'rounded-br-md bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
                                isNewMessage &&
                                  !isUser &&
                                  'bg-blue-50 ring-2 ring-blue-500 ring-opacity-50 dark:bg-blue-900/20'
                              )}
                            >
                              <p className='whitespace-pre-wrap text-sm leading-relaxed'>
                                {message.content}
                              </p>
                              {isNewMessage && !isUser && (
                                <div className='absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-blue-500' />
                              )}
                            </div>

                            <span className='mt-1 px-1 text-xs text-gray-500 dark:text-gray-400'>
                              {formatTime(message.created_at)}
                            </span>
                          </div>

                          {!isUser && showAvatar && (
                            <Avatar className='h-8 w-8'>
                              <AvatarFallback className='bg-blue-100 text-xs text-blue-600 dark:bg-blue-900 dark:text-blue-300'>
                                AI
                              </AvatarFallback>
                            </Avatar>
                          )}

                          {!isUser && !showAvatar && (
                            <div className='h-8 w-8' />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Show typing animation when message is incoming */}
              {incomingMessageLoading && (
                <div className='mt-4'>
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
        <div className='absolute bottom-0 left-0 right-0 h-20 border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900'>
          <div className='flex items-center space-x-2'>
            <button className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800'>
              <Paperclip size={18} />
            </button>

            <div className='relative flex-1'>
              <Input
                type='text'
                placeholder={
                  agentMode
                    ? 'Type your response as agent...'
                    : 'Agent mode required to send messages'
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!agentMode || sendingMessage}
                className='border-gray-200 bg-gray-50 pr-12 dark:border-gray-700 dark:bg-gray-800'
              />
              <button
                onClick={handleSendMessage}
                className={cn(
                  'absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-lg p-0 text-white transition-colors',
                  agentMode && newMessage.trim() && !sendingMessage
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'cursor-not-allowed bg-gray-300'
                )}
                disabled={!agentMode || !newMessage.trim() || sendingMessage}
              >
                {sendingMessage ? (
                  <div className='h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent' />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
