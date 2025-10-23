import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Card } from '@/components/ui/card'
import { useChatWidgetSettings } from '@/hooks/useChatWidgetSettings'
import { useNavigate } from 'react-router-dom'

export function SystemSetting() {
  const navigate = useNavigate()
  const { data: settings, isLoading } = useChatWidgetSettings()

  const handleInstallClick = () => {
    navigate('/dashboard/create-chat-widget')
  }

  if (isLoading) {
    return (
      <div className='flex h-[calc(100vh-120px)] w-full items-center justify-center'>
        <LoadingSpinner size='lg' text='Loading settings...' />
      </div>
    )
  }

  return (
    <div className='flex h-[calc(100vh-120px)] w-full flex-col'>
      <div className='flex-1 space-y-6 overflow-y-auto pb-6 pr-4'>
        {/* Chat Widget Section */}
        <div>
          <h3 className='text-xl font-medium'>Set up the chat widget</h3>
          <p className='mb-6 mt-1 text-sm text-muted-foreground'>
            Set up a chat widget to streamline communication, improve customer
            satisfaction, and drive conversations with real-time assistance.
          </p>

          <Card className='flex flex-col items-center justify-center space-y-6 rounded-lg border pb-8 pl-6 pr-12 pt-3'>
            <div className='relative mx-auto w-full max-w-xs'>
              <div className='flex justify-center'>
                <img
                  className='ml-16'
                  src='https://res.cloudinary.com/dq9yrj7c9/image/upload/v1747201869/v4rdwnsadrzqzsi6mlkm.png'
                  alt=''
                />
              </div>
            </div>

            <div className='mt-4 space-y-2 text-center'>
              <h4 className='flex items-center justify-center gap-2 text-2xl font-medium'>
                {settings?.is_bot_connected ? (
                  <>
                    Manage <span className='font-bold'>Bay AI</span> on your
                    website
                  </>
                ) : (
                  <>
                    Add <span className='font-bold'>Bay AI</span> to your
                    website
                  </>
                )}
              </h4>
              <p className='max-w-md text-sm text-muted-foreground'>
                {settings?.is_bot_connected
                  ? 'Your Bay AI chatbot is active. You can manage its settings and customize its behavior.'
                  : 'Installing chat widget is essential for engaging customers with live chat, activating our Flows and AI support features.'}
              </p>
            </div>

            <Button
              variant='default'
              className='mt-4 flex items-center gap-2 rounded-md bg-black px-6 py-2 text-white'
              onClick={handleInstallClick}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                {settings?.is_bot_connected ? (
                  <path
                    d='M12 4V20M4 12H20'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                ) : (
                  <path
                    d='M12 5V19M5 12H19'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                )}
              </svg>
              {settings?.is_bot_connected
                ? 'Manage Bay AI Settings'
                : 'Install Bay AI on your website'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
