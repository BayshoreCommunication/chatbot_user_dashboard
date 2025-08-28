import { Button } from '@/components/custom/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApiKey } from '@/hooks/useApiKey'
import useAxiosPublic from '@/hooks/useAxiosPublic'
import ContentSection from '@/pages/settings/components/content-section'
import { AxiosInstance, isAxiosError } from 'axios'
import {
  Edit,
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  Link2,
  Linkedin,
  Plus,
  Save,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Twitter,
  X,
  Youtube,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface TrainingUrl {
  id: string
  type:
    | 'website'
    | 'facebook'
    | 'linkedin'
    | 'instagram'
    | 'twitter'
    | 'youtube'
  url: string
  status: 'pending' | 'training' | 'success' | 'error'
  error?: string
}

const linkTypeOptions = [
  { value: 'website', label: 'Website', icon: Globe, color: 'bg-blue-500' },
  {
    value: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600',
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700',
  },
  {
    value: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    color: 'bg-pink-500',
  },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'bg-black' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'bg-red-500' },
]

export default function AITraining() {
  const axiosPublic = useAxiosPublic() as AxiosInstance
  const { apiKey } = useApiKey()
  const navigate = useNavigate()

  const [trainingUrls, setTrainingUrls] = useState<TrainingUrl[]>([])
  const [trainedSources, setTrainedSources] = useState<
    Array<{
      id?: string
      url?: string
      file_name?: string
      type?: string
      status?: string
      created_at?: string
    }>
  >([])

  const [newUrl, setNewUrl] = useState('')
  const [selectedType, setSelectedType] =
    useState<TrainingUrl['type']>('website')
  const [isTraining, setIsTraining] = useState(false)
  const [quickMode, setQuickMode] = useState(true) // Quick mode by default
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')

  // Load previously trained sources
  const fetchHistory = useCallback(async () => {
    try {
      const res = await axiosPublic.get('/api/chatbot/upload_history', {
        headers: { 'X-API-Key': apiKey },
        timeout: 15000,
      })
      setTrainedSources(res.data || [])
    } catch (e: unknown) {
      console.error('Failed to load trained sources', e)
    }
  }, [apiKey, axiosPublic])

  useEffect(() => {
    if (apiKey) {
      fetchHistory()
    }
  }, [apiKey, fetchHistory])

  const addUrl = () => {
    if (!newUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }

    // Validate URL format
    try {
      new URL(newUrl)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    // Check for duplicates
    const exists = trainingUrls.some((item) => item.url === newUrl.trim())
    if (exists) {
      toast.error('This URL has already been added')
      return
    }

    const newTrainingUrl: TrainingUrl = {
      id: Date.now().toString(),
      type: selectedType,
      url: newUrl.trim(),
      status: 'pending',
    }

    setTrainingUrls((prev) => [...prev, newTrainingUrl])
    setNewUrl('')
    toast.success('URL added successfully')
  }

  const removeUrl = (id: string) => {
    setTrainingUrls((prev) => prev.filter((item) => item.id !== id))
    toast.success('URL removed')
  }

  const startEdit = (id: string, currentUrl: string) => {
    setEditingId(id)
    setEditUrl(currentUrl)
  }

  const saveEdit = (id: string) => {
    if (!editUrl.trim()) {
      toast.error('Please enter a valid URL')
      return
    }

    try {
      new URL(editUrl)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setTrainingUrls((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, url: editUrl.trim() } : item
      )
    )
    setEditingId(null)
    setEditUrl('')
    toast.success('URL updated successfully')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditUrl('')
  }

  const toggleUrlStatus = (id: string) => {
    setTrainingUrls((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'pending' ? 'success' : 'pending',
            }
          : item
      )
    )
  }

  const updateUrlStatus = (
    id: string,
    status: TrainingUrl['status'],
    error?: string
  ) => {
    setTrainingUrls((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, error } : item))
    )
  }

  const startTraining = async () => {
    if (trainingUrls.length === 0) {
      toast.error('Please add at least one URL to train from')
      return
    }

    setIsTraining(true)
    let successCount = 0
    let errorCount = 0

    // Reset all statuses
    setTrainingUrls((prev) =>
      prev.map((item) => ({ ...item, status: 'pending' as const }))
    )

    for (const urlItem of trainingUrls) {
      try {
        updateUrlStatus(urlItem.id, 'training')
        toast.info(`Training from ${urlItem.type}: ${urlItem.url}`)

        const response = await axiosPublic.post(
          '/api/chatbot/upload_document',
          {
            url: urlItem.url,
            scrape_website: true,
            max_pages: quickMode
              ? urlItem.type === 'website'
                ? 3
                : 1 // Quick mode: very fast
              : urlItem.type === 'website'
                ? 5
                : 2, // Normal mode
            platform: urlItem.type,
          },
          {
            headers: { 'X-API-Key': apiKey },
            timeout: 30000, // 30 second timeout
          }
        )

        if (response.data.status === 'success') {
          updateUrlStatus(urlItem.id, 'success')
          successCount++
          toast.success(`✅ Successfully trained from ${urlItem.type}`)
        } else {
          updateUrlStatus(
            urlItem.id,
            'error',
            response.data.message || 'Training failed'
          )
          errorCount++
          toast.error(`❌ Failed to train from ${urlItem.type}`)
        }
      } catch (error: unknown) {
        let errMessage = 'Unknown error'
        let errDetail: string | undefined
        let errCode: string | number | undefined

        if (isAxiosError(error)) {
          errMessage = error.message
          errDetail = (error.response?.data as { detail?: string } | undefined)
            ?.detail
          errCode = error.code
        } else if (error instanceof Error) {
          errMessage = error.message
        }

        updateUrlStatus(urlItem.id, 'error', errDetail || errMessage)
        errorCount++
        console.error(`Error training from ${urlItem.type}:`, error)

        if (errCode === 'ECONNABORTED') {
          toast.error(
            `⏱️ ${urlItem.type} training timed out - site may be too large`
          )
        } else {
          toast.error(
            `❌ Failed to train from ${urlItem.type}: ${errDetail || errMessage}`
          )
        }
      }
    }

    // Show final summary
    if (successCount > 0) {
      toast.success(
        `🎉 Training completed! Successfully trained from ${successCount} source(s)`
      )

      // Test the training
      try {
        const testResponse = await axiosPublic.post(
          '/api/chatbot/verify-training',
          { question: 'Do you handle cases outside of Tampa?' },
          { headers: { 'X-API-Key': apiKey } }
        )

        if (testResponse.data.training_verified) {
          toast.success('✅ Training verified - AI can now answer questions!')
        }
      } catch (testError) {
        console.error('Training verification failed:', testError)
      }
    }

    if (errorCount > 0 && successCount === 0) {
      toast.error(
        '❌ All training attempts failed. Please check your URLs and try again.'
      )
    } else if (errorCount > 0) {
      toast.warning(
        `⚠️ Training completed with ${errorCount} error(s). Check the status below.`
      )
    }

    setIsTraining(false)

    // Refresh previously trained sources after training completes
    try {
      await fetchHistory()
    } catch (e) {
      // no-op, already logged in fetchHistory
    }
  }

  const deleteTrainedItemFromServer = async (
    item: {
      id?: string
      url?: string
      file_name?: string
    },
    index: number
  ) => {
    const confirmed = window.confirm(
      'Delete this trained source from the server? This removes it from the knowledge base and cannot be undone.'
    )
    if (!confirmed) return

    try {
      // Use the new delete endpoint with item id
      if (item.id) {
        await axiosPublic.delete(
          `/api/chatbot/upload_history/${encodeURIComponent(item.id)}`,
          { headers: { 'X-API-Key': apiKey }, timeout: 20000 }
        )
      } else {
        // If no id, show error - we need the id for deletion
        throw new Error(
          'Cannot delete item without ID. Please refresh the page and try again.'
        )
      }

      toast.success('Deleted from server. Updating list...')
      // Remove locally for instant feedback
      setTrainedSources((prev) => prev.filter((_, i) => i !== index))
      // Then refresh from server
      await fetchHistory()
    } catch (e: unknown) {
      console.error('Failed to delete trained item from server', e)
      const message = isAxiosError(e)
        ? (e.response?.data as { detail?: string } | undefined)?.detail ||
          e.message
        : e instanceof Error
          ? e.message
          : 'Unknown error'
      toast.error(`Failed to delete on server: ${message}`)
    }
  }

  const getStatusBadge = (status: TrainingUrl['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant='secondary'>Pending</Badge>
      case 'training':
        return <Badge className='bg-yellow-500'>Training...</Badge>
      case 'success':
        return <Badge className='bg-green-500'>Success</Badge>
      case 'error':
        return <Badge variant='destructive'>Error</Badge>
    }
  }

  const getIcon = (type: string) => {
    const option = linkTypeOptions.find((opt) => opt.value === type)
    const IconComponent = option?.icon || Link2
    return <IconComponent className='h-4 w-4' />
  }

  return (
    <div className='mx-6 mt-4'>
      <ContentSection title='AI Training'>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold'>Train Your AI Chatbot</h2>
              <p className='mt-1 text-muted-foreground'>
                Add websites and social media URLs to train your AI with your
                business information
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard/train-ai')}
              variant='outline'
            >
              Back to AI Home
            </Button>
          </div>

          {/* Add New URL Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Plus className='h-5 w-5' />
                Add Training Source
              </CardTitle>
              <CardDescription>
                Add a website or social media URL to train your AI chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex gap-3'>
                <div className='flex-1'>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                    <SelectContent>
                      {linkTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className='flex items-center gap-2'>
                            <option.icon className='h-4 w-4' />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex-[2]'>
                  <Input
                    type='url'
                    placeholder='https://example.com'
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addUrl()}
                  />
                </div>
                <Button onClick={addUrl} disabled={isTraining}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add URL
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Training URLs List */}
          <Card>
            <CardHeader>
              <CardTitle>Training Sources ({trainingUrls.length})</CardTitle>
              <CardDescription>
                URLs that will be used to train your AI chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trainingUrls.length === 0 ? (
                <div className='py-8 text-center text-muted-foreground'>
                  No training sources added yet. Add some URLs above to get
                  started.
                </div>
              ) : (
                <div className='space-y-3'>
                  {trainingUrls.map((urlItem) => (
                    <div
                      key={urlItem.id}
                      className='rounded-lg border p-4 transition-all hover:bg-gray-50'
                    >
                      {/* Header with type, status toggle, and actions */}
                      <div className='mb-3 flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='flex items-center gap-2'>
                            {getIcon(urlItem.type)}
                            <span className='font-medium capitalize'>
                              {urlItem.type}
                            </span>
                          </div>
                          {getStatusBadge(urlItem.status)}
                        </div>

                        <div className='flex items-center gap-2'>
                          {/* Status Toggle */}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => toggleUrlStatus(urlItem.id)}
                            disabled={isTraining}
                            className='px-2'
                          >
                            {urlItem.status === 'success' ? (
                              <ToggleRight className='h-4 w-4 text-green-500' />
                            ) : (
                              <ToggleLeft className='h-4 w-4 text-gray-400' />
                            )}
                          </Button>

                          {/* Edit Button */}
                          {editingId !== urlItem.id && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => startEdit(urlItem.id, urlItem.url)}
                              disabled={isTraining}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                          )}

                          {/* Delete Button */}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => removeUrl(urlItem.id)}
                            disabled={isTraining}
                            className='text-red-500 hover:text-red-700'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>

                      {/* URL Display/Edit */}
                      <div className='space-y-2'>
                        {editingId === urlItem.id ? (
                          /* Edit Mode */
                          <div className='flex gap-2'>
                            <Input
                              type='url'
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              placeholder='https://example.com'
                              className='flex-1'
                              autoFocus
                            />
                            <Button
                              size='sm'
                              onClick={() => saveEdit(urlItem.id)}
                              className='px-3'
                            >
                              <Save className='h-4 w-4' />
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={cancelEdit}
                              className='px-3'
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </div>
                        ) : (
                          /* Display Mode */
                          <div className='flex items-center gap-2'>
                            <div className='min-w-0 flex-1'>
                              <a
                                href={urlItem.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='block truncate text-blue-600 hover:text-blue-800 hover:underline'
                              >
                                {urlItem.url}
                              </a>
                            </div>
                            <ExternalLink className='h-4 w-4 flex-shrink-0 text-gray-400' />
                          </div>
                        )}

                        {/* Error Message */}
                        {urlItem.error && (
                          <div className='mt-2 rounded bg-red-50 p-2'>
                            <p className='text-xs text-red-600'>
                              <strong>Error:</strong> {urlItem.error}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Previously Trained Sources */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>
                    Previously Trained Sources ({trainedSources.length})
                  </CardTitle>
                  <CardDescription>
                    These were already added to your knowledge base
                  </CardDescription>
                </div>
                <Button variant='outline' size='sm' onClick={fetchHistory}>
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {trainedSources.length === 0 ? (
                <div className='py-6 text-center text-muted-foreground'>
                  No previous training found
                </div>
              ) : (
                <div className='space-y-2'>
                  {trainedSources.map((item, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between rounded border p-3'
                    >
                      <div className='min-w-0 flex-1'>
                        {item.url ? (
                          <a
                            href={item.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='block truncate text-blue-600 hover:text-blue-800 hover:underline'
                          >
                            {item.url}
                          </a>
                        ) : (
                          <span className='block truncate'>
                            {item.file_name || 'Document'}
                          </span>
                        )}
                        <div className='mt-1 text-xs text-muted-foreground'>
                          {item.type ? item.type : item.url ? 'url' : 'file'}
                          {item.status ? ` • ${item.status}` : ''}
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant='secondary' className='ml-3'>
                          {item.type || (item.url ? 'url' : 'file')}
                        </Badge>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => deleteTrainedItemFromServer(item, idx)}
                          className='text-red-500 hover:text-red-700'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Training Options */}
          <Card
            className={`transition-colors ${quickMode ? 'bg-green-50' : 'bg-blue-50'}`}
          >
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='flex items-center gap-2 font-medium'>
                    {quickMode ? '⚡' : '🔍'} Training Mode
                  </h3>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    {quickMode
                      ? '⚡ Quick mode: 1-3 pages per URL, ~15-30 seconds total'
                      : '🔍 Thorough mode: 2-5 pages per URL, ~30-60 seconds total'}
                  </p>
                  <div className='mt-2 flex items-center gap-4 text-xs text-muted-foreground'>
                    <span>Pages: {quickMode ? '1-3' : '2-5'}</span>
                    <span>Time: {quickMode ? '15-30s' : '30-60s'}</span>
                    <span>Quality: {quickMode ? 'Fast' : 'Detailed'}</span>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span
                    className={`text-sm ${quickMode ? 'font-medium text-green-600' : 'text-gray-500'}`}
                  >
                    Quick
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setQuickMode(!quickMode)}
                    className='px-2'
                  >
                    {quickMode ? (
                      <ToggleRight className='h-6 w-6 text-green-500' />
                    ) : (
                      <ToggleLeft className='h-6 w-6 text-gray-400' />
                    )}
                  </Button>
                  <span
                    className={`text-sm ${!quickMode ? 'font-medium text-blue-600' : 'text-gray-500'}`}
                  >
                    Thorough
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Training Button */}
          <div className='flex justify-center'>
            <Button
              onClick={startTraining}
              disabled={isTraining || trainingUrls.length === 0}
              size='lg'
              className='px-8'
            >
              {isTraining ? (
                <>
                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                  Training in Progress...
                </>
              ) : (
                <>🚀 Start Training ({trainingUrls.length} sources)</>
              )}
            </Button>
          </div>

          {/* Training Tips */}
          <Card className='bg-blue-50'>
            <CardHeader>
              <CardTitle className='text-lg'>💡 How to Use This Page</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium text-blue-800'>
                    🔗 Managing URLs
                  </h4>
                  <ul className='space-y-1 text-blue-700'>
                    <li>• Click URLs to open in new tab</li>
                    <li>
                      • Use <Edit className='inline h-3 w-3' /> to edit URLs
                      inline
                    </li>
                    <li>
                      • Use <ToggleRight className='inline h-3 w-3' /> to
                      enable/disable
                    </li>
                    <li>
                      • Use <Trash2 className='inline h-3 w-3' /> to remove URLs
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-blue-800'>
                    ⚡ Training Modes
                  </h4>
                  <ul className='space-y-1 text-blue-700'>
                    <li>
                      • <strong>Quick:</strong> 1-3 pages, 15-30 seconds
                    </li>
                    <li>
                      • <strong>Thorough:</strong> 2-5 pages, 30-60 seconds
                    </li>
                    <li>• Toggle between modes anytime</li>
                    <li>• Quick mode recommended for testing</li>
                  </ul>
                </div>
              </div>
              <div className='border-t border-blue-200 pt-2'>
                <p className='text-blue-600'>
                  <strong>💡 Pro Tip:</strong> Add your main website, FAQ page,
                  and social media for comprehensive AI training
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentSection>
    </div>
  )
}
