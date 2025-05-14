import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from '@radix-ui/react-icons'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/custom/button'
import {
  Form,
  FormLabel,
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
  fullName: z.string().optional(),
  nickName: z.string().optional(),
  gender: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  timeZone: z.string().optional(),
  email: z.string().email().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  // These would be populated from user data
}

export function AccountForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })

  return (
    <div className="w-full space-y-6 ">
      {/* User Profile Header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-gray-500">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Bye Wind</h2>
          <p className="text-sm text-muted-foreground">byewind@gmail.com</p>
        </div>
      </div>

      <div className="mr-12">
        <Form {...form}>
          <form className="space-y-6">
            {/* Full Name and Nick Name */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <FormLabel className="block text-sm font-medium mb-1.5">Full Name</FormLabel>
                <Input className="w-full bg-muted/40 h-12" placeholder="Your First Name" />
              </div>
              <div>
                <FormLabel className="block text-sm font-medium mb-1.5">Nick Name</FormLabel>
                <Input className="w-full bg-muted/40 h-12" placeholder="Your First Name" />
              </div>
            </div>

            {/* Gender and Country */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <FormLabel className="block text-sm font-medium mb-1.5">Gender</FormLabel>
                <Select>
                  <SelectTrigger className="w-full bg-muted/40 h-12">
                    <SelectValue placeholder="Your First Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FormLabel className="block text-sm font-medium mb-1.5">Country</FormLabel>
                <Select>
                  <SelectTrigger className="w-full bg-muted/40 h-12">
                    <SelectValue placeholder="Your First Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Language and Time Zone */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <FormLabel className="block text-sm font-medium mb-1.5">Language</FormLabel>
                <Select>
                  <SelectTrigger className="w-full bg-muted/40 h-12">
                    <SelectValue placeholder="Your First Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FormLabel className="block text-sm font-medium mb-1.5">Time Zone</FormLabel>
                <Select>
                  <SelectTrigger className="w-full bg-muted/40 h-12">
                    <SelectValue placeholder="Your First Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeZones.map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  <p className="text-sm font-medium">byewind@gmail.com</p>
                  <p className="text-xs text-muted-foreground">1 month ago</p>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs h-9 px-4 rounded">
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add Email Address
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Footer with buttons */}
      <div className="mt-auto pt-10">
        <Separator className="mb-6" />
        <div className="flex items-center justify-between">
          <a href="#" className="text-sm text-blue-500">
            Learn more about user profile
          </a>
          <div className="flex gap-4">
            <Button variant="outline" className="px-6 h-10 rounded">
              Cancel
            </Button>
            <Button className="bg-gray-900 px-6 h-10 rounded">
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
