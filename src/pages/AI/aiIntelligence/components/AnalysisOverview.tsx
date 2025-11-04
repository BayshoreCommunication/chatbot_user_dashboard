import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AnalysisReport } from '@/hooks/useFaqIntelligence'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
} from 'lucide-react'

interface AnalysisOverviewProps {
  analysis: AnalysisReport | undefined
  isLoading: boolean
}

export default function AnalysisOverview({
  analysis,
  isLoading,
}: AnalysisOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center p-12'>
          <LoadingSpinner size='lg' />
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className='p-12 text-center text-muted-foreground'>
          No analysis data available. Click "Full Analysis" to start.
        </CardContent>
      </Card>
    )
  }

  const { alerts = [], stats, analysis: detailedAnalysis } = analysis

  // Safety check for stats
  if (!stats) {
    return (
      <Card>
        <CardContent className='p-12 text-center text-muted-foreground'>
          Analysis data incomplete. Please try running the analysis again.
        </CardContent>
      </Card>
    )
  }

  // Group alerts by category
  const alertsByCategory: Record<string, typeof alerts> = {}
  alerts.forEach((alert) => {
    if (!alertsByCategory[alert.category]) {
      alertsByCategory[alert.category] = []
    }
    alertsByCategory[alert.category].push(alert)
  })

  // Get alert icon and color
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className='h-5 w-5' />
      case 'error':
        return <AlertCircle className='h-5 w-5' />
      case 'warning':
        return <AlertTriangle className='h-5 w-5' />
      case 'info':
        return <Info className='h-5 w-5' />
      default:
        return <Info className='h-5 w-5' />
    }
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {/* Profile Status */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            {stats.profile_complete ? (
              <CheckCircle2 className='h-5 w-5 text-green-600' />
            ) : (
              <AlertCircle className='h-5 w-5 text-red-600' />
            )}
            Profile Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Status</span>
              <Badge
                variant={stats.profile_complete ? 'default' : 'destructive'}
              >
                {stats.profile_complete ? 'Complete' : 'Incomplete'}
              </Badge>
            </div>

            {stats.missing_fields && stats.missing_fields.length > 0 && (
              <div className='border-t pt-2'>
                <p className='mb-2 text-sm font-medium'>Missing Fields:</p>
                <div className='flex flex-wrap gap-2'>
                  {stats.missing_fields.map((field) => (
                    <Badge key={field} variant='outline' className='text-xs'>
                      {field.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {detailedAnalysis?.profile && (
              <div className='border-t pt-2 text-sm text-muted-foreground'>
                {JSON.stringify(detailedAnalysis.profile).slice(0, 100)}...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base Status */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            {stats.faq_count >= 5 ? (
              <CheckCircle2 className='h-5 w-5 text-green-600' />
            ) : (
              <AlertTriangle className='h-5 w-5 text-yellow-600' />
            )}
            Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>FAQs</span>
              <span className='text-2xl font-bold'>{stats.faq_count}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Documents</span>
              <span className='text-2xl font-bold'>{stats.document_count}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                Conversations
              </span>
              <span className='text-2xl font-bold'>
                {stats.conversation_count}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts - Full Width */}
      {alerts.length > 0 && (
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Alerts & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {Object.entries(alertsByCategory).map(
                ([category, categoryAlerts]) => (
                  <div key={category} className='space-y-2'>
                    <h4 className='border-b pb-1 text-sm font-medium capitalize'>
                      {category}
                    </h4>
                    {categoryAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border p-3 ${
                          alert.type === 'critical' || alert.type === 'error'
                            ? 'border-red-200 bg-red-50'
                            : alert.type === 'warning'
                              ? 'border-yellow-200 bg-yellow-50'
                              : 'border-blue-200 bg-blue-50'
                        }`}
                      >
                        <div className='flex items-start gap-3'>
                          {getAlertIcon(alert.type)}
                          <div className='flex-1'>
                            <h5 className='text-sm font-medium'>
                              {alert.message}
                            </h5>
                            {(alert.action || alert.suggestion) && (
                              <p className='mt-1 text-xs text-muted-foreground'>
                                💡 {alert.action || alert.suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {alerts.length === 0 && (
        <Card className='border-green-200 bg-green-50 md:col-span-2'>
          <CardContent className='flex items-center gap-3 p-6'>
            <CheckCircle2 className='h-8 w-8 text-green-600' />
            <div>
              <h3 className='font-semibold text-green-900'>
                Excellent Setup! 🎉
              </h3>
              <p className='text-sm text-green-700'>
                Your AI chatbot is fully configured and ready to provide
                intelligent responses.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
