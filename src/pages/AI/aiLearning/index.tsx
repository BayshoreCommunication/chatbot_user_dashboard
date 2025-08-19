import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useApiKey } from '@/hooks/useApiKey'
import useAxiosPublic from '@/hooks/useAxiosPublic'
import ContentSection from '@/pages/settings/components/content-section'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'

interface LearningAnalytics {
  total_interactions: number
  recent_interactions: number
  follow_up_rate: number
  avg_response_time: number
  learning_score: number
}

interface ImprovementSuggestion {
  frequent_questions: Array<{
    question: string
    frequency: number
    suggestion: string
  }>
  questions_with_follow_ups: Array<{
    question: string
    follow_up_rate: number
    suggestion: string
  }>
  slow_responses: Array<{
    question: string
    avg_time: number
    suggestion: string
  }>
  suggested_faqs: Array<{
    question: string
    answer: string
    frequency: number
  }>
}

interface CommonQuestion {
  _id: string
  count: number
  avg_response_time: number
  has_follow_ups: number
  sample_response: string
}

export default function AILearningPage() {
  const axiosPublic = useAxiosPublic()
  const { apiKey } = useApiKey()
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null)
  const [suggestions, setSuggestions] = useState<ImprovementSuggestion | null>(
    null
  )
  const [commonQuestions, setCommonQuestions] = useState<CommonQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  useEffect(() => {
    fetchLearningData()
  }, [apiKey, selectedPeriod])

  const fetchLearningData = async () => {
    try {
      setLoading(true)

      // Fetch learning analytics
      const analyticsResponse = await axiosPublic.get(
        '/api/chatbot/learning-analytics',
        {
          headers: { 'X-API-Key': apiKey },
        }
      )

      // Fetch common questions
      const questionsResponse = await axiosPublic.get(
        `/api/chatbot/common-questions?days=${selectedPeriod}`,
        {
          headers: { 'X-API-Key': apiKey },
        }
      )

      if (analyticsResponse.data.status === 'success') {
        setAnalytics(analyticsResponse.data.analytics)
        setSuggestions(analyticsResponse.data.improvement_suggestions)
      }

      if (questionsResponse.data.status === 'success') {
        setCommonQuestions(questionsResponse.data.common_questions)
      }
    } catch (error) {
      console.error('Error fetching learning data:', error)
      toast.error('Failed to load learning analytics')
    } finally {
      setLoading(false)
    }
  }

  const createFaqFromSuggestion = async (question: string, answer: string) => {
    try {
      const response = await axiosPublic.post(
        '/api/faq/create',
        {
          question,
          response: answer,
          is_active: true,
          persistent_menu: false,
        },
        {
          headers: { 'X-API-Key': apiKey },
        }
      )

      if (response.data) {
        toast.success('FAQ created successfully')
        fetchLearningData() // Refresh data
      }
    } catch (error) {
      console.error('Error creating FAQ:', error)
      toast.error('Failed to create FAQ')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className='flex h-[calc(100vh-120px)] w-full items-center justify-center'>
        <LoadingSpinner size='lg' text='Loading AI learning analytics...' />
      </div>
    )
  }

  return (
    <div className='mx-6 mt-4'>
      <ContentSection title='AI Learning Analytics'>
        <div className='space-y-6'>
          <p className='text-muted-foreground'>
            Monitor how your AI is learning from user interactions and get
            insights to improve response quality.
          </p>

          {/* Period Selector */}
          <div className='mb-6 flex gap-2'>
            {[7, 30, 90].map((days) => (
              <Button
                key={days}
                variant={selectedPeriod === days ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSelectedPeriod(days)}
              >
                Last {days} days
              </Button>
            ))}
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {analytics.total_interactions}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {analytics.recent_interactions} in selected period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Learning Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(analytics.learning_score)}`}
                  >
                    {analytics.learning_score}%
                  </div>
                  <Progress
                    value={analytics.learning_score}
                    className='mt-2 w-full'
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Follow-up Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {analytics.follow_up_rate}%
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Lower is better
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Avg Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {Math.round(analytics.avg_response_time)}ms
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Response generation time
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Common Questions Chart */}
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>Most Frequent Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {commonQuestions.length > 0 ? (
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={commonQuestions.slice(0, 10)}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='_id'
                      angle={-45}
                      textAnchor='end'
                      height={100}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='count' fill='#8884d8' />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className='py-8 text-center text-muted-foreground'>
                  No questions data available for the selected period
                </p>
              )}
            </CardContent>
          </Card>

          {/* Improvement Suggestions */}
          {suggestions && (
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {/* Frequent Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    Frequent Questions
                    <Badge variant='secondary'>
                      {suggestions.frequent_questions.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {suggestions.frequent_questions
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={index} className='rounded-lg border p-3'>
                          <div className='mb-2 flex items-start justify-between'>
                            <h4 className='text-sm font-medium'>
                              {item.question}
                            </h4>
                            <Badge
                              className={getScoreBadgeColor(
                                100 - item.frequency * 5
                              )}
                            >
                              {item.frequency}x
                            </Badge>
                          </div>
                          <p className='mb-2 text-xs text-muted-foreground'>
                            {item.suggestion}
                          </p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Questions with Follow-ups */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    Questions Needing Improvement
                    <Badge variant='secondary'>
                      {suggestions.questions_with_follow_ups.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {suggestions.questions_with_follow_ups
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={index} className='rounded-lg border p-3'>
                          <div className='mb-2 flex items-start justify-between'>
                            <h4 className='text-sm font-medium'>
                              {item.question}
                            </h4>
                            <Badge variant='destructive'>
                              {item.follow_up_rate}% follow-ups
                            </Badge>
                          </div>
                          <p className='mb-2 text-xs text-muted-foreground'>
                            {item.suggestion}
                          </p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggested FAQs */}
              <Card className='lg:col-span-2'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    Suggested FAQs to Create
                    <Badge variant='secondary'>
                      {suggestions.suggested_faqs.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {suggestions.suggested_faqs
                      .slice(0, 6)
                      .map((item, index) => (
                        <div key={index} className='rounded-lg border p-4'>
                          <div className='mb-2 flex items-start justify-between'>
                            <h4 className='text-sm font-medium'>
                              {item.question}
                            </h4>
                            <Badge className='bg-blue-100 text-blue-800'>
                              {item.frequency}x asked
                            </Badge>
                          </div>
                          <p className='mb-3 line-clamp-2 text-xs text-muted-foreground'>
                            {item.answer}
                          </p>
                          <Button
                            size='sm'
                            onClick={() =>
                              createFaqFromSuggestion(
                                item.question,
                                item.answer
                              )
                            }
                            className='w-full'
                          >
                            Create FAQ
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex justify-end gap-4 pt-6'>
            <Button variant='outline' onClick={fetchLearningData}>
              Refresh Data
            </Button>
            <Button
              onClick={() => window.open('/dashboard/train-ai', '_blank')}
            >
              Go to Training
            </Button>
          </div>
        </div>
      </ContentSection>
    </div>
  )
}
