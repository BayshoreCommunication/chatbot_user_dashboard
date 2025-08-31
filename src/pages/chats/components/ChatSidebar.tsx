import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { RefreshCw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

interface GroupedConversation {
  session_id: string
  visitor_id: string
  user_name: string
  user_email?: string
  last_message: string
  last_message_role: string
  last_message_time: string
  message_count: number
  created_at: string
}

interface ChatSidebarProps {
  conversations: GroupedConversation[]
  isLoading: boolean
  onSelectConversation: (sessionId: string) => void
  selectedConversationId: string | null
  onRefresh?: () => void
}

export function ChatSidebar({
  conversations,
  isLoading,
  onSelectConversation,
  selectedConversationId,
  onRefresh,
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  // Debug logging for selected conversation
  console.log(
    '[DEBUG] ChatSidebar: Selected conversation ID:',
    selectedConversationId
  )
  console.log('[DEBUG] ChatSidebar: Total conversations:', conversations.length)

  // Track selected conversation changes
  useEffect(() => {
    console.log(
      '[DEBUG] ChatSidebar: Selected conversation changed to:',
      selectedConversationId
    )
  }, [selectedConversationId])

  // Sort conversations based on sortBy state
  const sortedConversations = [...conversations].sort((a, b) => {
    if (sortBy === 'newest') {
      return (
        new Date(b.last_message_time).getTime() -
        new Date(a.last_message_time).getTime()
      )
    } else {
      return (
        new Date(a.last_message_time).getTime() -
        new Date(b.last_message_time).getTime()
      )
    }
  })

  // Filter conversations based on search term
  const filteredConversations = sortedConversations.filter(
    (conversation) =>
      conversation.user_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      conversation.last_message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 1) {
        return 'Just now'
      } else if (diffInHours < 24) {
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      } else {
        return date.toLocaleDateString()
      }
    } catch (error) {
      return 'Unknown'
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

  return (
    <div className='relative flex h-full w-80 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'>
      {/* Header */}
      <div className='absolute left-0 right-0 top-0 z-10 h-40 border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            Messages
          </h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className='p-2 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              title='Refresh conversations'
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className='relative mb-3'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
          <Input
            type='text'
            placeholder='Search'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='border-gray-200 bg-gray-50 pl-10 dark:border-gray-700 dark:bg-gray-800'
          />
        </div>

        {/* Sort Dropdown */}
        <div className='flex items-center justify-between'>
          <span className='text-sm text-gray-500 dark:text-gray-400'>
            Sort by
          </span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className='h-8 w-24 border-none bg-transparent text-sm'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='newest'>Newest</SelectItem>
              <SelectItem value='oldest'>Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conversations List */}
      <div
        className='overflow-hidden p-2'
        style={{
          height: 'calc(100% - 10rem)',
          marginTop: '10rem',
        }}
      >
        <ScrollArea className='h-full'>
          {isLoading ? (
            <div className='flex h-32 items-center justify-center'>
              <LoadingSpinner size='sm' />
            </div>
          ) : (
            <div>
              {filteredConversations.length === 0 ? (
                <div className='py-8 text-center text-gray-500 dark:text-gray-400'>
                  {searchTerm
                    ? 'No conversations found'
                    : 'No conversations yet'}
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  console.log('[DEBUG] ChatSidebar: Rendering conversation:', {
                    session_id: conversation.session_id,
                    user_name: conversation.user_name,
                    isSelected:
                      selectedConversationId === conversation.session_id,
                  })

                  return (
                    <div
                      key={conversation.session_id}
                      className={cn(
                        'mb-1 flex cursor-pointer items-center rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
                        selectedConversationId === conversation.session_id &&
                          'border-r-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      )}
                      onClick={() => {
                        console.log(
                          '[DEBUG] ChatSidebar: Conversation clicked:',
                          conversation.session_id
                        )
                        onSelectConversation(conversation.session_id)
                      }}
                    >
                      <div className='relative'>
                        <Avatar className='h-12 w-12'>
                          <AvatarFallback className='bg-gray-200 font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300'>
                            {getInitials(conversation.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        {/* Mock online status - you can implement real online status later */}
                        <div className='absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-gray-900'></div>
                      </div>

                      <div className='ml-3 min-w-0 flex-1'>
                        <div className='mb-1 flex items-center justify-between'>
                          <h3 className='truncate font-medium text-gray-900 dark:text-white'>
                            {conversation.user_name}
                          </h3>
                          <span className='ml-2 text-xs text-gray-500 dark:text-gray-400'>
                            {formatTime(conversation.last_message_time)}
                          </span>
                        </div>

                        <div className='flex items-center justify-between'>
                          <p className='flex-1 truncate text-sm text-gray-600 dark:text-gray-400'>
                            {conversation.last_message_role === 'user'
                              ? ''
                              : '🤖 '}
                            {conversation.last_message}
                          </p>

                          {conversation.message_count > 1 && (
                            <div className='ml-2 flex items-center'>
                              <span className='rounded-full bg-blue-500 px-2 py-1 text-xs text-white'>
                                {conversation.message_count}
                              </span>
                            </div>
                          )}
                        </div>

                        {conversation.user_email && (
                          <p className='mt-1 truncate text-xs text-gray-500 dark:text-gray-400'>
                            {conversation.user_email}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
