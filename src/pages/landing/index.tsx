import { useState, lazy, Suspense, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/custom/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, Shield, Bot, MessageSquare, BarChart3, Settings, Users, ArrowRight, Star, Sparkles } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { loadStripe } from '@stripe/stripe-js';
import { UserNav } from '@/components/user-nav';

// Lazy load components that are below the fold
const Spotlight = lazy(() => import('@/components/ui/spotlight').then(module => ({ default: module.Spotlight })));

const stripePromise = loadStripe('pk_test_51QCEQyP8UcLxbKnCXzg48ysRmhBHDnf4N4gzPtBNpc8Hmnk9dtlt4HGdv92JLjRgw57UHqT6EQUHli5yETB9Gbro00bCBEQ8UT');

interface PricingPlan {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    recommended?: boolean;
    stripePriceId: string;
}

const pricingPlans: PricingPlan[] = [
    {
        id: 'monthly',
        name: 'Monthly',
        price: 49,
        description: 'Perfect for trying out our service',
        features: [
            'AI-powered chatbot',
            'Basic analytics',
            'Email support',
            'Standard integrations',
            'Up to 1,000 conversations/month'
        ],
        stripePriceId: 'price_monthly'
    },
    {
        id: 'trial',
        name: 'Free Trial',
        price: 0,
        description: 'Try all features free for 1 month',
        features: [
            'Everything in Monthly plan',
            'Advanced analytics',
            'Priority support',
            'Custom integrations',
            'Up to 5,000 conversations/month',
            'Automatic renewal at $49/month'
        ],
        recommended: true,
        stripePriceId: 'price_trial'
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: 499,
        description: 'Best value for long-term commitment',
        features: [
            'Everything in Monthly plan',
            'Save $89 compared to monthly',
            'Unlimited conversations',
            'Custom AI training',
            'Dedicated support',
            'API access'
        ],
        stripePriceId: 'price_yearly'
    }
];

// Optimized animations
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1
        }
    }
};

const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
};

const glowAnimation = {
    animate: {
        boxShadow: [
            "0 0 20px rgba(59, 130, 246, 0.3)",
            "0 0 40px rgba(59, 130, 246, 0.6)",
            "0 0 20px rgba(59, 130, 246, 0.3)"
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const sparkleVariants = {
    animate: {
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        rotate: [0, 180, 360],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
        }
    }
};

interface User {
    name?: string | null;
    email?: string | null;
    has_paid_subscription?: boolean | null;
    id?: string | null;
}

// interface Organization {
//     id: string;
//     name: string;
//     subscription_tier: string;
//     created_at: string;
//     updated_at: string;
// }

// Create a separate PricingCard component for better performance
const PricingCard = memo(({ plan, loading, handleSubscribe, isAuthenticated, user }: {
    plan: PricingPlan;
    loading: string | null;
    handleSubscribe: (plan: PricingPlan) => void;
    isAuthenticated: boolean;
    user: User | null;
}) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`relative ${plan.recommended ? 'lg:-my-8 lg:h-[calc(100%+4rem)]' : 'h-full'}`}
        >
            {plan.recommended && (
                <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-2 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                </Badge>
            )}

            <Card
                className={`relative h-full bg-gradient-to-br from-gray-900 to-black border overflow-hidden backdrop-blur-xl flex flex-col ${plan.recommended
                    ? 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] mt-4'
                    : 'border-gray-800 hover:border-gray-700'
                    }`}
            >
                <CardHeader className="relative z-10 text-center pb-8 pt-8">
                    <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-400 mb-6">{plan.description}</CardDescription>
                    <div className="mb-6 flex items-baseline justify-center">
                        <span className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">${plan.price}</span>
                        <span className="text-gray-400 text-lg ml-2">/month</span>
                    </div>
                </CardHeader>

                <CardContent className="relative z-10 flex-grow flex flex-col">
                    <ul className="space-y-4 mb-8 flex-grow">
                        {plan.features.map((feature, featureIndex) => (
                            <li
                                key={featureIndex}
                                className="flex items-center text-gray-300 group"
                            >
                                <CheckCircle className={`h-5 w-5 mr-3 ${plan.recommended ? 'text-blue-400' : 'text-blue-500'}`} />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-auto">
                        <Button
                            className={`w-full py-6 text-lg font-semibold transition-colors rounded-xl ${plan.recommended
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 border-0'
                                : 'bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 hover:border-gray-600'
                                }`}
                            onClick={() => handleSubscribe(plan)}
                            disabled={loading === plan.id}
                        >
                            {loading === plan.id ? (
                                <span className="flex items-center">Processing...</span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    {isAuthenticated && user?.has_paid_subscription ? 'Access Dashboard' : 'Get Started'}
                                    <ArrowRight className="w-5 h-5" />
                                </span>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
});

PricingCard.displayName = 'PricingCard';

// Create a separate CTA section component
const CTASection = memo(() => {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10"
        >
            <h2 className="text-4xl sm:text-6xl font-bold mb-8">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent block mt-16">
                    Ready to transform
                </span>
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent block">
                    your business?
                </span>
            </h2>

            <p className="text-xl sm:text-2xl text-gray-400 mb-12 leading-relaxed max-w-4xl mx-auto">
                Join thousands of businesses already using our AI assistant to
                <span className="text-blue-400 font-semibold"> automate customer interactions </span>
                and
                <span className="text-purple-400 font-semibold"> boost revenue</span>.
            </p>

            <Button
                size="lg"
                className={`text-xl px-12 mb-16 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 transition-colors ${!prefersReducedMotion && 'transform hover:scale-105'
                    }`}
            >
                Start Your Free Trial
                <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
        </motion.div>
    );
});

CTASection.displayName = 'CTASection';

export default function LandingPage() {
    const { user, isAuthenticated } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<string | null>(null);
    const prefersReducedMotion = useReducedMotion();

    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 300], prefersReducedMotion ? [0, 0] : [0, -25]);
    const y2 = useTransform(scrollY, [0, 300], prefersReducedMotion ? [0, 0] : [0, -50]);

    const handleSubscribe = async (plan: PricingPlan) => {
        if (!isAuthenticated) {
            navigate('/sign-in', {
                state: {
                    from: location.pathname,
                    plan: plan
                }
            });
            return;
        }

        if (user?.has_paid_subscription) {
            navigate('/dashboard');
            return;
        }

        setLoading(plan.id);

        try {
            // First check if user has an existing organization
            const orgCheckResponse = await fetch(`https://botapi.bayshorecommunication.org/organization/user/${user?.id}`);
            let organizationData;

            if (orgCheckResponse.ok) {
                // User has an existing organization
                organizationData = await orgCheckResponse.json();
                console.log('Found existing organization:', organizationData);
            } else if (orgCheckResponse.status === 500 || orgCheckResponse.status === 400) {
                // Create new organization only if none exists
                const createOrgResponse = await fetch('https://botapi.bayshorecommunication.org/organization/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: `${user?.name}'s Organization`,
                        user_id: user?.id,
                        subscription_tier: plan.id
                    }),
                });

                if (!createOrgResponse.ok) {
                    const errorData = await createOrgResponse.json();
                    throw new Error(errorData.detail || 'Failed to create organization');
                }

                const createOrgData = await createOrgResponse.json();
                organizationData = createOrgData.organization;
                console.log('Created new organization:', organizationData);
            } else {
                throw new Error('Failed to check organization status');
            }

            if (!organizationData?.id && !organizationData?._id) {
                throw new Error('No organization ID received');
            }

            // Store organization data
            // localStorage.setItem('organization', JSON.stringify(organizationData));

            // Create checkout session
            const response = await fetch('https://botapi.bayshorecommunication.org/payment/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: plan.stripePriceId,
                    successUrl: window.location.origin + '/payment-success',
                    cancelUrl: window.location.origin + '/landing',
                    customerEmail: user?.email,
                    planId: plan.id,
                    organizationId: organizationData.id || organizationData._id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create checkout session');
            }

            const { sessionId } = await response.json();

            if (!sessionId) {
                throw new Error('No session ID received from server');
            }

            // Redirect to Stripe checkout
            const stripe = await stripePromise;
            if (stripe) {
                const { error } = await stripe.redirectToCheckout({ sessionId });
                if (error) {
                    console.error('Stripe error:', error);
                    throw error;
                }
            }
        } catch (error) {
            console.error('Payment error:', error);
            // Remove organization data if payment fails
            localStorage.removeItem('organization');
        } finally {
            setLoading(null);
        }
    };

    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <div className="min-h-screen bg-black relative overflow-hidden">
                {/* Optimized background with reduced layers */}
                <div
                    className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-50"
                    style={{ willChange: 'opacity' }}
                />

                {/* Navigation */}
                <motion.nav
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="fixed top-0 w-full z-50 border-b border-gray-800/50 bg-black/80 backdrop-blur-xl"
                    style={{ translateZ: 0 }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <motion.div
                                className="flex items-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                            >
                                <motion.div
                                    variants={glowAnimation}
                                    animate="animate"
                                    className="relative"
                                >
                                    <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                                    <div className="absolute inset-0 bg-blue-400 blur-xl opacity-30" />
                                </motion.div>
                                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    AI Assistant
                                </span>
                            </motion.div>
                            <div className="flex items-center space-x-4">
                                {isAuthenticated ? (
                                    <div className="flex items-center space-x-4">
                                        {user?.has_paid_subscription === true && (
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    onClick={() => navigate('/dashboard')}
                                                    className="text-sm sm:text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                                                >
                                                    Dashboard
                                                </Button>
                                            </motion.div>
                                        )}
                                        <UserNav />
                                    </div>
                                ) : (
                                    <>
                                        <Link to="/sign-in">
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button variant="ghost" className="text-sm sm:text-base text-gray-300 hover:text-white hover:bg-gray-800">
                                                    Sign In
                                                </Button>
                                            </motion.div>
                                        </Link>
                                        <Link to="/sign-up">
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button className="text-sm sm:text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                                                    Get Started
                                                </Button>
                                            </motion.div>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.nav>

                {/* Hero Section with optimized animations */}
                <section className="relative">
                    <div className=" inset-0 pt-36 z-30 flex items-center justify-center">
                        <motion.div
                            style={{ y: y1, translateZ: 0 }}
                            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                        >
                            <motion.div variants={fadeInUp} className="text-center relative z-10">
                                <motion.div variants={sparkleVariants} animate="animate" className="absolute -top-10 -left-10">
                                    <Sparkles className="h-6 w-6 text-blue-400" />
                                </motion.div>
                                <motion.div variants={sparkleVariants} animate="animate" className="absolute -top-5 right-20">
                                    <Star className="h-4 w-4 text-purple-400" />
                                </motion.div>
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>
                                    <Badge className="mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-300 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Powered by Advanced AI
                                    </Badge>
                                </motion.div>
                                <motion.h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-8 leading-tight" variants={fadeInUp}>
                                    <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                                        Transform Your
                                    </span>
                                    <br />
                                    <motion.span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent" animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'], }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} style={{ backgroundSize: '200% 200%' }}>
                                        Business
                                    </motion.span>
                                </motion.h1>
                                <motion.p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed" variants={fadeInUp}>
                                    Revolutionize customer engagement with our{' '}
                                    <span className="text-blue-400 font-semibold">AI-powered assistant</span>.
                                    Automate support, capture leads, and boost sales effortlessly.
                                </motion.p>
                                <div className="h-8 sm:h-12" />
                                <motion.div className="flex flex-col sm:flex-row gap-6 justify-center items-center" variants={staggerContainer}>
                                    <motion.div variants={scaleIn} whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }} whileTap={{ scale: 0.95 }}>
                                        <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-2xl" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                                            Start Free Trial
                                            <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </motion.div>
                                        </Button>
                                    </motion.div>
                                    <motion.div variants={scaleIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500">
                                            Watch Demo
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section with optimized animations */}
                <Suspense fallback={null}>
                    <Spotlight className="relative pt-32 bg-black" fill="rgba(59, 130, 246, 0.08)">
                        <motion.div
                            style={{ y: y2, translateZ: 0 }}
                            className="will-change-transform"
                        >
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <motion.div
                                    initial="initial"
                                    whileInView="animate"
                                    viewport={{ once: true, amount: 0.3 }}
                                    variants={fadeInUp}
                                    className="text-center mb-20"
                                >
                                    <motion.h2
                                        className="text-4xl sm:text-6xl font-bold mb-6"
                                        variants={fadeInUp}
                                    >
                                        <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                            Everything you need to
                                        </span>
                                        <br />
                                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                            succeed
                                        </span>
                                    </motion.h2>
                                    <motion.p
                                        className="text-xl text-gray-400 max-w-3xl mx-auto"
                                        variants={fadeInUp}
                                    >
                                        Our AI assistant comes packed with powerful features designed to automate and accelerate your business growth.
                                    </motion.p>
                                </motion.div>

                                <motion.div
                                    variants={staggerContainer}
                                    initial="initial"
                                    whileInView="animate"
                                    viewport={{ once: true, amount: 0.2 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                                >
                                    {[
                                        {
                                            icon: MessageSquare,
                                            title: "Smart Conversations",
                                            description: "Natural language processing for human-like interactions with your customers.",
                                            color: "from-blue-500 to-cyan-500"
                                        },
                                        {
                                            icon: Zap,
                                            title: "Instant Responses",
                                            description: "24/7 availability with lightning-fast response times to never miss a customer.",
                                            color: "from-yellow-500 to-orange-500"
                                        },
                                        {
                                            icon: BarChart3,
                                            title: "Advanced Analytics",
                                            description: "Detailed insights into customer interactions and business performance.",
                                            color: "from-green-500 to-emerald-500"
                                        },
                                        {
                                            icon: Users,
                                            title: "Lead Management",
                                            description: "Automatically capture and qualify leads from your website visitors.",
                                            color: "from-purple-500 to-pink-500"
                                        },
                                        {
                                            icon: Settings,
                                            title: "Easy Integration",
                                            description: "Seamlessly integrate with your existing tools and workflows.",
                                            color: "from-indigo-500 to-blue-500"
                                        },
                                        {
                                            icon: Shield,
                                            title: "Enterprise Security",
                                            description: "Bank-level security with end-to-end encryption for all communications.",
                                            color: "from-red-500 to-pink-500"
                                        }
                                    ].map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            variants={scaleIn}
                                            whileHover={{
                                                scale: 1.05,
                                                rotateY: 5,
                                                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)"
                                            }}
                                            className="group"
                                        >
                                            <Card className="relative h-full bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-gray-700 transition-all duration-500 overflow-hidden">
                                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                                <CardHeader className="relative z-10">
                                                    <motion.div
                                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                                        transition={{ duration: 0.6 }}
                                                        className={`h-14 w-14 rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-4 mx-auto`}
                                                    >
                                                        <feature.icon className="h-8 w-8 text-white" />
                                                    </motion.div>
                                                    <CardTitle className="text-xl text-white text-center">{feature.title}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="relative z-10">
                                                    <p className="text-gray-400 text-center leading-relaxed">{feature.description}</p>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </motion.div>
                    </Spotlight>
                </Suspense>

                {/* Optimized Pricing Section */}
                <section className="relative pb-32 bg-black overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black opacity-50" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-20"
                        >
                            <h2 className="text-4xl sm:text-6xl mt-10 font-bold mb-6">
                                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent block">
                                    Choose your
                                </span>
                                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent block">
                                    perfect plan
                                </span>
                            </h2>
                            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                                Start free, scale as you grow. No hidden fees, cancel anytime.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto relative pt-6">
                            {/* Simple glow effect */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] opacity-20" />

                            {pricingPlans.map((plan) => (
                                <PricingCard
                                    key={plan.id}
                                    plan={plan}
                                    loading={loading}
                                    handleSubscribe={handleSubscribe}
                                    isAuthenticated={isAuthenticated}
                                    user={user}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Optimized CTA Section */}
                <section className="relative bg-black overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900 opacity-50" />
                    <CTASection />
                </section>

                {/* Footer */}
                <Suspense fallback={null}>
                    <Spotlight className="relative bg-black border-t border-gray-800 py-16" fill="rgba(59, 130, 246, 0.05)">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="flex flex-col md:flex-row justify-between items-center"
                            >
                                <motion.div
                                    className="flex items-center space-x-3 mb-8 md:mb-0"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <motion.div
                                        variants={glowAnimation}
                                        animate="animate"
                                        className="relative"
                                    >
                                        <Bot className="h-8 w-8 text-blue-400" />
                                        <div className="absolute inset-0 bg-blue-400 blur-xl opacity-30" />
                                    </motion.div>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                        AI Assistant
                                    </span>
                                </motion.div>
                                <motion.div
                                    className="text-gray-400 text-lg"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    © 2024 AI Assistant. All rights reserved.
                                </motion.div>
                            </motion.div>
                        </div>
                    </Spotlight>
                </Suspense>
            </div>
        </Suspense>
    );
}
