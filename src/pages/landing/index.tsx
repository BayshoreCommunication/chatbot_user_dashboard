import { Button } from '@/components/custom/button'
import ThemeSwitch from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UserNav } from '@/components/user-nav'
import { useUser } from '@/context/UserContext'
import { loadStripe } from '@stripe/stripe-js'

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react'
import { lazy, memo, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Lazy load components that are below the fold
const Spotlight = lazy(() =>
  import('@/components/ui/spotlight').then((module) => ({
    default: module.Spotlight,
  }))
)

const stripePromise = loadStripe(
  'pk_test_51RymVQFS3P7wS29bxPXDNz8ioouwvnM3oBq7SousaxgO63y5OFAbDwt1I9lpGTUM4km00mGiWcH1IIU4NPDn0H7Z00qy7z4tEw'
)

interface PricingPlan {
  id: string
  name: string
  monthlyPrice: number
  yearlyPrice: number
  description: string
  features: string[]
  recommended?: boolean
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Experience the full power risk-free',
    features: [
      'Complete access to all premium features',
      'Up to 1,000 AI-powered conversations',
      'Advanced analytics dashboard',
      'Email & chat support',
      'Multi-channel integration',
      'No credit card required',
    ],
    stripePriceIdMonthly: 'price_1RyxWWFS3P7wS29bZsXvMCOR',
    stripePriceIdYearly: 'price_1RyxWWFS3P7wS29bZsXvMCOR',
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 49,
    yearlyPrice: 499,
    description: 'Ideal for growing businesses',
    features: [
      'Unlimited AI-powered conversations',
      'Real-time analytics & insights',
      'Priority email & chat support',
      'Advanced customization options',
      'CRM & tool integrations',
      'Custom branding & themes',
    ],
    recommended: true,
    stripePriceIdMonthly: 'price_1RyxVtFS3P7wS29b940JDA7E',
    stripePriceIdYearly: 'price_1SRPfGFS3P7wS29b1LEGA6HR',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 99,
    yearlyPrice: 999,
    description: 'Maximum value for committed teams',
    features: [
      'Everything in Professional plan',
      'Save 2 months with annual billing',
      'Unlimited conversations & users',
      'Dedicated account manager',
      'Custom AI model training',
      'Premium API access & webhooks',
    ],
    stripePriceIdMonthly: 'price_1RyxUsFS3P7wS29bjiaTZag4',
    stripePriceIdYearly: 'price_1SRPh0FS3P7wS29bfAjG9QGZ',
  },
]

// Optimized animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 },
}

const glowAnimation = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(59, 130, 246, 0.3)',
      '0 0 40px rgba(59, 130, 246, 0.6)',
      '0 0 20px rgba(59, 130, 246, 0.3)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

const sparkleVariants = {
  animate: {
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: Math.random() * 2,
    },
  },
}

interface User {
  name?: string | null
  email?: string | null
  has_paid_subscription?: boolean | null
  id?: string | null
}

// interface Organization {
//     id: string;
//     name: string;
//     subscription_tier: string;
//     created_at: string;
//     updated_at: string;
// }

// Create a separate PricingCard component for better performance
const PricingCard = memo(
  ({
    plan,
    loading,
    handleSubscribe,
    isAuthenticated,
    user,
    isYearly,
  }: {
    plan: PricingPlan
    loading: string | null
    handleSubscribe: (
      plan: PricingPlan,
      billingCycle: 'monthly' | 'yearly'
    ) => void
    isAuthenticated: boolean
    user: User | null
    isYearly: boolean
  }) => {
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
    const displayPrice = isYearly && plan.id !== 'trial' ? price / 12 : price

    return (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`relative ${plan.recommended ? 'lg:-my-8 lg:h-[calc(100%+4rem)]' : 'h-full'}`}
      >
        {plan.recommended && (
          <Badge className='absolute -top-1 left-1/2 z-50 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-2 text-sm font-medium text-white shadow-lg'>
            Most Popular
          </Badge>
        )}

        <Card
          className={`relative flex h-full flex-col overflow-hidden border backdrop-blur-xl ${
            plan.recommended
              ? 'mt-4 border-blue-500/50 bg-gradient-to-br from-blue-50 to-purple-50 shadow-[0_0_30px_rgba(59,130,246,0.2)] dark:from-gray-900 dark:to-black'
              : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-gray-300 dark:border-gray-800 dark:from-gray-900 dark:to-black dark:hover:border-gray-700'
          }`}
        >
          <CardHeader className='relative z-10 pb-8 pt-8 text-center'>
            <CardTitle className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
              {plan.name}
            </CardTitle>
            <CardDescription className='mb-6 text-gray-600 dark:text-gray-400'>
              {plan.description}
            </CardDescription>
            <div className='mb-6 flex items-baseline justify-center'>
              <span className='bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-5xl font-bold text-transparent dark:from-white dark:to-gray-300'>
                ${displayPrice.toFixed(0)}
              </span>
              <span className='ml-2 text-lg text-gray-600 dark:text-gray-400'>
                /month
              </span>
            </div>
            {isYearly && plan.id !== 'trial' && (
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Billed ${price} annually
              </p>
            )}
          </CardHeader>

          <CardContent className='relative z-10 flex flex-grow flex-col'>
            <ul className='mb-8 flex-grow space-y-4'>
              {plan.features.map((feature, featureIndex) => (
                <li
                  key={featureIndex}
                  className='group flex items-center text-gray-700 dark:text-gray-300'
                >
                  <CheckCircle
                    className={`mr-3 h-5 w-5 ${plan.recommended ? 'text-blue-400' : 'text-blue-500'}`}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className='mt-auto'>
              <Button
                className={`w-full rounded-xl py-6 text-lg font-semibold transition-colors ${
                  plan.recommended
                    ? 'border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-purple-700'
                    : 'border border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-800'
                }`}
                onClick={() =>
                  handleSubscribe(plan, isYearly ? 'yearly' : 'monthly')
                }
                disabled={loading === plan.id}
              >
                {loading === plan.id ? (
                  <span className='flex items-center'>Processing...</span>
                ) : (
                  <span className='flex items-center justify-center gap-2'>
                    {isAuthenticated && user?.has_paid_subscription
                      ? 'Access Dashboard'
                      : 'Get Started'}
                    <ArrowRight className='h-5 w-5' />
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }
)

PricingCard.displayName = 'PricingCard'

// Create a separate CTA section component
const CTASection = memo(() => {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className='relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8'
    >
      <h2 className='mb-8 text-4xl font-bold sm:text-6xl'>
        <span className='mt-16 block bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300'>
          Ready to transform
        </span>
        <span className='block bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent'>
          your business?
        </span>
      </h2>

      <p className='mx-auto mb-12 max-w-4xl text-xl leading-relaxed text-gray-600 dark:text-gray-400 sm:text-2xl'>
        Join thousands of businesses already using our AI assistant to
        <span className='font-semibold text-blue-600 dark:text-blue-400'>
          {' '}
          automate customer interactions{' '}
        </span>
        and
        <span className='font-semibold text-purple-600 dark:text-purple-400'>
          {' '}
          boost revenue
        </span>
        .
      </p>

      <Button
        size='lg'
        className={`mb-16 border-0 bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-6 text-xl text-white transition-colors hover:from-blue-700 hover:to-purple-700 ${
          !prefersReducedMotion && 'transform hover:scale-105'
        }`}
      >
        Start Your Free Trial
        <ArrowRight className='ml-3 h-6 w-6' />
      </Button>
    </motion.div>
  )
})

CTASection.displayName = 'CTASection'

export default function LandingPage() {
  const { user, isAuthenticated } = useUser()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<string | null>(null)
  const [isYearly, setIsYearly] = useState(false)
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  // Check if user was redirected due to missing subscription
  useEffect(() => {
    const subscriptionRequired = localStorage.getItem('subscription_required')
    if (subscriptionRequired === 'true') {
      setShowSubscriptionAlert(true)
      localStorage.removeItem('subscription_required')

      // Auto-hide alert after 10 seconds
      const timer = setTimeout(() => {
        setShowSubscriptionAlert(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [])

  const { scrollY } = useScroll()
  const y1 = useTransform(
    scrollY,
    [0, 300],
    prefersReducedMotion ? [0, 0] : [0, -25]
  )
  const y2 = useTransform(
    scrollY,
    [0, 300],
    prefersReducedMotion ? [0, 0] : [0, -50]
  )

  const handleSubscribe = async (
    plan: PricingPlan,
    billingCycle: 'monthly' | 'yearly'
  ) => {
    if (!isAuthenticated) {
      navigate('/sign-in', {
        state: {
          from: location.pathname,
          plan: plan,
          billingCycle: billingCycle,
        },
      })
      return
    }

    if (user?.has_paid_subscription) {
      navigate('/dashboard')
      return
    }

    setLoading(plan.id)

    try {
      // First check if user has an existing organization
      const orgCheckResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/organization/user/${user?.id}`
      )
      let organizationData

      if (orgCheckResponse.ok) {
        // User has an existing organization
        organizationData = await orgCheckResponse.json()
        console.log('Found existing organization:', organizationData)
      } else if (
        orgCheckResponse.status === 500 ||
        orgCheckResponse.status === 400
      ) {
        // Create new organization only if none exists
        const createOrgResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/organization/register`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: `${user?.name}'s Organization`,
              user_id: user?.id,
              subscription_tier: plan.id,
            }),
          }
        )

        if (!createOrgResponse.ok) {
          const errorData = await createOrgResponse.json()
          throw new Error(errorData.detail || 'Failed to create organization')
        }

        const createOrgData = await createOrgResponse.json()
        organizationData = createOrgData.organization
        console.log('Created new organization:', organizationData)
      } else {
        throw new Error('Failed to check organization status')
      }

      if (!organizationData?.id && !organizationData?._id) {
        throw new Error('No organization ID received')
      }

      // Store organization data
      // localStorage.setItem('organization', JSON.stringify(organizationData));

      // Get the correct stripe price ID based on billing cycle
      const stripePriceId =
        billingCycle === 'yearly'
          ? plan.stripePriceIdYearly
          : plan.stripePriceIdMonthly

      // Create checkout session
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payment/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: stripePriceId,
            successUrl: window.location.origin + '/payment-success',
            cancelUrl: window.location.origin + '/landing',
            customerEmail: user?.email,
            planId: plan.id,
            billingCycle: billingCycle,
            organizationId: organizationData.id || organizationData._id,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage =
          errorData.detail || 'Failed to create checkout session'

        // Show user-friendly error message
        if (errorMessage.includes('already used your free trial')) {
          alert(
            'You have already used your free trial. Please select a paid plan to continue.'
          )
        } else {
          alert(errorMessage)
        }

        throw new Error(errorMessage)
      }

      const { sessionId } = await response.json()

      if (!sessionId) {
        throw new Error('No session ID received from server')
      }

      // Redirect to Stripe checkout
      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error('Stripe error:', error)
          throw error
        }
      }
    } catch (error) {
      console.error('Payment error:', error)

      // Show user-friendly error message
      if (error instanceof Error) {
        if (!error.message.includes('already used your free trial')) {
          alert(`Error: ${error.message}`)
        }
      } else {
        alert('An unexpected error occurred. Please try again.')
      }

      // Remove organization data if payment fails
      localStorage.removeItem('organization')
    } finally {
      setLoading(null)
    }
  }

  return (
    <Suspense
      fallback={<div className='min-h-screen bg-white dark:bg-black' />}
    >
      <div className='relative min-h-screen overflow-hidden bg-white dark:bg-black'>
        {/* Subscription Required Alert */}
        {showSubscriptionAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className='fixed left-1/2 top-20 z-50 mx-4 w-full max-w-lg -translate-x-1/2 transform'
          >
            <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-lg dark:border-yellow-800 dark:bg-yellow-900/20'>
              <div className='flex items-start'>
                <Shield className='mr-3 mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400' />
                <div className='flex-1'>
                  <h3 className='text-sm font-semibold text-yellow-800 dark:text-yellow-200'>
                    Subscription Required
                  </h3>
                  <p className='mt-1 text-sm text-yellow-700 dark:text-yellow-300'>
                    You need an active subscription to access the dashboard.
                    Please choose a plan below to continue.
                  </p>
                </div>
                <button
                  onClick={() => setShowSubscriptionAlert(false)}
                  className='ml-3 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200'
                >
                  <span className='sr-only'>Close</span>✕
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Optimized background with reduced layers */}
        <div
          className='fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-100 via-white to-gray-50 opacity-50 dark:from-gray-900 dark:via-black dark:to-black'
          style={{ willChange: 'opacity' }}
        />

        {/* Navigation */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className='fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-gray-800/50 dark:bg-black/80'
          style={{ translateZ: 0 }}
        >
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='flex h-16 items-center justify-between'>
              <motion.div
                className='flex items-center space-x-2'
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  variants={glowAnimation}
                  animate='animate'
                  className='relative'
                >
                  <Bot className='h-6 w-6 text-blue-400 sm:h-8 sm:w-8' />
                  <div className='absolute inset-0 bg-blue-400 opacity-30 blur-xl' />
                </motion.div>
                <span className='bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-lg font-bold text-transparent dark:from-white dark:to-gray-300 sm:text-xl'>
                  AI Assistant
                </span>
              </motion.div>
              <div className='flex items-center space-x-4'>
                {isAuthenticated ? (
                  <div className='flex items-center space-x-4'>
                    {user?.has_paid_subscription === true && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => navigate('/dashboard')}
                          className='border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-sm text-white hover:from-blue-600 hover:to-purple-700 sm:text-base'
                        >
                          Dashboard
                        </Button>
                      </motion.div>
                    )}
                    <UserNav />
                  </div>
                ) : (
                  <>
                    <Link to='/sign-in'>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant='ghost'
                          className='text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white sm:text-base'
                        >
                          Sign In
                        </Button>
                      </motion.div>
                    </Link>
                    <Link to='/sign-up'>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button className='border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-sm text-white hover:from-blue-600 hover:to-purple-700 sm:text-base'>
                          Get Started
                        </Button>
                      </motion.div>
                    </Link>
                  </>
                )}
                <ThemeSwitch />
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section with optimized animations */}
        <section className='relative'>
          <div className=' inset-0 z-30 flex items-center justify-center pt-36'>
            <motion.div
              style={{ y: y1, translateZ: 0 }}
              className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
            >
              <motion.div
                variants={fadeInUp}
                className='relative z-10 text-center'
              >
                <motion.div
                  variants={sparkleVariants}
                  animate='animate'
                  className='absolute -left-10 -top-10'
                >
                  <Sparkles className='h-6 w-6 text-blue-400' />
                </motion.div>
                <motion.div
                  variants={sparkleVariants}
                  animate='animate'
                  className='absolute -top-5 right-20'
                >
                  <Star className='h-4 w-4 text-purple-400' />
                </motion.div>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <Badge className='mb-8 border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 transition-all duration-300 hover:from-blue-500/20 hover:to-purple-500/20 dark:text-blue-300'>
                    <Sparkles className='mr-2 h-4 w-4' />
                    Powered by Advanced AI
                  </Badge>
                </motion.div>
                <motion.h1
                  className='mb-8 text-5xl font-bold leading-tight sm:text-7xl lg:text-8xl'
                  variants={fadeInUp}
                >
                  <span className='bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent dark:from-white dark:via-gray-100 dark:to-gray-300'>
                    Transform Your
                  </span>
                  <br />
                  <motion.span
                    className='bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent'
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    Business
                  </motion.span>
                </motion.h1>
                <motion.p
                  className='mx-auto mb-12 max-w-4xl text-xl leading-relaxed text-gray-700 dark:text-gray-300 sm:text-2xl'
                  variants={fadeInUp}
                >
                  Revolutionize customer engagement with our{' '}
                  <span className='font-semibold text-blue-600 dark:text-blue-400'>
                    AI-powered assistant
                  </span>
                  . Automate support, capture leads, and boost sales
                  effortlessly.
                </motion.p>
                <div className='h-8 sm:h-12' />
                <motion.div
                  className='flex flex-col items-center justify-center gap-6 sm:flex-row'
                  variants={staggerContainer}
                >
                  <motion.div
                    variants={scaleIn}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size='lg'
                      className='border-0 bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg text-white shadow-2xl hover:from-blue-600 hover:to-purple-700'
                      onClick={() =>
                        document
                          .getElementById('pricing')
                          ?.scrollIntoView({ behavior: 'smooth' })
                      }
                    >
                      Start Free Trial
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className='ml-2 h-5 w-5' />
                      </motion.div>
                    </Button>
                  </motion.div>
                  <motion.div
                    variants={scaleIn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size='lg'
                      variant='outline'
                      className='border-gray-300 bg-white px-8 py-4 text-lg text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800 dark:hover:text-white'
                    >
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
          <Spotlight
            className='relative bg-gray-50 pt-32 dark:bg-black'
            fill='rgba(59, 130, 246, 0.08)'
          >
            <motion.div
              style={{ y: y2, translateZ: 0 }}
              className='will-change-transform'
            >
              <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <motion.div
                  initial='initial'
                  whileInView='animate'
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeInUp}
                  className='mb-20 text-center'
                >
                  <motion.h2
                    className='mb-6 text-4xl font-bold sm:text-6xl'
                    variants={fadeInUp}
                  >
                    <span className='bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300'>
                      Everything you need to
                    </span>
                    <br />
                    <span className='bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'>
                      succeed
                    </span>
                  </motion.h2>
                  <motion.p
                    className='mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-400'
                    variants={fadeInUp}
                  >
                    Our AI assistant comes packed with powerful features
                    designed to automate and accelerate your business growth.
                  </motion.p>
                </motion.div>

                <motion.div
                  variants={staggerContainer}
                  initial='initial'
                  whileInView='animate'
                  viewport={{ once: true, amount: 0.2 }}
                  className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'
                >
                  {[
                    {
                      icon: MessageSquare,
                      title: 'Smart Conversations',
                      description:
                        'Natural language processing for human-like interactions with your customers.',
                      color: 'from-blue-500 to-cyan-500',
                    },
                    {
                      icon: Zap,
                      title: 'Instant Responses',
                      description:
                        '24/7 availability with lightning-fast response times to never miss a customer.',
                      color: 'from-yellow-500 to-orange-500',
                    },
                    {
                      icon: BarChart3,
                      title: 'Advanced Analytics',
                      description:
                        'Detailed insights into customer interactions and business performance.',
                      color: 'from-green-500 to-emerald-500',
                    },
                    {
                      icon: Users,
                      title: 'Lead Management',
                      description:
                        'Automatically capture and qualify leads from your website visitors.',
                      color: 'from-purple-500 to-pink-500',
                    },
                    {
                      icon: Settings,
                      title: 'Easy Integration',
                      description:
                        'Seamlessly integrate with your existing tools and workflows.',
                      color: 'from-indigo-500 to-blue-500',
                    },
                    {
                      icon: Shield,
                      title: 'Enterprise Security',
                      description:
                        'Bank-level security with end-to-end encryption for all communications.',
                      color: 'from-red-500 to-pink-500',
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={scaleIn}
                      whileHover={{
                        scale: 1.05,
                        rotateY: 5,
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                      }}
                      className='group'
                    >
                      <Card className='relative h-full overflow-hidden border border-gray-200 bg-gradient-to-br from-white to-gray-50 transition-all duration-500 hover:border-gray-300 dark:border-gray-800 dark:from-gray-900 dark:to-black dark:hover:border-gray-700'>
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
                        />
                        <CardHeader className='relative z-10'>
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className={`h-14 w-14 rounded-lg bg-gradient-to-br ${feature.color} mx-auto mb-4 p-3`}
                          >
                            <feature.icon className='h-8 w-8 text-white' />
                          </motion.div>
                          <CardTitle className='text-center text-xl text-gray-900 dark:text-white'>
                            {feature.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='relative z-10'>
                          <p className='text-center leading-relaxed text-gray-600 dark:text-gray-400'>
                            {feature.description}
                          </p>
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
        <section className='relative overflow-hidden bg-white pb-32 dark:bg-black'>
          <div className='absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 opacity-50 dark:from-gray-900 dark:via-black dark:to-black' />

          <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className='mb-20 text-center'
            >
              <h2 className='mb-6 mt-10 text-4xl font-bold sm:text-6xl'>
                <span className='block bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300'>
                  Choose your
                </span>
                <span className='block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'>
                  perfect plan
                </span>
              </h2>
              <p className='mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-400'>
                Start free, scale as you grow. No hidden fees, cancel anytime.
              </p>

              {/* Billing Cycle Toggle */}
              <div className='mx-auto mb-6 flex w-fit flex-col items-center gap-4'>
                <motion.div
                  className='relative flex items-center justify-center gap-3 rounded-full border border-gray-300 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-900'
                  layout
                >
                  <motion.div
                    className='absolute inset-0 rounded-full'
                    animate={{
                      background: isYearly
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))'
                        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))',
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  <motion.button
                    onClick={() => setIsYearly(false)}
                    className='relative z-10 rounded-full px-6 py-2.5 text-sm font-semibold transition-all'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {!isYearly && (
                      <motion.div
                        layoutId='activeTab'
                        className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl'
                        transition={{
                          type: 'spring',
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${!isYearly ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      Monthly
                    </span>
                  </motion.button>

                  <motion.button
                    onClick={() => setIsYearly(true)}
                    className='relative z-10 flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isYearly && (
                      <motion.div
                        layoutId='activeTab'
                        className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl'
                        transition={{
                          type: 'spring',
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${isYearly ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      Yearly
                    </span>
                    <motion.span
                      className='relative z-10 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white shadow-md'
                      animate={{ scale: isYearly ? [1, 1.1, 1] : 1 }}
                      transition={{
                        duration: 0.5,
                        repeat: isYearly ? Infinity : 0,
                        repeatDelay: 2,
                      }}
                    >
                      Save 17%
                    </motion.span>
                  </motion.button>
                </motion.div>

                {/* Savings Indicator */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: isYearly ? 1 : 0,
                    y: isYearly ? 0 : -10,
                  }}
                  transition={{ duration: 0.3 }}
                  className='flex items-center gap-2 text-center'
                >
                  <motion.div
                    animate={{ rotate: isYearly ? 360 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Sparkles className='h-4 w-4 text-green-500' />
                  </motion.div>
                  <span className='bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-sm font-semibold text-transparent dark:from-green-400 dark:to-emerald-400'>
                    Save $118/year with Professional plan or $178/year with
                    Enterprise plan!
                  </span>
                  <motion.div
                    animate={{ rotate: isYearly ? -360 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Sparkles className='h-4 w-4 text-green-500' />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              key={isYearly ? 'yearly' : 'monthly'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className='relative mx-auto grid max-w-6xl grid-cols-1 gap-8 pt-6 lg:grid-cols-3'
            >
              {/* Simple glow effect */}
              <div className='absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 opacity-20 blur-[120px]' />

              {pricingPlans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  loading={loading}
                  handleSubscribe={handleSubscribe}
                  isAuthenticated={isAuthenticated}
                  user={user}
                  isYearly={isYearly}
                />
              ))}
            </motion.div>
          </div>
        </section>

        {/* Optimized CTA Section */}
        <section className='relative overflow-hidden bg-gray-50 dark:bg-black'>
          <div className='absolute inset-0 bg-gradient-to-b from-white to-gray-50 opacity-50 dark:from-black dark:to-gray-900' />
          <CTASection />
        </section>

        {/* Footer */}
        <Suspense fallback={null}>
          <Spotlight
            className='relative border-t border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-black'
            fill='rgba(59, 130, 246, 0.05)'
          >
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className='flex flex-col items-center justify-between md:flex-row'
              >
                <motion.div
                  className='mb-8 flex items-center space-x-3 md:mb-0'
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    variants={glowAnimation}
                    animate='animate'
                    className='relative'
                  >
                    <Bot className='h-8 w-8 text-blue-400' />
                    <div className='absolute inset-0 bg-blue-400 opacity-30 blur-xl' />
                  </motion.div>
                  <span className='bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-300'>
                    AI Assistant
                  </span>
                </motion.div>
                <motion.div
                  className='text-lg text-gray-600 dark:text-gray-400'
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  © 2025 AI Assistant. All rights reserved.
                </motion.div>
              </motion.div>
            </div>
          </Spotlight>
        </Suspense>
      </div>
    </Suspense>
  )
}
