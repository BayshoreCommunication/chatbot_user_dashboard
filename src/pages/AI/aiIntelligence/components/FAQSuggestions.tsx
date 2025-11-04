import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import type { FAQSuggestion } from '@/hooks/useFaqIntelligence'
import { CheckCircle, Copy, Lightbulb, Plus } from 'lucide-react'
import { useState } from 'react'

interface FAQSuggestionsProps {
  suggestions: FAQSuggestion[]
  isLoading: boolean
}

export default function FAQSuggestions({
  suggestions,
  isLoading,
}: FAQSuggestionsProps) {
  const { toast } = useToast()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = (suggestion: FAQSuggestion, index: number) => {
    const question = suggestion.question || ''
    const answer = suggestion.answer || suggestion.suggested_answer || ''
    const text = `Q: ${question}\n\nA: ${answer}`
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    toast({
      title: 'Copied to clipboard',
      description: 'FAQ question and answer copied successfully',
    })
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const getPriorityColor = (
    priority: string
  ): 'destructive' | 'default' | 'secondary' | 'outline' => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center p-12'>
          <LoadingSpinner size='lg' />
        </CardContent>
      </Card>
    )
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Lightbulb className='h-5 w-5 text-yellow-600' />
            AI-Powered FAQ Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className='py-12 text-center text-muted-foreground'>
          <p>No suggestions available yet.</p>
          <p className='mt-2 text-sm'>
            Run a full analysis to get AI-powered FAQ recommendations.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Filter only FAQ suggestions (exclude document, website, etc.)
  const faqSuggestions = suggestions.filter(
    (s) => s.type === 'missing_faq' || (!s.type && s.question)
  )

  if (faqSuggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Lightbulb className='h-5 w-5 text-yellow-600' />
            AI-Powered FAQ Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className='py-12 text-center text-muted-foreground'>
          <p>No FAQ suggestions generated yet.</p>
          <p className='mt-2 text-sm'>
            Your knowledge base looks good! Run another analysis later to check
            for new suggestions.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group suggestions by priority
  const highPriority = faqSuggestions.filter((s) => s.priority === 'high')
  const mediumPriority = faqSuggestions.filter((s) => s.priority === 'medium')
  const lowPriority = faqSuggestions.filter((s) => s.priority === 'low')

  return (
    <div className='space-y-6'>
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Lightbulb className='h-5 w-5 text-yellow-600' />
            AI-Powered FAQ Suggestions ({faqSuggestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            Based on your website content, conversation history, and industry
            type, here are FAQ recommendations to improve your AI chatbot's
            knowledge base.
          </p>
          <div className='mt-4 flex gap-4'>
            {highPriority.length > 0 && (
              <Badge variant='destructive'>
                {highPriority.length} High Priority
              </Badge>
            )}
            {mediumPriority.length > 0 && (
              <Badge variant='default'>
                {mediumPriority.length} Medium Priority
              </Badge>
            )}
            {lowPriority.length > 0 && (
              <Badge variant='secondary'>
                {lowPriority.length} Low Priority
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* High Priority Suggestions */}
      {highPriority.length > 0 && (
        <div className='space-y-3'>
          <h3 className='flex items-center gap-2 text-lg font-semibold text-red-600'>
            <span className='h-2 w-2 rounded-full bg-red-600'></span>
            High Priority ({highPriority.length})
          </h3>
          {highPriority.map((suggestion, index) => (
            <SuggestionCard
              key={index}
              suggestion={suggestion}
              index={index}
              onCopy={handleCopy}
              isCopied={copiedIndex === index}
              getPriorityColor={getPriorityColor}
            />
          ))}
        </div>
      )}

      {/* Medium Priority Suggestions */}
      {mediumPriority.length > 0 && (
        <div className='space-y-3'>
          <h3 className='flex items-center gap-2 text-lg font-semibold text-blue-600'>
            <span className='h-2 w-2 rounded-full bg-blue-600'></span>
            Medium Priority ({mediumPriority.length})
          </h3>
          {mediumPriority.map((suggestion, index) => (
            <SuggestionCard
              key={index}
              suggestion={suggestion}
              index={index + highPriority.length}
              onCopy={handleCopy}
              isCopied={copiedIndex === index + highPriority.length}
              getPriorityColor={getPriorityColor}
            />
          ))}
        </div>
      )}

      {/* Low Priority Suggestions */}
      {lowPriority.length > 0 && (
        <div className='space-y-3'>
          <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-600'>
            <span className='h-2 w-2 rounded-full bg-gray-600'></span>
            Low Priority ({lowPriority.length})
          </h3>
          {lowPriority.map((suggestion, index) => (
            <SuggestionCard
              key={index}
              suggestion={suggestion}
              index={index + highPriority.length + mediumPriority.length}
              onCopy={handleCopy}
              isCopied={
                copiedIndex ===
                index + highPriority.length + mediumPriority.length
              }
              getPriorityColor={getPriorityColor}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Sub-component for individual suggestion card
interface SuggestionCardProps {
  suggestion: FAQSuggestion
  index: number
  onCopy: (suggestion: FAQSuggestion, index: number) => void
  isCopied: boolean
  getPriorityColor: (priority: string) => string
}

function SuggestionCard({
  suggestion,
  index,
  onCopy,
  isCopied,
  getPriorityColor,
}: SuggestionCardProps) {
  // Handle both 'answer' and 'suggested_answer' fields
  const answer = suggestion.answer || suggestion.suggested_answer || ''
  const question = suggestion.question || ''

  return (
    <Card className='border-l-4 border-l-blue-500'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1 space-y-3'>
            {/* Question */}
            <div>
              <div className='mb-2 flex items-center gap-2'>
                <Badge
                  variant={
                    getPriorityColor(suggestion.priority || 'low') as
                      | 'destructive'
                      | 'default'
                      | 'secondary'
                      | 'outline'
                  }
                >
                  {(suggestion.priority || 'low').toUpperCase()}
                </Badge>
                {suggestion.category && (
                  <Badge variant='outline'>{suggestion.category}</Badge>
                )}
                {suggestion.source && (
                  <span className='text-xs text-muted-foreground'>
                    Source: {suggestion.source}
                  </span>
                )}
              </div>
              <h4 className='text-base font-semibold'>{question}</h4>
            </div>

            {/* Answer */}
            <div className='rounded-md bg-muted/50 p-3 text-sm text-muted-foreground'>
              <p className='whitespace-pre-wrap'>{answer}</p>
            </div>

            {/* Reasoning */}
            {suggestion.reasoning && (
              <div className='border-l-2 pl-3 text-xs italic text-muted-foreground'>
                💡 {suggestion.reasoning}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className='flex flex-col gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => onCopy(suggestion, index)}
            >
              {isCopied ? (
                <>
                  <CheckCircle className='mr-1 h-4 w-4 text-green-600' />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className='mr-1 h-4 w-4' />
                  Copy
                </>
              )}
            </Button>
            <Button size='sm' variant='default'>
              <Plus className='mr-1 h-4 w-4' />
              Add FAQ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
