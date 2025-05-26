import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import {
  Form,
  FormLabel,
  FormControl,
  FormField,
  FormItem,
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
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import useAxiosPublic from '@/hooks/useAxiosPublic'

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

const genders = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non-binary' },
  { label: 'Prefer not to say', value: 'not-specified' },
] as const

const profileFormSchema = z.object({
  nickName: z.string().min(2, 'Nickname must be at least 2 characters').optional(),
  gender: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  timeZone: z.string().optional(),
  email: z.string().email().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function AccountForm() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const axiosPublic = useAxiosPublic()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nickName: '',
      gender: '',
      country: '',
      language: '',
      timeZone: '',
      email: user?.email || '',
    },
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return
      setIsFetching(true)
      try {
        const { data } = await axiosPublic.get(`/user/profile/${user.id}`)
        console.log('data', data)
        form.reset({
          nickName: data.nickName || '',
          gender: data.gender || '',
          country: data.country || '',
          language: data.language || '',
          timeZone: data.timeZone || '',
          email: data.email || user.email || '',
        })
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchUserProfile()
  }, [user, form, axiosPublic])

  async function onSubmit(data: ProfileFormValues) {
    if (!user?.id) return

    setIsLoading(true)
    try {
      await axiosPublic.put(`/user/profile/${user.id}`, data)
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      })
    } catch (error) {
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
    return <div className="w-full h-[calc(100vh-120px)] flex items-center justify-center">
      <LoadingSpinner
        size="lg"
        text="Loading settings..."
      />
    </div>
  }

  return (
    <div className="w-full space-y-6">
      {/* User Profile Header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-gray-500">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user?.name || 'User Profile'}</h2>
          <p className="text-sm text-muted-foreground">{form.watch('email') || user?.email}</p>
        </div>
      </div>

      <div className="mr-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name and Nick Name */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <FormLabel className="block text-sm font-medium mb-1.5">Full Name</FormLabel>
                <Input
                  className="w-full bg-muted/40 h-12"
                  value={user?.name || ''}
                  disabled
                />
              </div>
              <FormField
                control={form.control}
                name="nickName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium mb-1.5">Nick Name</FormLabel>
                    <FormControl>
                      <Input className="w-full bg-muted/40 h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Gender and Country */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium mb-1.5">Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-muted/40 h-12">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genders.map((gender) => (
                          <SelectItem key={gender.value} value={gender.value}>
                            {gender.label}
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
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium mb-1.5">Country</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-muted/40 h-12">
                          <SelectValue placeholder="Select country" />
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium mb-1.5">Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-muted/40 h-12">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language.value} value={language.value}>
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
                name="timeZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium mb-1.5">Time Zone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-muted/40 h-12">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeZones.map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value}>
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

            {/* Email Address Section */}
            <div className="mt-8">
              <h3 className="text-base font-medium mb-4">My email Address</h3>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{form.watch('email') || user?.email}</p>
                  <p className="text-xs text-muted-foreground">Primary email</p>
                </div>
              </div>
            </div>

            {/* Footer with buttons */}
            <div className="mt-auto pt-10">
              <Separator className="mb-6" />
              <div className="flex items-center justify-between">
                <a href="#" className="text-sm text-blue-500">
                  Learn more about user profile
                </a>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-6 h-10 rounded"
                    onClick={() => form.reset()}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gray-900 dark:bg-gray-100 px-6 h-10 rounded"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
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
