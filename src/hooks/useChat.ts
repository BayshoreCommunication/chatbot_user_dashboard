import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

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
    agent_id?: string
    type?: string
  }
}

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

interface UserInfo {
  user_name?: string
  user_email?: string
}

interface SessionData {
  conversations: Message[]
  user_name?: string
  user_email?: string
  agent_mode?: boolean
  agent_id?: string | null
  agent_takeover_at?: string | null
}

export function useChat(apiKey: string | null) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  )
  const [hasAutoSelected, setHasAutoSelected] = useState(false)
  const [incomingMessageLoading, setIncomingMessageLoading] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const selectedSessionIdRef = useRef<string | null>(null)
  const lastMessageCountRef = useRef<number>(0)
  const queryClient = useQueryClient()

  // Agent mode states
  const [isAgentMode, setIsAgentMode] = useState(false)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [agentTakeoverAt, setAgentTakeoverAt] = useState<string | null>(null)

  console.log(
    'current season : ',
    selectedSessionId,
    'selected season ref : ',
    selectedSessionIdRef.current
  )

  // Keep ref in sync with state
  useEffect(() => {
    selectedSessionIdRef.current = selectedSessionId
    // Hide typing animation when switching conversations
    setIncomingMessageLoading(false)
    // Reset message count for new session
    lastMessageCountRef.current = 0
  }, [selectedSessionId])

  // Initialize socket connection for real-time updates
  useEffect(() => {
    if (!apiKey) return

    console.log('Initializing Socket.IO connection with API key:', apiKey)

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const socketInstance = io(apiUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        apiKey: apiKey,
      },
      query: {
        apiKey: apiKey,
      },
      forceNew: true,
    })

    socketRef.current = socketInstance

    // Listen for connection events
    socketInstance.on('connect', () => {
      console.log('Socket connected successfully for real-time chat updates')
      // Join organization room explicitly
      socketInstance.emit('join_room', { room: `org_${apiKey}` })
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    // Listen for connection confirmation
    socketInstance.on('connection_confirmed', (data) => {
      console.log('Socket.IO connection confirmed:', data)
    })

    // Listen for room join confirmation
    socketInstance.on('room_joined', (data) => {
      console.log('Socket.IO room joined:', data)
    })

    // Listen for new messages
    socketInstance.on('new_message', (data) => {
      console.log('Received new message via Socket.IO:', data)
      console.log('Message content:', data.message)
      console.log('Session ID from message:', data.session_id)
      console.log('Current selected session:', selectedSessionIdRef.current)

      // Handle typing animation based on message type
      if (data.session_id === selectedSessionIdRef.current) {
        if (data.message.role === 'user') {
          // User message received - show typing animation only if not in agent mode
          // In agent mode, the agent will respond manually
          if (!data.message.metadata?.agent_id) {
            console.log('User message received, waiting for AI thinking event')
          } else {
            console.log(
              'User message received in agent mode, no typing animation needed'
            )
          }
        } else if (data.message.role === 'assistant') {
          // Assistant/Agent message received - hide typing animation
          console.log(
            'Assistant/Agent message received via Socket.IO - hiding typing animation'
          )
          setIncomingMessageLoading(false)
        }
      }

      // Invalidate and refetch conversations to update the sidebar
      queryClient.invalidateQueries({ queryKey: ['conversations', apiKey] })

      // If the message is for the currently selected session, update messages
      if (data.session_id === selectedSessionIdRef.current) {
        console.log('Invalidating messages for current session')
        queryClient.invalidateQueries({
          queryKey: ['messages', selectedSessionIdRef.current, apiKey],
        })
      } else {
        console.log(
          'Message is for different session, not invalidating current messages'
        )
      }
    })

    // Listen for AI thinking event
    socketInstance.on('ai_thinking', (data) => {
      console.log('Received AI thinking event:', data)
      if (data.session_id === selectedSessionIdRef.current) {
        console.log('AI is thinking for current session')
        setIncomingMessageLoading(true)
      }
    })

    // Listen for agent takeover events
    socketInstance.on('agent_takeover', (data) => {
      console.log('Received agent takeover via Socket.IO:', data)

      // Update agent mode states if this is for the current session
      if (data.session_id === selectedSessionIdRef.current) {
        setIsAgentMode(true)
        setAgentId(data.agent_id || null)
        setAgentTakeoverAt(data.timestamp)
      }

      // Refresh conversations to update any status indicators
      queryClient.invalidateQueries({ queryKey: ['conversations', apiKey] })

      // Refresh messages for the current session to get updated agent mode
      if (data.session_id === selectedSessionIdRef.current) {
        queryClient.invalidateQueries({
          queryKey: ['messages', selectedSessionIdRef.current, apiKey],
        })
      }
    })

    // Listen for agent release events
    socketInstance.on('agent_release', (data) => {
      console.log('Received agent release via Socket.IO:', data)

      // Update agent mode states if this is for the current session
      if (data.session_id === selectedSessionIdRef.current) {
        setIsAgentMode(false)
        setAgentId(null)
        setAgentTakeoverAt(null)
        setIncomingMessageLoading(false) // Clear any typing indicators when agent releases
      }

      // Refresh conversations to update any status indicators
      queryClient.invalidateQueries({ queryKey: ['conversations', apiKey] })

      // Refresh messages for the current session to get updated agent mode
      if (data.session_id === selectedSessionIdRef.current) {
        queryClient.invalidateQueries({
          queryKey: ['messages', selectedSessionIdRef.current, apiKey],
        })
      }
    })

    // Listen for agent typing events (when agent is typing a manual response)
    socketInstance.on('agent_typing', (data) => {
      console.log('Received agent typing via Socket.IO:', data)
      if (data.session_id === selectedSessionIdRef.current) {
        setIncomingMessageLoading(true)
      }
    })

    // Listen for agent stopped typing events
    socketInstance.on('agent_stop_typing', (data) => {
      console.log('Received agent stop typing via Socket.IO:', data)
      if (data.session_id === selectedSessionIdRef.current) {
        setIncomingMessageLoading(false)
      }
    })

    return () => {
      console.log('Cleaning up Socket.IO connection')
      socketInstance.disconnect()
    }
  }, [apiKey, queryClient]) // Removed selectedSessionId dependency to prevent reconnections

  // Query for conversations with caching
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['conversations', apiKey],
    queryFn: async (): Promise<GroupedConversation[]> => {
      if (!apiKey) return []

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const url = `${apiUrl}/api/conversations`

      const response = await axios.get(url, {
        headers: {
          'X-API-Key': apiKey,
        },
      })
      return response.data
    },
    enabled: !!apiKey,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Only retry on network errors, not on 4xx errors
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status < 500
      ) {
        return false
      }
      return failureCount < 2
    },
  })

  // Query for messages of selected session with caching
  const {
    data: sessionData,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['messages', selectedSessionId, apiKey],
    queryFn: async (): Promise<SessionData | null> => {
      if (!selectedSessionId || !apiKey) return null

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const url = `${apiUrl}/api/conversations/session/${selectedSessionId}`

      const response = await axios.get(url, {
        headers: {
          'X-API-Key': apiKey,
        },
      })
      return response.data
    },
    enabled: !!selectedSessionId && !!apiKey,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status < 500
      ) {
        return false
      }
      return failureCount < 2
    },
  })

  // Auto-select first conversation when conversations are loaded
  useEffect(() => {
    if (conversations.length > 0 && !selectedSessionId && !hasAutoSelected) {
      // Sort conversations by last message time to get the most recent one
      const sortedConversations = [...conversations].sort(
        (a, b) =>
          new Date(b.last_message_time).getTime() -
          new Date(a.last_message_time).getTime()
      )
      setSelectedSessionId(sortedConversations[0].session_id)
      setHasAutoSelected(true)
    }
  }, [conversations, selectedSessionId, hasAutoSelected])

  // Reset auto-selection flag when navigating away
  useEffect(() => {
    return () => {
      setHasAutoSelected(false)
    }
  }, [])

  // Handle conversation selection
  const handleSelectConversation = (sessionId: string) => {
    setSelectedSessionId(sessionId)
  }

  // Extract and sort messages
  const messages: Message[] = useMemo(() => {
    return sessionData?.conversations
      ? [...sessionData.conversations].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      : []
  }, [sessionData])

  // Extract user info
  const userInfo: UserInfo | null = sessionData
    ? {
        user_name: sessionData.user_name,
        user_email: sessionData.user_email,
      }
    : null

  // Update agent mode states when session data changes
  useEffect(() => {
    if (sessionData) {
      setIsAgentMode(sessionData.agent_mode || false)
      setAgentId(sessionData.agent_id || null)
      setAgentTakeoverAt(sessionData.agent_takeover_at || null)
    } else {
      setIsAgentMode(false)
      setAgentId(null)
      setAgentTakeoverAt(null)
    }
  }, [sessionData])

  // Log errors for debugging
  if (conversationsError) {
    console.error('Error loading conversations:', conversationsError)
  }

  if (messagesError) {
    console.error('Error loading messages:', messagesError)
  }

  // Properly handle typing animation based on message updates
  useEffect(() => {
    if (messages.length > 0) {
      const currentMessageCount = messages.length
      const lastMessage = messages[messages.length - 1]

      // If we have new messages since last check
      if (currentMessageCount > lastMessageCountRef.current) {
        console.log(
          `Messages increased from ${lastMessageCountRef.current} to ${currentMessageCount}`
        )
        console.log('Last message role:', lastMessage.role)

        // If the newest message is from assistant and typing is showing, hide it
        if (lastMessage.role === 'assistant' && incomingMessageLoading) {
          console.log(
            'New assistant message appeared in UI, hiding typing animation'
          )
          setIncomingMessageLoading(false)
        }

        // Update the message count
        lastMessageCountRef.current = currentMessageCount
      }
    } else {
      // Reset count if no messages
      lastMessageCountRef.current = 0
    }
  }, [messages, incomingMessageLoading])

  // Reset message count when switching sessions
  useEffect(() => {
    if (selectedSessionId) {
      lastMessageCountRef.current = messages.length
    }
  }, [selectedSessionId, messages.length])

  // Agent takeover functions
  const takeoverChat = async (sessionId: string, agentId?: string) => {
    if (!apiKey) {
      throw new Error('API key not available')
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await axios.post(
        `${apiUrl}/api/chatbot/agent-takeover`,
        {
          session_id: sessionId,
          agent_id: agentId || 'dashboard-user',
        },
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      // Update local state immediately for better UX
      if (sessionId === selectedSessionId) {
        setIsAgentMode(true)
        setAgentId(agentId || 'dashboard-user')
        setAgentTakeoverAt(new Date().toISOString())
      }

      // Refresh conversations and messages
      queryClient.invalidateQueries({ queryKey: ['conversations', apiKey] })
      if (sessionId === selectedSessionId) {
        queryClient.invalidateQueries({
          queryKey: ['messages', sessionId, apiKey],
        })
      }

      return response.data
    } catch (error) {
      console.error('Error taking over chat:', error)
      throw error
    }
  }

  const releaseChat = async (sessionId: string) => {
    if (!apiKey) {
      throw new Error('API key not available')
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await axios.post(
        `${apiUrl}/api/chatbot/agent-release`,
        {
          session_id: sessionId,
        },
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      // Update local state immediately for better UX
      if (sessionId === selectedSessionId) {
        setIsAgentMode(false)
        setAgentId(null)
        setAgentTakeoverAt(null)
      }

      // Refresh conversations and messages
      queryClient.invalidateQueries({ queryKey: ['conversations', apiKey] })
      if (sessionId === selectedSessionId) {
        queryClient.invalidateQueries({
          queryKey: ['messages', sessionId, apiKey],
        })
      }

      return response.data
    } catch (error) {
      console.error('Error releasing chat:', error)
      throw error
    }
  }

  const sendAgentMessage = async (
    sessionId: string,
    message: string,
    agentId?: string
  ) => {
    if (!apiKey) {
      throw new Error('API key not available')
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await axios.post(
        `${apiUrl}/api/chatbot/send-agent-message`,
        {
          session_id: sessionId,
          message: message,
          agent_id: agentId || 'dashboard-user',
        },
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      // Refresh messages for the session
      if (sessionId === selectedSessionId) {
        queryClient.invalidateQueries({
          queryKey: ['messages', sessionId, apiKey],
        })
      }

      return response.data
    } catch (error) {
      console.error('Error sending agent message:', error)
      throw error
    }
  }

  return {
    // Data
    conversations,
    messages,
    userInfo,
    selectedSessionId,

    // Agent mode data
    isAgentMode,
    agentId,
    agentTakeoverAt,

    // Loading states
    conversationsLoading,
    messagesLoading,
    incomingMessageLoading,

    // Errors
    conversationsError,
    messagesError,

    // Actions
    handleSelectConversation,
    refetchConversations,
    refetchMessages,

    // Agent takeover actions
    takeoverChat,
    releaseChat,
    sendAgentMessage,

    // Internal state (for debugging)
    hasAutoSelected,

    // Socket connection
    socket: socketRef.current,
  }
}
