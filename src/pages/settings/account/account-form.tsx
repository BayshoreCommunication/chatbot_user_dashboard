import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
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
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import useAxiosPublic from '@/hooks/useAxiosPublic'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const languages = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Spanish', value: 'es' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Russian', value: 'ru' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Chinese', value: 'zh' },
] as const

const countries = [
  { label: 'United States', value: 'us' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Canada', value: 'ca' },
  { label: 'Germany', value: 'de' },
  { label: 'France', value: 'fr' },
  { label: 'Japan', value: 'jp' },
  { label: 'Australia', value: 'au' },
  { label: 'India', value: 'in' },
  { label: 'Brazil', value: 'br' },
] as const

const timeZones = [
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
  { label: 'Mountain Time (MT)', value: 'America/Denver' },
  { label: 'Central Time (CT)', value: 'America/Chicago' },
  { label: 'Eastern Time (ET)', value: 'America/New_York' },
  { label: 'Greenwich Mean Time (GMT)', value: 'Europe/London' },
  { label: 'Central European Time (CET)', value: 'Europe/Paris' },
  { label: 'Japan Standard Time (JST)', value: 'Asia/Tokyo' },
  { label: 'Australian Eastern Time (AET)', value: 'Australia/Sydney' },
] as const

const companyTypes = [
  { label: 'Law Firm', value: 'law-firm' },
  { label: 'Tech Company', value: 'tech-company' },
  { label: 'Healthcare Provider', value: 'healthcare' },
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'Consulting', value: 'consulting' },
  { label: 'Non-profit', value: 'non-profit' },
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Real Estate', value: 'real-estate' },
  { label: 'Education', value: 'education' },
  { label: 'Financial Services', value: 'financial' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Other', value: 'other' },
] as const

const profileFormSchema = z.object({
  organization_name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .optional(),
  website: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  company_organization_type: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  timeZone: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface UserProfileData {
  organization_name?: string
  name?: string
  website?: string
  company_organization_type?: string
  country?: string
  language?: string
  timeZone?: string
  email?: string
}

export function AccountForm() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const axiosPublic = useAxiosPublic()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      organization_name: '',
      website: '',
      company_organization_type: '',
      country: '',
      language: '',
      timeZone: '',
    },
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return
      setIsFetching(true)
      try {
        const { data } = await axiosPublic.get(`/user/profile/${user.id}`)
        console.log('Fetched user profile data:', data)

        // Store profile data in state
        setProfileData(data)

        // Map the data to form fields
        const formData = {
          organization_name: data.organization_name || data.name || '',
          website: data.website || '',
          company_organization_type: data.company_organization_type || '',
          country: data.country || '',
          language: data.language || '',
          timeZone: data.timeZone || '',
        }

        console.log('Mapped form data:', formData)
        form.reset(formData)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchUserProfile()
  }, [user, form, axiosPublic, toast])

  async function onSubmit(data: ProfileFormValues) {
    if (!user?.id) return

    setIsLoading(true)
    try {
      console.log('Submitting profile data:', data)
      await axiosPublic.put(`/user/profile/${user.id}`, data)
      toast({
        title: 'Profile updated',
        description: 'Your organization profile has been updated successfully.',
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className='flex h-[calc(100vh-120px)] w-full items-center justify-center'>
        <LoadingSpinner size='lg' text='Loading settings...' />
      </div>
    )
  }

  return (
    <div className='w-full space-y-6'>
      {/* User Profile Header */}
      <div className='flex items-center gap-4'>
        <div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100'>
          <svg
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='h-8 w-8 text-gray-600'
          >
            <path
              d='M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M3 7L3 19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M8 11H16'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M8 15H12'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>
        <div>
          <h2 className='text-xl font-semibold'>
            {profileData?.organization_name ||
              profileData?.name ||
              user?.name ||
              'Organization Profile'}
          </h2>
          <p className='text-sm text-muted-foreground'>{user?.email}</p>
        </div>
      </div>

      <div className='mr-12'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Organization Name and Website */}
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='organization_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='mb-1.5 block text-sm font-medium'>
                      Organization Name
                    </FormLabel>
                    <FormControl>
                      <Input className='h-12 w-full bg-muted/40' {...field} />
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
                    <FormLabel className='mb-1.5 block text-sm font-medium'>
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='h-12 w-full bg-muted/40'
                        placeholder='https://example.com'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Company Type and Country */}
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='company_organization_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='mb-1.5 block text-sm font-medium'>
                      Company Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className='h-12 w-full bg-muted/40'>
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
                name='country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='mb-1.5 block text-sm font-medium'>
                      Country
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className='h-12 w-full bg-muted/40'>
                          <SelectValue placeholder='Select country' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Language and Time Zone */}
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='language'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='mb-1.5 block text-sm font-medium'>
                      Language
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className='h-12 w-full bg-muted/40'>
                          <SelectValue placeholder='Select language' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem
                            key={language.value}
                            value={language.value}
                          >
                            {language.label}
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
                name='timeZone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='mb-1.5 block text-sm font-medium'>
                      Time Zone
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className='h-12 w-full bg-muted/40'>
                          <SelectValue placeholder='Select timezone' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeZones.map((timezone) => (
                          <SelectItem
                            key={timezone.value}
                            value={timezone.value}
                          >
                            {timezone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email Address Section - Read Only */}
            <div className='mt-8'>
              <h3 className='mb-4 text-base font-medium'>Email Address</h3>
              <div className='flex items-center gap-3'>
                <div className='flex-shrink-0'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium'>{user?.email}</p>
                  <p className='text-xs text-muted-foreground'>
                    Primary email (not editable)
                  </p>
                </div>
              </div>
            </div>

            {/* Footer with buttons */}
            <div className='mt-auto pt-10'>
              <Separator className='mb-6' />
              <div className='flex items-center justify-between'>
                <a href='#' className='text-sm text-blue-500'>
                  Learn more about organization profile
                </a>
                <div className='flex gap-4'>
                  <Button
                    type='button'
                    variant='outline'
                    className='h-10 rounded px-6'
                    onClick={() => form.reset()}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    className='h-10 rounded bg-gray-900 px-6 dark:bg-gray-100'
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Update'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
