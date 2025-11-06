import { useApiKey } from '@/hooks/useApiKey'
import useAxiosPublic from '@/hooks/useAxiosPublic'
import { getApiUrl } from '@/lib/utils'
import { useEffect, useState } from 'react'

export default function ApiDebug() {
  const [apiStatus, setApiStatus] = useState<{
    healthz: string
    instantReply: string
    faq: string
    training: string
  }>({
    healthz: 'pending',
    instantReply: 'pending',
    faq: 'pending',
    training: 'pending',
  })

  const axiosPublic = useAxiosPublic()
  const { apiKey } = useApiKey() as { apiKey: string }

  useEffect(() => {
    const testEndpoints = async () => {
      const baseUrl = getApiUrl()
      console.log('Testing API endpoints with base URL:', baseUrl)

      // Test healthz endpoint
      try {
        await axiosPublic.get('/healthz')
        setApiStatus((prev) => ({ ...prev, healthz: 'success' }))
      } catch (error) {
        console.error('Healthz endpoint failed:', error)
        setApiStatus((prev) => ({ ...prev, healthz: 'failed' }))
      }

      // Test instant-reply endpoint
      try {
        await axiosPublic.get('/api/instant-reply/', {
          headers: { 'X-API-Key': apiKey },
        })
        setApiStatus((prev) => ({ ...prev, instantReply: 'success' }))
      } catch (error) {
        console.error('Instant-reply endpoint failed:', error)
        setApiStatus((prev) => ({ ...prev, instantReply: 'failed' }))
      }

      // Test FAQ endpoint
      try {
        await axiosPublic.get('/api/faq/list', {
          headers: { 'X-API-Key': apiKey },
        })
        setApiStatus((prev) => ({ ...prev, faq: 'success' }))
      } catch (error) {
        console.error('FAQ endpoint failed:', error)
        setApiStatus((prev) => ({ ...prev, faq: 'failed' }))
      }

      // Test training endpoint
      try {
        await axiosPublic.get('/api/chatbot/upload_history', {
          headers: { 'X-API-Key': apiKey },
        })
        setApiStatus((prev) => ({ ...prev, training: 'success' }))
      } catch (error) {
        console.error('Training endpoint failed:', error)
        setApiStatus((prev) => ({ ...prev, training: 'failed' }))
      }
    }

    if (apiKey) {
      testEndpoints()
    }
  }, [apiKey, axiosPublic])

  if (!import.meta.env.DEV) {
    return null // Only show in development
  }

  return (
    <div className='fixed bottom-4 right-4 z-50 max-w-sm rounded border border-blue-300 bg-blue-100 p-3 text-xs'>
      <h4 className='mb-2 font-bold'>API Debug (Dev Only)</h4>
      <div className='space-y-1'>
        <div>
          <strong>Base URL:</strong> {getApiUrl()}
        </div>
        <div>
          <strong>API Key:</strong> {apiKey ? 'Set' : 'Not Set'}
        </div>
        <div>
          <strong>Healthz:</strong>
          <span
            className={`ml-1 ${apiStatus.healthz === 'success' ? 'text-green-600' : apiStatus.healthz === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}
          >
            {apiStatus.healthz}
          </span>
        </div>
        <div>
          <strong>Instant Reply:</strong>
          <span
            className={`ml-1 ${apiStatus.instantReply === 'success' ? 'text-green-600' : apiStatus.instantReply === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}
          >
            {apiStatus.instantReply}
          </span>
        </div>
        <div>
          <strong>FAQ:</strong>
          <span
            className={`ml-1 ${apiStatus.faq === 'success' ? 'text-green-600' : apiStatus.faq === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}
          >
            {apiStatus.faq}
          </span>
        </div>
        <div>
          <strong>Training:</strong>
          <span
            className={`ml-1 ${apiStatus.training === 'success' ? 'text-green-600' : apiStatus.training === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}
          >
            {apiStatus.training}
          </span>
        </div>
      </div>
    </div>
  )
}
