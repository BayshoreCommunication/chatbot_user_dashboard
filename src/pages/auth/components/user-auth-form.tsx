import { HTMLAttributes, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { PasswordInput } from '@/components/custom/password-input'
import { cn } from '@/lib/utils'
import { useUser } from '@/context/UserContext'
import { Separator } from '@/components/ui/separator'

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {
  isSignUp?: boolean;
}

const API_URL = 'http://localhost:8000';

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
  confirmPassword: z
    .string()
    .optional(),
}).refine((data) => {
  if (data.confirmPassword !== undefined) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function UserAuthForm({ className, isSignUp = false, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { setUser } = useUser()

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setError(null)
      if (!credentialResponse.credential) {
        throw new Error('No credentials received from Google')
      }

      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]))

      const authResponse = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: decoded.email,
          name: decoded.name,
          google_id: decoded.sub
        }),
      })

      if (!authResponse.ok) {
        const errorData = await authResponse.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to authenticate with Google')
      }

      const { user, access_token } = await authResponse.json()

      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', access_token)
      setUser(user)

      // Redirect based on subscription status
      if (user.has_paid_subscription) {
        navigate('/dashboard')
      } else {
        navigate('/landing')
      }
    } catch (error) {
      console.error('Google login error:', error)
      setError(error instanceof Error ? error.message : 'Failed to authenticate with Google')
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(isSignUp && { confirmPassword: '' }),
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const endpoint = isSignUp ? 'register' : 'login'
      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          ...(isSignUp && { name: data.email.split('@')[0] })
        }),
      })

      if (!response.ok) {
        throw new Error(isSignUp ? 'Failed to register' : 'Failed to login')
      }

      const { user, access_token } = await response.json()

      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', access_token)
      setUser(user)

      // Redirect based on subscription status
      if (user.has_paid_subscription) {
        navigate('/dashboard')
      } else {
        navigate('/landing')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-sm text-red-500">
          {error}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder='name@example.com'
                    {...field}
                    className="bg-gray-900/50 border-gray-800 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center justify-between'>
                  <FormLabel className="text-white">Password</FormLabel>
                  {!isSignUp && (
                    <Link
                      to='/forgot-password'
                      className='text-sm font-medium text-blue-400 hover:text-blue-300'
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <FormControl>
                  <PasswordInput
                    placeholder='********'
                    {...field}
                    className="bg-gray-900/50 border-gray-800 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isSignUp && (
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='********'
                      {...field}
                      className="bg-gray-900/50 border-gray-800 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            loading={isLoading}
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Failed to authenticate with Google')
              }}
              useOneTap={false}
              theme="filled_black"
              size="large"
              width={300}
              context="signin"
            />
          </div>
        </form>
      </Form>
    </div>
  )
}
