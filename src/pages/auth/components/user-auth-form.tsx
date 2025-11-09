import { Button } from '@/components/custom/button'
import { PasswordInput } from '@/components/custom/password-input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useUser } from '@/context/UserContext'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google'
import { HTMLAttributes, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {
  isSignUp?: boolean
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const companyTypes = [
  { label: 'Law Firm', value: 'law-firm' },
  { label: 'Tech Company', value: 'tech-company' },
  { label: 'Healthcare Provider', value: 'healthcare' },
  { label: 'Consulting', value: 'consulting' },
  { label: 'Non-profit', value: 'non-profit' },
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Real Estate', value: 'real-estate' },
  { label: 'Education', value: 'education' },
  { label: 'Financial Services', value: 'financial' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Other', value: 'other' },
] as const

const formSchema = z
  .object({
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
    organization_name: z.string().optional(),
    website: z.string().optional(),
    company_organization_type: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword !== undefined) {
        return data.password === data.confirmPassword
      }
      return true
    },
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }
  )

export function UserAuthForm({
  className,
  isSignUp = false,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { setUser } = useUser()

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      setError(null)
      if (!credentialResponse.credential) {
        throw new Error('No credentials received from Google')
      }

      const decoded = JSON.parse(
        atob(credentialResponse.credential.split('.')[1])
      )

      const authResponse = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: decoded.email,
          organization_name: decoded.name || decoded.email.split('@')[0],
          google_id: decoded.sub,
          has_paid_subscription: false,
        }),
      })

      if (!authResponse.ok) {
        const errorData = await authResponse.json().catch(() => ({}))
        throw new Error(
          errorData.detail || 'Failed to authenticate with Google'
        )
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
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to authenticate with Google'
      )
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      organization_name: '',
      website: '',
      company_organization_type: '',
      ...(isSignUp && { confirmPassword: '' }),
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const endpoint = isSignUp ? 'register' : 'login'

      // Prepare the request body
      const requestBody = isSignUp
        ? {
            email: data.email,
            password: data.password,
            organization_name:
              data.organization_name || data.email.split('@')[0],
            website: data.website,
            company_organization_type: data.company_organization_type,
            has_paid_subscription: false,
          }
        : {
            email: data.email,
            password: data.password,
          }

      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.detail ||
            (isSignUp ? 'Failed to register' : 'Failed to login')
        )
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
        <div className='rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 dark:text-red-500'>
          {error}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-gray-900 dark:text-white'>
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='name@example.com'
                    {...field}
                    className='border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-400'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isSignUp && (
            <>
              <FormField
                control={form.control}
                name='company_organization_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-900 dark:text-white'>
                      Company Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className='border-gray-300 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white'>
                          <SelectValue placeholder='Select company type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='organization_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-900 dark:text-white'>
                      Organization Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Your company name'
                        {...field}
                        className='border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-400'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='website'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-900 dark:text-white'>
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://example.com'
                        {...field}
                        className='border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-400'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center justify-between'>
                  <FormLabel className='text-gray-900 dark:text-white'>
                    Password
                  </FormLabel>
                  {!isSignUp && (
                    <Link
                      to='/forgot-password'
                      className='text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <FormControl>
                  <PasswordInput
                    placeholder='********'
                    {...field}
                    className='border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-400'
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
                  <FormLabel className='text-gray-900 dark:text-white'>
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='********'
                      {...field}
                      className='border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-400'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button
            className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
            loading={isLoading}
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>

          <div className='relative my-4'>
            <div className='absolute inset-0 flex items-center'>
              <Separator className='w-full border-gray-300 dark:border-gray-800' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-white px-2 text-gray-500 dark:bg-black dark:text-gray-500'>
                Or continue with
              </span>
            </div>
          </div>

          <div className='flex justify-center'>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Failed to authenticate with Google')
              }}
              useOneTap={false}
              theme='filled_black'
              size='large'
              width={300}
              context='signin'
            />
          </div>
        </form>
      </Form>
    </div>
  )
}
