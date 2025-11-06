import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useApiKey } from '@/hooks/useApiKey'
import { useChatWidgetSettings } from '@/hooks/useChatWidgetSettings'
import { getApiUrl } from '@/lib/utils'
import ContentSection from '@/pages/settings/components/content-section'
import axios from 'axios'
import { CheckIcon, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface InstantMessage {
  id: string
  message: string
  order: number
}

interface ApiResponseMessage {
  message: string
  order: number
}

export default function InstantReply() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [messages, setMessages] = useState<InstantMessage[]>([
    {
      id: '1',
      message:
        "Hi, thanks for contacting us. We've received your message and appreciate your getting in touch.",
      order: 1,
    },
  ])
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { data: settings, isLoading: isSettingsLoading } =
    useChatWidgetSettings()
  const { apiKey } = useApiKey()

  const handleMessageChange = (id: string, newMessage: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, message: newMessage } : msg))
    )
  }

  const addMessage = () => {
    const newMessage: InstantMessage = {
      id: Date.now().toString(),
      message: '',
      order: messages.length + 1,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const removeMessage = (id: string) => {
    if (messages.length === 1) return // Prevent removing the last message
    setMessages((prev) =>
      prev
        .filter((msg) => msg.id !== id)
        .map((msg, index) => ({
          ...msg,
          order: index + 1,
        }))
    )
  }

  useEffect(() => {
    const loadInstantReply = async () => {
      try {
        const response = await axios.get(`${getApiUrl()}/api/instant-reply`, {
          headers: {
            'X-API-Key': apiKey,
          },
        })

        if (response.data.status === 'success' && response.data.data) {
          const responseMessages = response.data.data.messages || []
          if (responseMessages.length > 0) {
            const formattedMessages = responseMessages.map(
              (msg: ApiResponseMessage, index: number) => ({
                id: `${index + 1}`,
                message: msg.message,
                order: msg.order || index + 1,
              })
            )
            setMessages(formattedMessages)
          }
          setIsEnabled(response.data.data.isActive)
        }
      } catch (error) {
        console.error('Error loading instant reply:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (apiKey) {
      loadInstantReply()
    }
  }, [apiKey])

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const filteredMessages = messages.filter(
        (msg) => msg.message.trim() !== ''
      )

      await axios.post(
        `${getApiUrl()}/api/instant-reply/`,
        {
          messages: filteredMessages.map((msg) => ({
            message: msg.message,
            order: msg.order,
          })),
          isActive: isEnabled,
        },
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      setShowSuccessModal(true)
      // Automatically navigate to train AI after 1.5s
      setTimeout(() => {
        navigate('/dashboard/train-ai')
      }, 1500)
    } catch (error) {
      console.error('Error saving instant reply:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading spinner while settings or instant reply are loading
  if (isSettingsLoading || isLoading) {
    return (
      <div className='flex h-[calc(100vh-120px)] w-full items-center justify-center'>
        <LoadingSpinner size='lg' text='Loading preview...' />
      </div>
    )
  }

  return (
    <div className='mx-6 mt-4'>
      <ContentSection title='Instant Reply'>
        <div className='space-y-6'>
          <div className='mb-6 flex justify-end'>
            <div className='flex items-center gap-3'>
              <span className='text-sm text-muted-foreground'>
                {isEnabled ? 'On' : 'Off'}
              </span>
              <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>
          </div>

          <p className='text-muted-foreground'>
            These instant messages will automatically trigger when a user visits
            the bot page. The bot will proactively engage users by sending these
            messages to encourage them to start a conversation. This only
            happens before the conversation begins - once a user responds,
            normal chat flow takes over.
          </p>

          <div className='flex flex-col gap-6 md:flex-row'>
            <div className='flex-1 space-y-6 rounded-lg border p-6'>
              <div className='space-y-2'>
                <h3 className='font-medium'>When this happens</h3>
                <p className='text-sm text-muted-foreground'>
                  A user visits your website and opens the chat widget.
                </p>
              </div>

              <div className='space-y-2'>
                <h3 className='font-medium'>Take this action</h3>
                <p className='text-sm text-muted-foreground'>
                  Automatically send these messages to initiate conversation
                </p>
              </div>

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <Label className='font-medium'>
                    Messages ({messages.length})
                  </Label>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addMessage}
                    className='flex items-center gap-2'
                    disabled={!isEnabled || messages.length >= 5}
                  >
                    <Plus className='h-4 w-4' />
                    Add Message
                  </Button>
                </div>

                {messages.map((msg, index) => (
                  <div key={msg.id} className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium text-muted-foreground'>
                        Message {index + 1}
                      </span>
                      {messages.length > 1 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => removeMessage(msg.id)}
                          className='h-6 w-6 p-0 text-red-500 hover:text-red-700'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                    <div className='relative'>
                      <Textarea
                        placeholder={`Type your message ${index + 1} here`}
                        value={msg.message}
                        onChange={(e) =>
                          handleMessageChange(msg.id, e.target.value)
                        }
                        className='min-h-24 resize-none pr-16'
                        disabled={!isEnabled}
                        maxLength={500}
                      />
                      <div className='absolute bottom-3 right-3 text-sm text-muted-foreground'>
                        {msg.message.length}/500
                      </div>
                    </div>
                  </div>
                ))}

                {messages.length >= 5 && (
                  <p className='text-sm text-amber-600'>
                    Maximum 5 messages allowed
                  </p>
                )}
              </div>
            </div>

            {/* Right side - Preview */}
            <div className='w-[320px]'>
              <div className='sticky top-6'>
                <div className='relative'>
                  <div className='h-[500px] w-[300px] overflow-hidden rounded-xl border bg-white shadow-lg'>
                    {/* Chat header */}
                    <div
                      className={`p-4 ${settings?.selectedColor === 'black' ? 'bg-black' : `bg-${settings?.selectedColor}-500`} text-white`}
                    >
                      <div className='flex items-center'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white'>
                          {settings?.avatarUrl ? (
                            <img
                              src={settings.avatarUrl}
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
                            <span className='font-bold'>
                              {settings?.name || 'Bay AI'}
                            </span>
                          </p>
                          <p className='text-xs opacity-70'>
                            online conversation
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chat content */}
                    <div className='flex h-[350px] flex-col'>
                      <div
                        className='flex-1 space-y-2 overflow-y-auto p-4'
                        style={{ scrollbarWidth: 'thin' }}
                      >
                        <div className='flex min-h-full flex-col justify-end'>
                          <div className='space-y-2'>
                            {/* Bot messages (instant messages) - left side */}
                            <div className='flex flex-col items-start gap-2'>
                              {messages
                                .filter((msg) => msg.message.trim() !== '')
                                .map((msg, index) => (
                                  <div
                                    key={msg.id}
                                    className='max-w-[75%] break-words rounded-lg bg-gray-800 p-3 text-white'
                                  >
                                    <p className='text-sm'>
                                      {msg.message || `Message ${index + 1}`}
                                    </p>
                                  </div>
                                ))}
                            </div>

                            {/* User response - right side */}
                            <div className='flex justify-end'>
                              <div className='max-w-[75%] break-words rounded-lg bg-gray-100 p-3'>
                                <p className='text-sm text-black'>
                                  Hi yes, David have found it, ask our concierge{' '}
                                  <span className='text-lg font-bold'>👋</span>
                                </p>
                              </div>
                            </div>
                          </div>
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
                        className={`ml-2 h-8 w-8 rounded-full ${settings?.selectedColor === 'black' ? 'bg-black' : `bg-${settings?.selectedColor}-500`} flex items-center justify-center text-white`}
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

          <div className='flex items-center justify-between pt-16'>
            <a href='#' className='text-sm text-blue-500'>
              Learn more about automation
            </a>
            <div className='flex gap-4'>
              <Button
                onClick={() => navigate('/dashboard/train-ai')}
                variant='outline'
                className='px-6'
              >
                Cancel
              </Button>
              <Button className='px-6' onClick={handleSave} disabled={isSaving}>
                {isSaving ? <LoadingSpinner size='sm' /> : 'Save'}
              </Button>
            </div>
          </div>

          {/* Success Modal */}
          {showSuccessModal && (
            <div className='fixed inset-[-28px] z-50 mt-0 flex items-center justify-center bg-black bg-opacity-50 pt-0'>
              <div className='mx-auto max-w-md rounded-lg bg-white p-6'>
                <div className='flex flex-col items-center text-center'>
                  <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
                    <CheckIcon className='h-6 w-6 text-green-600' />
                  </div>
                  <h3 className='mb-2 text-lg font-medium'>
                    Successfully Saved
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Your instant reply settings have been saved successfully.
                    You will be redirected shortly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ContentSection>
    </div>
  )
}
