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
// Slider component not available, will use input range instead
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { useApiKey } from '@/hooks/useApiKey'
import { Play, Settings, Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function VideoSettings() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [autoplay, setAutoplay] = useState(true)
  const [duration, setDuration] = useState([10])
  const [isUploading, setIsUploading] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<string>('')
  const { toast } = useToast()
  const { apiKey } = useApiKey()

  useEffect(() => {
    loadVideoSettings()
  }, [])

  const loadVideoSettings = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chatbot/settings`,
        {
          headers: {
            'X-API-Key': apiKey || '',
          },
        }
      )
      const data = await response.json()

      if (data.status === 'success') {
        const settings = data.settings
        setVideoUrl(settings.video_url || '')
        setAutoplay(settings.video_autoplay ?? true)
        setDuration([settings.video_duration || 10])
        setCurrentVideo(settings.video_filename || '')
      }
    } catch (error) {
      console.error('Error loading video settings:', error)
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
    if (!videoFile) {
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
        `${import.meta.env.VITE_API_URL}/api/chatbot/upload-video`,
        {
          method: 'POST',
          headers: {
            'X-API-Key': apiKey || '',
          },
          body: formData,
        }
      )

      const data = await response.json()

      if (data.status === 'success') {
        setVideoUrl(data.video_url)
        setCurrentVideo(data.filename)
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
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chatbot/video`,
        {
          method: 'DELETE',
          headers: {
            'X-API-Key': apiKey || '',
          },
        }
      )

      const data = await response.json()

      if (data.status === 'success') {
        setVideoUrl('')
        setCurrentVideo('')
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
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot/video-settings`, {
        method: 'PUT',
        headers: {
          'X-API-Key': apiKey || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          autoplay,
          duration: duration[0],
        }),
      })

      const data = await response.json()

      if (data.status === 'success') {
        toast({
          title: 'Settings saved',
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

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Video Settings</h3>
        <p className='text-sm text-muted-foreground'>
          Upload and configure video for your chat widget
        </p>
      </div>

      {/* Video Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            Upload Video
          </CardTitle>
          <CardDescription>
            Upload a video that will play when users visit your website
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

            {currentVideo && (
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

          {videoUrl && (
            <div className='mt-4 rounded-lg bg-muted p-4'>
              <h4 className='mb-2 font-medium'>Current Video</h4>
              <video
                controls
                className='w-full max-w-md rounded'
                src={videoUrl}
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
            <Switch checked={autoplay} onCheckedChange={setAutoplay} />
          </div>

          <div className='space-y-2'>
            <Label>Video Duration (seconds)</Label>
            <div className='flex items-center gap-4'>
              <input
                type="range"
                value={duration[0]}
                onChange={(e) => setDuration([parseInt(e.target.value)])}
                max={30}
                min={5}
                step={1}
                className='flex-1'
              />
              <span className='w-12 text-sm font-medium'>{duration[0]}s</span>
            </div>
            <p className='text-sm text-muted-foreground'>
              How long the video will play before stopping
            </p>
          </div>

          <Button
            onClick={handleSaveSettings}
            className='flex items-center gap-2'
          >
            <Settings className='h-4 w-4' />
            Save Settings
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
            See how your video will appear in the chat widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-lg border bg-muted/50 p-4'>
            <div className='mb-2 text-sm text-muted-foreground'>
              Chat Widget Preview
            </div>
            {videoUrl ? (
              <div className='relative'>
                <video
                  className='w-full max-w-sm rounded'
                  autoPlay={autoplay}
                  muted
                  loop={false}
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement
                    setTimeout(() => {
                      video.pause()
                    }, duration[0] * 1000)
                  }}
                >
                  <source src={videoUrl} type='video/mp4' />
                  Your browser does not support the video tag.
                </video>
                <div className='mt-2 text-xs text-muted-foreground'>
                  Auto-play: {autoplay ? 'Yes' : 'No'} | Duration: {duration[0]}
                  s
                </div>
              </div>
            ) : (
              <div className='py-8 text-center text-muted-foreground'>
                No video uploaded yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
