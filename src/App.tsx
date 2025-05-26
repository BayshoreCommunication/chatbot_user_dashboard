import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import router from '@/router';
import { ThemeColorProvider } from './context/ThemeColorContext';
import { UserProvider } from './context/UserContext';
import { AuthProvider } from '@/context/AuthContext'

const GOOGLE_CLIENT_ID = '580986048415-qpgtv2kvij47ae4if8ep47jjq8o2qtmj.apps.googleusercontent.com';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
            gcTime: 1000 * 60 * 30, // Cache will be garbage collected after 30 minutes
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
                                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                                    <RouterProvider router={router} />
                                    <Toaster />
                                </ThemeProvider>
                            </ThemeColorProvider>
                        </UserProvider>
                    </GoogleOAuthProvider>
                </React.StrictMode>
            </AuthProvider>
        </QueryClientProvider>
    );
} 