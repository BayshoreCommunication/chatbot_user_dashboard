import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext' // Assuming you have an auth context
import { useUser } from '@/context/UserContext'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface SubscriptionData {
  subscription_tier: string
  subscription_status: string
  current_period_end: string
  payment_amount: number
}

export function AccountSetting() {
  // const [colorValue, setColorValue] = useState('#34dsf89D')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const { user } = useAuth() // Get user from auth context
  const { logout } = useUser() // Get logout function from UserContext
  const navigate = useNavigate() // Get navigate function for routing

  // console.log("user",user)

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        if (user?.id) {
          console.log('Fetching subscription for user:', user.id)
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/payment/user-subscription/${user.id}`
          )
          // console.log('Subscription response:', response.data);

          if (response.data.status === 'success') {
            setSubscriptionData(response.data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error)
        if (axios.isAxiosError(error)) {
          console.error('Error details:', error.response?.data)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionData()
  }, [user?.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear errors when user starts typing
    if (passwordError) setPasswordError('')
    if (passwordSuccess) setPasswordSuccess('')
  }

  const handlePasswordSubmit = async () => {
    // Prevent multiple submissions
    if (isChangingPassword) return

    // Validation
    if (!passwordData.oldPassword) {
      setPasswordError('Please enter your current password')
      return
    }
    if (!passwordData.newPassword) {
      setPasswordError('Please enter a new password')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match')
      return
    }
    if (passwordData.oldPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password')
      return
    }

    setIsChangingPassword(true)
    try {
      const token = localStorage.getItem('token')
      console.log(
        'Token from localStorage:',
        token ? `${token.substring(0, 20)}...` : 'No token found'
      )

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/user/change-password`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.status === 'success') {
        setPasswordSuccess(
          'Password updated successfully! Redirecting to sign-in...'
        )

        // Clear form data
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setPasswordError('')

        // Wait a moment to show success message, then logout and redirect
        setTimeout(() => {
          // Clear localStorage (token and user data)
          localStorage.removeItem('token')
          localStorage.removeItem('user')

          // Call logout function to clear user context
          logout()

          // Redirect to sign-in page
          navigate('/sign-in')
        }, 2000) // 2 second delay to show success message
      } else {
        setPasswordError(response.data.message || 'Failed to update password')
      }
    } catch (error) {
      console.error('Password change error:', error)
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status)
        console.error('Response data:', error.response?.data)
        console.error('Response headers:', error.response?.headers)

        if (error.response?.status === 401) {
          const errorMessage =
            error.response?.data?.detail || 'Current password is incorrect'
          setPasswordError(errorMessage)
        } else {
          setPasswordError(
            error.response?.data?.message ||
              error.response?.data?.detail ||
              'Failed to update password'
          )
        }
      } else {
        setPasswordError('An error occurred. Please try again.')
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className='flex h-[calc(100vh-120px)] w-full items-center justify-center'>
        <LoadingSpinner size='lg' text='Loading settings...' />
      </div>
    )
  }

  console.log('subscriptionData', subscriptionData)

  return (
    <div className='flex h-[calc(100vh-120px)] w-full flex-col'>
      <div className='flex-1 space-y-6 overflow-y-auto pb-6 pr-4'>
        {/* Subscription Section */}
        <div>
          <h3 className='text-lg font-medium'>Subscription</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            You can see here your current subscription end date and anytime
            update your plan.
          </p>
          <div className='mt-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full'>
                <img
                  src='https://res.cloudinary.com/dq9yrj7c9/image/upload/v1747201321/jmmegj7hsm1tp3ard65i.png'
                  alt='premium'
                />
              </div>
              <div>
                {subscriptionData ? (
                  <>
                    <h4 className='font-medium capitalize'>
                      {subscriptionData.subscription_tier} Plan
                    </h4>
                    <p className='text-sm text-muted-foreground'>
                      Status:{' '}
                      <span className='capitalize'>
                        {subscriptionData.subscription_status}
                      </span>
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      End Date:{' '}
                      {formatDate(subscriptionData.current_period_end)}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Amount: ${subscriptionData.payment_amount}/month
                    </p>
                  </>
                ) : (
                  <p>No subscription data available</p>
                )}
              </div>
            </div>
            <Button
              variant='default'
              className='h-9 rounded-md bg-black px-4 py-2 text-white'
            >
              Update Plan
            </Button>
          </div>
        </div>

        {/* <Separator /> */}

        {/* Connect your website Section */}
        {/* <div className='dark:bg-gray-950'>
          <h3 className="text-lg font-medium">Connect your website</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Connect the website from which you want to receive SMS.
          </p>
          <div className="mt-4">
            <Button variant="outline" className="flex items-center gap-2 rounded-md h-9 px-4 py-2 bg-gray-50 dark:bg-gray-950">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Connect your website
            </Button>
          </div>
        </div> */}

        {/* <Separator /> */}

        {/* Brand Color Section */}
        {/* <div>
          <h3 className="text-lg font-medium">Brand Color</h3>
          <div className="mt-4 space-y-4">
            <div className="h-8 w-full max-w-xs rounded-md bg-gradient-to-r from-red-500 via-green-500 to-purple-500 relative">
              <div
                className="absolute top-0 bottom-0 w-5 h-5 rounded-full bg-white border-2 border-white translate-y-[-25%] cursor-pointer"
                style={{ left: '70%' }}
              />
            </div>
            <div className="flex items-center">
              <Input
                value={colorValue}
                onChange={(e) => setColorValue(e.target.value)}
                className="w-32 font-mono h-9 text-sm"
              />
              <div
                className="inline-block ml-4 w-8 h-8 rounded-md"
                style={{ backgroundColor: '#34dsf89D' }}
              />
            </div>
          </div>
        </div> */}

        <Separator />

        {/* Change Password Section */}
        <div>
          <h3 className='text-lg font-medium'>Change Your Password</h3>
          <div className='mt-4 max-w-md space-y-4'>
            {/* Error/Success Messages */}
            {passwordError && (
              <div className='rounded-md border border-red-200 bg-red-50 p-3'>
                <p className='text-sm text-red-600'>{passwordError}</p>
              </div>
            )}
            {passwordSuccess && (
              <div className='rounded-md border border-green-200 bg-green-50 p-3'>
                <p className='text-sm text-green-600'>{passwordSuccess}</p>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label htmlFor='old-password' className='mb-2 block text-sm'>
                Current Password:
              </label>
              <div className='relative'>
                <Input
                  id='old-password'
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    handlePasswordChange('oldPassword', e.target.value)
                  }
                  className='h-9 w-full'
                  placeholder='Enter your current password'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'
                >
                  {showPassword ? (
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22m-16-15a10.3 10.3 0 0 0-4 7c0 0 4 8 11 8a9.34 9.34 0 0 0 5.1-1.47'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  ) : (
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor='new-password' className='mb-2 block text-sm'>
                New Password:
              </label>
              <div className='relative'>
                <Input
                  id='new-password'
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    handlePasswordChange('newPassword', e.target.value)
                  }
                  className='h-9 w-full'
                  placeholder='Enter your new password'
                />
                <button
                  type='button'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'
                >
                  {showNewPassword ? (
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22m-16-15a10.3 10.3 0 0 0-4 7c0 0 4 8 11 8a9.34 9.34 0 0 0 5.1-1.47'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  ) : (
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor='confirm-password' className='mb-2 block text-sm'>
                Confirm New Password:
              </label>
              <div className='relative'>
                <Input
                  id='confirm-password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange('confirmPassword', e.target.value)
                  }
                  className='h-9 w-full'
                  placeholder='Confirm your new password'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'
                >
                  {showConfirmPassword ? (
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22m-16-15a10.3 10.3 0 0 0-4 7c0 0 4 8 11 8a9.34 9.34 0 0 0 5.1-1.47'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  ) : (
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with buttons - Fixed at bottom */}
      <div className='sticky bottom-0 z-10 mt-auto pt-4 dark:bg-gray-950 '>
        <Separator className='mb-4' />
        <div className='flex items-center justify-between'>
          <a href='#' className='text-sm text-blue-500 hover:underline'>
            Learn more about account setting
          </a>
          <div className='flex gap-4'>
            <Button
              variant='outline'
              className='h-9 rounded-md px-4 py-2'
              onClick={() => {
                setPasswordData({
                  oldPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                })
                setPasswordError('')
                setPasswordSuccess('')
              }}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              variant='default'
              className='h-9 rounded-md bg-black px-4 py-2 text-white'
              onClick={handlePasswordSubmit}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
