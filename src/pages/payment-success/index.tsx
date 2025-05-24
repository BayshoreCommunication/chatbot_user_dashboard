import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/custom/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            setError('No session ID found');
            setLoading(false);
            return;
        }

        // Verify payment and update user subscription
        const verifyPayment = async () => {
            try {
                const response = await fetch('http://localhost:8000/payment/verify-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sessionId }),
                });

                const data = await response.json();

                if (data.success) {
                    // Update user context with subscription info
                    if (user) {
                        setUser({
                            ...user,
                            hasPaidSubscription: true,
                            subscriptionId: data.subscriptionId
                        });
                    }
                } else {
                    setError('Payment verification failed');
                }
            } catch (error) {
                console.error('Error verifying payment:', error);
                setError('Failed to verify payment');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams, user, setUser]);

    const handleContinue = () => {
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center space-y-4 p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-center text-slate-600 dark:text-slate-300">
                            Verifying your payment...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-red-600">Payment Error</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-slate-600 dark:text-slate-300">{error}</p>
                        <Button onClick={() => navigate('/landing')} variant="outline">
                            Return to Landing Page
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <div className="space-y-2">
                        <p className="text-lg font-medium text-slate-900 dark:text-white">
                            Welcome to AI Assistant!
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                            Your subscription has been activated successfully. You now have access to all premium features.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button onClick={handleContinue} className="w-full" size="lg">
                            Access Dashboard
                        </Button>
                        <Button
                            onClick={() => navigate('/landing')}
                            variant="outline"
                            className="w-full"
                        >
                            Return to Landing Page
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 