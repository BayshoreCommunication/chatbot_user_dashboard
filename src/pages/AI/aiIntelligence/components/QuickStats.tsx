import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Card, CardContent } from '@/components/ui/card'
import type { AnalysisReport } from '@/hooks/useFaqIntelligence'
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Globe,
  MessageCircle,
  MessageSquare,
  TrendingUp,
} from 'lucide-react'

interface QuickStatsProps {
  analysis: AnalysisReport | undefined
  isLoading: boolean
  analysisType: 'full' | 'quick'
}

export default function QuickStats({
  analysis,
  isLoading,
  analysisType,
}: QuickStatsProps) {
  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-6'>
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className='flex items-center justify-center p-6'>
              <LoadingSpinner size='sm' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analysis) {
    return null
  }

  const { readiness_score, stats, alerts } = analysis

  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  // Calculate score background
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    if (score >= 40) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-200'
  }

  const criticalAlerts = alerts.filter((a) => a.type === 'critical').length
  const warningAlerts = alerts.filter((a) => a.type === 'warning').length

  return (
    <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-6'>
      {/* Readiness Score */}
      <Card className={`border-2 ${getScoreBg(readiness_score)}`}>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                Readiness Score
              </p>
              <h3
                className={`mt-2 text-3xl font-bold ${getScoreColor(readiness_score)}`}
              >
                {readiness_score}
                <span className='text-lg'>/100</span>
              </h3>
              <p className='mt-1 text-xs text-muted-foreground'>
                {analysisType === 'full' ? 'AI Analysis' : 'Quick Check'}
              </p>
            </div>
            <TrendingUp
              className={`h-10 w-10 ${getScoreColor(readiness_score)}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQ Count */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                Active FAQs
              </p>
              <h3 className='mt-2 text-3xl font-bold'>{stats.faq_count}</h3>
              <p className='mt-1 text-xs text-muted-foreground'>
                {stats.faq_count >= 10
                  ? 'Excellent'
                  : stats.faq_count >= 5
                    ? 'Good'
                    : 'Need more'}
              </p>
            </div>
            <MessageSquare className='h-10 w-10 text-blue-600' />
          </div>
        </CardContent>
      </Card>

      {/* Document Count */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                Documents
              </p>
              <h3 className='mt-2 text-3xl font-bold'>
                {stats.document_count}
              </h3>
              <p className='mt-1 text-xs text-muted-foreground'>
                {stats.document_count > 0 ? 'Trained' : 'Not trained'}
              </p>
            </div>
            <FileText className='h-10 w-10 text-purple-600' />
          </div>
        </CardContent>
      </Card>

      {/* Website */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                Website URLs
              </p>
              <h3 className='mt-2 text-3xl font-bold'>
                {stats.url_count || 0}
              </h3>
              <p className='mt-1 max-w-[120px] truncate text-xs text-muted-foreground'>
                {stats.url_count && stats.url_count > 0
                  ? `Trained URLs (${stats.url_count})`
                  : 'Not set'}
              </p>
            </div>
            <Globe
              className={`h-10 w-10 ${stats.url_count && stats.url_count > 0 ? 'text-green-600' : 'text-gray-400'}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversations */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                Conversations
              </p>
              <h3 className='mt-2 text-3xl font-bold'>
                {stats.conversation_count}
              </h3>
              <p className='mt-1 text-xs text-muted-foreground'>
                {stats.conversation_count > 10 ? 'Active' : 'Growing'}
              </p>
            </div>
            <MessageCircle className='h-10 w-10 text-cyan-600' />
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                Alerts
              </p>
              <h3 className='mt-2 text-3xl font-bold'>
                {criticalAlerts + warningAlerts}
              </h3>
              <p className='mt-1 text-xs text-muted-foreground'>
                {criticalAlerts > 0 ? (
                  <span className='text-red-600'>
                    {criticalAlerts} critical
                  </span>
                ) : warningAlerts > 0 ? (
                  <span className='text-yellow-600'>
                    {warningAlerts} warnings
                  </span>
                ) : (
                  <span className='text-green-600'>All good!</span>
                )}
              </p>
            </div>
            {criticalAlerts + warningAlerts > 0 ? (
              <AlertCircle className='h-10 w-10 text-red-600' />
            ) : (
              <CheckCircle2 className='h-10 w-10 text-green-600' />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
