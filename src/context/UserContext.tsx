import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    has_paid_subscription: boolean;
    subscriptionId?: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isAuthenticated: boolean;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('user');
            }
        }

        // Listen for storage changes (for multi-tab sync)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user') {
                if (e.newValue) {
                    try {
                        setUser(JSON.parse(e.newValue));
                    } catch (error) {
                        console.error('Failed to parse user from storage event:', error);
                    }
                } else {
                    setUser(null);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const setUserWithStorage = (newUser: User | null) => {
        setUser(newUser);
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('user');
        }
    };

    const logout = () => {
        setUserWithStorage(null);
    };

    const isAuthenticated = !!user;

    return (
        <UserContext.Provider value={{
            user,
            setUser: setUserWithStorage,
            isAuthenticated,
            logout
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
} 