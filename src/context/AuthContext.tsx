import { createContext, useContext, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export function AuthProvider({ children }: { children: ReactNode }) {
    // You can implement actual auth logic here
    const user = {
        id: "f456bac6-baf1-45bf-9565-82cd6ae15161", // Example user ID
        email: "info.bayshorecommunication@gmail.com",
        name: "Bayshore Communication"
    };

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext); 