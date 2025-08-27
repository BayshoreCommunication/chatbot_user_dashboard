import { Layout } from '@/components/custom/layout'
import { RightSidebar } from '@/components/RightSidebar'
import { Search } from '@/components/search'
import ThemeSwitch from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { useApiKey } from '@/hooks/useApiKey'
import { useChat } from '@/hooks/useChat'
import { ChatPanel } from './components/ChatPanel'
import { ChatSidebar } from './components/ChatSidebar'

export default function Chats() {
  const { apiKey } = useApiKey()

  const {
    conversations,
    messages,
    userInfo,
    selectedSessionId,
    conversationsLoading,
    messagesLoading,
    incomingMessageLoading,
    handleSelectConversation,
    forceRefreshConversations,
    socket,
  } = useChat(apiKey)

  console.log('apiKey', apiKey)

  return (
    <div className='h-screen overflow-hidden'>
      <Layout className='h-full dark:bg-gray-950'>
        {/* ===== Top Heading ===== */}
        <Layout.Header className='h-16 flex-shrink-0 dark:border-gray-800 dark:bg-gray-950'>
          <div className='flex items-center'>
            <div className='flex items-center space-x-2'>
              <div className='p-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-message-circle dark:text-gray-300'
                >
                  <path d='M7.9 20A9 9 0 1 0 4 16.1L2 22Z' />
                </svg>
              </div>
              <span className='text-lg font-medium dark:text-white'>
                Chat Management
              </span>
            </div>
          </div>
          <div className='ml-auto flex items-center space-x-4'>
            <Search />
            <ThemeSwitch />
            <UserNav />
          </div>
        </Layout.Header>

        {/* ===== Main Chat Content ===== */}
        <div
          className='flex overflow-hidden'
          style={{ height: 'calc(100vh - 4rem)' }}
        >
          {/* Conversation List */}
          <ChatSidebar
            conversations={conversations}
            isLoading={conversationsLoading}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedSessionId}
            onRefresh={forceRefreshConversations}
          />

          {/* Chat Panel */}
          <ChatPanel
            messages={messages}
            isLoading={messagesLoading}
            selectedSessionId={selectedSessionId}
            userInfo={userInfo}
            socket={socket}
            incomingMessageLoading={incomingMessageLoading}
          />

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </Layout>
    </div>
  )
}
