import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      // Not logged in, redirect to sign-in
      navigate('/sign-in', { replace: true });
      return;
    }

    // Check if user has paid subscription
    if (user && !user.has_paid_subscription) {
      // No paid subscription, redirect to landing page with message
      localStorage.setItem('subscription_required', 'true');
      navigate('/', { replace: true });
      return;
    }
  }, [user, navigate]);

  // If user has paid subscription, render the child routes
  if (user?.has_paid_subscription) {
    return <Outlet />;
  }

  // Show nothing while redirecting
  return null;
}
