import { Layout } from '@/components/custom/layout'
import { Search } from '@/components/search'
import ThemeSwitch from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { Notifications, ActiveUsers } from '@/pages/dashboard/components/notifications'
import { Button } from '@/components/custom/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

// Chat user type
interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'typing';
  lastMessage: {
    text: string;
    time: string;
    isFromMe: boolean;
  };
  unread: number;
  isStarred: boolean;
}

// Message type
interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
  date: string;
  isRead: boolean;
  attachments?: {
    type: 'image' | 'link';
    title?: string;
    subtitle?: string;
    url: string;
    previewUrl?: string;
    metadata?: string;
  }[];
}

// Chat data
const chatUsers: ChatUser[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: '/avatars/01.png',
    status: 'online',
    lastMessage: {
      text: 'How are you doing?',
      time: '16:45',
      isFromMe: false
    },
    unread: 0,
    isStarred: true
  },
  {
    id: '2',
    name: 'Travis Barker',
    avatar: '/avatars/02.png',
    status: 'typing',
    lastMessage: {
      text: 'Hi! I made new UI-Kit for project, check it late',
      time: '16:45',
      isFromMe: false
    },
    unread: 0,
    isStarred: false
  },
  {
    id: '3',
    name: 'Kate Rose',
    avatar: '/avatars/03.png',
    status: 'online',
    lastMessage: {
      text: 'See you tomorrow!',
      time: '16:45',
      isFromMe: true
    },
    unread: 0,
    isStarred: false
  },
  {
    id: '4',
    name: 'Robert Parker',
    avatar: '/avatars/04.png',
    status: 'online',
    lastMessage: {
      text: 'Awesome!',
      time: '16:45',
      isFromMe: false
    },
    unread: 1,
    isStarred: false
  },
  {
    id: '5',
    name: 'Rick Owens',
    avatar: '/avatars/05.png',
    status: 'offline',
    lastMessage: {
      text: 'Good idea 😊',
      time: '16:45',
      isFromMe: false
    },
    unread: 0,
    isStarred: false
  },
  {
    id: '6',
    name: 'George Orwell',
    avatar: '/avatars/06.png',
    status: 'offline',
    lastMessage: {
      text: 'Literally 1984 😱',
      time: '16:45',
      isFromMe: true
    },
    unread: 0,
    isStarred: false
  },
  {
    id: '7',
    name: 'Franz Kafka',
    avatar: '/avatars/07.png',
    status: 'offline',
    lastMessage: {
      text: 'Are you interested in insecticides for your garden?',
      time: '16:45',
      isFromMe: false
    },
    unread: 0,
    isStarred: false
  },
  {
    id: '8',
    name: 'Tom Hardy',
    avatar: '/avatars/08.png',
    status: 'offline',
    lastMessage: {
      text: 'Smells like design spirit...',
      time: '16:45',
      isFromMe: false
    },
    unread: 0,
    isStarred: false
  },
  {
    id: '9',
    name: 'Vivienne Westwood',
    avatar: '/avatars/09.png',
    status: 'offline',
    lastMessage: {
      text: 'This cat is so funny 😂',
      time: '16:45',
      isFromMe: false
    },
    unread: 0,
    isStarred: false
  },
  {
    id: '10',
    name: 'Anthony Paul',
    avatar: '/avatars/10.png',
    status: 'offline',
    lastMessage: {
      text: 'Check out my page 😎',
      time: '16:45',
      isFromMe: false
    },
    unread: 0,
    isStarred: false
  },
  {
    id: '11',
    name: 'Stan Smith',
    avatar: '/avatars/11.png',
    status: 'offline',
    lastMessage: {
      text: 'Want to see this kicks rn',
      time: '16:45',
      isFromMe: false
    },
    unread: 0,
    isStarred: false
  }
];

// Chat messages by user ID
const chatMessages: Record<string, Message[]> = {
  '2': [
    {
      id: '1',
      senderId: '2',
      text: 'Hi! I made new UI-Kit for project, check it late',
      time: '16:45',
      date: 'Yesterday',
      isRead: true,
      attachments: [
        {
          type: 'image',
          title: 'Car sharing service',
          subtitle: 'Mobile App',
          url: 'https://dribbble.com/shots/17742253-ui-kit-designjam',
          previewUrl: 'https://res.cloudinary.com/dq9yrj7c9/image/upload/v1747194083/qu0x5egvnho7lvo10ezn.png',
          metadata: 'Page 1 of 7'
        }
      ]
    },
    {
      id: '2',
      senderId: '2',
      text: 'See you at office tomorrow!',
      time: '15:42',
      date: 'Yesterday',
      isRead: true
    },
    {
      id: '3',
      senderId: 'me',
      text: 'Thank you for work, see you!',
      time: '15:42',
      date: 'Yesterday',
      isRead: true
    },
    {
      id: '4',
      senderId: '2',
      text: 'Hello! Have you seen my backpack anywhere in office?',
      time: '15:42',
      date: 'Today',
      isRead: true
    },
    {
      id: '5',
      senderId: 'me',
      text: 'Hi, yes, David have found it, ask our concierge **',
      time: '15:42',
      date: 'Today',
      isRead: true
    }
  ],
  '1': [
    {
      id: '1',
      senderId: '1',
      text: 'How are you doing?',
      time: '16:45',
      date: 'Yesterday',
      isRead: true
    },
    {
      id: '2',
      senderId: 'me',
      text: 'I\'m good, thanks! How about you?',
      time: '16:47',
      date: 'Yesterday',
      isRead: true
    },
    {
      id: '3',
      senderId: '1',
      text: 'Just finished that project we were discussing.',
      time: '16:50',
      date: 'Yesterday',
      isRead: true
    }
  ],
  '3': [
    {
      id: '1',
      senderId: '3',
      text: 'Are we still meeting tomorrow?',
      time: '15:30',
      date: 'Yesterday',
      isRead: true
    },
    {
      id: '2',
      senderId: 'me',
      text: 'Yes, at 10am in the conference room.',
      time: '15:35',
      date: 'Yesterday',
      isRead: true
    },
    {
      id: '3',
      senderId: '3',
      text: 'Perfect, I\'ll bring the presentation materials.',
      time: '15:40',
      date: 'Yesterday',
      isRead: true
    },
    {
      id: '4',
      senderId: 'me',
      text: 'See you tomorrow!',
      time: '16:45',
      date: 'Yesterday',
      isRead: true
    }
  ],
  '4': [
    {
      id: '1',
      senderId: 'me',
      text: 'What did you think about the new design?',
      time: '14:20',
      date: 'Yesterday',
      isRead: true
    },
    {
      id: '2',
      senderId: '4',
      text: 'Awesome!',
      time: '16:45',
      date: 'Yesterday',
      isRead: false
    }
  ]
};

export default function Tasks() {
  // State for active chat user
  const [activeChatId, setActiveChatId] = useState<string>('2');
  const [newMessage, setNewMessage] = useState<string>('');

  // Get active chat user
  const activeChatUser = chatUsers.find(user => user.id === activeChatId);

  // Get messages for active chat
  const activeMessages = chatMessages[activeChatId] || [];

  // Handle sending new message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // In a real app, you would send this to your backend
    console.log('Sending message:', newMessage);
    setNewMessage('');

    // For demo purposes, we'll just add it to the UI
    const newMsg: Message = {
      id: `new-${Date.now()}`,
      senderId: 'me',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      isRead: true
    };

    // Update messages (in a real app, this would be handled by your state management)
    chatMessages[activeChatId] = [...(chatMessages[activeChatId] || []), newMsg];

    // Force re-render
    setActiveChatId(activeChatId);
  };

  return (
    <Layout fixed>
      {/* ===== Top Heading ===== */}
      <Layout.Header sticky className="border-b shadow-sm">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">Website SMS</h2>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <UserNav />
        </div>
      </Layout.Header>

      <Layout.Body className="p-0 flex h-[calc(100vh-var(--header-height))]">
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Messages list */}
          <div className="w-[350px] border-r flex flex-col bg-white dark:bg-gray-950">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Messages</h2>
              <div className="mt-4">
                <Search />
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">Sort by:</div>
                <Button variant="ghost" size="sm" className="text-sm text-blue-500 font-medium">
                  Newest <span className="ml-1">▼</span>
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {/* Message list items */}
              {chatUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => setActiveChatId(user.id)}
                  className={`flex items-center p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer 
                    ${user.unread > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                    ${user.id === activeChatId ? 'bg-gray-100 dark:bg-gray-800' : ''}
                  `}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {user.isStarred && (
                      <div className="absolute -top-1 -left-1 text-xs text-yellow-500">
                        ★
                      </div>
                    )}
                    {user.status === 'online' && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-950"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.lastMessage.time}</p>
                    </div>
                    <p className={`text-sm truncate ${user.status === 'typing'
                      ? 'text-blue-500'
                      : user.lastMessage.isFromMe
                        ? 'text-gray-500'
                        : 'text-gray-600'
                      }`}>
                      {user.status === 'typing' ? (
                        <span className="text-blue-500">... is typing</span>
                      ) : user.lastMessage.isFromMe ? (
                        <span>you: {user.lastMessage.text}</span>
                      ) : (
                        user.lastMessage.text
                      )}
                    </p>
                  </div>
                  {user.lastMessage.isFromMe && user.unread === 0 && (
                    <div className="ml-2 text-blue-500">
                      <CheckIcon />
                    </div>
                  )}
                  {user.unread > 0 && (
                    <div className="ml-2 bg-green-500 h-2 w-2 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Middle - Chat area */}
          {activeChatUser && (
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
              {/* Chat header */}
              <div className="border-b p-4 flex items-center bg-white dark:bg-gray-950 shadow-sm">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activeChatUser.avatar} alt={activeChatUser.name} />
                    <AvatarFallback>{activeChatUser.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <h3 className="font-semibold">{activeChatUser.name}</h3>
                    <p className="text-xs text-green-500">
                      {activeChatUser.status === 'online' ? 'Online' :
                        activeChatUser.status === 'typing' ? 'Typing...' : 'Offline'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto rounded-full">
                  <InfoIcon />
                </Button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-auto p-4 space-y-6">
                {/* Group messages by date */}
                {Array.from(new Set(activeMessages.map(m => m.date))).map(date => (
                  <div key={date}>
                    <div className="text-center text-xs text-gray-500 my-6">{date}</div>

                    {/* Messages for this date */}
                    {activeMessages
                      .filter(m => m.date === date)
                      .map(message => (
                        <div key={message.id} className={`flex items-start mb-4 ${message.senderId === 'me' ? 'justify-end' : ''}`}>
                          {message.senderId !== 'me' && (
                            <Avatar className="h-8 w-8 mr-2 mt-1">
                              <AvatarImage src={activeChatUser.avatar} alt={activeChatUser.name} />
                              <AvatarFallback>{activeChatUser.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[80%] ${message.senderId === 'me' ? 'text-right' : ''}`}>
                            {message.text && (
                              <div className={`p-3 rounded-lg ${message.senderId === 'me'
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white ml-auto'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                }`}>
                                <p>{message.text}</p>
                              </div>
                            )}

                            {/* Attachments */}
                            {message.attachments && message.attachments.map((attachment, i) => (
                              <div key={i} className={`mt-2 ${message.senderId === 'me' ? 'ml-auto' : ''}`}>
                                {attachment.type === 'image' && (
                                  <div className="bg-blue-600 text-white rounded-lg overflow-hidden">
                                    <div className="p-4">
                                      <div className="font-bold">Car sharing service</div>
                                      <div className="font-bold">Mobile App</div>
                                    </div>
                                    <img
                                      src="https://res.cloudinary.com/dq9yrj7c9/image/upload/v1747194083/qu0x5egvnho7lvo10ezn.png"
                                      alt="UI Kit Preview"
                                      className="w-full"
                                    />
                                    <div className="p-2 bg-blue-600 text-xs text-blue-200">
                                      Page 1 of 7
                                    </div>
                                    <a href="https://dribbble.com/shots/17742253-ui-kit-designjam" className="text-xs text-blue-500 mt-1 block bg-white p-1">
                                      https://dribbble.com/shots/17742253-ui-kit-designjam
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))}

                            <div className={`flex items-center mt-1 text-xs text-gray-500 ${message.senderId === 'me' ? 'justify-end' : ''}`}>
                              <span>{message.time}</span>
                              {message.senderId === 'me' && message.isRead && (
                                <span className="ml-1 text-blue-500">
                                  <CheckIcon />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>

              {/* Chat input */}
              <div className="border-t p-4 flex items-center bg-white dark:bg-gray-950">
                <Button variant="ghost" size="icon" className="rounded-full text-gray-500">
                  <PaperclipIcon />
                </Button>
                <Input
                  className="mx-2 flex-1"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  className=" text-green-500 bg-white dark:bg-gray-950"
                  onClick={handleSendMessage}
                >
                  Send message
                </Button>
              </div>
            </div>
          )}

          {/* Right sidebar - Notifications and Active Users */}
          <div className="w-[300px] border-l p-4 overflow-auto bg-white dark:bg-gray-950">
            <Notifications />
            <ActiveUsers />
          </div>
        </div>
      </Layout.Body>
    </Layout>
  )
}

// Icons
function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
    </svg>
  )
}
