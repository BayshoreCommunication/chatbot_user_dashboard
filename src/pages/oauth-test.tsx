import { Button } from '@/components/custom/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function OAuthTest() {
  const [checks, setChecks] = useState({
    clientId: { status: 'checking', message: '' },
    origin: { status: 'checking', message: '' },
    apiUrl: { status: 'checking', message: '' },
  })

  useEffect(() => {
    // Check environment variables
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const apiUrl = import.meta.env.VITE_API_URL
    const origin = window.location.origin

    setChecks({
      clientId: {
        status: clientId ? 'success' : 'error',
        message: clientId || 'NOT SET - Add to Vercel Dashboard',
      },
      origin: {
        status: 'info',
        message: origin,
      },
      apiUrl: {
        status: apiUrl ? 'success' : 'error',
        message: apiUrl || 'NOT SET',
      },
    })
  }, [])

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className='h-5 w-5 text-green-500' />
      case 'error':
        return <XCircle className='h-5 w-5 text-red-500' />
      default:
        return <AlertCircle className='h-5 w-5 text-yellow-500' />
    }
  }

  return (
    <div className='container mx-auto max-w-4xl px-4 py-10'>
      <Card>
        <CardHeader>
          <CardTitle className='text-3xl'>
            Google OAuth Configuration Test
          </CardTitle>
          <CardDescription>
            Verify your Google OAuth setup before testing sign-in
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Environment Variables Check */}
          <div>
            <h3 className='mb-4 text-lg font-semibold'>
              1. Environment Variables
            </h3>

            <div className='space-y-3'>
              <div className='flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900'>
                {getIcon(checks.clientId.status)}
                <div className='flex-1'>
                  <p className='font-medium'>VITE_GOOGLE_CLIENT_ID</p>
                  <p className='break-all text-sm text-gray-600 dark:text-gray-400'>
                    {checks.clientId.message}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900'>
                {getIcon(checks.apiUrl.status)}
                <div className='flex-1'>
                  <p className='font-medium'>VITE_API_URL</p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {checks.apiUrl.message}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900'>
                {getIcon(checks.origin.status)}
                <div className='flex-1'>
                  <p className='font-medium'>Current Origin</p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {checks.origin.message}
                  </p>
                </div>
              </div>
            </div>

            {checks.clientId.status === 'error' && (
              <Alert className='mt-4 border-red-500 bg-red-50 dark:bg-red-950'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  <strong>Action Required:</strong> Go to Vercel Dashboard →
                  Settings → Environment Variables
                  <br />
                  Add:{' '}
                  <code className='rounded bg-red-100 px-1 dark:bg-red-900'>
                    VITE_GOOGLE_CLIENT_ID
                  </code>{' '}
                  with your Google Client ID
                  <br />
                  Then redeploy the application.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Google Console Check */}
          <div>
            <h3 className='mb-4 text-lg font-semibold'>
              2. Google Cloud Console
            </h3>
            <Alert className='border-yellow-500 bg-yellow-50 dark:bg-yellow-950'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                <p className='mb-2 font-semibold'>
                  Verify this origin is authorized:
                </p>
                <code className='mb-3 block rounded bg-yellow-100 px-2 py-1 dark:bg-yellow-900'>
                  {window.location.origin}
                </code>
                <ol className='list-inside list-decimal space-y-2 text-sm'>
                  <li>
                    Go to{' '}
                    <a
                      href='https://console.cloud.google.com/apis/credentials'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 underline'
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Click on your OAuth 2.0 Client ID</li>
                  <li>
                    Under "Authorized JavaScript origins", add the origin above
                  </li>
                  <li>
                    Click SAVE and wait 5-10 minutes for changes to propagate
                  </li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>

          {/* Common Errors */}
          <div>
            <h3 className='mb-4 text-lg font-semibold'>3. Common 400 Errors</h3>
            <div className='space-y-3 text-sm'>
              <div className='border-l-4 border-red-500 py-2 pl-4'>
                <p className='font-semibold'>
                  Error: "The server cannot process the request because it is
                  malformed"
                </p>
                <p className='mt-1 text-gray-600 dark:text-gray-400'>
                  <strong>Cause:</strong> Client ID is undefined or origin not
                  authorized
                  <br />
                  <strong>Fix:</strong> Set environment variables in Vercel and
                  add origin to Google Console
                </p>
              </div>

              <div className='border-l-4 border-orange-500 py-2 pl-4'>
                <p className='font-semibold'>Error: "Origin not allowed"</p>
                <p className='mt-1 text-gray-600 dark:text-gray-400'>
                  <strong>Cause:</strong> Current origin not in Google Console
                  authorized origins
                  <br />
                  <strong>Fix:</strong> Add {window.location.origin} to Google
                  Console
                </p>
              </div>

              <div className='border-l-4 border-blue-500 py-2 pl-4'>
                <p className='font-semibold'>
                  Error: "Network error" or "Failed to fetch"
                </p>
                <p className='mt-1 text-gray-600 dark:text-gray-400'>
                  <strong>Cause:</strong> Backend not reachable or CORS issue
                  <br />
                  <strong>Fix:</strong> Verify backend is running at{' '}
                  {checks.apiUrl.message}
                </p>
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className='flex gap-4 pt-4'>
            <Button
              onClick={() => (window.location.href = '/sign-up')}
              className='flex-1'
            >
              Test Sign Up
            </Button>
            <Button
              onClick={() => (window.location.href = '/sign-in')}
              variant='outline'
              className='flex-1'
            >
              Test Sign In
            </Button>
          </div>

          {/* Console Instructions */}
          <Alert>
            <AlertDescription>
              <p className='mb-2 font-semibold'>Debug in Browser Console:</p>
              <ol className='list-inside list-decimal space-y-1 text-sm'>
                <li>Press F12 to open Developer Tools</li>
                <li>Go to Console tab</li>
                <li>Click "Test Sign Up" or "Test Sign In" above</li>
                <li>Click "Continue with Google"</li>
                <li>Check console for detailed error messages</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
