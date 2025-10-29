import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import ColorPicker from '@/components/shared/ColorPicker'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useApiKey } from '@/hooks/useApiKey'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const colorOptions = [
  { bgClass: 'bg-black', value: '#000000' },
  { bgClass: 'bg-red-500', value: '#ef4444' },
  { bgClass: 'bg-orange-500', value: '#f97316' },
  { bgClass: 'bg-blue-500', value: '#3b82f6' },
  { bgClass: 'bg-pink-500', value: '#ec4899' },
]

export function ChatWidgetCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [customColor, setCustomColor] = useState('#000000')
  const [isCustomColor, setIsCustomColor] = useState(false)
  const [displayColorPicker, setDisplayColorPicker] = useState(false)
  const [aiBehavior, setAiBehavior] = useState('')
  const [botBehavior, setBotBehavior] = useState('2')
  const [leadCapture, setLeadCapture] = useState(true)
  const [name, setName] = useState('Byewind')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [autoOpen, setAutoOpen] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoAutoplay, setVideoAutoplay] = useState(true)
  const [videoDuration, setVideoDuration] = useState(10)
  const [fontName, setFontName] = useState('Arial')
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [aiPersonaTags, setAiPersonaTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  // const [currentVideo, setCurrentVideo] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoFileInputRef = useRef<HTMLInputElement>(null)
  const { apiKey } = useApiKey()
  const { toast } = useToast()

  // Removed initialValues; not needed with save-on-Next

  // Removed hasChanges; Next will always save then navigate

  // Load video settings separately
  const loadVideoSettings = useCallback(async () => {
    if (!apiKey) return
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/chatbot/video-settings`,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      if (response.data.status === 'success') {
        const videoSettings = response.data.settings
        setVideoEnabled(
          videoSettings.enabled !== undefined ? videoSettings.enabled : false
        )
        setVideoUrl(videoSettings.video_url || '')
        setVideoAutoplay(
          videoSettings.autoplay !== undefined ? videoSettings.autoplay : true
        )
        setVideoDuration(videoSettings.duration || 10)

        // If video_url exists, ensure video is enabled
        if (videoSettings.video_url) {
          setVideoEnabled(true)
        }
      }
    } catch (error) {
      console.error('Load video settings error:', error)
    }
  }, [apiKey])

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
          setName(settings.name || 'Bay AI')
          setSelectedColor(settings.selectedColor || '#000000')
          setLeadCapture(
            settings.leadCapture !== undefined ? settings.leadCapture : true
          )
          setBotBehavior(settings.botBehavior || '2')
          if (settings.ai_behavior) {
            setAiBehavior(settings.ai_behavior)
          }
          if (settings.avatarUrl) {
            setAvatarUrl(settings.avatarUrl)
          }
          if (settings.auto_open !== undefined) {
            setAutoOpen(settings.auto_open)
          }

          // Font name
          if (settings.font_name) {
            setFontName(settings.font_name)
          }

          // Sound notifications
          if (
            settings.sound_notifications &&
            typeof settings.sound_notifications.enabled === 'boolean'
          ) {
            setSoundEnabled(settings.sound_notifications.enabled)
          }

          // Persona tags
          if (Array.isArray(settings.ai_persona_tags)) {
            setAiPersonaTags(settings.ai_persona_tags)
          }

          // Load video settings from the main settings if they exist
          if (settings.intro_video) {
            setVideoEnabled(
              settings.intro_video.enabled !== undefined
                ? settings.intro_video.enabled
                : false
            )
            setVideoUrl(settings.intro_video.video_url || '')
            setVideoAutoplay(
              settings.intro_video.autoplay !== undefined
                ? settings.intro_video.autoplay
                : true
            )
            setVideoDuration(settings.intro_video.duration || 10)

            // If video_url exists, ensure video is enabled
            if (settings.intro_video.video_url) {
              setVideoEnabled(true)
            }
          }

          // Handle preset vs custom color using hex values
          if (settings.selectedColor) {
            setSelectedColor(settings.selectedColor)
            const preset = colorOptions.find(
              (c) => c.value === settings.selectedColor
            )
            if (preset) {
              setIsCustomColor(false)
              setCustomColor(preset.value)
            } else {
              setIsCustomColor(true)
              setCustomColor(settings.selectedColor)
            }
          } else {
            setSelectedColor('#000000')
            setIsCustomColor(false)
            setCustomColor('#000000')
          }

          // No initial values tracking; saving occurs on Next
        }

        // Load video settings separately
        await loadVideoSettings()
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
  }, [apiKey, toast, loadVideoSettings])

  // Removed change-tracking effect; we always save on Next

  const handleColorSelect = (colorValue: string, hexValue: string) => {
    setSelectedColor(colorValue)
    setIsCustomColor(false)
    setCustomColor(hexValue)
  }

  const handleSaveSettings = async (overrides?: {
    name?: string
    selectedColor?: string
    customColor?: string
    isCustomColor?: boolean
    leadCapture?: boolean
    botBehavior?: string
    avatarUrl?: string
    autoOpen?: boolean
    aiBehavior?: string
    fontName?: string
    soundEnabled?: boolean
    aiPersonaTags?: string[]
  }) => {
    if (!apiKey) return

    setIsSaving(true)
    const settingsToSave: Record<string, unknown> = {
      name: overrides?.name ?? name,
      selectedColor:
        (overrides?.isCustomColor ?? isCustomColor)
          ? (overrides?.customColor ?? customColor)
          : (overrides?.selectedColor ?? selectedColor),
      leadCapture: overrides?.leadCapture ?? leadCapture,
      botBehavior: overrides?.botBehavior ?? botBehavior,
      avatarUrl: overrides?.avatarUrl ?? avatarUrl,
      auto_open_widget: overrides?.autoOpen ?? autoOpen,
      auto_open: overrides?.autoOpen ?? autoOpen,
      ai_behavior: overrides?.aiBehavior ?? aiBehavior,
      is_bot_connected: false,
    }

    settingsToSave.font_name = overrides?.fontName ?? fontName

    if (typeof (overrides?.soundEnabled ?? soundEnabled) === 'boolean') {
      settingsToSave.sound_notifications = {
        enabled: overrides?.soundEnabled ?? soundEnabled,
        welcome_sound: { enabled: true, play_on_first_load: true },
        message_sound: { enabled: true, play_on_send: true },
      }
    }

    const personaTagsToSave = overrides?.aiPersonaTags ?? aiPersonaTags
    if (Array.isArray(personaTagsToSave)) {
      settingsToSave.ai_persona_tags = personaTagsToSave
      if (personaTagsToSave.length > 0) {
        const descriptor = personaTagsToSave.join(', ')
        settingsToSave.ai_behavior = `You are a ${descriptor} AI assistant. Focus on being ${descriptor.toLowerCase()} while providing accurate, clear answers.`
      }
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chatbot/save-settings`,
        settingsToSave,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      if (response.data.status === 'success') {
        await queryClient.invalidateQueries({
          queryKey: ['chatWidgetSettings'],
        })

        toast({
          title: 'Success',
          description: 'Settings saved successfully',
        })
      }
    } catch (error) {
      console.error('Save settings error:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCustomColorPick = (color: string) => {
    setCustomColor(color)
    setSelectedColor('custom')
    setIsCustomColor(true)
  }

  const getCurrentColor = () => {
    if (isCustomColor) {
      return customColor
    }
    const colorOption = colorOptions.find((c) => c.value === selectedColor)
    return colorOption?.value || '#000000'
  }

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

    // Log file details for debugging
    const fileSizeKB = (file.size / 1024).toFixed(2)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)

    console.log('=== FILE UPLOAD STARTED ===')
    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeKB: `${fileSizeKB} KB`,
      sizeMB: `${fileSizeMB} MB`,
    })

    // Validate file type - Only PNG and JPG allowed
    const allowedTypes = ['image/jpeg', 'image/png']
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['jpg', 'jpeg', 'png']

    console.log('Validation check:', {
      fileType: file.type,
      fileExtension: fileExtension,
      typeAllowed: allowedTypes.includes(file.type),
      extensionAllowed: allowedExtensions.includes(fileExtension || ''),
    })

    if (
      !allowedTypes.includes(file.type) ||
      !allowedExtensions.includes(fileExtension || '')
    ) {
      console.error('❌ File type validation FAILED')
      toast({
        title: 'Invalid File Type',
        description: `Only PNG and JPG images are allowed. Your file type: ${file.type}, extension: .${fileExtension}`,
        variant: 'destructive',
      })
      return
    }

    console.log('✅ File type validation PASSED')

    // Validate file size (max 1MB)
    const maxSize = 1 * 1024 * 1024 // 1MB in bytes
    if (file.size > maxSize) {
      console.error('❌ File size validation FAILED')
      toast({
        title: 'File Too Large',
        description: `File size is ${fileSizeMB}MB. Maximum allowed size is 1MB`,
        variant: 'destructive',
      })
      return
    }

    console.log('✅ File size validation PASSED')
    console.log(
      '✅ All client-side validations PASSED - Uploading to server...'
    )

    setIsUploadingAvatar(true)
    const formData = new FormData()
    // Try 'file' first (original field name)
    formData.append('file', file)

    try {
      console.log(
        'Sending request to:',
        `${import.meta.env.VITE_API_URL}/api/upload/upload-avatar`
      )
      console.log('FormData field name:', 'file')
      console.log('API Key present:', !!apiKey)
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`,
      })

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/upload/upload-avatar`,
        formData,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      console.log('✅ SERVER RESPONSE SUCCESS:', response.status)
      console.log('Response data:', response.data)

      if (response.data && response.data.status === 'success') {
        console.log(
          '✅ Avatar URL received:',
          response.data.url || response.data.avatar_url
        )
        // Use the full URL directly from the server response
        const avatarImageUrl = response.data.url || response.data.avatar_url
        setAvatarUrl(avatarImageUrl)

        // Save the updated settings with new avatar URL
        const settingsResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/chatbot/save-settings`,
          {
            name,
            selectedColor: isCustomColor ? customColor : selectedColor,
            leadCapture,
            botBehavior,
            avatarUrl: avatarImageUrl,
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
        }

        toast({
          title: 'Success',
          description: 'Avatar uploaded successfully',
        })
      } else {
        throw new Error(response.data?.message || 'Upload failed')
      }
    } catch (error) {
      console.error('❌ ========== UPLOAD ERROR ==========')
      console.error('Error:', error)
      let errorMessage = 'Failed to upload avatar'

      // Log more detailed error information
      if (axios.isAxiosError(error)) {
        console.error('❌ Status Code:', error.response?.status)
        console.error('❌ Response data:', error.response?.data)
        console.error('❌ Response headers:', error.response?.headers)

        // Handle specific status codes
        if (error.response?.status === 422) {
          // Validation error from server
          const responseData = error.response?.data
          const validationErrors = error.response?.data?.errors
          const serverMessage = error.response?.data?.message

          console.error('❌ 422 VALIDATION ERROR FROM SERVER')
          console.error(
            '❌ FULL Response data:',
            JSON.stringify(responseData, null, 2)
          )
          console.error('❌ Validation errors:', validationErrors)
          console.error('❌ Server message:', serverMessage)
          console.error('❌ This means SERVER rejected the file (not client)')

          // Log all keys in response data
          if (responseData) {
            console.error('❌ Response data keys:', Object.keys(responseData))
          }

          if (validationErrors) {
            // Join all validation errors from server
            const errorMessages = Object.values(validationErrors).flat()
            errorMessage =
              '❌ Server Validation Failed: ' + errorMessages.join('. ')

            console.error('❌ Exact server errors:', errorMessages)
            // Add requirements hint
            errorMessage +=
              '\n\n✓ Your file: ' +
              file.name +
              ' (' +
              fileSizeKB +
              'KB, ' +
              file.type +
              ')'
            errorMessage +=
              '\n✓ Requirements: PNG or JPG, max 1MB, field name "file"'
          } else if (serverMessage) {
            errorMessage = '❌ Server says: ' + serverMessage

            console.error('❌ Checking for field mismatch...')
            // Check if it mentions field requirements
            if (
              serverMessage.toLowerCase().includes('field') ||
              serverMessage.toLowerCase().includes('required') ||
              serverMessage.toLowerCase().includes('avatar')
            ) {
              errorMessage +=
                '\n\n💡 The server may expect a different field name (currently using "file")'
              console.error(
                '❌ FIELD NAME MISMATCH - Server might expect "avatar" instead of "file"'
              )
            }
          } else {
            errorMessage = '❌ Upload failed without specific error message'
            errorMessage += '\n\n✓ Your file passed client validation'
            errorMessage += '\n✓ File: ' + file.name + ' (' + fileSizeKB + 'KB)'
            errorMessage += '\n✓ Server rejected it for unknown reason'
            console.error(
              '❌ Server rejected but gave no specific error message'
            )
          }
        } else if (error.response?.status === 401) {
          errorMessage =
            'Authentication failed. Please login again or check your API key.'
        } else if (error.response?.status === 413) {
          errorMessage = 'File is too large. Maximum allowed size is 1MB.'
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error.message) {
          errorMessage = error.message
        }
      }

      console.error('❌ ========== ERROR SUMMARY ==========')
      console.error('❌ Final error message:', errorMessage)
      console.error('❌ Check the error details above for more info')
      console.error('❌ ===================================')

      toast({
        title: 'Upload Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsUploadingAvatar(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      console.log('=== FILE UPLOAD ENDED ===')
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

    setIsUploadingVideo(true)
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
        setVideoEnabled(true) // Auto-enable video when uploaded
        setVideoFile(null)
        // Reload video settings to get updated info
        await loadVideoSettings()
        toast({
          title: 'Video uploaded successfully',
          description: 'Your intro video is now ready for the chat widget',
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
      setIsUploadingVideo(false)
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
        setVideoEnabled(false)
        // Reload video settings to get updated info
        await loadVideoSettings()
        toast({
          title: 'Video deleted',
          description: 'Intro video has been removed from the chat widget',
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
          enabled: videoEnabled,
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
          description: 'Intro video settings have been updated successfully',
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
    if (!apiKey) return
    await handleSaveSettings()
    navigate('/dashboard/chat-widget-install')
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

                  {/* Chatbot Header Title */}
                  <div className='space-y-2'>
                    <label htmlFor='name' className='block text-sm font-medium'>
                      Chatbot Title
                    </label>
                    <div className='flex gap-2'>
                      <Input
                        id='name'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className='w-[500px]'
                      />
                      {/* Update button removed; saving will occur on Next */}
                    </div>
                  </div>

                  {/* Color Scheme */}
                  <div className='space-y-3'>
                    <label className='block text-sm font-medium'>
                      Widget Color Theme
                    </label>
                    <div className='space-y-3'>
                      {/* Preset Colors */}
                      <div className='relative'>
                        <p className='mb-2 text-xs text-gray-500'>
                          Choose a color for your widget
                        </p>
                        <div className='flex items-center gap-2'>
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              onClick={() =>
                                handleColorSelect(color.value, color.value)
                              }
                              className={`h-10 w-10 rounded-full ${color.bgClass} flex items-center justify-center transition-all hover:scale-110 ${
                                selectedColor === color.value && !isCustomColor
                                  ? 'ring-2 ring-black ring-offset-2'
                                  : ''
                              }`}
                              title={color.value}
                            >
                              {selectedColor === color.value &&
                                !isCustomColor && (
                                  <svg
                                    width='16'
                                    height='16'
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
                          {/* Custom Color Picker Button */}
                          <div className='relative'>
                            <button
                              onClick={() => {
                                setIsCustomColor(true)
                                setDisplayColorPicker(true)
                              }}
                              className={`relative h-10 w-10 rounded-full border-2 border-dashed transition-all hover:scale-110 ${
                                isCustomColor
                                  ? 'border-gray-300 ring-2 ring-black ring-offset-2'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{
                                backgroundColor: isCustomColor
                                  ? customColor
                                  : 'transparent',
                              }}
                              title='Pick custom color'
                            >
                              {!isCustomColor && (
                                <svg
                                  className='absolute inset-0 m-auto h-5 w-5 text-gray-400'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 4v16m8-8H4'
                                  />
                                </svg>
                              )}
                              {isCustomColor && (
                                <svg
                                  width='16'
                                  height='16'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='absolute inset-0 m-auto'
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

                            <ColorPicker
                              color={customColor}
                              onChange={(color) => {
                                setCustomColor(color)
                                setIsCustomColor(true)
                                // Automatically save to server when color changes
                                handleCustomColorPick(color)
                              }}
                              onClose={() => setDisplayColorPicker(false)}
                              displayColorPicker={displayColorPicker}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Upload */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium'>
                      Chat Avatar
                    </label>
                    <p className='text-xs text-gray-500'>
                      Upload a custom avatar (PNG or JPG, max 1MB)
                    </p>
                    <div className='flex items-center gap-3'>
                      {avatarUrl && (
                        <div className='h-12 w-12 overflow-hidden rounded-full border-2 border-gray-200'>
                          <img
                            src={avatarUrl}
                            alt='Avatar Preview'
                            className='h-full w-full object-cover'
                          />
                        </div>
                      )}
                      <Button
                        variant='outline'
                        className='text-sm'
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                      >
                        {isUploadingAvatar ? (
                          <>
                            <svg
                              className='mr-2 h-4 w-4 animate-spin'
                              fill='none'
                              viewBox='0 0 24 24'
                            >
                              <circle
                                className='opacity-25'
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='4'
                              />
                              <path
                                className='opacity-75'
                                fill='currentColor'
                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                              />
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg
                              className='mr-2 h-4 w-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                              />
                            </svg>
                            {avatarUrl ? 'Change Avatar' : 'Upload Avatar'}
                          </>
                        )}
                      </Button>
                      <input
                        type='file'
                        ref={fileInputRef}
                        className='hidden'
                        accept='image/png, image/jpeg, image/jpg, .png, .jpg, .jpeg'
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
                        onClick={() => {
                          setLeadCapture(!leadCapture)
                        }}
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
                        onClick={() => {
                          setAutoOpen(!autoOpen)
                        }}
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

                  {/* Sound Notifications Toggle */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium'>
                      Sound Notifications
                    </label>
                    <div className='mt-2 flex items-center'>
                      <div
                        onClick={() => {
                          const newValue = !soundEnabled
                          setSoundEnabled(newValue)
                        }}
                        className={`relative h-6 w-12 cursor-pointer rounded-full transition-colors ${soundEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                      >
                        <div
                          className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                        ></div>
                      </div>
                      <span className='ml-2 text-sm'>
                        {soundEnabled ? 'On' : 'Off'}
                      </span>
                    </div>
                    <p className='text-xs text-gray-500'>
                      Play a simple tone on first load and on message send.
                    </p>
                  </div>

                  {/* Assistant Persona (multi-select) */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium'>
                      Assistant Persona
                    </label>
                    <div className='flex flex-wrap gap-2 '>
                      {[
                        'Helpful',
                        'Professional',
                        'Warm',
                        'Conversational',
                        'Concise',
                        'Direct',
                        'Expert',
                        'Formal',
                        'Clinical',
                        'Reassuring',
                      ].map((tag) => {
                        const checked = aiPersonaTags.includes(tag)
                        return (
                          <label
                            key={tag}
                            className='flex cursor-pointer items-center gap-2 rounded border px-2 py-1 text-sm'
                          >
                            <input
                              type='checkbox'
                              checked={checked}
                              onChange={(e) => {
                                const isChecked = e.target.checked
                                setAiPersonaTags((prev) => {
                                  if (isChecked)
                                    return Array.from(new Set([...prev, tag]))
                                  return prev.filter((t) => t !== tag)
                                })
                              }}
                            />
                            <span>{tag}</span>
                          </label>
                        )
                      })}
                    </div>
                    <p className='text-xs text-gray-500'>
                      Select multiple to shape tone and style. Applied on
                      Update.
                    </p>
                  </div>

                  {/* Font Selection */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium'>
                      Font Family
                    </label>
                    <div className='mt-2 flex items-center gap-2'>
                      <select
                        value={fontName}
                        onChange={(e) => {
                          const newFont = e.target.value
                          setFontName(newFont)
                        }}
                        className='w-[500px] rounded-md border border-gray-300 p-2 text-sm'
                      >
                        {[
                          {
                            label: 'Arial',
                            value: 'Arial, Helvetica, sans-serif',
                          },
                          {
                            label: 'Inter',
                            value:
                              "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                          },
                          {
                            label: 'Roboto',
                            value:
                              "'Roboto', 'Helvetica Neue', Arial, sans-serif",
                          },
                          {
                            label: 'Poppins',
                            value:
                              "'Poppins', 'Helvetica Neue', Arial, sans-serif",
                          },
                          {
                            label: 'Open Sans',
                            value:
                              "'Open Sans', 'Helvetica Neue', Arial, sans-serif",
                          },
                          {
                            label: 'Montserrat',
                            value:
                              "'Montserrat', 'Helvetica Neue', Arial, sans-serif",
                          },
                          {
                            label: 'Lato',
                            value:
                              "'Lato', 'Helvetica Neue', Arial, sans-serif",
                          },
                          {
                            label: 'Nunito',
                            value:
                              "'Nunito', 'Helvetica Neue', Arial, sans-serif",
                          },
                          {
                            label: 'Work Sans',
                            value:
                              "'Work Sans', 'Helvetica Neue', Arial, sans-serif",
                          },
                          {
                            label: 'Source Sans Pro',
                            value:
                              "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",
                          },
                          {
                            label: 'IBM Plex Sans',
                            value:
                              "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
                          },
                          {
                            label: 'Playfair Display',
                            value:
                              "'Playfair Display', 'Times New Roman', serif",
                          },
                          {
                            label: 'Merriweather',
                            value:
                              "'Merriweather', Georgia, 'Times New Roman', serif",
                          },
                          {
                            label: 'Lora',
                            value: "'Lora', Georgia, 'Times New Roman', serif",
                          },
                          {
                            label: 'Georgia',
                            value: 'Georgia, "Times New Roman", serif',
                          },
                          {
                            label: 'Times New Roman',
                            value: '"Times New Roman", Times, serif',
                          },
                          {
                            label: 'Trebuchet MS',
                            value: '"Trebuchet MS", Tahoma, sans-serif',
                          },
                          {
                            label: 'System UI',
                            value:
                              'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
                          },
                          {
                            label: 'Verdana',
                            value: 'Verdana, Geneva, sans-serif',
                          },
                        ].map((opt) => (
                          <option
                            key={opt.label}
                            value={opt.value}
                            style={{ fontFamily: opt.value }}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className='text-xs text-gray-500'>
                      Select a font for your chat widget UI.
                    </p>
                  </div>

                  {/* Video Upload */}
                  <div className='space-y-2'>
                    {/* Video Enable Toggle */}
                    <div className='flex items-center justify-between pt-2'>
                      <div>
                        <p className='text-sm font-medium'>
                          Intro Welcome Video
                        </p>
                        <p className='text-xs text-gray-500'>
                          Upload an intro video that will play when users first
                          open the chat widget
                        </p>
                      </div>
                      <div
                        onClick={() => {
                          setVideoEnabled(!videoEnabled)
                        }}
                        className={`relative h-6 w-12 cursor-pointer rounded-full transition-colors ${videoEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                      >
                        <div
                          className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition-transform ${videoEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                        ></div>
                      </div>
                    </div>
                    <div
                      className={`mt-2 space-y-3 ${!videoEnabled ? 'opacity-50' : ''}`}
                    >
                      {!videoEnabled && (
                        <p className='rounded bg-amber-50 p-2 text-xs text-amber-600'>
                          Enable intro video above to upload and configure video
                          settings
                        </p>
                      )}
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          className='text-sm'
                          onClick={() => videoFileInputRef.current?.click()}
                          disabled={isUploadingVideo || !videoEnabled}
                        >
                          Select Video
                        </Button>
                        {videoFile && (
                          <Button
                            onClick={handleVideoUpload}
                            disabled={isUploadingVideo || !videoEnabled}
                            className='text-sm'
                          >
                            {isUploadingVideo ? 'Uploading...' : 'Upload Video'}
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
                      {videoFile && !isUploadingVideo && (
                        <p className='text-xs text-blue-600'>
                          Selected: {videoFile.name}
                        </p>
                      )}
                      {isUploadingVideo && (
                        <p className='text-xs text-orange-600'>
                          Uploading video... Please wait.
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
                  {videoUrl && videoEnabled && (
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
                            onClick={() => {
                              setVideoAutoplay(!videoAutoplay)
                            }}
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
                          onClick={() => handleVideoSettingsSave()}
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
                          onClick={() => {
                            setBotBehavior(option.value)
                          }}
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
                  <div
                    className='h-[500px] w-[300px] overflow-hidden rounded-xl border bg-white shadow-lg'
                    style={{ fontFamily: fontName }}
                  >
                    {/* Chat header */}
                    <div
                      className='p-4 text-white'
                      style={{ backgroundColor: getCurrentColor() }}
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
                        className='ml-2 flex h-8 w-8 items-center justify-center rounded-full text-white'
                        style={{ backgroundColor: getCurrentColor() }}
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
          disabled={isSaving}
          aria-busy={isSaving}
        >
          {isSaving ? (
            <span className='inline-flex items-center gap-2'>
              <svg
                className='h-4 w-4 animate-spin'
                viewBox='0 0 24 24'
                fill='none'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z'
                />
              </svg>
              Saving...
            </span>
          ) : (
            'Next'
          )}
        </Button>
      </div>
    </div>
  )
}

export default ChatWidgetCreate
