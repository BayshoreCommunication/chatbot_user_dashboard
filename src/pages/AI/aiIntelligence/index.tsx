import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFaqIntelligence } from '@/hooks/useFaqIntelligence'
import { useQueryClient } from '@tanstack/react-query'
import { Brain, History, RefreshCw, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import AnalysisHistory from './components/AnalysisHistory'
import AnalysisOverview from './components/AnalysisOverview'
import FAQSuggestions from './components/FAQSuggestions'
import ProgressChart from './components/ProgressChart'
import QuickStats from './components/QuickStats'

export default function AiIntelligence() {
  const [activeTab, setActiveTab] = useState('overview')
  const queryClient = useQueryClient()

  const {
    latestAnalysis,
    isLoadingAnalysis,
    runAnalysis,
    isAnalyzing,
    history,
    isLoadingHistory,
    progress,
    isLoadingProgress,
  } = useFaqIntelligence()

  const isLoading = isLoadingAnalysis || isAnalyzing

  const handleSuggestionAdded = () => {
    // Refresh FAQ intelligence data after adding a new FAQ
    queryClient.invalidateQueries({ queryKey: ['faqIntelligence'] })
  }

  return (
    <div className='flex flex-col gap-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>AI Intelligence</h1>
          <p className='mt-1 text-muted-foreground'>
            AI-powered analysis of your chatbot's knowledge base readiness
          </p>
        </div>
        <Button onClick={() => runAnalysis()} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <LoadingSpinner size='xs' />
              <span className='ml-2'>Analyzing...</span>
            </>
          ) : (
            <>
              <RefreshCw className='mr-2 h-4 w-4' />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {/* Quick Stats */}
      <QuickStats
        analysis={latestAnalysis}
        isLoading={isLoading}
        analysisType={latestAnalysis?.analysis_type || 'full'}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>
            <Brain className='mr-2 h-4 w-4' />
            Overview
          </TabsTrigger>
          <TabsTrigger value='suggestions'>
            <Brain className='mr-2 h-4 w-4' />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value='progress'>
            <TrendingUp className='mr-2 h-4 w-4' />
            Progress
          </TabsTrigger>
          <TabsTrigger value='history'>
            <History className='mr-2 h-4 w-4' />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='mt-6 space-y-4'>
          <AnalysisOverview analysis={latestAnalysis} isLoading={isLoading} />
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value='suggestions' className='mt-6 space-y-4'>
          <FAQSuggestions
            suggestions={latestAnalysis?.suggestions || []}
            isLoading={isLoading}
            onSuggestionAdded={handleSuggestionAdded}
          />
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value='progress' className='mt-6 space-y-4'>
          <ProgressChart progress={progress} isLoading={isLoadingProgress} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value='history' className='mt-6 space-y-4'>
          <AnalysisHistory history={history} isLoading={isLoadingHistory} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
