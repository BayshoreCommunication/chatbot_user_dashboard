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
  useUploadVideo,
  useDeleteVideo,
  useUpdateVideoSettings
} from '@/hooks/useChatWidgetSettings'
import { Play, Settings, Trash2, Upload } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function VideoSettings() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const { toast } = useToast()
  
  // Use the new hooks
  const { data: settings, isLoading, error } = useChatWidgetSettings()
  const uploadVideo = useUploadVideo()
  const deleteVideo = useDeleteVideo()
  const updateVideoSettings = useUpdateVideoSettings()

  // Local state for form inputs
  const [localSettings, setLocalSettings] = useState({
    video_autoplay: true,
    video_duration: 10,
  })

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        video_autoplay: settings.video_autoplay ?? true,
        video_duration: settings.video_duration || 10,
      })
    }
  }, [settings])

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
        description: error instanceof Error ? error.message : 'Failed to upload video',
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
      await updateVideoSettings.mutateAsync({
        autoplay: localSettings.video_autoplay,
        duration: localSettings.video_duration,
      })
      toast({
        title: 'Settings saved',
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
          <p className='text-red-600'>Error loading settings: {error.message}</p>
        </div>
      </div>
    )
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
              disabled={uploadVideo.isPending}
            />
          </div>

          <div className='flex gap-2'>
            <Button
              onClick={handleUpload}
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
              onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, video_autoplay: checked }))} 
            />
          </div>

          <div className='space-y-2'>
            <Label>Video Duration (seconds)</Label>
            <div className='flex items-center gap-4'>
              <input
                type="range"
                value={localSettings.video_duration}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, video_duration: parseInt(e.target.value) }))}
                max={30}
                min={5}
                step={1}
                className='flex-1'
              />
              <span className='w-12 text-sm font-medium'>{localSettings.video_duration}s</span>
            </div>
            <p className='text-sm text-muted-foreground'>
              How long the video will play before stopping
            </p>
          </div>

          <Button
            onClick={handleSaveSettings}
            disabled={updateVideoSettings.isPending}
            className='flex items-center gap-2'
          >
            <Settings className='h-4 w-4' />
            {updateVideoSettings.isPending ? 'Saving...' : 'Save Settings'}
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
            {settings?.video_url ? (
              <div className='relative'>
                <video
                  className='w-full max-w-sm rounded'
                  autoPlay={localSettings.video_autoplay}
                  muted
                  loop={false}
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement
                    setTimeout(() => {
                      video.pause()
                    }, localSettings.video_duration * 1000)
                  }}
                >
                  <source src={
                    settings.video_url?.startsWith('http')
                      ? settings.video_url
                      : `${import.meta.env.VITE_API_URL}${settings.video_url}`
                  } type='video/mp4' />
                  Your browser does not support the video tag.
                </video>
                <div className='mt-2 text-xs text-muted-foreground'>
                  Auto-play: {localSettings.video_autoplay ? 'Yes' : 'No'} | Duration: {localSettings.video_duration}s
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
