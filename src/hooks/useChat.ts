import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

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

interface UserInfo {
  user_name?: string;
  user_email?: string;
}

interface SessionData {
  conversations: Message[];
  user_name?: string;
  user_email?: string;
}

export function useChat(apiKey: string | null) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  // Initialize socket connection for real-time updates
  useEffect(() => {
    if (!apiKey) return;

    const socketInstance = io('http://localhost:8000', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
    });

    socketRef.current = socketInstance;

    // Join organization room for real-time updates
    socketInstance.emit('join_room', { room: `org_${apiKey}` });

    // Listen for new messages
    socketInstance.on('new_message', (data) => {
      console.log('Received new message:', data);
      
      // Invalidate and refetch conversations to update the sidebar
      queryClient.invalidateQueries({ queryKey: ['conversations', apiKey] });
      
      // If the message is for the currently selected session, update messages
      if (data.session_id === selectedSessionId) {
        queryClient.invalidateQueries({ queryKey: ['messages', selectedSessionId, apiKey] });
      }
    });

    // Listen for connection events
    socketInstance.on('connect', () => {
      console.log('Socket connected for real-time chat updates');
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [apiKey, selectedSessionId, queryClient]);

  // Query for conversations with caching
  const { 
    data: conversations = [], 
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['conversations', apiKey],
    queryFn: async (): Promise<GroupedConversation[]> => {
      if (!apiKey) return [];
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/conversations`,
        {
          headers: {
            'X-API-Key': apiKey
          }
        }
      );
      return response.data;
    },
    enabled: !!apiKey,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Only retry on network errors, not on 4xx errors
      if (axios.isAxiosError(error) && error.response && error.response.status < 500) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Query for messages of selected session with caching
  const { 
    data: sessionData, 
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['messages', selectedSessionId, apiKey],
    queryFn: async (): Promise<SessionData | null> => {
      if (!selectedSessionId || !apiKey) return null;
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/conversations/session/${selectedSessionId}`,
        {
          headers: {
            'X-API-Key': apiKey
          }
        }
      );
      return response.data;
    },
    enabled: !!selectedSessionId && !!apiKey,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response && error.response.status < 500) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Auto-select first conversation when conversations are loaded
  useEffect(() => {
    if (conversations.length > 0 && !selectedSessionId && !hasAutoSelected) {
      // Sort conversations by last message time to get the most recent one
      const sortedConversations = [...conversations].sort((a, b) => 
        new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );
      setSelectedSessionId(sortedConversations[0].session_id);
      setHasAutoSelected(true);
    }
  }, [conversations, selectedSessionId, hasAutoSelected]);

  // Reset auto-selection flag when navigating away
  useEffect(() => {
    return () => {
      setHasAutoSelected(false);
    };
  }, []);

  // Handle conversation selection
  const handleSelectConversation = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  // Extract and sort messages
  const messages: Message[] = sessionData?.conversations ? 
    [...sessionData.conversations].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) : [];
    
  // Extract user info
  const userInfo: UserInfo | null = sessionData ? {
    user_name: sessionData.user_name,
    user_email: sessionData.user_email
  } : null;

  // Log errors for debugging
  if (conversationsError) {
    console.error('Error loading conversations:', conversationsError);
  }

  if (messagesError) {
    console.error('Error loading messages:', messagesError);
  }

  return {
    // Data
    conversations,
    messages,
    userInfo,
    selectedSessionId,
    
    // Loading states
    conversationsLoading,
    messagesLoading,
    
    // Errors
    conversationsError,
    messagesError,
    
    // Actions
    handleSelectConversation,
    refetchConversations,
    refetchMessages,
    
    // Internal state (for debugging)
    hasAutoSelected,
    
    // Socket connection
    socket: socketRef.current
  };
} 