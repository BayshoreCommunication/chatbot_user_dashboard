import { cn } from '@/lib/utils'
import {
  AppWindow,
  Home,
  ListTodo,
  MessageSquare,
  Settings,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface SidebarNavProps {
  activeItem?: string
  onItemClick?: (item: string) => void
}

export function SidebarNav({
  activeItem = 'messages',
  onItemClick,
}: SidebarNavProps) {
  const [active, setActive] = useState(activeItem)
  const navigate = useNavigate()

  const handleItemClick = (item: string) => {
    setActive(item)
    onItemClick?.(item)
    // Route mapping
    switch (item) {
      case 'apps':
        navigate('/dashboard/apps')
        break
      case 'dashboard':
        navigate('/dashboard')
        break
      case 'messages':
        navigate('/dashboard/chats')
        break
      case 'leads':
        navigate('/dashboard/leads')
        break
      case 'users':
        navigate('/dashboard/users')
        break
      case 'settings':
        navigate('/dashboard/system-settings')
        break
      default:
        break
    }
  }

  // Order: App (top), Dashboard, Messages, Leads (just after chat), Users, Settings
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'leads', icon: ListTodo, label: 'Leads' },
    { id: 'apps', icon: AppWindow, label: 'Apps' },
    { id: 'users', icon: User, label: 'Users' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className='flex h-full w-20 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'>
      {/* Logo */}
      <div className='flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-800'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600'>
          <span className='text-sm font-bold text-white'>B</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex flex-1 flex-col items-center space-y-4 py-6'>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                'group relative flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                active === item.id
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300'
              )}
            >
              <Icon size={20} />
              {active === item.id && (
                <div className='absolute -right-1 top-1/2 h-6 w-1 -translate-y-1/2 transform rounded-l-full bg-blue-600' />
              )}
              {/* Tooltip */}
              <div className='pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
                {item.label}
              </div>
            </button>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className='border-t border-gray-200 p-4 dark:border-gray-800'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700'>
          <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>
            U
          </span>
        </div>
      </div>
    </div>
  )
}
