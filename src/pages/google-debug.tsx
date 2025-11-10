import { Button } from '@/components/custom/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Copy, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function GoogleDebug() {
  const [copied, setCopied] = useState(false)
  const [checks, setChecks] = useState({
    clientId: { status: 'checking', value: '', message: '' },
    clientSecret: { status: 'checking', value: '', message: '' },
    apiUrl: { status: 'checking', value: '', message: '' },
    origin: { status: 'info', value: '', message: '' },
  })

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET
    const apiUrl = import.meta.env.VITE_API_URL
    const origin = window.location.origin

    setChecks({
      clientId: {
        status: clientId ? 'success' : 'error',
        value: clientId || 'NOT SET',
        message: clientId
          ? 'Client ID loaded correctly'
          : 'Missing - Add VITE_GOOGLE_CLIENT_ID to Vercel',
      },
      clientSecret: {
        status: clientSecret ? 'success' : 'error',
        value: clientSecret ? '****' + clientSecret.slice(-10) : 'NOT SET',
        message: clientSecret
          ? 'Client Secret loaded correctly'
          : 'Missing - Add VITE_GOOGLE_CLIENT_SECRET to Vercel',
      },
      apiUrl: {
        status: apiUrl ? 'success' : 'error',
        value: apiUrl || 'NOT SET',
        message: apiUrl ? 'API URL configured' : 'Missing VITE_API_URL',
      },
      origin: {
        status: 'info',
        value: origin,
        message: 'Current origin - must be in Google Console',
      },
    })
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className='h-5 w-5 text-green-500' />
      case 'error':
        return <XCircle className='h-5 w-5 text-red-500' />
      default:
        return <AlertCircle className='h-5 w-5 text-blue-500' />
    }
  }

  const googleConsoleInstructions = `
🔧 GOOGLE CLOUD CONSOLE SETUP - EXACT STEPS:

1. Go to: https://console.cloud.google.com/apis/credentials

2. Click on your OAuth 2.0 Client ID:
   410846066995-sdnso7dkpoh083akfk4k790dig56d0jn

3. In "Authorized JavaScript origins" section, add EXACTLY:
   
   ${checks.origin.value}
   http://localhost:5173

   ⚠️ CRITICAL: NO TRAILING SLASHES!
   ✅ Correct: ${checks.origin.value}
   ❌ Wrong: ${checks.origin.value}/

4. In "Authorized redirect URIs" section:
   
   ⚠️ LEAVE THIS COMPLETELY EMPTY!
   
   For popup-based OAuth (which you're using), redirect URIs should be EMPTY.

5. Click "SAVE"

6. Wait 5-10 minutes for changes to propagate

7. Clear browser cache or test in Incognito mode

---

🔍 VERIFY YOUR SETUP:

Current Configuration:
- Client ID: ${checks.clientId.value}
- Origin: ${checks.origin.value}
- API URL: ${checks.apiUrl.value}

Google Console Must Have:
- Authorized JavaScript origins: ${checks.origin.value}
- Authorized redirect URIs: [EMPTY]

---

❌ COMMON MISTAKES CAUSING 400 ERROR:

1. Trailing slash in origin:
   ❌ ${checks.origin.value}/
   ✅ ${checks.origin.value}

2. Redirect URIs set (should be empty):
   ❌ ${checks.origin.value}/auth/callback
   ✅ [Leave section empty]

3. Wrong client ID in code vs Google Console

4. Not waiting after saving changes (wait 5-10 min)

5. OAuth consent screen not configured:
   - Go to: OAuth consent screen
   - User type: External
   - Publishing status: Testing
   - Add test users: Add your email

---

🎯 AFTER FIXING GOOGLE CONSOLE:

1. Wait 5-10 minutes
2. Clear browser cache (or use Incognito)
3. Come back to this page and check console logs
4. Go to /sign-up and try "Continue with Google"
`

  return (
    <div className='container mx-auto max-w-5xl px-4 py-10'>
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-3xl'>
            🔍 Google OAuth 400 Error Debugger
          </CardTitle>
          <CardDescription className='text-base'>
            Comprehensive diagnostic tool to fix the "malformed request" error
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Current Configuration */}
          <div>
            <h3 className='mb-4 text-xl font-semibold'>
              ✅ Step 1: Verify Environment Variables
            </h3>
            <div className='space-y-3'>
              <div className='flex items-start gap-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900'>
                {getIcon(checks.clientId.status)}
                <div className='flex-1'>
                  <p className='font-semibold'>VITE_GOOGLE_CLIENT_ID</p>
                  <p className='break-all text-sm text-gray-600 dark:text-gray-400'>
                    {checks.clientId.value}
                  </p>
                  <p className='mt-1 text-xs text-gray-500'>
                    {checks.clientId.message}
                  </p>
                </div>
                {checks.clientId.status === 'success' && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => copyToClipboard(checks.clientId.value)}
                  >
                    <Copy className='h-4 w-4' />
                  </Button>
                )}
              </div>

              <div className='flex items-start gap-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900'>
                {getIcon(checks.clientSecret.status)}
                <div className='flex-1'>
                  <p className='font-semibold'>VITE_GOOGLE_CLIENT_SECRET</p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {checks.clientSecret.value}
                  </p>
                  <p className='mt-1 text-xs text-gray-500'>
                    {checks.clientSecret.message}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900'>
                {getIcon(checks.apiUrl.status)}
                <div className='flex-1'>
                  <p className='font-semibold'>VITE_API_URL</p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {checks.apiUrl.value}
                  </p>
                  <p className='mt-1 text-xs text-gray-500'>
                    {checks.apiUrl.message}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3 rounded-lg border border-blue-500 bg-blue-50 p-4 dark:bg-blue-950'>
                {getIcon(checks.origin.status)}
                <div className='flex-1'>
                  <p className='font-semibold text-blue-900 dark:text-blue-100'>
                    Current Origin (CRITICAL)
                  </p>
                  <p className='font-mono text-sm text-blue-800 dark:text-blue-200'>
                    {checks.origin.value}
                  </p>
                  <p className='mt-1 text-xs text-blue-700 dark:text-blue-300'>
                    This EXACT URL must be in Google Console "Authorized
                    JavaScript origins"
                  </p>
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => copyToClipboard(checks.origin.value)}
                >
                  <Copy className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>

          {/* Google Console Instructions */}
          <div>
            <h3 className='mb-4 text-xl font-semibold'>
              🔧 Step 2: Fix Google Cloud Console
            </h3>
            <div className='rounded-lg border border-orange-500 bg-orange-50 p-4 dark:bg-orange-950'>
              <div className='mb-3 flex items-center gap-2'>
                <AlertCircle className='h-5 w-5 text-orange-600' />
                <p className='font-semibold text-orange-900 dark:text-orange-100'>
                  The 400 error means Google Console is not configured
                  correctly!
                </p>
              </div>
              <pre className='overflow-x-auto whitespace-pre-wrap rounded bg-white p-4 text-xs dark:bg-gray-900'>
                {googleConsoleInstructions}
              </pre>
              <Button
                className='mt-3'
                onClick={() => copyToClipboard(googleConsoleInstructions)}
              >
                {copied ? 'Copied!' : 'Copy Instructions'}
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='mb-4 text-xl font-semibold'>🔗 Quick Links</h3>
            <div className='grid gap-3 sm:grid-cols-2'>
              <a
                href='https://console.cloud.google.com/apis/credentials'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 rounded-lg border bg-white p-4 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800'
              >
                <span className='text-2xl'>🔑</span>
                <div>
                  <p className='font-semibold'>Google Cloud Credentials</p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Configure OAuth 2.0 Client
                  </p>
                </div>
              </a>

              <a
                href='https://console.cloud.google.com/apis/credentials/consent'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 rounded-lg border bg-white p-4 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800'
              >
                <span className='text-2xl'>✅</span>
                <div>
                  <p className='font-semibold'>OAuth Consent Screen</p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Add test users, publish app
                  </p>
                </div>
              </a>

              <a
                href='https://vercel.com/dashboard'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 rounded-lg border bg-white p-4 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800'
              >
                <span className='text-2xl'>🚀</span>
                <div>
                  <p className='font-semibold'>Vercel Dashboard</p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Check environment variables
                  </p>
                </div>
              </a>

              <a
                href='https://developers.google.com/identity/gsi/web/guides/overview'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 rounded-lg border bg-white p-4 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800'
              >
                <span className='text-2xl'>📚</span>
                <div>
                  <p className='font-semibold'>Google OAuth Docs</p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Official documentation
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Test Buttons */}
          <div>
            <h3 className='mb-4 text-xl font-semibold'>
              🧪 Step 3: Test After Fixing
            </h3>
            <div className='flex flex-wrap gap-3'>
              <Button
                onClick={() => {
                  window.location.reload()
                }}
                variant='outline'
              >
                🔄 Refresh This Page
              </Button>
              <Button onClick={() => (window.location.href = '/sign-up')}>
                Test Sign Up
              </Button>
              <Button
                onClick={() => (window.location.href = '/sign-in')}
                variant='outline'
              >
                Test Sign In
              </Button>
            </div>
          </div>

          {/* Console Check */}
          <div className='rounded-lg border bg-gray-50 p-4 dark:bg-gray-900'>
            <p className='mb-2 font-semibold'>
              📋 Before testing, check browser console:
            </p>
            <ol className='list-inside list-decimal space-y-1 text-sm text-gray-600 dark:text-gray-400'>
              <li>Press F12 to open Developer Tools</li>
              <li>Go to Console tab</li>
              <li>
                Look for "=== Google OAuth Configuration ===" section above
              </li>
              <li>Verify Client ID matches: {checks.clientId.value}</li>
              <li>Click "Test Sign Up" button</li>
              <li>Click "Continue with Google"</li>
              <li>Check console for any error messages</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className='border-2 border-blue-500'>
        <CardHeader className='bg-blue-50 dark:bg-blue-950'>
          <CardTitle className='text-blue-900 dark:text-blue-100'>
            🎯 Summary: How to Fix 400 Error
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='space-y-4'>
            <div className='flex gap-3'>
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-900 dark:bg-blue-900 dark:text-blue-100'>
                1
              </div>
              <div>
                <p className='font-semibold'>Check Environment Variables</p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Verify all green checkmarks above. If any are red, add them to
                  Vercel dashboard and redeploy.
                </p>
              </div>
            </div>

            <div className='flex gap-3'>
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-900 dark:bg-blue-900 dark:text-blue-100'>
                2
              </div>
              <div>
                <p className='font-semibold'>Fix Google Cloud Console</p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Go to Google Console, add{' '}
                  <code className='rounded bg-gray-200 px-1 dark:bg-gray-700'>
                    {checks.origin.value}
                  </code>{' '}
                  to "Authorized JavaScript origins" (no trailing slash). Leave
                  "Authorized redirect URIs" empty.
                </p>
              </div>
            </div>

            <div className='flex gap-3'>
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-900 dark:bg-blue-900 dark:text-blue-100'>
                3
              </div>
              <div>
                <p className='font-semibold'>Wait & Clear Cache</p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  After saving in Google Console, wait 5-10 minutes. Then test
                  in Incognito mode or clear cache.
                </p>
              </div>
            </div>

            <div className='flex gap-3'>
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-900 dark:bg-green-900 dark:text-green-100'>
                ✓
              </div>
              <div>
                <p className='font-semibold'>Test Google Sign-In</p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Click "Test Sign Up" above, then "Continue with Google". It
                  should open popup without 400 error.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
