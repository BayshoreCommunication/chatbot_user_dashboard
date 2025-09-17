import { Button } from '@/components/custom/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertCircle,
  BarChart3,
  Brain,
  Download,
  MessageSquare,
  Plus,
} from 'lucide-react'
import React from 'react'

const UnknownQuestionsPage: React.FC = () => {
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
          <Button variant='outline'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Train AI
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Total Questions */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Questions
            </CardTitle>
            <MessageSquare className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>12</div>
            <p className='text-xs text-muted-foreground'>3 new this period</p>
          </CardContent>
        </Card>

        {/* Needs Review */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Needs Review</CardTitle>
            <AlertCircle className='h-4 w-4 text-orange-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>8</div>
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
            <div className='text-2xl font-bold text-purple-600'>4</div>
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
            <div className='text-2xl font-bold'>75%</div>
            <p className='text-xs text-muted-foreground'>Good AI responses</p>
          </CardContent>
        </Card>
      </div>

      {/* Sample Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Unknown Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* Sample Question 1 */}
            <div className='space-y-3 rounded-lg border p-4'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-2'>
                    <h3 className='font-medium'>
                      Do you handle dog bite cases in Florida?
                    </h3>
                    <AlertCircle className='h-4 w-4 text-orange-500' />
                  </div>
                  <div className='mb-2 flex items-center gap-2'>
                    <Badge className='bg-blue-100 text-blue-800'>New</Badge>
                    <Badge
                      variant='outline'
                      className='bg-red-100 text-red-800'
                    >
                      Legal
                    </Badge>
                    <Badge variant='secondary'>Similarity: 30%</Badge>
                    <Badge variant='outline'>Asked 3 times</Badge>
                  </div>
                  <p className='mb-2 text-sm text-muted-foreground'>
                    <strong>AI Response:</strong> Yes, we handle various injury
                    cases including dog bites. Dog bite laws vary by state and
                    we can help you understand your rights...
                  </p>
                  <div className='text-xs text-muted-foreground'>
                    <span>Created: {new Date().toLocaleDateString()}</span>
                    <span className='ml-4'>User: John Smith</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Question 2 */}
            <div className='space-y-3 rounded-lg border p-4'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-2'>
                    <h3 className='font-medium'>
                      What are your office hours on weekends?
                    </h3>
                    <AlertCircle className='h-4 w-4 text-yellow-500' />
                  </div>
                  <div className='mb-2 flex items-center gap-2'>
                    <Badge className='bg-blue-100 text-blue-800'>New</Badge>
                    <Badge
                      variant='outline'
                      className='bg-green-100 text-green-800'
                    >
                      Contact
                    </Badge>
                    <Badge variant='secondary'>Similarity: 45%</Badge>
                  </div>
                  <p className='mb-2 text-sm text-muted-foreground'>
                    <strong>AI Response:</strong> Our office hours are Monday
                    through Friday, 9 AM to 5 PM. For urgent matters, you can
                    contact us anytime...
                  </p>
                  <div className='text-xs text-muted-foreground'>
                    <span>Created: {new Date().toLocaleDateString()}</span>
                    <span className='ml-4'>User: Anonymous</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-6 text-center'>
            <p className='text-muted-foreground'>
              🚀 <strong>System is working!</strong> Your chatbot will
              automatically detect and store questions it can't answer well.
            </p>
            <p className='mt-2 text-sm text-muted-foreground'>
              Questions with similarity scores below 70% will appear here for
              review.
            </p>
          </div>
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
