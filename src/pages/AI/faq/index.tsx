import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useApiKey } from '@/hooks/useApiKey'
import { useChatWidgetSettings } from '@/hooks/useChatWidgetSettings'
import { getApiUrl } from '@/lib/utils'
import ContentSection from '@/pages/settings/components/content-section'
import axios from 'axios'
import { CheckIcon, ChevronDownIcon, EditIcon, UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface FAQ {
  id?: string
  question: string
  response: string
  is_active: boolean
  persistent_menu: boolean
  created_at?: string
  updated_at?: string
}

export default function FAQAutomation() {
  const navigate = useNavigate()
  const { data: settings, isLoading: isSettingsLoading } =
    useChatWidgetSettings()
  const { apiKey } = useApiKey()
  const [isEnabled, setIsEnabled] = useState(true)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null
  )
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isCreatingFaq, setIsCreatingFaq] = useState(false)

  // Helper function to get character count
  const getCharCount = (text: string): number => {
    return text?.length || 0
  }

  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFAQs()
  }, [apiKey])

  const fetchFAQs = async () => {
    try {
      const response = await axios.get(`${getApiUrl()}/api/faq/list`, {
        headers: {
          'X-API-Key': apiKey || '',
        },
      })
      if (response.data) {
        setFaqs(response.data)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      toast.error('Failed to load FAQs')
      setIsLoading(false)
    }
  }

  const handleQuestionChange = (id: string, value: string) => {
    setFaqs(
      faqs.map((faq) => (faq.id === id ? { ...faq, question: value } : faq))
    )
  }

  const handleResponseChange = (id: string, value: string) => {
    setFaqs(
      faqs.map((faq) => (faq.id === id ? { ...faq, response: value } : faq))
    )
  }

  const togglePersistentMenu = async (id: string) => {
    const faq = faqs.find((f) => f.id === id)
    if (!faq) return

    try {
      const response = await axios.put(
        `${getApiUrl()}/api/faq/${id}`,
        {
          ...faq,
          persistent_menu: !faq.persistent_menu,
        },
        {
          headers: {
            'X-API-Key': apiKey || '',
          },
        }
      )

      if (response.data) {
        setFaqs(
          faqs.map((f) =>
            f.id === id
              ? { ...f, persistent_menu: response.data.persistent_menu }
              : f
          )
        )
        toast.success('FAQ updated successfully')
      }
    } catch (error) {
      console.error('Error updating FAQ:', error)
      toast.error('Failed to update FAQ')
    }
  }

  const toggleQuestionExpand = (id: string) => {
    setExpandedQuestionId(expandedQuestionId === id ? null : id)
  }

  const deleteQuestion = async (id: string) => {
    try {
      const response = await axios.delete(`${getApiUrl()}/api/faq/${id}`, {
        headers: {
          'X-API-Key': apiKey || '',
        },
      })

      if (response.data?.status === 'success') {
        setFaqs(faqs.filter((faq) => faq.id !== id))
        if (expandedQuestionId === id) {
          setExpandedQuestionId(null)
        }
        toast.success('FAQ deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      toast.error('Failed to delete FAQ')
    }
  }

  const addQuestion = async () => {
    setIsCreatingFaq(true)
    const newFaq = {
      question: 'New Question',
      response: 'Enter your response here...',
      is_active: true,
      persistent_menu: false,
    }

    try {
      const response = await axios.post(
        `${getApiUrl()}/api/faq/create`,
        newFaq,
        {
          headers: {
            'X-API-Key': apiKey || '',
          },
        }
      )

      if (response.data) {
        setFaqs([...faqs, response.data])
        toast.success('New FAQ created successfully')
      }
    } catch (error) {
      console.error('Error creating FAQ:', error)
      toast.error('Failed to create new FAQ')
    } finally {
      setIsCreatingFaq(false)
    }
  }

  const handleSave = async () => {
    let hasError = false

    // Update all expanded FAQs
    for (const faq of faqs) {
      if (faq.id && expandedQuestionId === faq.id) {
        try {
          const response = await axios.put(
            `${getApiUrl()}/api/faq/${faq.id}`,
            {
              question: faq.question,
              response: faq.response,
              is_active: faq.is_active,
              persistent_menu: faq.persistent_menu,
            },
            {
              headers: {
                'X-API-Key': apiKey || '',
              },
            }
          )

          if (!response.data) throw new Error('Failed to update FAQ')
        } catch (error) {
          console.error('Error updating FAQ:', error)
          hasError = true
        }
      }
    }

    if (hasError) {
      toast.error('Some FAQs failed to update')
    } else {
      setShowSuccessModal(true)
      toast.success('All FAQs saved successfully')
      // Refresh the FAQ list to ensure UI is in sync
      await fetchFAQs()
      setTimeout(() => {
        setShowSuccessModal(false)
      }, 1500)
    }
  }

  const toggleFaqActive = async (id: string) => {
    // Find the current FAQ
    const currentFaq = faqs.find((faq) => faq.id === id)
    if (!currentFaq) return

    // Store the current state
    const currentState = currentFaq.is_active

    try {
      // Optimistically update the UI
      setFaqs((prevFaqs) =>
        prevFaqs.map((faq) =>
          faq.id === id ? { ...faq, is_active: !currentState } : faq
        )
      )

      const response = await axios.put(
        `${getApiUrl()}/api/faq/${id}/toggle`,
        {},
        {
          headers: {
            'X-API-Key': apiKey || '',
          },
        }
      )

      if (!response.data) {
        // Revert on failure
        setFaqs((prevFaqs) =>
          prevFaqs.map((faq) =>
            faq.id === id ? { ...faq, is_active: currentState } : faq
          )
        )
        throw new Error('Failed to update FAQ status')
      }

      toast.success('FAQ status updated successfully')
    } catch (error) {
      // Revert on error
      setFaqs((prevFaqs) =>
        prevFaqs.map((faq) =>
          faq.id === id ? { ...faq, is_active: currentState } : faq
        )
      )

      console.error('Error toggling FAQ status:', error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          toast.error('FAQ not found. Please refresh the page.')
        } else if (error.response?.status === 400) {
          toast.error('Invalid FAQ ID format.')
        } else {
          toast.error(
            error.response?.data?.detail || 'Failed to update FAQ status'
          )
        }
      } else {
        toast.error('An unexpected error occurred')
      }

      // Refresh the FAQs list to ensure UI is in sync with server
      await fetchFAQs()
    }
  }

  // Show loading spinner while settings are loading
  if (isSettingsLoading || isLoading) {
    return (
      <div className='flex h-[calc(100vh-120px)] w-full items-center justify-center'>
        <LoadingSpinner size='lg' text='Loading FAQs...' />
      </div>
    )
  }

  return (
    <div className='mx-6 mt-4'>
      {/* Loading Overlay */}
      {isCreatingFaq && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='flex flex-col items-center rounded-lg bg-white p-6'>
            <LoadingSpinner size='lg' text='Creating new FAQ...' />
          </div>
        </div>
      )}

      <ContentSection title='Frequently Asked Questions'>
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
            Suggest questions that people can ask your Page. Then set up
            automated responses to those questions.
          </p>

          <div className='flex flex-col gap-6 md:flex-row'>
            <div className='flex-1 space-y-6 rounded-lg border p-6'>
              <div className='space-y-2'>
                <h3 className='font-medium'>When this happens</h3>
                <p className='text-sm text-muted-foreground'>
                  A person starts a chat with Bay AI on the selected platforms.
                </p>
              </div>

              <div className='space-y-2'>
                <h3 className='font-medium'>Take this action</h3>
                <p className='text-sm text-muted-foreground'>
                  Show frequently asked questions as suggested messages that the
                  person can send to your business. If the person sends a
                  suggested question, send the answer (if applicable) as an
                  automated response.
                </p>
              </div>

              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className={`overflow-hidden rounded-lg border ${expandedQuestionId === faq.id ? 'border-gray-300' : ''}`}
                >
                  <div
                    className={`cursor-pointer p-4 ${expandedQuestionId === faq.id ? 'bg-gray-100 text-gray-900' : ''}`}
                    onClick={() => toggleQuestionExpand(faq.id!)}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${expandedQuestionId === faq.id ? 'bg-gray-200 text-gray-900' : 'bg-gray-100'} mr-2`}
                        >
                          <span className='text-sm'>Aa</span>
                        </div>
                        <h4 className='font-medium'>{faq.question}</h4>
                      </div>
                      <div className='flex items-center'>
                        <Switch
                          checked={faq.is_active}
                          onCheckedChange={() => toggleFaqActive(faq.id!)}
                          className='mr-2'
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleQuestionExpand(faq.id!)
                          }}
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${expandedQuestionId === faq.id ? 'text-gray-700' : 'text-gray-400'}`}
                        >
                          <EditIcon className='h-4 w-4' />
                        </button>
                        <ChevronDownIcon
                          className={`ml-2 h-5 w-5 ${expandedQuestionId === faq.id ? 'text-gray-700' : 'text-gray-400'} transition-transform ${expandedQuestionId === faq.id ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  {expandedQuestionId === faq.id && (
                    <div className='border-t bg-gray-100 p-4 pt-0 text-gray-900'>
                      <div className='space-y-4'>
                        <div className='space-y-2'>
                          <Label
                            htmlFor={`question-${faq.id}`}
                            className='font-medium'
                          >
                            Question
                          </Label>
                          <div className='relative rounded-md bg-white'>
                            <Input
                              id={`question-${faq.id}`}
                              placeholder='Enter your question here'
                              value={faq.question}
                              onChange={(e) =>
                                handleQuestionChange(faq.id!, e.target.value)
                              }
                              className='border-gray-300 pr-16 text-gray-900'
                            />
                            <div className='absolute right-3 top-2.5 text-sm text-gray-500'>
                              {getCharCount(faq.question)}/80
                            </div>
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <Label
                            htmlFor={`response-${faq.id}`}
                            className='font-medium'
                          >
                            Automated response
                          </Label>
                          <div className='relative rounded-md bg-white'>
                            <Textarea
                              id={`response-${faq.id}`}
                              placeholder='Type your response here'
                              value={faq.response}
                              onChange={(e) =>
                                handleResponseChange(faq.id!, e.target.value)
                              }
                              className='min-h-32 resize-none border-gray-300 pr-16 text-gray-900'
                            />
                            <div className='absolute bottom-3 right-3 text-sm text-gray-500'>
                              {getCharCount(faq.response)}/500
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() => setShowPersonalizeModal(true)}
                          className='flex cursor-pointer items-center gap-2 text-blue-400'
                        >
                          <UserIcon className='h-4 w-4' />
                          <span>Personalise your message</span>
                        </div>

                        <div className='mt-4 flex items-center'>
                          <Switch
                            id={`persistent-menu-${faq.id}`}
                            checked={faq.persistent_menu}
                            onCheckedChange={() =>
                              togglePersistentMenu(faq.id!)
                            }
                            className='mr-3'
                          />
                          <div>
                            <Label
                              htmlFor={`persistent-menu-${faq.id}`}
                              className='font-medium'
                            >
                              Add this question to persistent menu
                            </Label>
                            <p className='text-xs text-gray-400'>
                              Enabling this will display the question in the
                              persistent menu in the chat. Limit to 30
                              characters for a full view.
                            </p>
                          </div>
                        </div>

                        <Button
                          variant='ghost'
                          onClick={() => deleteQuestion(faq.id!)}
                          className='mt-4 w-full justify-center border border-gray-700 text-red-400 hover:bg-black hover:text-red-300'
                        >
                          <span className='flex items-center'>
                            <svg
                              className='mr-1.5 h-4 w-4'
                              viewBox='0 0 24 24'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M3 6H5H21'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                              <path
                                d='M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                              <path
                                d='M10 11V17'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                              <path
                                d='M14 11V17'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                            Delete question
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div
                onClick={addQuestion}
                className='mt-4 flex cursor-pointer items-center gap-2 text-blue-500'
              >
                <span>+ Add Another Question</span>
              </div>
            </div>

            {/* Right side - Preview */}
            <div className='w-[320px] md:sticky md:top-6 md:self-start'>
              <div className='relative'>
                <div className='w-[300px] overflow-hidden rounded-xl border bg-white shadow-lg'>
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
                          we reply immediately
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chat content */}
                  <div className='flex max-h-[350px] min-h-[350px] flex-col justify-end overflow-y-auto p-4'>
                    {/* Show active FAQs as suggestions */}
                    <div className='mb-4 space-y-2'>
                      {faqs
                        .filter((faq) => faq.is_active)
                        .map((faq) => (
                          <div
                            key={faq.id}
                            className='cursor-pointer rounded-lg bg-gray-100 p-2 text-sm text-black hover:bg-gray-200'
                          >
                            {faq.question}
                          </div>
                        ))}
                    </div>

                    <div className='mb-2 max-w-[75%] rounded-lg bg-gray-100 p-3'>
                      <p className='text-sm text-black'>
                        Hi, yes, David have found it, ask our concierge 👋
                      </p>
                    </div>
                    <div className='flex justify-end'>
                      <div className='max-w-[75%] rounded-lg bg-gray-800 p-3 text-white'>
                        <p className='text-sm'>Thank you for work, see you!</p>
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

                  <div className='border-t p-2 text-center text-xs text-gray-500'>
                    Website chat Preview
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between pb-8 pt-16'>
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
              <Button className='px-6' onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>

          {/* Personalize Modal */}
          {showPersonalizeModal && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
              <div className='mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
                <h3 className='mb-4 text-lg font-medium'>
                  Personalise your message
                </h3>
                <p className='mb-6 text-sm text-gray-500'>
                  Make your message more personal by adding names or Page
                  information to your automated response.
                </p>

                <div className='space-y-3'>
                  <div className='cursor-pointer rounded-md p-2 hover:bg-gray-50'>
                    <div className='font-medium'>First name of recipient</div>
                  </div>
                  <div className='cursor-pointer rounded-md p-2 hover:bg-gray-50'>
                    <div className='font-medium'>Surname of recipient</div>
                  </div>
                  <div className='cursor-pointer rounded-md p-2 hover:bg-gray-50'>
                    <div className='font-medium'>Full name of recipient</div>
                  </div>
                  <div className='cursor-pointer rounded-md p-2 hover:bg-gray-50'>
                    <div className='font-medium'>Email address</div>
                  </div>
                </div>

                <div className='mt-6 flex justify-end gap-3'>
                  <Button
                    variant='outline'
                    onClick={() => setShowPersonalizeModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowPersonalizeModal(false)}
                    className='bg-black text-white hover:bg-gray-800'
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
              <div className='mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg'>
                <div className='flex flex-col items-center text-center'>
                  <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
                    <CheckIcon className='h-6 w-6 text-green-600' />
                  </div>
                  <h3 className='mb-2 text-lg font-medium'>
                    Successfully Saved
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Your FAQ automation settings have been saved successfully.
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
