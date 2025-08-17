import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useApiKey } from '@/hooks/useApiKey'
import { MessageCircle, Play, Settings, Trash2, Video } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ChatWidgetSettings {
  name: string
  selectedColor: string
  leadCapture: boolean
  botBehavior: string
  avatarUrl?: string
  auto_open?: boolean
  video_url?: string
  video_autoplay?: boolean
  video_duration?: number
  ai_behavior?: string
}

export default function ChatWidgetSetup() {
  const [settings, setSettings] = useState<ChatWidgetSettings>({
    name: 'Bay AI',
    selectedColor: 'black',
    leadCapture: true,
    botBehavior: '2',
    auto_open: false,
    video_autoplay: true,
    video_duration: 10,
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { apiKey } = useApiKey()

  useEffect(() => {
    loadSettings()
  }, [apiKey])

  const loadSettings = async () => {
    if (!apiKey) return

    try {
      const response = await fetch(
        `http://localhost:8000/api/chatbot/settings`,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )
      const data = await response.json()

      if (data.status === 'success') {
        setSettings((prev) => ({ ...prev, ...data.settings }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleUpload = async () => {
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
      const response = await fetch(
        'http://localhost:8000/api/chatbot/upload-video',
        {
          method: 'POST',
          headers: {
            'X-API-Key': apiKey,
          },
          body: formData,
        }
      )

      const data = await response.json()

      if (data.status === 'success') {
        setSettings((prev) => ({
          ...prev,
          video_url: data.video_url,
        }))
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

  const handleDelete = async () => {
    if (!apiKey) return

    try {
      const response = await fetch('http://localhost:8000/api/chatbot/video', {
        method: 'DELETE',
        headers: {
          'X-API-Key': apiKey,
        },
      })

      const data = await response.json()

      if (data.status === 'success') {
        setSettings((prev) => ({
          ...prev,
          video_url: undefined,
        }))
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

  const handleSaveSettings = async () => {
    if (!apiKey) return

    try {
      const response = await fetch(
        'http://localhost:8000/api/chatbot/save-settings',
        {
          method: 'POST',
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        }
      )

      const data = await response.json()

      if (data.status === 'success') {
        toast({
          title: 'Settings saved',
          description: 'Chat widget settings have been updated',
        })
      }
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    }
  }

  const handleVideoSettingsSave = async () => {
    if (!apiKey) return

    try {
      const response = await fetch(
        'http://localhost:8000/api/chatbot/video-settings',
        {
          method: 'PUT',
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            autoplay: settings.video_autoplay,
            duration: settings.video_duration,
          }),
        }
      )

      const data = await response.json()

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

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Chat Widget Setup</h3>
        <p className='text-sm text-muted-foreground'>
          Configure your chat widget appearance, behavior, and video settings
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
              value={settings.name}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder='Enter widget name'
            />
          </div>

          <div className='space-y-2'>
            <Label>Auto Open Widget</Label>
            <div className='flex items-center space-x-2'>
              <Switch
                checked={settings.auto_open || false}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, auto_open: checked }))
                }
              />
              <span className='text-sm text-muted-foreground'>
                {settings.auto_open
                  ? 'Widget will automatically open when users visit your website'
                  : 'Users need to click the chat button to open the widget'}
              </span>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Lead Capture</Label>
            <div className='flex items-center space-x-2'>
              <Switch
                checked={settings.leadCapture}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, leadCapture: checked }))
                }
              />
              <span className='text-sm text-muted-foreground'>
                Collect visitor information during conversations
              </span>
            </div>
          </div>
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
            Upload a video that will play when users first open the chat widget
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid w-full max-w-sm items-center gap-1.5'>
            <Label htmlFor='video'>Video File</Label>
            <Input
              id='video'
              type='file'
              accept='video/*'
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          <div className='flex gap-2'>
            <Button
              onClick={handleUpload}
              disabled={!videoFile || isUploading}
              className='flex items-center gap-2'
            >
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </Button>

            {settings.video_url && (
              <Button
                variant='destructive'
                onClick={handleDelete}
                className='flex items-center gap-2'
              >
                <Trash2 className='h-4 w-4' />
                Delete
              </Button>
            )}
          </div>

          {settings.video_url && (
            <div className='mt-4 rounded-lg bg-muted p-4'>
              <h4 className='mb-2 font-medium'>Current Video</h4>
              <video
                controls
                className='w-full max-w-md rounded'
                src={
                  settings.video_url?.startsWith('http')
                    ? settings.video_url
                    : `http://localhost:8000${settings.video_url}`
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
              checked={settings.video_autoplay || false}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, video_autoplay: checked }))
              }
            />
          </div>

          <div className='space-y-2'>
            <Label>Video Duration (seconds)</Label>
            <div className='flex items-center gap-4'>
              <Slider
                value={[settings.video_duration || 10]}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, video_duration: value[0] }))
                }
                max={30}
                min={5}
                step={1}
                className='flex-1'
              />
              <span className='w-12 text-sm font-medium'>
                {settings.video_duration || 10}s
              </span>
            </div>
            <p className='text-sm text-muted-foreground'>
              How long the video will play before stopping
            </p>
          </div>

          <Button
            onClick={handleVideoSettingsSave}
            className='flex items-center gap-2'
          >
            <Settings className='h-4 w-4' />
            Save Video Settings
          </Button>
        </CardContent>
      </Card>

      {/* Save All Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Save All Settings</CardTitle>
          <CardDescription>
            Save all your chat widget configuration changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSaveSettings}
            className='flex items-center gap-2'
          >
            <Settings className='h-4 w-4' />
            Save All Settings
          </Button>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Play className='h-5 w-5' />
            Preview
          </CardTitle>
          <CardDescription>
            See how your chat widget will appear and behave
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-lg border bg-muted/50 p-4'>
            <div className='mb-2 text-sm text-muted-foreground'>
              Chat Widget Preview
            </div>
            <div className='space-y-2 text-sm'>
              <p>
                <strong>Name:</strong> {settings.name}
              </p>
              <p>
                <strong>Auto Open:</strong> {settings.auto_open ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>Lead Capture:</strong>{' '}
                {settings.leadCapture ? 'Enabled' : 'Disabled'}
              </p>
              {settings.video_url && (
                <>
                  <p>
                    <strong>Video:</strong> Uploaded
                  </p>
                  <p>
                    <strong>Auto-play:</strong>{' '}
                    {settings.video_autoplay ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <strong>Duration:</strong> {settings.video_duration || 10}s
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
