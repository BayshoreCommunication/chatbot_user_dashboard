import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useApiKey } from '@/hooks/useApiKey'
import { getApiUrl } from '@/lib/utils'
import ContentSection from '@/pages/settings/components/content-section'
import axios from 'axios'
import { EditIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface InstantReply {
  id?: string
  trigger: string
  response: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export default function InstantReplyAutomation() {
  const { apiKey } = useApiKey()
  const [isEnabled, setIsEnabled] = useState(true)
  const [instantReplies, setInstantReplies] = useState<InstantReply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedReplyId, setExpandedReplyId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreatingReply, setIsCreatingReply] = useState(false)
  const [newReply, setNewReply] = useState<Partial<InstantReply>>({
    trigger: '',
    response: '',
    is_active: true,
  })

  // Fetch instant replies on component mount
  useEffect(() => {
    fetchInstantReplies()
  }, [apiKey])

  const fetchInstantReplies = async () => {
    try {
      const response = await axios.get(`${getApiUrl()}/api/instant-reply/list`, {
        headers: {
          'X-API-Key': apiKey || '',
        },
      })
      if (response.data) {
        setInstantReplies(response.data)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error fetching instant replies:', error)
      toast.error('Failed to load instant replies')
      setIsLoading(false)
    }
  }

  const handleTriggerChange = (id: string, value: string) => {
    setInstantReplies(
      instantReplies.map((reply) => 
        reply.id === id ? { ...reply, trigger: value } : reply
      )
    )
  }

  const handleResponseChange = (id: string, value: string) => {
    setInstantReplies(
      instantReplies.map((reply) => 
        reply.id === id ? { ...reply, response: value } : reply
      )
    )
  }

  const toggleActive = async (id: string) => {
    const reply = instantReplies.find((r) => r.id === id)
    if (!reply) return

    try {
      const response = await axios.put(
        `${getApiUrl()}/api/instant-reply/${id}`,
        {
          ...reply,
          is_active: !reply.is_active,
        },
        {
          headers: {
            'X-API-Key': apiKey || '',
          },
        }
      )

      if (response.data) {
        setInstantReplies(
          instantReplies.map((r) =>
            r.id === id ? { ...r, is_active: !r.is_active } : r
          )
        )
        toast.success('Instant reply updated successfully')
      }
    } catch (error) {
      console.error('Error updating instant reply:', error)
      toast.error('Failed to update instant reply')
    }
  }

  const saveReply = async (id: string) => {
    const reply = instantReplies.find((r) => r.id === id)
    if (!reply) return

    try {
      const response = await axios.put(
        `${getApiUrl()}/api/instant-reply/${id}`,
        reply,
        {
          headers: {
            'X-API-Key': apiKey || '',
          },
        }
      )

      if (response.data) {
        setExpandedReplyId(null)
        toast.success('Instant reply saved successfully')
      }
    } catch (error) {
      console.error('Error saving instant reply:', error)
      toast.error('Failed to save instant reply')
    }
  }

  const deleteReply = async (id: string) => {
    try {
      await axios.delete(`${getApiUrl()}/api/instant-reply/${id}`, {
        headers: {
          'X-API-Key': apiKey || '',
        },
      })

      setInstantReplies(instantReplies.filter((r) => r.id !== id))
      toast.success('Instant reply deleted successfully')
    } catch (error) {
      console.error('Error deleting instant reply:', error)
      toast.error('Failed to delete instant reply')
    }
  }

  const createNewReply = async () => {
    if (!newReply.trigger || !newReply.response) {
      toast.error('Please fill in all fields')
      return
    }

    setIsCreatingReply(true)
    try {
      const response = await axios.post(
        `${getApiUrl()}/api/instant-reply`,
        newReply,
        {
          headers: {
            'X-API-Key': apiKey || '',
          },
        }
      )

      if (response.data) {
        setInstantReplies([...instantReplies, response.data])
        setNewReply({ trigger: '', response: '', is_active: true })
        setShowCreateModal(false)
        toast.success('Instant reply created successfully')
      }
    } catch (error) {
      console.error('Error creating instant reply:', error)
      toast.error('Failed to create instant reply')
    } finally {
      setIsCreatingReply(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Instant Reply Automation</h1>
          <p className="text-muted-foreground">
            Configure automatic responses for common customer inquiries
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <EditIcon className="mr-2 h-4 w-4" />
          Add New Reply
        </Button>
      </div>

      <ContentSection title="Instant Reply Settings">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="instant-reply-enabled"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
            <Label htmlFor="instant-reply-enabled">
              Enable Instant Reply Automation
            </Label>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Instant Replies">
        <div className="space-y-4">
          {instantReplies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No instant replies configured yet.</p>
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(true)}
                className="mt-2"
              >
                Create Your First Reply
              </Button>
            </div>
          ) : (
            instantReplies.map((reply) => (
              <div
                key={reply.id}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={reply.is_active}
                      onCheckedChange={() => toggleActive(reply.id!)}
                    />
                    <span className="font-medium">
                      Trigger: {reply.trigger}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExpandedReplyId(
                          expandedReplyId === reply.id ? null : reply.id!
                        )
                      }
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReply(reply.id!)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {expandedReplyId === reply.id && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor={`trigger-${reply.id}`}>Trigger</Label>
                      <Input
                        id={`trigger-${reply.id}`}
                        value={reply.trigger}
                        onChange={(e) => handleTriggerChange(reply.id!, e.target.value)}
                        placeholder="Enter trigger keywords or phrases"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`response-${reply.id}`}>Response</Label>
                      <Textarea
                        id={`response-${reply.id}`}
                        value={reply.response}
                        onChange={(e) => handleResponseChange(reply.id!, e.target.value)}
                        placeholder="Enter the automatic response"
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setExpandedReplyId(null)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => saveReply(reply.id!)}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ContentSection>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Create New Instant Reply</h2>
            <div>
              <Label htmlFor="new-trigger">Trigger</Label>
              <Input
                id="new-trigger"
                value={newReply.trigger}
                onChange={(e) => setNewReply({ ...newReply, trigger: e.target.value })}
                placeholder="Enter trigger keywords or phrases"
              />
            </div>
            <div>
              <Label htmlFor="new-response">Response</Label>
              <Textarea
                id="new-response"
                value={newReply.response}
                onChange={(e) => setNewReply({ ...newReply, response: e.target.value })}
                placeholder="Enter the automatic response"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="new-active"
                checked={newReply.is_active}
                onCheckedChange={(checked) => setNewReply({ ...newReply, is_active: checked })}
              />
              <Label htmlFor="new-active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createNewReply}
                disabled={isCreatingReply}
              >
                {isCreatingReply ? <LoadingSpinner /> : 'Create Reply'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}