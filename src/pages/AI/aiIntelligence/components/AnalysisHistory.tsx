import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import type { AnalysisHistory as AnalysisHistoryType } from '@/hooks/useFaqIntelligence'
import { useFaqIntelligence } from '@/hooks/useFaqIntelligence'
import {
  Brain,
  History,
  Minus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

interface AnalysisHistoryProps {
  history: AnalysisHistoryType | undefined
  isLoading: boolean
}

export default function AnalysisHistory({
  history,
  isLoading,
}: AnalysisHistoryProps) {
  const { clearHistory, isClearingHistory } = useFaqIntelligence()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleClearHistory = () => {
    clearHistory(undefined, {
      onSuccess: () => {
        toast({
          title: 'History cleared',
          description: 'All analysis reports have been deleted',
        })
        setIsDialogOpen(false)
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to clear history',
          variant: 'destructive',
        })
      },
    })
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

  if (!history || !history.reports || history.reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <History className='h-5 w-5' />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent className='py-12 text-center text-muted-foreground'>
          <p>No analysis history available yet.</p>
          <p className='mt-2 text-sm'>
            Your last 5 analysis reports will be shown here.
          </p>
        </CardContent>
      </Card>
    )
  }

  const { reports, progress } = history

  // Get trend icon
  const getTrendIcon = () => {
    switch (progress.score_trend) {
      case 'improving':
        return <TrendingUp className='h-5 w-5 text-green-600' />
      case 'declining':
        return <TrendingDown className='h-5 w-5 text-red-600' />
      default:
        return <Minus className='h-5 w-5 text-gray-600' />
    }
  }

  const getTrendText = () => {
    switch (progress.score_trend) {
      case 'improving':
        return 'Improving'
      case 'declining':
        return 'Declining'
      default:
        return 'Stable'
    }
  }

  const getTrendColor = () => {
    switch (progress.score_trend) {
      case 'improving':
        return 'text-green-600'
      case 'declining':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className='space-y-4'>
      {/* Progress Summary */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2'>
            <History className='h-5 w-5' />
            Analysis History ({reports.length})
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant='outline' size='sm' disabled={isClearingHistory}>
                <Trash2 className='mr-1 h-4 w-4' />
                Clear History
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This will permanently delete all analysis reports. This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isClearingHistory}
                >
                  Cancel
                </Button>
                <Button
                  variant='destructive'
                  onClick={handleClearHistory}
                  disabled={isClearingHistory}
                >
                  {isClearingHistory ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Latest Score</p>
              <p className='mt-1 text-2xl font-bold'>{progress.latest_score}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Trend</p>
              <div className='mt-1 flex items-center gap-2'>
                {getTrendIcon()}
                <p className={`text-lg font-semibold ${getTrendColor()}`}>
                  {getTrendText()}
                </p>
              </div>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Total Analyses</p>
              <p className='mt-1 text-2xl font-bold'>
                {progress.total_analyses}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report List */}
      <div className='space-y-3'>
        {reports.map((report, index) => (
          <Card
            key={index}
            className={index === 0 ? 'border-2 border-blue-500' : ''}
          >
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-3'>
                    {report.analysis_type === 'full' ? (
                      <Badge variant='default'>
                        <Brain className='mr-1 h-3 w-3' />
                        Full Analysis
                      </Badge>
                    ) : (
                      <Badge variant='secondary'>
                        <Zap className='mr-1 h-3 w-3' />
                        Quick Check
                      </Badge>
                    )}
                    <span className='text-sm text-muted-foreground'>
                      {new Date(report.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {index === 0 && (
                      <Badge variant='outline' className='text-xs'>
                        Latest
                      </Badge>
                    )}
                  </div>

                  <div className='mt-3 grid grid-cols-2 gap-4 md:grid-cols-4'>
                    <div>
                      <p className='text-xs text-muted-foreground'>Score</p>
                      <p className='text-lg font-bold'>
                        {report.readiness_score}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>FAQs</p>
                      <p className='text-lg font-bold'>
                        {report.stats.faq_count}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Documents</p>
                      <p className='text-lg font-bold'>
                        {report.stats.document_count}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Alerts</p>
                      <p className='text-lg font-bold'>
                        {report.alerts.length}
                      </p>
                    </div>
                  </div>

                  {report.suggestions && report.suggestions.length > 0 && (
                    <div className='mt-3 border-t pt-3'>
                      <p className='text-xs text-muted-foreground'>
                        💡 {report.suggestions.length} suggestion(s) generated
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
