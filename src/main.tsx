import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import '@/index.css';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
        },
    },
});

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

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>
);