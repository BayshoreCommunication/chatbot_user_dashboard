import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProgressTracking } from '@/hooks/useFaqIntelligence'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ProgressChartProps {
  progress: ProgressTracking | undefined
  isLoading: boolean
}

export default function ProgressChart({
  progress,
  isLoading,
}: ProgressChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center p-12'>
          <LoadingSpinner size='lg' />
        </CardContent>
      </Card>
    )
  }

  if (!progress || !progress.timeline || progress.timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Tracking</CardTitle>
        </CardHeader>
        <CardContent className='py-12 text-center text-muted-foreground'>
          <p>No progress data available yet.</p>
          <p className='mt-2 text-sm'>
            Run multiple analyses to see your improvement over time.
          </p>
        </CardContent>
      </Card>
    )
  }

  const { timeline, metrics, recommendations } = progress

  // Format timeline data for chart
  const chartData = timeline.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    score: item.score,
    faqs: item.faq_count,
    alerts: item.alert_count,
  }))

  // Get trend icon
  const getTrendIcon = () => {
    if (metrics.improvement > 5) {
      return <TrendingUp className='h-5 w-5 text-green-600' />
    } else if (metrics.improvement < -5) {
      return <TrendingDown className='h-5 w-5 text-red-600' />
    } else {
      return <Minus className='h-5 w-5 text-gray-600' />
    }
  }

  const getTrendColor = () => {
    if (metrics.improvement > 5) return 'text-green-600'
    if (metrics.improvement < -5) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className='space-y-4'>
      {/* Metrics Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Latest Score</p>
            <p className='mt-1 text-2xl font-bold'>{metrics.latest_score}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>First Score</p>
            <p className='mt-1 text-2xl font-bold'>{metrics.first_score}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Improvement</p>
            <div className='mt-1 flex items-center gap-2'>
              {getTrendIcon()}
              <p className={`text-2xl font-bold ${getTrendColor()}`}>
                {metrics.improvement > 0 ? '+' : ''}
                {metrics.improvement}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Average Score</p>
            <p className='mt-1 text-2xl font-bold'>
              {metrics.average_score.toFixed(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type='monotone'
                dataKey='score'
                stroke='#8884d8'
                strokeWidth={2}
                name='Readiness Score'
              />
              <Line
                type='monotone'
                dataKey='faqs'
                stroke='#82ca9d'
                strokeWidth={2}
                name='FAQ Count'
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-2'>
              {recommendations.map((rec, index) => (
                <li key={index} className='flex items-start gap-2 text-sm'>
                  <span className='mt-0.5 text-blue-600'>💡</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Total Analyses */}
      <Card>
        <CardContent className='p-4 text-center'>
          <p className='text-sm text-muted-foreground'>
            Total Analyses Performed
          </p>
          <p className='mt-1 text-3xl font-bold'>{metrics.total_analyses}</p>
        </CardContent>
      </Card>
    </div>
  )
}
