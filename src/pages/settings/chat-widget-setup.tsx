import { Button } from '@/components/custom/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import {
  useChatWidgetSettings,
  useDeleteVideo,
  useUpdateChatWidgetSettings,
  useUpdateVideoSettings,
  useUploadAvatar,
  useUploadVideo,
} from '@/hooks/useChatWidgetSettings'
import {
  CheckCircle,
  ChevronRight,
  Code,
  Copy,
  ExternalLink,
  Globe,
  MessageCircle,
  Settings,
  Trash2,
  Video,
} from 'lucide-react'
import { useEffect, useState } from 'react'

type Platform = 'wordpress' | 'manual' | 'shopify' | 'wix' | 'squarespace'
type Step = 'setup' | 'connect'

const platformOptions = [
  { id: 'wordpress', name: 'WordPress', icon: Globe },
  { id: 'manual', name: 'Manual Installation', icon: Code },
  { id: 'shopify', name: 'Shopify', icon: Globe },
  { id: 'wix', name: 'Wix', icon: Globe },
  { id: 'squarespace', name: 'Squarespace', icon: Globe },
]

const wordpressSteps = [
  'Log in to your WordPress account and go to Dashboard',
  'Navigate to the "Plugins" section and select "Add New"',
  'Type "Chat Widget" in the search bar and hit the "Install Now" button',
  'Once installed, make sure to hit the "Activate" button before moving on',
  'Click "Chat Widget" in the left-hand side menu and enter your API key',
]

const manualSteps = [
  'Copy the installation script below',
  "Paste the script into your website's HTML head section",
  'Replace YOUR_API_KEY with your actual API key',
  'Save and publish your website',
  'Test the chat widget on your live site',
]

export default function ChatWidgetSetup() {
  const [currentStep, setCurrentStep] = useState<Step>('setup')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null
  )
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Use the new hooks
  const { data: settings, isLoading, error } = useChatWidgetSettings()
  const updateSettings = useUpdateChatWidgetSettings()
  const uploadVideo = useUploadVideo()
  const uploadAvatar = useUploadAvatar()
  const deleteVideo = useDeleteVideo()
  const updateVideoSettings = useUpdateVideoSettings()

  // Local state for form inputs
  const [localSettings, setLocalSettings] = useState({
    name: '',
    auto_open: false,
    leadCapture: true,
    video_autoplay: true,
    video_duration: 10,
  })

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        name: settings.name || 'Bay AI',
        auto_open: settings.auto_open || false,
        leadCapture: settings.leadCapture || true,
        video_autoplay: settings.video_autoplay ?? true,
        video_duration: settings.video_duration || 10,
      })
    }
  }, [settings])

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

  const handleAvatarFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file)
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      })
    }
  }

  const handleVideoUpload = async () => {
    if (!videoFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a video file to upload',
        variant: 'destructive',
      })
      return
    }

    try {
      await uploadVideo.mutateAsync(videoFile)
      setVideoFile(null)
      toast({
        title: 'Video uploaded successfully',
        description: 'Your video is now ready for the chat widget',
      })
    } catch (error) {
      toast({
        title: 'Upload failed',
        description:
          error instanceof Error ? error.message : 'Failed to upload video',
        variant: 'destructive',
      })
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast({
        title: 'No file selected',
        description: 'Please select an image file to upload',
        variant: 'destructive',
      })
      return
    }

    try {
      await uploadAvatar.mutateAsync(avatarFile)
      setAvatarFile(null)
      toast({
        title: 'Avatar uploaded successfully',
        description: 'Your avatar has been updated',
      })
    } catch (error) {
      toast({
        title: 'Upload failed',
        description:
          error instanceof Error ? error.message : 'Failed to upload avatar',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteVideo.mutateAsync()
      toast({
        title: 'Video deleted',
        description: 'Video has been removed from the chat widget',
      })
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete video',
        variant: 'destructive',
      })
    }
  }

  const handleSaveSettings = async () => {
    try {
      await updateSettings.mutateAsync({
        name: localSettings.name,
        auto_open: localSettings.auto_open,
        leadCapture: localSettings.leadCapture,
      })
      toast({
        title: 'Settings saved',
        description: 'Chat widget settings have been updated',
      })
      // Move to connect step after saving
      setCurrentStep('connect')
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    }
  }

  const handleVideoSettingsSave = async () => {
    try {
      await updateVideoSettings.mutateAsync({
        autoplay: localSettings.video_autoplay,
        duration: localSettings.video_duration,
      })
      toast({
        title: 'Video settings saved',
        description: 'Video settings have been updated',
      })
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save video settings',
        variant: 'destructive',
      })
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: 'Copied!',
        description: 'Installation script copied to clipboard',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      })
    }
  }

  const getInstallationScript = () => {
    const apiKey = settings?.apiKey || 'YOUR_API_KEY'
    const botUrl =
      import.meta.env.VITE_BOT_URL || 'https://aibotwizard.vercel.app'
    return `<script 
  src="${botUrl}/chatbot-widget.min.js" 
  data-api-key="${apiKey}"
  async>
</script>`
  }

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
          <p className='mt-2 text-sm text-gray-600'>Loading settings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600'>
            Error loading settings: {error.message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Progress Indicator */}
      <div className='mb-8 flex items-center space-x-4'>
        <div className='flex items-center space-x-2'>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              currentStep === 'setup'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {currentStep === 'setup' ? (
              '1'
            ) : (
              <CheckCircle className='h-4 w-4' />
            )}
          </div>
          <span
            className={`text-sm font-medium ${
              currentStep === 'setup' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            Setup
          </span>
        </div>

        <ChevronRight className='h-4 w-4 text-gray-400' />

        <div className='flex items-center space-x-2'>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              currentStep === 'connect'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {currentStep === 'connect' ? '2' : '2'}
          </div>
          <span
            className={`text-sm font-medium ${
              currentStep === 'connect' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            Connect
          </span>
        </div>
      </div>

      {/* Step 1: Setup */}
      {currentStep === 'setup' && (
        <>
          <div>
            <h3 className='mb-2 text-2xl font-bold'>
              Install your chat widget
            </h3>
            <p className='text-sm text-muted-foreground'>
              Talk to your visitors via live chat
            </p>
          </div>

          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MessageCircle className='h-5 w-5' />
                Basic Settings
              </CardTitle>
              <CardDescription>
                Configure the basic appearance and behavior of your chat widget
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid w-full max-w-sm items-center gap-1.5'>
                <Label htmlFor='name'>Widget Name</Label>
                <Input
                  id='name'
                  value={localSettings.name}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder='Enter widget name'
                />
              </div>

              <div className='space-y-2'>
                <Label>Auto Open Widget</Label>
                <div className='flex items-center space-x-2'>
                  <Switch
                    checked={localSettings.auto_open}
                    onCheckedChange={(checked) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        auto_open: checked,
                      }))
                    }
                  />
                  <span className='text-sm text-muted-foreground'>
                    {localSettings.auto_open
                      ? 'Widget will automatically open when users visit your website'
                      : 'Users need to click the chat button to open the widget'}
                  </span>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Lead Capture</Label>
                <div className='flex items-center space-x-2'>
                  <Switch
                    checked={localSettings.leadCapture}
                    onCheckedChange={(checked) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        leadCapture: checked,
                      }))
                    }
                  />
                  <span className='text-sm text-muted-foreground'>
                    Collect visitor information during conversations
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avatar Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MessageCircle className='h-5 w-5' />
                Chat Widget Avatar
              </CardTitle>
              <CardDescription>
                Upload an avatar image for your chat widget
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid w-full max-w-sm items-center gap-1.5'>
                <Label htmlFor='avatar'>Avatar Image</Label>
                <Input
                  id='avatar'
                  type='file'
                  accept='image/*'
                  onChange={handleAvatarFileChange}
                  disabled={uploadAvatar.isPending}
                />
              </div>

              <div className='flex gap-2'>
                <Button
                  onClick={handleAvatarUpload}
                  disabled={!avatarFile || uploadAvatar.isPending}
                  className='flex items-center gap-2'
                >
                  {uploadAvatar.isPending ? 'Uploading...' : 'Upload Avatar'}
                </Button>
              </div>

              {settings?.avatarUrl && (
                <div className='mt-4 rounded-lg bg-muted p-4'>
                  <h4 className='mb-2 font-medium'>Current Avatar</h4>
                  <img
                    src={settings.avatarUrl}
                    alt='Chat widget avatar'
                    className='h-16 w-16 rounded-full object-cover'
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Video className='h-5 w-5' />
                Welcome Video
              </CardTitle>
              <CardDescription>
                Upload a video that will play when users first open the chat
                widget
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid w-full max-w-sm items-center gap-1.5'>
                <Label htmlFor='video'>Video File</Label>
                <Input
                  id='video'
                  type='file'
                  accept='video/*'
                  onChange={handleVideoFileChange}
                  disabled={uploadVideo.isPending}
                />
              </div>

              <div className='flex gap-2'>
                <Button
                  onClick={handleVideoUpload}
                  disabled={!videoFile || uploadVideo.isPending}
                  className='flex items-center gap-2'
                >
                  {uploadVideo.isPending ? 'Uploading...' : 'Upload Video'}
                </Button>

                {settings?.video_url && (
                  <Button
                    variant='destructive'
                    onClick={handleDelete}
                    disabled={deleteVideo.isPending}
                    className='flex items-center gap-2'
                  >
                    <Trash2 className='h-4 w-4' />
                    {deleteVideo.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
              </div>

              {settings?.video_url && (
                <div className='mt-4 rounded-lg bg-muted p-4'>
                  <h4 className='mb-2 font-medium'>Current Video</h4>
                  <video
                    controls
                    className='w-full max-w-md rounded'
                    src={
                      settings.video_url?.startsWith('http')
                        ? settings.video_url
                        : `${import.meta.env.VITE_API_URL}${settings.video_url}`
                    }
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings className='h-5 w-5' />
                Video Settings
              </CardTitle>
              <CardDescription>
                Configure how the video behaves in your chat widget
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label>Auto-play Video</Label>
                  <p className='text-sm text-muted-foreground'>
                    Automatically play video when widget opens
                  </p>
                </div>
                <Switch
                  checked={localSettings.video_autoplay}
                  onCheckedChange={(checked) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      video_autoplay: checked,
                    }))
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label>Video Duration (seconds)</Label>
                <div className='flex items-center gap-4'>
                  <input
                    type='range'
                    value={localSettings.video_duration}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        video_duration: parseInt(e.target.value),
                      }))
                    }
                    max={30}
                    min={5}
                    step={1}
                    className='flex-1'
                  />
                  <span className='w-12 text-sm font-medium'>
                    {localSettings.video_duration}s
                  </span>
                </div>
                <p className='text-sm text-muted-foreground'>
                  How long the video will play before stopping
                </p>
              </div>

              <Button
                onClick={handleVideoSettingsSave}
                disabled={updateVideoSettings.isPending}
                className='flex items-center gap-2'
              >
                <Settings className='h-4 w-4' />
                {updateVideoSettings.isPending
                  ? 'Saving...'
                  : 'Save Video Settings'}
              </Button>
            </CardContent>
          </Card>

          {/* Save and Continue */}
          <Card>
            <CardHeader>
              <CardTitle>Save and Continue</CardTitle>
              <CardDescription>
                Save your settings and proceed to connect your chat widget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSaveSettings}
                disabled={updateSettings.isPending}
                className='flex items-center gap-2'
              >
                <Settings className='h-4 w-4' />
                {updateSettings.isPending ? 'Saving...' : 'Save & Continue'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Step 2: Connect */}
      {currentStep === 'connect' && (
        <>
          <div>
            <h3 className='mb-2 text-2xl font-bold'>
              Connect your chat widget
            </h3>
            <p className='text-sm text-muted-foreground'>
              Choose your platform and follow the installation steps
            </p>
          </div>

          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select platform</CardTitle>
              <CardDescription>
                Choose your website platform for installation instructions
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-3'>
                {platformOptions.map((platform) => {
                  const Icon = platform.icon
                  return (
                    <div
                      key={platform.id}
                      className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors ${
                        selectedPlatform === platform.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() =>
                        setSelectedPlatform(platform.id as Platform)
                      }
                    >
                      <input
                        type='radio'
                        name='platform'
                        value={platform.id}
                        checked={selectedPlatform === platform.id}
                        onChange={() =>
                          setSelectedPlatform(platform.id as Platform)
                        }
                        className='h-4 w-4 text-blue-600'
                      />
                      <Icon className='h-5 w-5 text-gray-600' />
                      <span className='font-medium'>{platform.name}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Installation Instructions */}
          {selectedPlatform && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  {selectedPlatform === 'wordpress' ? (
                    <Globe className='h-5 w-5' />
                  ) : (
                    <Code className='h-5 w-5' />
                  )}
                  {selectedPlatform === 'wordpress'
                    ? 'WordPress Installation'
                    : 'Manual Installation'}
                </CardTitle>
                <CardDescription>
                  Follow these steps to install your chat widget
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* WordPress Steps */}
                {selectedPlatform === 'wordpress' && (
                  <div className='space-y-4'>
                    {wordpressSteps.map((step, index) => (
                      <div key={index} className='flex items-start space-x-3'>
                        <div className='mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs text-white'>
                          {index + 1}
                        </div>
                        <p className='text-sm'>{step}</p>
                      </div>
                    ))}
                    <div className='mt-6 rounded-lg bg-gray-50 p-4'>
                      <p className='mb-2 text-sm font-medium'>Your API Key:</p>
                      <div className='flex items-center space-x-2'>
                        <code className='rounded border bg-white px-3 py-2 font-mono text-sm'>
                          {settings?.apiKey || 'YOUR_API_KEY'}
                        </code>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            copyToClipboard(settings?.apiKey || 'YOUR_API_KEY')
                          }
                        >
                          {copied ? (
                            <CheckCircle className='h-4 w-4' />
                          ) : (
                            <Copy className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Installation */}
                {selectedPlatform === 'manual' && (
                  <div className='space-y-4'>
                    {manualSteps.map((step, index) => (
                      <div key={index} className='flex items-start space-x-3'>
                        <div className='mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs text-white'>
                          {index + 1}
                        </div>
                        <p className='text-sm'>{step}</p>
                      </div>
                    ))}

                    <div className='mt-6 space-y-4'>
                      <div className='rounded-lg bg-gray-50 p-4'>
                        <p className='mb-2 text-sm font-medium'>
                          Installation Script:
                        </p>
                        <div className='relative'>
                          <pre className='overflow-x-auto rounded border bg-white p-4 font-mono text-sm'>
                            <code>{getInstallationScript()}</code>
                          </pre>
                          <Button
                            size='sm'
                            variant='outline'
                            className='absolute right-2 top-2'
                            onClick={() =>
                              copyToClipboard(getInstallationScript())
                            }
                          >
                            {copied ? (
                              <CheckCircle className='h-4 w-4' />
                            ) : (
                              <Copy className='h-4 w-4' />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className='rounded-lg bg-blue-50 p-4'>
                        <p className='mb-2 text-sm font-medium'>
                          Your API Key:
                        </p>
                        <div className='flex items-center space-x-2'>
                          <code className='rounded border bg-white px-3 py-2 font-mono text-sm'>
                            {settings?.apiKey || 'YOUR_API_KEY'}
                          </code>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() =>
                              copyToClipboard(
                                settings?.apiKey || 'YOUR_API_KEY'
                              )
                            }
                          >
                            {copied ? (
                              <CheckCircle className='h-4 w-4' />
                            ) : (
                              <Copy className='h-4 w-4' />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other platforms - placeholder */}
                {selectedPlatform !== 'wordpress' &&
                  selectedPlatform !== 'manual' && (
                    <div className='py-8 text-center'>
                      <p className='mb-4 text-gray-600'>
                        Installation instructions for {selectedPlatform} are
                        coming soon.
                      </p>
                      <p className='text-sm text-gray-500'>
                        For now, please use the manual installation method.
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Test Connection */}
          {selectedPlatform && (
            <Card>
              <CardHeader>
                <CardTitle>Test Your Installation</CardTitle>
                <CardDescription>
                  Verify that your chat widget is working correctly
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='rounded-lg bg-green-50 p-4'>
                  <p className='mb-2 text-sm text-green-800'>
                    ✅ Your chat widget is ready to use!
                  </p>
                  <p className='text-sm text-green-700'>
                    Once you've completed the installation steps, your chat
                    widget will appear on your website.
                  </p>
                </div>

                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setCurrentStep('setup')}
                  >
                    Back to Setup
                  </Button>
                  <Button
                    onClick={() => {
                      const botUrl =
                        import.meta.env.VITE_BOT_URL ||
                        'https://aibotwizard.vercel.app'
                      window.open(botUrl, '_blank')
                    }}
                    className='flex items-center gap-2'
                  >
                    <ExternalLink className='h-4 w-4' />
                    View Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
