import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import router from '@/router';
import '@/index.css';
import { ThemeColorProvider } from './context/ThemeColorContext';
import { UserProvider } from './context/UserContext';

// Load Google OAuth script manually
const loadGoogleScript = () => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
};

loadGoogleScript();

// Initialize Google OAuth
if (!window.google) {
    window.google = {
        accounts: {
            id: {
                initialize: () => { },
                renderButton: () => { },
                prompt: () => { }
            }
        }
    };
}

const App = () => (
    <React.StrictMode>
        <UserProvider>
            <ThemeColorProvider>
                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                    <RouterProvider router={router} />
                    <Toaster />
                </ThemeProvider>
            </ThemeColorProvider>
        </UserProvider>
    </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);