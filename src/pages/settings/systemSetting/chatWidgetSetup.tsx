import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useApiKey } from '@/hooks/useApiKey'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function ChatWidgetSetup() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedColor, setSelectedColor] = useState('black')
  const [aiBehavior, setAiBehavior] = useState('')
  const [botBehavior, setBotBehavior] = useState('2')
  const [leadCapture, setLeadCapture] = useState(true)
  const [name, setName] = useState('Byewind')
  const [isUploading, setIsUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [autoOpen, setAutoOpen] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoAutoplay, setVideoAutoplay] = useState(true)
  const [videoDuration, setVideoDuration] = useState(10)
  // const [currentVideo, setCurrentVideo] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoFileInputRef = useRef<HTMLInputElement>(null)
  const { apiKey } = useApiKey()
  const { toast } = useToast()

  // Add state to track initial values
  const [initialValues, setInitialValues] = useState({
    name: '',
    selectedColor: '',
    leadCapture: true,
    botBehavior: '',
    avatarUrl: '',
    is_bot_connected: false,
    auto_open: false,
  })

  // Add state to track if any changes were made
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      if (!apiKey) return
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/chatbot/settings`,
          {
            headers: {
              'X-API-Key': apiKey,
            },
          }
        )

        if (response.data.status === 'success') {
          const settings = response.data.settings
          setName(settings.name)
          setSelectedColor(settings.selectedColor)
          setLeadCapture(settings.leadCapture)
          setBotBehavior(settings.botBehavior)
          if (settings.ai_behavior) {
            setAiBehavior(settings.ai_behavior)
          }
          if (settings.avatarUrl) {
            setAvatarUrl(settings.avatarUrl)
          }
          if (settings.auto_open !== undefined) {
            setAutoOpen(settings.auto_open)
          }
          if (settings.video_url) {
            setVideoUrl(settings.video_url)
          }
          if (settings.video_autoplay !== undefined) {
            setVideoAutoplay(settings.video_autoplay)
          }
          if (settings.video_duration) {
            setVideoDuration(settings.video_duration)
          }
          if (settings.video_filename) {
            // setCurrentVideo(settings.video_filename)
          }

          // Store initial values
          setInitialValues({
            name: settings.name,
            selectedColor: settings.selectedColor,
            leadCapture: settings.leadCapture,
            botBehavior: settings.botBehavior,
            avatarUrl: settings.avatarUrl || '',
            is_bot_connected: settings.is_bot_connected,
            auto_open: settings.auto_open || false,
          })
        }
      } catch (error) {
        console.error('Load settings error:', error)
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [apiKey, toast])

  // Add effect to check for changes
  useEffect(() => {
    const currentValues = {
      name,
      selectedColor,
      leadCapture,
      botBehavior,
      avatarUrl,
      is_bot_connected: false,
      auto_open: autoOpen,
    }

    const hasAnyChanges = Object.keys(initialValues).some((key) => {
      return (
        initialValues[key as keyof typeof initialValues] !==
        currentValues[key as keyof typeof currentValues]
      )
    })

    setHasChanges(hasAnyChanges)
  }, [
    name,
    selectedColor,
    leadCapture,
    botBehavior,
    avatarUrl,
    autoOpen,
    initialValues,
  ])

  const colorOptions = [
    { value: 'black', bgClass: 'bg-black' },
    { value: 'red', bgClass: 'bg-red-500' },
    { value: 'orange', bgClass: 'bg-orange-500' },
    { value: 'blue', bgClass: 'bg-blue-500' },
    { value: 'pink', bgClass: 'bg-pink-500' },
  ]

  const botBehaviorOptions = [
    { value: '2', label: '2 Sec' },
    { value: '5', label: '5 Sec' },
    { value: '10', label: '10 Sec' },
    { value: '15', label: '15 Sec' },
  ]

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!apiKey) return

    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log(
        'Sending request to:',
        `${import.meta.env.VITE_API_URL}/api/upload/upload-avatar`
      )
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/upload/upload-avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-API-Key': apiKey,
          },
        }
      )

      console.log('Upload response:', response.data)

      if (response.data.status === 'success') {
        // Use the full URL directly from the server response
        setAvatarUrl(response.data.url)

        // Save the updated settings with new avatar URL
        const settingsResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/chatbot/save-settings`,
          {
            name,
            selectedColor,
            leadCapture,
            botBehavior,
            avatarUrl: response.data.url,
            auto_open: autoOpen,
            is_bot_connected: false,
          },
          {
            headers: {
              'X-API-Key': apiKey,
            },
          }
        )

        if (settingsResponse.data.status === 'success') {
          // Invalidate and refetch chatWidgetSettings query
          await queryClient.invalidateQueries({
            queryKey: ['chatWidgetSettings'],
          })

          // Update initial values
          setInitialValues((prev) => ({
            ...prev,
            avatarUrl: response.data.url,
            is_bot_connected: false,
            auto_open: autoOpen,
          }))
        }

        toast({
          title: 'Success',
          description: 'Avatar uploaded successfully',
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      // Log more detailed error information
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data)
        console.error('Response status:', error.response?.status)
        console.error('Response headers:', error.response?.headers)
      }
      toast({
        title: 'Error',
        description: 'Failed to upload avatar',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleVideoFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please select a video file',
        variant: 'destructive',
      })
    }
  }

  const handleVideoUpload = async () => {
    if (!videoFile || !apiKey) {
      toast({
        title: 'No file selected',
        description: 'Please select a video file to upload',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', videoFile)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chatbot/upload-video`,
        formData,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      const data = response.data

      if (data.status === 'success') {
        setVideoUrl(data.video_url)
        // setCurrentVideo(data.filename)
        setVideoFile(null)
        toast({
          title: 'Video uploaded successfully',
          description: 'Your video is now ready for the chat widget',
        })
      } else {
        throw new Error(data.message || 'Upload failed')
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description:
          error instanceof Error ? error.message : 'Failed to upload video',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleVideoDelete = async () => {
    if (!apiKey) return

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/chatbot/video`,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      const data = response.data

      if (data.status === 'success') {
        setVideoUrl('')
        // setCurrentVideo('')
        toast({
          title: 'Video deleted',
          description: 'Video has been removed from the chat widget',
        })
      }
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete video',
        variant: 'destructive',
      })
    }
  }

  const handleVideoSettingsSave = async () => {
    if (!apiKey) return

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/chatbot/video-settings`,
        {
          autoplay: videoAutoplay,
          duration: videoDuration,
        },
        {
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = response.data

      if (data.status === 'success') {
        toast({
          title: 'Video settings saved',
          description: 'Video settings have been updated',
        })
      }
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save video settings',
        variant: 'destructive',
      })
    }
  }

  const handleNext = async () => {
    // If no changes, navigate directly without making API call
    if (!hasChanges) {
      navigate('/dashboard/chat-widget-install')
      return
    }
    if (!apiKey) return

    try {
      // Save settings to MongoDB only if there are changes
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chatbot/save-settings`,
        {
          name,
          selectedColor,
          leadCapture,
          botBehavior,
          avatarUrl,
          auto_open: autoOpen,
          ai_behavior: aiBehavior,
          video_url: videoUrl,
          video_autoplay: videoAutoplay,
          video_duration: videoDuration,
          is_bot_connected: false,
        },
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      if (response.data.status === 'success') {
        // Invalidate and refetch chatWidgetSettings query
        await queryClient.invalidateQueries({
          queryKey: ['chatWidgetSettings'],
        })

        // Update the initial values to match current values
        setInitialValues({
          name,
          selectedColor,
          leadCapture,
          botBehavior,
          avatarUrl,
          is_bot_connected: false,
          auto_open: autoOpen,
        })

        // Navigate to the installation page
        navigate('/dashboard/chat-widget-install')
      }
    } catch (error) {
      console.error('Save settings error:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    }
  }

  // Update loading state to use LoadingSpinner
  if (isLoading) {
    return (
      <div className='flex h-[calc(100vh-120px)] w-full items-center justify-center'>
        <LoadingSpinner size='lg' text='Loading settings...' />
      </div>
    )
  }

  return (
    <div className='flex h-[calc(100vh-120px)] w-full flex-col'>
      <div className='flex-1 space-y-6 overflow-y-auto'>
        {/* Chat Widget Setup Section */}
        <div>
          <div>
            <h3 className='text-xl font-medium'>Set up the chat widget</h3>
            <p className='mb-6 mt-1  text-sm text-muted-foreground'>
              Set up a chat widget to streamline communication, improve customer
              satisfaction, and drive conversions with real-time assistance.
            </p>
          </div>
          <div className='flex gap-8'>
            {/* Left side - Configuration */}
            <div className='flex-1'>
              <Card className='rounded-lg border p-6'>
                <div className='space-y-6'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center'>
                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white'>
                        1
                      </div>
                      <span className='ml-2 text-sm text-gray-500'>—</span>
                      <div className='ml-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-400'>
                        2
                      </div>
                    </div>
                    <h4 className='text-lg font-medium'>
                      Adjust appearance to suit your website
                    </h4>
                    <h3 className='text-xl font-bold'>
                      Configure your chat widget
                    </h3>
                  </div>

                  {/* Name Input */}
                  <div className='space-y-2'>
                    <label htmlFor='name' className='block text-sm font-medium'>
                      Your Name
                    </label>
                    <Input
                      id='name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className='w-full'
                    />
                  </div>

                  {/* Color Scheme & Avatar */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium'>
                      Color Scheme & Avatar
                    </label>
                    <div className='mt-2 flex items-center justify-between'>
                      <div className='flex gap-2'>
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setSelectedColor(color.value)}
                            className={`h-8 w-8 rounded-full ${color.bgClass} flex items-center justify-center ${
                              selectedColor === color.value
                                ? 'ring-2 ring-black ring-offset-2'
                                : ''
                            }`}
                          >
                            {selectedColor === color.value && (
                              <svg
                                width='12'
                                height='12'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M20 6L9 17L4 12'
                                  stroke='white'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                              </svg>
                            )}
                          </button>
                        ))}
                        <Button
                          variant='outline'
                          className='text-sm'
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                      <input
                        type='file'
                        ref={fileInputRef}
                        className='hidden'
                        accept='image/*'
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>

                  {/* Lead Capture */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium'>
                      Lead Capture
                    </label>
                    <div className='mt-2 flex items-center'>
                      <div
                        onClick={() => setLeadCapture(!leadCapture)}
                        className={`relative h-6 w-12 cursor-pointer rounded-full transition-colors ${leadCapture ? 'bg-blue-500' : 'bg-gray-300'}`}
                      >
                        <div
                          className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition-transform ${leadCapture ? 'translate-x-6' : 'translate-x-1'}`}
                        ></div>
                      </div>
                      <span className='ml-2 text-sm'>On</span>
                    </div>
                  </div>

                  {/* Auto Open Widget */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium'>
                      Auto Open Widget
                    </label>
                    <div className='mt-2 flex items-center'>
                      <div
                        onClick={() => setAutoOpen(!autoOpen)}
                        className={`relative h-6 w-12 cursor-pointer rounded-full transition-colors ${autoOpen ? 'bg-blue-500' : 'bg-gray-300'}`}
                      >
                        <div
                          className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition-transform ${autoOpen ? 'translate-x-6' : 'translate-x-1'}`}
                        ></div>
                      </div>
                      <span className='ml-2 text-sm'>
                        {autoOpen ? 'Auto-open' : 'Click to open'}
                      </span>
                    </div>
                    <p className='text-xs text-gray-500'>
                      {autoOpen
                        ? 'Widget will automatically open when users visit your website'
                        : 'Users need to click the chat button to open the widget'}
                    </p>
                  </div>

                  {/* Video Upload */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium'>
                      Welcome Video
                    </label>
                    <p className='text-xs text-gray-500'>
                      Upload a video that will play when users first open the
                      chat widget
                    </p>
                    <div className='mt-2 space-y-3'>
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          className='text-sm'
                          onClick={() => videoFileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? 'Uploading...' : 'Select Video'}
                        </Button>
                        {videoFile && (
                          <Button
                            onClick={handleVideoUpload}
                            disabled={isUploading}
                            className='text-sm'
                          >
                            {isUploading ? 'Uploading...' : 'Upload Video'}
                          </Button>
                        )}
                        {videoUrl && (
                          <Button
                            variant='destructive'
                            onClick={handleVideoDelete}
                            className='text-sm'
                          >
                            Delete Video
                          </Button>
                        )}
                      </div>
                      <input
                        type='file'
                        ref={videoFileInputRef}
                        className='hidden'
                        accept='video/*'
                        onChange={handleVideoFileChange}
                      />
                      {videoFile && (
                        <p className='text-xs text-blue-600'>
                          Selected: {videoFile.name}
                        </p>
                      )}
                      {videoUrl && (
                        <div className='mt-3 rounded-lg bg-gray-50 p-3'>
                          <h4 className='mb-2 text-sm font-medium'>
                            Current Video
                          </h4>
                          <video
                            controls
                            className='w-full max-w-xs rounded'
                            src={videoUrl}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Settings */}
                  {videoUrl && (
                    <div className='space-y-2'>
                      <label className='block text-sm font-medium'>
                        Video Settings
                      </label>
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm'>Auto-play Video</p>
                            <p className='text-xs text-gray-500'>
                              Automatically play video when widget opens
                            </p>
                          </div>
                          <div
                            onClick={() => setVideoAutoplay(!videoAutoplay)}
                            className={`relative h-6 w-12 cursor-pointer rounded-full transition-colors ${videoAutoplay ? 'bg-blue-500' : 'bg-gray-300'}`}
                          >
                            <div
                              className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition-transform ${videoAutoplay ? 'translate-x-6' : 'translate-x-1'}`}
                            ></div>
                          </div>
                        </div>
                        <div className='space-y-2'>
                          <label className='text-sm'>
                            Video Duration (seconds)
                          </label>
                          <div className='flex items-center gap-3'>
                            <input
                              type='range'
                              min='5'
                              max='30'
                              value={videoDuration}
                              onChange={(e) =>
                                setVideoDuration(Number(e.target.value))
                              }
                              className='flex-1'
                            />
                            <span className='w-8 text-sm font-medium'>
                              {videoDuration}s
                            </span>
                          </div>
                          <p className='text-xs text-gray-500'>
                            How long the video will play before stopping
                          </p>
                        </div>
                        <Button
                          onClick={handleVideoSettingsSave}
                          className='text-sm'
                          size='sm'
                        >
                          Save Video Settings
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Bot Behavior */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium'>
                      Bot Response Delay
                    </label>
                    <div className='flex gap-2'>
                      {botBehaviorOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setBotBehavior(option.value)}
                          className={`rounded-md px-3 py-1 text-sm ${
                            botBehavior === option.value
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
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
      </div>

      {/* Bottom navigation */}
      <div className='mt-4 flex justify-between border-t py-4'>
        <a href='#' className='text-sm text-blue-500 hover:underline'>
          Learn more about account setting
        </a>
        <Button
          variant='default'
          className='bg-black text-white dark:bg-slate-950'
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
