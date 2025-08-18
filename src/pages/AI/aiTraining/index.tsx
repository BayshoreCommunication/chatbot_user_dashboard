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
import { Label } from '@/components/ui/label'
// Progress component not available, will create a simple one
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useApiKey } from '@/hooks/useApiKey'
import {
  AlertCircle,
  BookOpen,
  Brain,
  CheckCircle,
  FileText,
  Lightbulb,
  TrendingUp,
  Upload,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface TrainingStatus {
  ai_behavior_configured: boolean
  training_data_count: number
  response_templates_count: number
  knowledge_base_size: number
  completeness_score: number
  last_updated: string
}

interface ImprovementAnalysis {
  current_state: Record<string, unknown>
  recommendations: Record<string, unknown>
  quick_wins: Array<{
    action: string
    description: string
    impact: string
    effort: string
  }>
  industry_templates: Record<string, unknown>
}

export default function AITrainingPage() {
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(
    null
  )
  const [analysis, setAnalysis] = useState<ImprovementAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // AI Behavior form
  const [aiBehavior, setAiBehavior] = useState('')
  const [personalityTraits, setPersonalityTraits] = useState('')
  const [tone, setTone] = useState('professional')
  const [expertiseAreas, setExpertiseAreas] = useState('')

  // Training data form
  const [trainingType, setTrainingType] = useState('faq')
  const [trainingContent, setTrainingContent] = useState('')
  const [trainingTitle, setTrainingTitle] = useState('')

  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileTrainingType, setFileTrainingType] = useState('services')

  const { toast } = useToast()
  const { apiKey } = useApiKey()

  useEffect(() => {
    if (apiKey) {
      loadData()
    }
  }, [apiKey])

  const loadData = async () => {
    if (!apiKey) return

    setIsLoading(true)
    try {
      // Load training status and analysis
      const [statusResponse, analysisResponse] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_API_URL}/api/ai-training/training-status`,
          {
            headers: { 'X-API-Key': apiKey },
          }
        ),
        fetch(
          `${import.meta.env.VITE_API_URL}/api/ai-training/improvement-analysis`,
          {
            headers: { 'X-API-Key': apiKey },
          }
        ),
      ])

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setTrainingStatus(statusData.training_status)
      }

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json()
        setAnalysis(analysisData.analysis)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load training data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateAIBehavior = async () => {
    if (!apiKey || !aiBehavior.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter AI behavior description',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai-training/update-ai-behavior`,
        {
          method: 'POST',
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ai_behavior: aiBehavior,
            personality_traits: personalityTraits
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
            tone: tone,
            expertise_areas: expertiseAreas
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          }),
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'AI behavior updated successfully',
        })
        loadData()
        setAiBehavior('')
        setPersonalityTraits('')
        setExpertiseAreas('')
      } else {
        throw new Error('Failed to update AI behavior')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update AI behavior',
        variant: 'destructive',
      })
    }
  }

  const handleUploadTrainingData = async () => {
    if (!apiKey || !trainingContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter training content',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai-training/upload-training-data`,
        {
          method: 'POST',
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            training_type: trainingType,
            content: trainingContent,
            title: trainingTitle,
          }),
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Training data uploaded successfully',
        })
        loadData()
        setTrainingContent('')
        setTrainingTitle('')
      } else {
        throw new Error('Failed to upload training data')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload training data',
        variant: 'destructive',
      })
    }
  }

  const handleFileUpload = async () => {
    if (!apiKey || !selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file',
        variant: 'destructive',
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('training_type', fileTrainingType)
      formData.append(
        'description',
        `Training document for ${fileTrainingType}`
      )

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai-training/upload-document-for-training`,
        {
          method: 'POST',
          headers: {
            'X-API-Key': apiKey,
          },
          body: formData,
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Document uploaded and processed successfully',
        })
        loadData()
        setSelectedFile(null)
      } else {
        throw new Error('Failed to upload document')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      })
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getImpactBadgeColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
          <p className='mt-2 text-sm text-gray-600'>
            Loading AI training data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>AI Training & Improvement</h3>
        <p className='text-sm text-muted-foreground'>
          Enhance your AI's responses and train it for your specific services
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='behavior'>AI Behavior</TabsTrigger>
          <TabsTrigger value='training'>Training Data</TabsTrigger>
          <TabsTrigger value='documents'>Documents</TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Training Status */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  Training Progress
                </CardTitle>
                <CardDescription>
                  Current AI training completeness
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {trainingStatus && (
                  <>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span>Completeness Score</span>
                        <span
                          className={`font-bold ${getScoreColor(trainingStatus.completeness_score)}`}
                        >
                          {trainingStatus.completeness_score}%
                        </span>
                      </div>
                      <div className='h-2 w-full rounded-full bg-gray-200'>
                        <div
                          className='h-2 rounded-full bg-blue-600'
                          style={{
                            width: `${trainingStatus.completeness_score}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div className='flex items-center gap-2'>
                        {trainingStatus.ai_behavior_configured ? (
                          <CheckCircle className='h-4 w-4 text-green-600' />
                        ) : (
                          <AlertCircle className='h-4 w-4 text-red-600' />
                        )}
                        AI Behavior
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground'>
                          {trainingStatus.training_data_count} Training Sets
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground'>
                          {trainingStatus.response_templates_count} Templates
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground'>
                          {trainingStatus.knowledge_base_size} KB Size
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Wins */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Lightbulb className='h-5 w-5' />
                  Quick Wins
                </CardTitle>
                <CardDescription>
                  High-impact improvements you can make now
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                {analysis?.quick_wins.map((win, index) => (
                  <div key={index} className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>{win.action}</span>
                      <div className='flex gap-1'>
                        <Badge className={getImpactBadgeColor(win.impact)}>
                          {win.impact}
                        </Badge>
                      </div>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {win.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='behavior'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Brain className='h-5 w-5' />
                AI Behavior & Personality
              </CardTitle>
              <CardDescription>
                Define how your AI should behave and respond to customers
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='ai-behavior'>AI Identity & Role</Label>
                <Textarea
                  id='ai-behavior'
                  placeholder='Example: You are a professional legal assistant for Carter Injury Law. You help potential clients understand their rights and schedule consultations...'
                  value={aiBehavior}
                  onChange={(e) => setAiBehavior(e.target.value)}
                  rows={4}
                />
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='personality'>Personality Traits</Label>
                  <Input
                    id='personality'
                    placeholder='Professional, empathetic, knowledgeable'
                    value={personalityTraits}
                    onChange={(e) => setPersonalityTraits(e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='tone'>Communication Tone</Label>
                  <select
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <option value='professional'>Professional</option>
                    <option value='friendly'>Friendly</option>
                    <option value='compassionate'>Compassionate</option>
                    <option value='authoritative'>Authoritative</option>
                    <option value='casual'>Casual</option>
                  </select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='expertise'>Areas of Expertise</Label>
                <Input
                  id='expertise'
                  placeholder='Personal injury law, auto accidents, medical malpractice'
                  value={expertiseAreas}
                  onChange={(e) => setExpertiseAreas(e.target.value)}
                />
              </div>

              <Button onClick={handleUpdateAIBehavior} className='w-full'>
                Update AI Behavior
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='training'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BookOpen className='h-5 w-5' />
                Custom Training Data
              </CardTitle>
              <CardDescription>
                Add specific information about your services and responses
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='training-type'>Training Type</Label>
                  <select
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    value={trainingType}
                    onChange={(e) => setTrainingType(e.target.value)}
                  >
                    <option value='faq'>FAQ / Common Questions</option>
                    <option value='services'>Services & Procedures</option>
                    <option value='policies'>Policies & Guidelines</option>
                    <option value='scripts'>Response Scripts</option>
                  </select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='training-title'>Title (Optional)</Label>
                  <Input
                    id='training-title'
                    placeholder='e.g., Auto Accident FAQ'
                    value={trainingTitle}
                    onChange={(e) => setTrainingTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='training-content'>Training Content</Label>
                <Textarea
                  id='training-content'
                  placeholder='Enter detailed information about your services, common questions and answers, or response guidelines...'
                  value={trainingContent}
                  onChange={(e) => setTrainingContent(e.target.value)}
                  rows={6}
                />
              </div>

              <Button onClick={handleUploadTrainingData} className='w-full'>
                Add Training Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='documents'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5' />
                Document Upload
              </CardTitle>
              <CardDescription>
                Upload PDFs, brochures, and other documents to train your AI
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='file-training-type'>Document Type</Label>
                <select
                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                  value={fileTrainingType}
                  onChange={(e) => setFileTrainingType(e.target.value)}
                >
                  <option value='services'>Service Information</option>
                  <option value='policies'>Policies & Procedures</option>
                  <option value='faq'>FAQ Documents</option>
                  <option value='marketing'>Marketing Materials</option>
                  <option value='legal'>Legal Information</option>
                </select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='file-upload'>Upload Document</Label>
                <Input
                  id='file-upload'
                  type='file'
                  accept='.pdf,.txt,.doc,.docx'
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile && (
                  <p className='text-sm text-muted-foreground'>
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <Button
                onClick={handleFileUpload}
                className='w-full'
                disabled={!selectedFile}
              >
                <Upload className='mr-2 h-4 w-4' />
                Upload Document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
