import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface User {
    _id: string;
    id: string;
    email: string;
    name: string;
    has_paid_subscription: boolean;
    created_at: string;
    updated_at: string;
    google_id: string;
    subscription_id: string;
}

interface AuthContextType {
    user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        console.log("userData",userData)
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext); 