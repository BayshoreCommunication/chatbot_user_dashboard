import { useUser } from '@/context/UserContext'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function ProtectedRoute() {
  const { user, isAuthenticated } = useUser()
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAccess = () => {
      // Check if user is logged in (check for 'token' key, not 'authToken')
      const token = localStorage.getItem('token')

      if (!token || !isAuthenticated) {
        // Not logged in, redirect to sign-in
        console.log('No auth token found, redirecting to sign-in')
        navigate('/sign-in', { replace: true })
        return
      }

      // Check if user data is loaded
      if (!user) {
        console.log('User data not loaded yet')
        return
      }

      // Check if user has paid subscription
      if (!user.has_paid_subscription) {
        // No paid subscription, redirect to landing page with message
        console.log('No paid subscription, redirecting to landing page')
        localStorage.setItem('subscription_required', 'true')
        navigate('/', { replace: true })
        return
      }

      // All checks passed
      console.log('User has paid subscription, allowing access')
      setIsChecking(false)
    }

    checkAccess()
  }, [user, isAuthenticated, navigate])

  // Show loading while checking or user data not loaded
  if (isChecking) {
    return (
      <div className='flex h-screen items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    )
  }

  // If user has paid subscription, render the child routes
  if (user?.has_paid_subscription && isAuthenticated) {
    return <Outlet />
  }

  // Show nothing while redirecting (fallback)
  return null
}
