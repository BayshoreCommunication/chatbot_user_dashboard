import { Separator } from '@/components/ui/separator'
import ThemeSwitch from '@/components/theme-switch'

interface ContentSectionProps {
  title: string
  children: JSX.Element
  className?: string
}


export default function ContentSection({
  title,
  children,
  className = '',
}: ContentSectionProps) {

  return (
    <div className={`flex flex-1 flex-col ${className}`}>
      <div className='flex-none flex items-center justify-between'>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 17H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className={`text-lg font-medium`}>{title}</h3>
        </div>
        <div className="flex items-center">
          <div className='mr-2' >
            <ThemeSwitch />
          </div>
          <div className="relative flex items-center rounded-md bg-gray-100 dark:bg-gray-950 px-3 py-1.5">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <span className="ml-2 text-xs text-gray-500">Search</span>
            <span className="ml-4 rounded border border-gray-300 dark:border-gray-700 bg-background px-1 text-xs text-gray-500">⌘/</span>
          </div>
        </div>
      </div>
      <Separator className='my-4 flex-none' />
      <div className='-mx-4 flex-1 overflow-auto scroll-smooth px-4 md:pb-9'>
        <div className='w-full'>{children}</div>
      </div>
    </div>
  )
}
