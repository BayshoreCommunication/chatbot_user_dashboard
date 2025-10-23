import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useApiKey } from '@/hooks/useApiKey'
import { useChatWidgetSettings } from '@/hooks/useChatWidgetSettings'
import { CheckIcon, CopyIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function ChatWidgetInstall() {
  const navigate = useNavigate()
  const [platform, setPlatform] = useState('manual')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const { toast } = useToast()
  const { apiKey, isLoading: isApiKeyLoading } = useApiKey()
  const { data: settings, isLoading: isSettingsLoading } =
    useChatWidgetSettings()

  // Add states for chat widget settings
  const [name, setName] = useState('Bay AI')
  const [selectedColor, setSelectedColor] = useState('black')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [scriptTag, setScriptTag] = useState('')

  useEffect(() => {
    if (!apiKey) return

    // Generate script tag with API key as data attribute
    setScriptTag(
      `<script src="${import.meta.env.VITE_BOT_URL}" data-api-key="${apiKey}" async></script>`
    )

    // Update states from settings when they're available
    if (settings) {
      setName(settings.name)
      setSelectedColor(settings.selectedColor)
      if (settings.avatarUrl) {
        setAvatarUrl(settings.avatarUrl)
      }
    }
  }, [apiKey, settings])

  const handleBack = () => {
    navigate('/dashboard/create-chat-widget')
  }

  const handleConnect = async () => {
    try {
      // Show success modal
      setShowSuccessModal(true)

      // Automatically navigate to system settings after 1.5s
      setTimeout(() => {
        navigate('/dashboard/system-settings')
      }, 1500)
    } catch (error) {
      console.error('Error connecting bot:', error)
      toast({
        title: 'Error',
        description: 'Failed to connect the bot',
        variant: 'destructive',
      })
    }
  }

  const handleCopyToClipboard = () => {
    const code = document.getElementById('code-snippet')?.textContent
    if (code) {
      navigator.clipboard.writeText(code)
      // Could add a toast notification here
      toast({
        title: 'Success',
        description: 'Code copied to clipboard',
      })
    }
  }

  // Update loading state to use LoadingSpinner
  if (isSettingsLoading || isApiKeyLoading) {
    return (
      <div className='flex h-[calc(100vh-120px)] w-full items-center justify-center'>
        <LoadingSpinner size='lg' text='Loading settings...' />
      </div>
    )
  }

  return (
    <div className='flex h-[calc(100vh-120px)] w-full flex-col'>
      <div className='flex-1 space-y-6 overflow-y-auto'>
        {/* Chat Widget Installation Section */}
        <div>
          <div>
            <h3 className='text-xl font-medium'>Set up the chat widget</h3>
            <p className='mb-6 mt-1 text-sm text-muted-foreground'>
              Set up a chat widget to streamline communication, improve customer
              satisfaction, and drive conversions with real-time assistance.
            </p>
          </div>

          <Card className='rounded-lg border p-6'>
            <div className='space-y-6'>
              {/* Two-column layout */}
              <div className='flex flex-col justify-between gap-8 lg:flex-row'>
                {/* Left Column - Installation Instructions */}
                <div className='w-full lg:w-3/5'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center'>
                      <div className='flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-400'>
                        1
                      </div>
                      <span className='ml-2 text-sm text-gray-500'>—</span>
                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white'>
                        2
                      </div>
                    </div>
                    <h4 className='text-sm text-gray-500'>
                      Talk to your visitors via live chat
                    </h4>
                    <h3 className='text-xl font-bold'>
                      Install your chat widget
                    </h3>
                  </div>

                  {/* Platform Selection */}
                  <div className='mb-6 space-y-2'>
                    <label className='block text-sm font-medium'>
                      Select platform
                    </label>
                    <Select
                      value={platform}
                      onValueChange={(value) => setPlatform(value)}
                    >
                      <SelectTrigger className='h-10 w-full max-w-[250px]'>
                        <SelectValue placeholder='Select a platform' />
                      </SelectTrigger>
                      <SelectContent>
                        {/* <SelectItem value="wordpress">
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path>
                                                        </svg>
                                                        WordPress
                                                    </div>
                                                </SelectItem> */}
                        <SelectItem value='manual'>
                          <div className='flex items-center'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='16'
                              height='16'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              className='mr-2'
                            >
                              <path d='M8 3H5a2 2 0 0 0-2 2v3'></path>
                              <path d='M21 8V5a2 2 0 0 0-2-2h-3'></path>
                              <path d='M3 16v3a2 2 0 0 0 2 2h3'></path>
                              <path d='M16 21h3a2 2 0 0 0 2-2v-3'></path>
                            </svg>
                            Manual install
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {platform === 'wordpress' && (
                    <div className='space-y-4'>
                      <ol className='list-decimal space-y-2 pl-6'>
                        <li className='text-sm'>
                          Log in to your WordPress account and go to Dashboard
                        </li>
                        <li className='text-sm'>
                          Navigate to the "Plugins" section and select "Add New"
                        </li>
                        <li className='text-sm'>
                          Type "Tidio" in the search bar and hit the "Install
                          New" button Tip
                        </li>
                        <li className='text-sm'>
                          Once installed, make sure to hit the "Activate" button
                          before moving on
                        </li>
                        <li className='text-sm'>
                          Click "Tidio Chat" in the left-hand side menu. Choose
                          "Log in" and enter your email and password
                        </li>
                      </ol>
                    </div>
                  )}

                  {/* Manual Installation Instructions */}
                  {platform === 'manual' && (
                    <div className='space-y-4'>
                      <div className='flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-900'>
                        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white'>
                          2
                        </div>
                        <span className='text-sm dark:text-gray-300'>
                          Paste this code snippet just before the &lt;/body&gt;
                          tag
                        </span>
                      </div>
                      <div className='relative rounded-lg bg-gray-50 p-4 dark:bg-gray-900'>
                        <pre
                          className='whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200'
                          id='code-snippet'
                        >
                          {scriptTag || 'Loading script tag...'}
                        </pre>
                        <button
                          onClick={handleCopyToClipboard}
                          className='absolute right-4 top-4 flex items-center p-2 text-gray-500 hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-300'
                        >
                          <span className='mr-1 text-xs'>
                            Copy to clipboard
                          </span>
                          <CopyIcon className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side - Preview */}
                <div className='w-[320px]'>
                  <div className='sticky top-6'>
                    <div className='relative'>
                      <div className='h-[500px] w-[300px] overflow-hidden rounded-xl border bg-white shadow-lg'>
                        {/* Chat header */}
                        <div
                          className={`p-4 ${selectedColor === 'black' ? 'bg-black' : `bg-${selectedColor}-500`} text-white`}
                        >
                          <div className='flex items-center'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white'>
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt='Avatar'
                                  className='h-8 w-8 rounded-full object-cover'
                                />
                              ) : (
                                <span className='text-xs font-bold text-black'>
                                  BA
                                </span>
                              )}
                            </div>
                            <div className='ml-2'>
                              <p className='text-sm'>
                                <span className='font-bold'>{name}</span>
                              </p>
                              <p className='text-xs opacity-70'>
                                online conversation
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Chat content */}
                        <div className='flex h-[350px] flex-col justify-end p-4'>
                          <div className='mb-2 max-w-[75%] rounded-lg bg-gray-100 p-3'>
                            <p className='text-sm text-black'>
                              Hi yes, David have found it, ask our concierge{' '}
                              <span className='text-lg font-bold'>👋</span>
                            </p>
                          </div>
                          <div className='flex justify-end'>
                            <div className='max-w-[75%] rounded-lg bg-gray-800 p-3 text-white'>
                              <p className='text-sm'>
                                Thank you for work, see you!
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Chat input */}
                        <div className='flex items-center border-t p-4'>
                          <div className='relative flex flex-1 items-center'>
                            <svg
                              className='absolute left-2 h-5 w-5 text-gray-400'
                              viewBox='0 0 24 24'
                              fill='none'
                            >
                              <path
                                d='M19 13C19 16.866 15.866 20 12 20C8.13401 20 5 16.866 5 13C5 9.13401 8.13401 6 12 6C15.866 6 19 9.13401 19 13Z'
                                stroke='currentColor'
                                strokeWidth='2'
                              />
                            </svg>
                            <input
                              type='text'
                              placeholder='Type your message here...'
                              className='flex-1 rounded-full border border-gray-200 py-2 pl-8 pr-2 text-sm outline-none'
                            />
                          </div>
                          <button
                            className={`ml-2 h-8 w-8 rounded-full ${selectedColor === 'black' ? 'bg-black' : `bg-${selectedColor}-500`} flex items-center justify-center text-white`}
                          >
                            <svg
                              width='16'
                              height='16'
                              viewBox='0 0 24 24'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M22 2L11 13'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                              <path
                                d='M22 2L15 22L11 13L2 9L22 2Z'
                                stroke='white'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='mx-auto max-w-md rounded-lg bg-white p-6'>
            <div className='flex flex-col items-center text-center'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
                <CheckIcon className='h-6 w-6 text-green-600' />
              </div>
              <h3 className='mb-2 text-lg font-medium'>
                Successfully Connected
              </h3>
              <p className='text-sm text-gray-500'>
                Your chat widget has been set up successfully. You will be
                redirected shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <div className='mt-4 flex justify-between border-t py-4'>
        <a href='#' className='text-sm text-blue-500 hover:underline'>
          Learn more about account setting
        </a>
        <div className='space-x-2'>
          <Button variant='outline' className='px-6' onClick={handleBack}>
            Back
          </Button>
          <Button
            variant='default'
            className='bg-black px-6 text-white dark:bg-slate-950'
            onClick={handleConnect}
          >
            Connect
          </Button>
        </div>
      </div>
    </div>
  )
}
