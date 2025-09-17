import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Input } from '@/components/ui/input'
import { useApiKey } from '@/hooks/useApiKey'
import useAxiosPublic from '@/hooks/useAxiosPublic'
import { useChatWidgetSettings } from '@/hooks/useChatWidgetSettings'
import ContentSection from '@/pages/settings/components/content-section'
import { AxiosError, AxiosInstance } from 'axios'
import {
  AlertTriangle,
  Brain,
  Check,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface Website {
  id: string
  url: string
  status: 'Used' | 'Pending' | 'Failed'
  createdAt: string
}

interface Document {
  id: string
  name: string
  status: 'Used' | 'Pending' | 'Failed'
  createdAt: string
}

interface UploadHistoryItem {
  id: string
  type: 'url' | 'pdf' | 'text'
  status: 'Used' | 'Pending' | 'Failed'
  created_at: string
  url?: string
  file_name?: string
}

export default function TrainAiPage() {
  const navigate = useNavigate()
  const { data: settings, isLoading: isSettingsLoading } =
    useChatWidgetSettings()
  const { apiKey } = useApiKey() as { apiKey: string }
  const axiosPublic = useAxiosPublic() as AxiosInstance

  // Page state management
  const [currentStep, setCurrentStep] = useState<'initial' | 'main'>('initial')
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isLoadingWebsites, setIsLoadingWebsites] = useState(false)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)

  // Modal state management
  const [showRestrictionsModal, setShowRestrictionsModal] = useState(false)
  const [showUrlModal, setShowUrlModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [showActivationModal, setShowActivationModal] = useState(false)

  // Form state
  const [urlInputs, setUrlInputs] = useState<string[]>([''])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [websites, setWebsites] = useState<Website[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Delete loading states
  const [deletingWebsiteIds, setDeletingWebsiteIds] = useState<Set<string>>(
    new Set()
  )
  const [deletingDocumentIds, setDeletingDocumentIds] = useState<Set<string>>(
    new Set()
  )

  // Check for previous uploads when component mounts
  useEffect(() => {
    const checkPreviousUploads = async () => {
      if (!apiKey) {
        console.log('API key not available, skipping upload history check')
        setIsLoadingHistory(false)
        setIsLoadingWebsites(false)
        setIsLoadingDocuments(false)
        return
      }

      try {
        setIsLoadingWebsites(true)
        setIsLoadingDocuments(true)

        // First check if user has previous uploads
        const hasPreviousResponse = await axiosPublic.get(
          '/api/chatbot/has_previous_uploads',
          {
            headers: {
              'X-API-Key': apiKey,
            },
          }
        )

        if (hasPreviousResponse.data.has_previous_uploads) {
          setCurrentStep('main')
        }

        // Get upload history
        const historyResponse = await axiosPublic.get(
          '/api/chatbot/upload_history',
          {
            headers: {
              'X-API-Key': apiKey,
            },
          }
        )

        // Convert history items to website/document format
        const websites: Website[] = []
        const documents: Document[] = []

        historyResponse.data.forEach((item: UploadHistoryItem) => {
          const historyItem = {
            id: item.id,
            status: item.status,
            createdAt: new Date(item.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            }),
          }

          if (item.type === 'url' && item.url) {
            websites.push({
              ...historyItem,
              url: item.url,
            })
          } else if (item.type === 'pdf' && item.file_name) {
            documents.push({
              ...historyItem,
              name: item.file_name,
            })
          }
        })

        setWebsites(websites)
        setDocuments(documents)
      } catch (error: unknown) {
        console.error('Error checking previous uploads:', error)
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            toast.error('Authentication failed. Please check your API key.')
          } else if (error.response?.status === 404) {
            toast.error('API endpoint not found. Please contact support.')
          } else {
            toast.error('Failed to load upload history. Please try again.')
          }
        } else {
          toast.error('Failed to load upload history. Please try again.')
        }
      } finally {
        setIsLoadingHistory(false)
        setIsLoadingWebsites(false)
        setIsLoadingDocuments(false)
      }
    }

    checkPreviousUploads()
  }, [apiKey, axiosPublic])

  const handleStartTraining = () => {
    setShowRestrictionsModal(true)
  }

  const handleAcceptRestrictions = () => {
    setShowRestrictionsModal(false)
    setShowUrlModal(true)
  }

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urlInputs]
    newUrls[index] = value
    setUrlInputs(newUrls)
  }

  const handleAddWebsite = () => {
    setShowUrlModal(true)
  }

  const handleAddDocument = () => {
    setShowPdfModal(true)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const allowedFiles = Array.from(files).filter(
        (file) =>
          file.type === 'application/pdf' ||
          file.type === 'text/csv' ||
          file.name.toLowerCase().endsWith('.csv')
      )
      const nonAllowedFiles = Array.from(files).filter(
        (file) =>
          file.type !== 'application/pdf' &&
          file.type !== 'text/csv' &&
          !file.name.toLowerCase().endsWith('.csv')
      )

      if (nonAllowedFiles.length > 0) {
        toast.error(
          'Only PDF and CSV files are allowed. Other files will be ignored.'
        )
      }

      if (allowedFiles.length > 0) {
        setSelectedFiles((prevFiles) => [...prevFiles, ...allowedFiles])
        const pdfCount = allowedFiles.filter(
          (f) => f.type === 'application/pdf'
        ).length
        const csvCount = allowedFiles.filter(
          (f) => f.type === 'text/csv' || f.name.toLowerCase().endsWith('.csv')
        ).length

        let message = ''
        if (pdfCount > 0 && csvCount > 0) {
          message = `${pdfCount} PDF file(s) and ${csvCount} CSV file(s) selected`
        } else if (pdfCount > 0) {
          message = `${pdfCount} PDF file(s) selected`
        } else {
          message = `${csvCount} CSV file(s) selected`
        }
        toast.success(message)
      }
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index))
  }

  const handleUrlSubmit = async () => {
    if (!apiKey) {
      toast.error('API key not available')
      return
    }

    const validUrls = urlInputs.filter((url) => url.trim() !== '')
    if (validUrls.length === 0) return

    // Validate URLs
    const invalidUrls = validUrls.filter((url) => {
      try {
        new URL(url)
        return false
      } catch {
        return true
      }
    })

    if (invalidUrls.length > 0) {
      toast.error(`Invalid URL format: ${invalidUrls.join(', ')}`)
      return
    }

    setIsUploading(true)
    try {
      for (const url of validUrls) {
        const formData = new FormData()
        formData.append('url', url)
        formData.append('scrape_website', 'true')
        formData.append('platform', 'website') // Default to website platform
        formData.append('max_pages', '10')

        const response = await axiosPublic.post(
          '/api/chatbot/upload_document',
          formData,
          {
            headers: {
              'X-API-Key': apiKey,
            },
          }
        )

        if (response.data.status === 'success') {
          setWebsites((prev) => [
            ...prev,
            {
              id: response.data.id || Date.now().toString(),
              url: url,
              status: 'Used',
              createdAt: new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              }),
            },
          ])
        }
      }

      setUrlInputs(['', '', '', ''])
      setShowUrlModal(false)
      setCurrentStep('main')
      setShowSuccessMessage(true)
      toast.success('URLs uploaded successfully')

      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    } catch (error: unknown) {
      console.error('Error uploading URLs:', error)
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Authentication failed. Please check your API key.')
        } else if (error.response?.status === 400) {
          toast.error('Invalid URL format. Please check your URLs.')
        } else {
          toast.error('Failed to upload URLs. Please try again.')
        }
      } else {
        toast.error('Failed to upload URLs. Please try again.')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handlePdfSubmit = async () => {
    if (!apiKey) {
      toast.error('API key not available')
      return
    }

    if (selectedFiles.length === 0) return

    setIsUploading(true)
    try {
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await axiosPublic.post(
          '/api/chatbot/upload_document',
          formData,
          {
            headers: {
              'X-API-Key': apiKey,
            },
          }
        )

        if (response.data.status === 'success') {
          setDocuments((prev) => [
            ...prev,
            {
              id: response.data.id || Date.now().toString(),
              name: file.name,
              status: 'Used',
              createdAt: new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              }),
            },
          ])
        }
      }

      setSelectedFiles([])
      setShowPdfModal(false)
      setCurrentStep('main')
      setShowSuccessMessage(true)
      toast.success('Documents uploaded successfully')

      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    } catch (error: unknown) {
      console.error('Error uploading documents:', error)
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Authentication failed. Please check your API key.')
        } else if (error.response?.status === 400) {
          toast.error(
            'Invalid file format. Please upload PDF or CSV files only.'
          )
        } else {
          toast.error('Failed to upload documents. Please try again.')
        }
      } else {
        toast.error('Failed to upload documents. Please try again.')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddUrlInput = () => {
    if (urlInputs.length < 10) {
      setUrlInputs([...urlInputs, ''])
    } else {
      toast.error('Maximum 10 URLs allowed')
    }
  }

  const handleRemoveUrlInput = (index: number) => {
    const newUrls = [...urlInputs]
    newUrls.splice(index, 1)
    setUrlInputs(newUrls)
  }

  const handleActivate = () => {
    setShowActivationModal(true)
  }

  const handleActivationDone = () => {
    navigate('/dashboard/ai-training')
  }

  // Remove website from knowledge base
  const removeWebsiteFromKnowledgeBase = async (websiteId: string) => {
    if (!apiKey) {
      toast.error('API key not available')
      return
    }

    // Add to deleting IDs to show loading state
    setDeletingWebsiteIds((prev) => new Set([...prev, websiteId]))

    try {
      const response = await axiosPublic.delete(
        `/api/chatbot/upload_history/${websiteId}`,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      if (response.data.status === 'success') {
        // Remove the website from the local state immediately
        setWebsites((prev) =>
          prev.filter((website) => website.id !== websiteId)
        )
        toast.success('Website removed from knowledge base')
      }
    } catch (error: unknown) {
      console.error('Error removing website:', error)
      toast.error('Failed to remove website from knowledge base')
    } finally {
      // Remove from deleting IDs
      setDeletingWebsiteIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(websiteId)
        return newSet
      })
    }
  }

  // Remove document from knowledge base
  const removeDocumentFromKnowledgeBase = async (documentId: string) => {
    if (!apiKey) {
      toast.error('API key not available')
      return
    }

    // Add to deleting IDs to show loading state
    setDeletingDocumentIds((prev) => new Set([...prev, documentId]))

    try {
      const response = await axiosPublic.delete(
        `/api/chatbot/upload_history/${documentId}`,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      if (response.data.status === 'success') {
        // Remove the document from the local state immediately
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
        toast.success('Document removed from knowledge base')
      }
    } catch (error: unknown) {
      console.error('Error removing document:', error)
      toast.error('Failed to remove document from knowledge base')
    } finally {
      // Remove from deleting IDs
      setDeletingDocumentIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(documentId)
        return newSet
      })
    }
  }

  // Show loading spinner while settings or history are loading
  if ((isSettingsLoading || isLoadingHistory) && currentStep === 'initial') {
    return (
      <div className='flex h-[calc(100vh-120px)] w-full items-center justify-center'>
        <LoadingSpinner size='lg' text='Loading preview...' />
      </div>
    )
  }

  return (
    <div className='mx-6 mt-4'>
      <ContentSection title='Training your AI'>
        <div className='space-y-6 '>
          <p className='text-muted-foreground'>
            Build a smarter AI by continuously updating its knowledge and
            refining its responses to meet customer expectations.
          </p>

          {/* Initial Page */}
          {currentStep === 'initial' && (
            <div className='relative mt-8 flex flex-col gap-8 rounded-lg border-2 lg:flex-row'>
              {/* Left side content */}
              <div className='z-20 flex-1'>
                <div className='mt-16 flex w-3/4 items-center justify-center '>
                  <div className='space-y-4'>
                    <h2 className='text-2xl font-semibold'>
                      Enhance customer support with an AI assistant,{' '}
                      <span className='text-gray-900'>Bay AI!</span>
                    </h2>
                    <p>
                      Bay AI is a next-generation AI built for customer support,
                      capable of answering up to{' '}
                      <span className='font-semibold'>85%</span> of customer
                      inquiries.
                    </p>

                    <div className='mt-6 space-y-3'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center'>
                          <svg
                            viewBox='0 0 24 24'
                            fill='none'
                            className='h-5 w-5'
                          >
                            <path
                              d='M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        </div>
                        <p>
                          Replies immediately in natural, human-like
                          conversations.
                        </p>
                      </div>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center'>
                          <svg
                            viewBox='0 0 24 24'
                            fill='none'
                            className='h-5 w-5'
                          >
                            <path
                              d='M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        </div>
                        <p>Multilingual conversations.</p>
                      </div>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center'>
                          <svg
                            viewBox='0 0 24 24'
                            fill='none'
                            className='h-5 w-5'
                          >
                            <path
                              d='M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        </div>
                        <p>Powered by various sources: websites, Q&A sets.</p>
                      </div>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center'>
                          <svg
                            viewBox='0 0 24 24'
                            fill='none'
                            className='h-5 w-5'
                          >
                            <path
                              d='M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        </div>
                        <p>
                          Tackle more complicated, specific use-cases with{' '}
                          <span className='font-semibold'>Bay AI</span> tasks.
                        </p>
                      </div>
                    </div>

                    <div className='mt-6'>
                      <Button
                        onClick={handleStartTraining}
                        className='bg-black text-white hover:bg-gray-800'
                      >
                        Start Training
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Chat Preview */}
              <div className='z-20 my-5 w-[320px] md:sticky md:top-6 md:self-start'>
                <div className='relative'>
                  <div className='w-[270px] overflow-hidden rounded-xl border bg-white shadow-lg'>
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
                    <div className='flex max-h-[400px] min-h-[200px] flex-col justify-end overflow-y-auto p-4'>
                      <div className='mb-2 mt-24 max-w-[75%] rounded-lg bg-gray-100 p-3'>
                        <p className='text-sm'>
                          Hi, yes, David have found it, ask our concierge 👋
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

              {/* Brain background image */}
              <div
                className='pointer-events-none absolute bottom-0 right-0 z-10 h-full w-full'
                style={{
                  backgroundImage:
                    "url('https://res.cloudinary.com/dq9yrj7c9/image/upload/v1747287480/d0tfhqfgnhtxfeu7buyr.png')",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right bottom',
                  backgroundSize: 'contain',
                }}
              ></div>
            </div>
          )}

          {/* Main Page (after submission) */}
          {currentStep === 'main' && (
            <>
              <div className='mb-4 flex items-center justify-between'>
                <Button
                  onClick={handleActivate}
                  className='bg-blue-600 px-8 tracking-widest text-white hover:bg-blue-700'
                >
                  Active
                </Button>
              </div>

              {/* Add Content Section */}
              <div className='mb-6 flex gap-4'>
                <Button
                  onClick={handleAddWebsite}
                  variant='outline'
                  className='flex items-center gap-2'
                >
                  <Plus className='h-4 w-4' />
                  Add Website URL
                </Button>
                <Button
                  onClick={handleAddDocument}
                  variant='outline'
                  className='flex items-center gap-2'
                >
                  <Upload className='h-4 w-4' />
                  Upload Documents
                </Button>
              </div>

              {/* Websites List */}
              {(websites.length > 0 || isLoadingWebsites) && (
                <div className='mt-4'>
                  {isLoadingWebsites ? (
                    <div className='overflow-hidden rounded-md border bg-white p-8'>
                      <div className='animate-pulse space-y-4'>
                        <div className='h-6 w-32 rounded bg-gray-200'></div>
                        <div className='space-y-3'>
                          <div className='h-4 rounded bg-gray-200'></div>
                          <div className='h-4 rounded bg-gray-200'></div>
                          <div className='h-4 rounded bg-gray-200'></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className='mb-4 text-lg font-medium'>
                        Websites: {websites.length}
                      </h3>
                      <div className='overflow-hidden rounded-md border bg-white'>
                        <table className='w-full'>
                          <thead>
                            <tr className='border-b bg-gray-50'>
                              <th className='w-8 px-4 py-3 text-left'>
                                <input type='checkbox' className='rounded' />
                              </th>
                              <th className='px-4 py-3 text-left text-sm font-medium'>
                                URL
                              </th>
                              <th className='px-4 py-3 text-left text-sm font-medium'>
                                Status
                              </th>
                              <th className='px-4 py-3 text-left text-sm font-medium'>
                                Created at
                              </th>
                              <th className='px-4 py-3 text-left text-sm font-medium'>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {websites.map((website, index) => (
                              <tr
                                key={website.id}
                                className={
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }
                              >
                                <td className='px-4 py-3'>
                                  <input type='checkbox' className='rounded' />
                                </td>
                                <td className='px-4 py-3 text-sm'>
                                  {website.url}
                                </td>
                                <td className='px-4 py-3'>
                                  <span
                                    className={`inline-block rounded-md px-2 py-1 text-xs ${
                                      website.status === 'Used'
                                        ? 'bg-green-100 text-green-800'
                                        : website.status === 'Failed'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                  >
                                    {website.status}
                                  </span>
                                </td>
                                <td className='px-4 py-3 text-sm'>
                                  {website.createdAt}
                                </td>
                                <td className='px-4 py-3'>
                                  <div className='flex items-center gap-2'>
                                    {website.status === 'Used' && (
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                          removeWebsiteFromKnowledgeBase(
                                            website.id
                                          )
                                        }
                                        disabled={deletingWebsiteIds.has(
                                          website.id
                                        )}
                                        className='text-orange-600 hover:text-orange-700'
                                      >
                                        {deletingWebsiteIds.has(website.id) ? (
                                          <LoadingSpinner
                                            size='xs'
                                            variant='removing'
                                          />
                                        ) : (
                                          <Brain className='h-4 w-4' />
                                        )}
                                      </Button>
                                    )}
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={() =>
                                        removeWebsiteFromKnowledgeBase(
                                          website.id
                                        )
                                      }
                                      disabled={deletingWebsiteIds.has(
                                        website.id
                                      )}
                                      className='text-red-600 hover:text-red-700'
                                    >
                                      {deletingWebsiteIds.has(website.id) ? (
                                        <LoadingSpinner
                                          size='xs'
                                          variant='deleting'
                                        />
                                      ) : (
                                        <Trash2 className='h-4 w-4' />
                                      )}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Documents List */}
              {(documents.length > 0 || isLoadingDocuments) && (
                <div className='mt-6'>
                  {isLoadingDocuments ? (
                    <div className='overflow-hidden rounded-md border bg-white p-8'>
                      <div className='animate-pulse space-y-4'>
                        <div className='h-6 w-32 rounded bg-gray-200'></div>
                        <div className='space-y-3'>
                          <div className='h-4 rounded bg-gray-200'></div>
                          <div className='h-4 rounded bg-gray-200'></div>
                          <div className='h-4 rounded bg-gray-200'></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className='mb-4 text-lg font-medium'>
                        Documents: {documents.length}
                      </h3>
                      <div className='overflow-hidden rounded-md border bg-white'>
                        <table className='w-full'>
                          <thead>
                            <tr className='border-b bg-gray-50'>
                              <th className='w-8 px-4 py-3 text-left'>
                                <input type='checkbox' className='rounded' />
                              </th>
                              <th className='px-4 py-3 text-left text-sm font-medium'>
                                Name
                              </th>
                              <th className='px-4 py-3 text-left text-sm font-medium'>
                                Status
                              </th>
                              <th className='px-4 py-3 text-left text-sm font-medium'>
                                Created at
                              </th>
                              <th className='px-4 py-3 text-left text-sm font-medium'>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {documents.map((doc, index) => (
                              <tr
                                key={doc.id}
                                className={
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }
                              >
                                <td className='px-4 py-3'>
                                  <input type='checkbox' className='rounded' />
                                </td>
                                <td className='px-4 py-3 text-sm'>
                                  <div className='flex items-center gap-2'>
                                    <span>{doc.name}</span>
                                    {doc.name
                                      .toLowerCase()
                                      .endsWith('.pdf') && (
                                      <span className='rounded bg-red-100 px-2 py-1 text-xs text-red-800'>
                                        PDF
                                      </span>
                                    )}
                                    {doc.name
                                      .toLowerCase()
                                      .endsWith('.csv') && (
                                      <span className='rounded bg-green-100 px-2 py-1 text-xs text-green-800'>
                                        CSV
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className='px-4 py-3'>
                                  <span
                                    className={`inline-block rounded-md px-2 py-1 text-xs ${
                                      doc.status === 'Used'
                                        ? 'bg-green-100 text-green-800'
                                        : doc.status === 'Failed'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                  >
                                    {doc.status}
                                  </span>
                                </td>
                                <td className='px-4 py-3 text-sm'>
                                  {doc.createdAt}
                                </td>
                                <td className='px-4 py-3'>
                                  <div className='flex items-center gap-2'>
                                    {doc.status === 'Used' && (
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                          removeDocumentFromKnowledgeBase(
                                            doc.id
                                          )
                                        }
                                        disabled={deletingDocumentIds.has(
                                          doc.id
                                        )}
                                        className='text-orange-600 hover:text-orange-700'
                                      >
                                        {deletingDocumentIds.has(doc.id) ? (
                                          <LoadingSpinner
                                            size='xs'
                                            variant='removing'
                                          />
                                        ) : (
                                          <Brain className='h-4 w-4' />
                                        )}
                                      </Button>
                                    )}
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={() =>
                                        removeDocumentFromKnowledgeBase(doc.id)
                                      }
                                      disabled={deletingDocumentIds.has(doc.id)}
                                      className='text-red-600 hover:text-red-700'
                                    >
                                      {deletingDocumentIds.has(doc.id) ? (
                                        <LoadingSpinner
                                          size='xs'
                                          variant='deleting'
                                        />
                                      ) : (
                                        <Trash2 className='h-4 w-4' />
                                      )}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* URL Input Modal */}
          {showUrlModal && (
            <div className='fixed inset-[-31px] z-50 flex items-center justify-center bg-black bg-opacity-30'>
              <div className='mx-auto w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg'>
                <h3 className='mb-4 text-lg font-medium'>
                  Add website content from URL
                </h3>
                <p className='mb-6 text-sm text-gray-500'>
                  Training your Bay AI from your website and others
                </p>

                <div className='space-y-4'>
                  {urlInputs.map((url, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <Input
                        placeholder='Enter URL of your website e.g http://mypage.com/faq'
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                        className='flex-1'
                        disabled={isUploading}
                      />
                      {urlInputs.length > 1 && (
                        <button
                          onClick={() => handleRemoveUrlInput(index)}
                          className='flex h-8 w-8 flex-shrink-0 items-center justify-center text-gray-400 hover:text-gray-600'
                          disabled={isUploading}
                        >
                          <X className='h-4 w-4' />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={handleAddUrlInput}
                    className='flex items-center gap-2 text-blue-500 hover:text-blue-600'
                    disabled={isUploading || urlInputs.length >= 10}
                  >
                    <Plus className='h-4 w-4' />
                    Add Another URL
                  </button>
                </div>

                <div className='mt-8 flex justify-end gap-3'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setShowUrlModal(false)
                      setUrlInputs([''])
                    }}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUrlSubmit}
                    className='bg-black text-white hover:bg-gray-800'
                    disabled={isUploading}
                  >
                    {isUploading ? <LoadingSpinner size='sm' /> : null}
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Document Upload Modal */}
          {showPdfModal && (
            <div className='fixed inset-[-31px] z-50 flex items-center justify-center bg-black bg-opacity-30'>
              <div className='mx-auto w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg'>
                <h3 className='mb-4 text-lg font-medium'>Upload Documents</h3>
                <p className='mb-6 text-sm text-gray-500'>
                  Train your Bay AI with knowledge from PDF documents and CSV
                  files
                </p>

                <div className='space-y-4'>
                  <div className='rounded-lg border-2 border-dashed border-gray-300 p-6'>
                    <input
                      type='file'
                      accept='.pdf,.csv'
                      multiple
                      onChange={handleFileSelect}
                      className='hidden'
                      id='document-upload'
                      disabled={isUploading}
                    />
                    <label
                      htmlFor='document-upload'
                      className='flex cursor-pointer flex-col items-center justify-center'
                    >
                      <Upload className='mb-2 h-8 w-8 text-gray-400' />
                      <p className='text-sm text-gray-600'>
                        Click to upload or drag and drop
                      </p>
                      <p className='text-xs text-gray-500'>
                        PDF and CSV files only
                      </p>
                    </label>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className='space-y-2'>
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between rounded bg-gray-50 p-2'
                        >
                          <span className='truncate text-sm'>{file.name}</span>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className='text-gray-400 hover:text-gray-600'
                            disabled={isUploading}
                          >
                            <X className='h-4 w-4' />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className='mt-8 flex justify-end gap-3'>
                  <Button
                    variant='outline'
                    onClick={() => setShowPdfModal(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePdfSubmit}
                    className='bg-black text-white hover:bg-gray-800'
                    disabled={isUploading || selectedFiles.length === 0}
                  >
                    {isUploading ? <LoadingSpinner size='sm' /> : null}
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Restriction Modal */}
          {showRestrictionsModal && (
            <div className='fixed inset-[-31px] z-50 flex items-center justify-center bg-black bg-opacity-30'>
              <div className='mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
                <div className='mb-4 flex justify-center'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100'>
                    <AlertTriangle className='h-5 w-5 text-yellow-500' />
                  </div>
                </div>

                <h3 className='mb-4 text-center text-lg font-medium'>
                  Restrictions of Bay AI
                </h3>

                <p className='mb-4 text-sm text-gray-600'>
                  Bay AI is explicitly forbidden from being used in the
                  following areas:
                </p>

                <p className='mb-4 text-sm text-gray-600'>
                  Weapons and Military, Adult Content, Political Campaigns,
                  Gambling and betting.
                </p>

                <p className='mb-4 text-sm text-gray-600'>
                  By clicking the "Accept" button I confirm that I understand
                  and agree to abide by these limitations.
                </p>

                <div className='flex justify-end'>
                  <Button
                    onClick={handleAcceptRestrictions}
                    className='bg-black text-white hover:bg-gray-800'
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Activation Confirmation Modal */}
          {showActivationModal && (
            <div className='fixed inset-[-31px] z-50 flex items-center justify-center bg-black bg-opacity-30'>
              <div className='mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
                <div className='text-center'>
                  <h2 className='mb-6 text-2xl font-bold'>Bay AI</h2>

                  <div className='flex justify-center'>
                    <div className='mb-6 flex gap-1'>
                      {Array(20)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className='h-2 w-2 rounded-full bg-gray-200'
                          ></div>
                        ))}
                    </div>
                  </div>

                  <h3 className='mb-4 text-lg font-medium'>
                    Bay AI is active now
                  </h3>

                  <p className='mb-6 text-sm text-gray-600'>
                    The AI support agent can now answer visitor questions using
                    knowledge you provided.
                  </p>

                  <h4 className='mb-2 text-left font-medium'>What's next:</h4>

                  <div className='mb-6 space-y-4 text-left'>
                    <div className='flex items-center gap-2'>
                      <div className='flex h-5 w-5 items-center justify-center rounded-full border border-gray-300'>
                        <Check className='h-3 w-3 text-gray-500' />
                      </div>
                      <p className='text-sm'>
                        Control Bay AI conversations in the Inbox/operator view
                      </p>
                    </div>

                    <div className='flex items-center gap-2'>
                      <div className='flex h-5 w-5 items-center justify-center rounded-full border border-gray-300'>
                        <Check className='h-3 w-3 text-gray-500' />
                      </div>
                      <p className='text-sm'>
                        Monitor and analyze Bay AI performance
                      </p>
                    </div>

                    <div className='flex items-center gap-2'>
                      <div className='flex h-5 w-5 items-center justify-center rounded-full border border-gray-300'>
                        <Check className='h-3 w-3 text-gray-500' />
                      </div>
                      <p className='text-sm'>
                        Continue to enhance Lynn's knowledge to improve its
                        responses
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleActivationDone}
                    className='w-full bg-black text-white hover:bg-gray-800'
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {showSuccessMessage && (
            <div className='fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md border border-green-200 bg-green-100 px-4 py-3 text-green-800 shadow-md'>
              <Check className='h-4 w-5' />
              <span>Content added successfully!</span>
            </div>
          )}
        </div>
      </ContentSection>
    </div>
  )
}
