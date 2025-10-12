import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUnknownQuestions } from '@/hooks/useUnknownQuestions'
import {
  AlertCircle,
  BarChart3,
  Brain,
  Download,
  MessageSquare,
  Plus,
} from 'lucide-react'
import React, { useState } from 'react'
import QuestionStatsCard from './components/QuestionStatsCard'

interface UnknownQuestion {
  _id: string
  organization_id: string
  session_id: string
  visitor_id?: string
  question: string
  question_normalized: string
  ai_response: string
  response_quality?: string
  user_context?: Record<string, any>
  conversation_context?: any[]
  knowledge_base_results?: any[]
  similarity_scores?: number[]
  max_similarity?: number
  question_category?: string
  is_answered_well?: boolean
  needs_human_review: boolean
  status: string
  reviewed_by?: string
  reviewed_at?: string
  improved_answer?: string
  added_to_training: boolean
  created_at: string
  updated_at: string
  frequency_count: number
  last_asked_at: string
}

const UnknownQuestionsPage: React.FC = () => {
  const { questions, stats, loading, error, exportQuestions } =
    useUnknownQuestions()

  const [selectedQuestions] = useState<string[]>([])

  if (loading) {
    return (
      <div className='flex h-[calc(100vh-120px)] w-full items-center justify-center'>
        <LoadingSpinner size='lg' text='Loading unknown questions...' />
      </div>
    )
  }
  return (
    <div className='mx-6 mb-6 mt-4 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Unknown Questions
          </h1>
          <p className='text-muted-foreground'>
            Manage questions that your chatbot couldn't answer well from
            training data
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => exportQuestions({ format: 'json' })}
            disabled={loading}
          >
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
          <Button disabled={selectedQuestions.length === 0}>
            <Plus className='mr-2 h-4 w-4' />
            Train AI ({selectedQuestions.length})
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && <QuestionStatsCard stats={stats} />}

      {error && (
        <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
          <div className='flex items-center gap-2'>
            <AlertCircle className='h-4 w-4 text-red-500' />
            <span className='text-red-700'>Error: {error}</span>
          </div>
        </div>
      )}

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Unknown Questions ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className='py-8 text-center'>
              <MessageSquare className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
              <p className='text-muted-foreground'>
                No unknown questions found. Your chatbot is handling all
                questions well!
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {questions.map((question: UnknownQuestion) => (
                <div
                  key={question._id}
                  className='space-y-3 rounded-lg border p-4'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center gap-2'>
                        <h3 className='font-medium'>{question.question}</h3>
                        {question.needs_human_review && (
                          <AlertCircle className='h-4 w-4 text-orange-500' />
                        )}
                      </div>
                      <div className='mb-2 flex items-center gap-2'>
                        <Badge
                          className={
                            question.status === 'new'
                              ? 'bg-blue-100 text-blue-800'
                              : question.status === 'reviewed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {question.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant='outline'>
                          {question.question_category || 'General'}
                        </Badge>
                        <Badge variant='secondary'>
                          Similarity:{' '}
                          {Math.round((question.max_similarity || 0) * 100)}%
                        </Badge>
                        <Badge variant='outline'>
                          Asked {question.frequency_count} times
                        </Badge>
                      </div>
                      <p className='mb-2 text-sm text-muted-foreground'>
                        <strong>AI Response:</strong> {question.ai_response}
                      </p>
                      <div className='text-xs text-muted-foreground'>
                        <span>
                          Created:{' '}
                          {new Date(question.created_at).toLocaleDateString()}
                        </span>
                        {question.user_context?.name && (
                          <span className='ml-4'>
                            User: {question.user_context.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Unknown Questions Detection Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='text-center'>
              <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
                <MessageSquare className='h-6 w-6 text-blue-600' />
              </div>
              <h3 className='font-medium'>1. User Asks Question</h3>
              <p className='text-sm text-muted-foreground'>
                User asks a question to your chatbot
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100'>
                <BarChart3 className='h-6 w-6 text-orange-600' />
              </div>
              <h3 className='font-medium'>2. AI Searches Training Data</h3>
              <p className='text-sm text-muted-foreground'>
                System checks similarity to existing knowledge
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100'>
                <Brain className='h-6 w-6 text-purple-600' />
              </div>
              <h3 className='font-medium'>3. Auto-Store if Unknown</h3>
              <p className='text-sm text-muted-foreground'>
                Questions with low similarity (&lt;70%) are saved here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UnknownQuestionsPage
