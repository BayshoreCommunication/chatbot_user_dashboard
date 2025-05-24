import { Routes, Route } from 'react-router-dom'
import SignIn from '@/pages/auth/sign-in'
import SignUp from '@/pages/auth/sign-up'
import LandingPage from '@/pages/landing'

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
        </Routes>
    )
} 