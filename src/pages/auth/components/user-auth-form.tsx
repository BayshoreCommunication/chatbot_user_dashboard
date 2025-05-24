import { HTMLAttributes, useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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

const GOOGLE_CLIENT_ID = '580986048415-qpgtv2kvij47ae4if8ep47jjq8o2qtmj.apps.googleusercontent.com';

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
  const navigate = useNavigate()
  const { setUser } = useUser()
  const googleButtonRef = useRef<HTMLDivElement>(null)

  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    try {
      const decoded = JSON.parse(atob(response.credential.split('.')[1]))

      const userData = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        hasPaidSubscription: false,
      }

      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      navigate('/')
    } catch (error) {
      console.error('Google login error:', error)
    }
  }, [navigate, setUser])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        })

        window.google.accounts.id.renderButton(
          googleButtonRef.current!,
          { theme: 'filled_black', size: 'large', width: '100%' }
        )
      }
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [handleGoogleResponse])

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
      const userData = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email: data.email,
        name: data.email.split('@')[0],
        hasPaidSubscription: false,
      }

      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)

      // Navigate to landing page instead of dashboard
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Authentication error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
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

          <div ref={googleButtonRef} className="w-full" />
        </form>
      </Form>
    </div>
  )
}
