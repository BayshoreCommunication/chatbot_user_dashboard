import { getApiUrl } from '@/lib/utils'
import { useEffect, useState } from 'react'

export default function ApiUrlDebug() {
  const [apiUrl, setApiUrl] = useState<string>('')
  const [envUrl, setEnvUrl] = useState<string>('')
  const [isProd, setIsProd] = useState<boolean>(false)

  useEffect(() => {
    setApiUrl(getApiUrl())
    setEnvUrl(import.meta.env.VITE_API_URL || 'NOT_SET')
    setIsProd(import.meta.env.PROD)
  }, [])

  if (!import.meta.env.DEV) {
    return null // Only show in development
  }

  return (
    <div className='fixed bottom-4 left-4 z-50 max-w-sm rounded border border-yellow-300 bg-yellow-100 p-3 text-xs'>
      <h4 className='mb-2 font-bold'>API URL Debug (Dev Only)</h4>
      <div className='space-y-1'>
        <div>
          <strong>Environment:</strong> {isProd ? 'Production' : 'Development'}
        </div>
        <div>
          <strong>VITE_API_URL:</strong> {envUrl}
        </div>
        <div>
          <strong>getApiUrl():</strong> {apiUrl}
        </div>
        <div>
          <strong>Uses HTTPS:</strong>{' '}
          {apiUrl.startsWith('https://') ? '✅ Yes' : '❌ No'}
        </div>
      </div>
    </div>
  )
}
