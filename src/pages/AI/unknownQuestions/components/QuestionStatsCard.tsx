import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, BarChart3, Brain, MessageSquare } from 'lucide-react'
import React from 'react'

interface QuestionStatsCardProps {
  stats: {
    total_unknown_questions: number
    new_questions: number
    reviewed_questions: number
    added_to_training: number
    ignored_questions: number
    good_ai_responses: number
    poor_ai_responses: number
    needs_improvement: number
    legal_questions: number
    appointment_questions: number
    general_questions: number
    other_questions: number
  }
}

const QuestionStatsCard: React.FC<QuestionStatsCardProps> = ({ stats }) => {
  const totalQuestions = stats.total_unknown_questions
  const responseQualityPercentage =
    totalQuestions > 0
      ? Math.round((stats.good_ai_responses / totalQuestions) * 100)
      : 0

  return (
    <div className='mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {/* Total Questions */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Questions</CardTitle>
          <MessageSquare className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalQuestions}</div>
          <p className='text-xs text-muted-foreground'>
            {stats.new_questions} new this period
          </p>
        </CardContent>
      </Card>

      {/* Needs Review */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Needs Review</CardTitle>
          <AlertCircle className='h-4 w-4 text-orange-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-orange-600'>
            {stats.needs_improvement}
          </div>
          <p className='text-xs text-muted-foreground'>
            Require human attention
          </p>
        </CardContent>
      </Card>

      {/* Added to Training */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Added to Training
          </CardTitle>
          <Brain className='h-4 w-4 text-purple-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-purple-600'>
            {stats.added_to_training}
          </div>
          <p className='text-xs text-muted-foreground'>
            Improved knowledge base
          </p>
        </CardContent>
      </Card>

      {/* Response Quality */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Response Quality
          </CardTitle>
          <BarChart3 className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{responseQualityPercentage}%</div>
          <Progress value={responseQualityPercentage} className='mt-2' />
          <p className='mt-1 text-xs text-muted-foreground'>
            Good AI responses
          </p>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className='md:col-span-2'>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Questions by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Legal</span>
              <div className='flex items-center gap-2'>
                <Progress
                  value={(stats.legal_questions / totalQuestions) * 100}
                  className='w-20'
                />
                <span className='text-sm font-medium'>
                  {stats.legal_questions}
                </span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Appointments</span>
              <div className='flex items-center gap-2'>
                <Progress
                  value={(stats.appointment_questions / totalQuestions) * 100}
                  className='w-20'
                />
                <span className='text-sm font-medium'>
                  {stats.appointment_questions}
                </span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>General</span>
              <div className='flex items-center gap-2'>
                <Progress
                  value={(stats.general_questions / totalQuestions) * 100}
                  className='w-20'
                />
                <span className='text-sm font-medium'>
                  {stats.general_questions}
                </span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Other</span>
              <div className='flex items-center gap-2'>
                <Progress
                  value={(stats.other_questions / totalQuestions) * 100}
                  className='w-20'
                />
                <span className='text-sm font-medium'>
                  {stats.other_questions}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card className='md:col-span-2'>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex items-center gap-2'>
              <div className='h-3 w-3 rounded-full bg-blue-500'></div>
              <span className='text-sm'>New: {stats.new_questions}</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-3 w-3 rounded-full bg-green-500'></div>
              <span className='text-sm'>
                Reviewed: {stats.reviewed_questions}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-3 w-3 rounded-full bg-purple-500'></div>
              <span className='text-sm'>
                In Training: {stats.added_to_training}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-3 w-3 rounded-full bg-gray-500'></div>
              <span className='text-sm'>
                Ignored: {stats.ignored_questions}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default QuestionStatsCard
