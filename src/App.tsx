import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/context/AuthContext'
import router from '@/router'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { ThemeColorProvider } from './context/ThemeColorContext'
import { UserProvider } from './context/UserContext'

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '410846066995-sdnso7dkpoh083akfk4k790dig56d0jn.apps.googleusercontent.com'

// Debug: Log the client ID being used
console.log('=== Google OAuth Configuration ===')
console.log('VITE_GOOGLE_CLIENT_ID from env:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
console.log('Using Client ID:', GOOGLE_CLIENT_ID)
console.log('Current URL:', window.location.origin)
console.log('===================================')

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable refetch on window focus
      retry: 1, // Only retry failed requests once
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <React.StrictMode>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <UserProvider>
              <ThemeColorProvider>
                <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
                  <RouterProvider router={router} />
                  <Toaster />
                </ThemeProvider>
              </ThemeColorProvider>
            </UserProvider>
          </GoogleOAuthProvider>
        </React.StrictMode>
      </AuthProvider>
    </QueryClientProvider>
  )
}
0
