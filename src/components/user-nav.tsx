import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/custom/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@/context/UserContext'
import { useNavigate } from 'react-router-dom'
import { User, CreditCard, Settings, LogOut } from 'lucide-react'

export function UserNav() {
  const { user, setUser } = useUser()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('organization')
    setUser(null)
    navigate('/')
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return 'U'
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src='https://bayshore.nyc3.cdn.digitaloceanspaces.com/ai_bot/avatars/61f75ea9a680def2ed1c6929fe75aeee.jpg' alt={user?.name || 'User'} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{user?.name}</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/dashboard/user-profile')} className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/dashboard/user-settings')} className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/dashboard/system-settings')} className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
