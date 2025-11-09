import { useUser } from '@/context/UserContext'
import { motion } from 'framer-motion'
import { ArrowLeft, Bot } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {
  // const location = useLocation();
  const navigate = useNavigate()
  const { user, isAuthenticated } = useUser()
  // const redirectPath = location.state?.from || '/';

  useEffect(() => {
    // If user is authenticated, check subscription status and redirect accordingly
    if (isAuthenticated) {
      if (user?.has_paid_subscription) {
        navigate('/dashboard')
      } else {
        navigate('/landing')
      }
    }
  }, [isAuthenticated, user, navigate])

  return (
    <div className='relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 dark:bg-black'>
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className='absolute left-4 top-4 z-20'
      >
        <Link
          to='/'
          className='group flex items-center space-x-2 rounded-full border border-gray-300 bg-white/80 px-4 py-2 text-gray-600 backdrop-blur-sm transition-colors hover:text-gray-900 dark:border-white/10 dark:bg-black/20 dark:text-gray-400 dark:hover:text-white'
        >
          <ArrowLeft className='h-5 w-5 transition-transform group-hover:-translate-x-1' />
          <span>Back</span>
        </Link>
      </motion.div>

      {/* Background Effects */}
      <div className='absolute inset-0'>
        {/* Enhanced gradient background */}
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/40 via-gray-50 to-white dark:from-blue-950/20 dark:via-black dark:to-black' />
        <div className='absolute inset-0 bg-[linear-gradient(to_right,#ffffff,#f1f5f9,#ffffff)] opacity-50 dark:bg-[linear-gradient(to_right,#000000,#0f172a,#000000)]' />
        {/* Noise texture removed - file not found */}

        {/* Animated gradient orbs */}
        <div className='absolute left-[50%] top-[50%] h-[500px] w-[500px] -translate-x-[50%] -translate-y-[50%] animate-pulse rounded-full bg-blue-300/20 blur-[128px] dark:bg-blue-500/30' />
        <div className='absolute left-[45%] top-[45%] h-[300px] w-[300px] -translate-x-[50%] -translate-y-[50%] animate-pulse rounded-full bg-indigo-300/15 blur-[128px] delay-700 dark:bg-indigo-500/20' />
      </div>

      <div className='container relative z-10 mx-auto flex w-full max-w-[380px] flex-col justify-center space-y-6 px-4'>
        <div className='flex flex-col space-y-2 text-center'>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className='mx-auto flex items-center space-x-2 rounded-full border border-gray-300 bg-white/80 px-4 py-2 backdrop-blur-sm dark:border-white/10 dark:bg-black/20'
          >
            <Bot className='h-6 w-6 text-blue-400' />
            <span className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent dark:from-blue-400 dark:to-indigo-300'>
              AI Assistant
            </span>
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className='text-2xl font-semibold tracking-tight text-gray-900 dark:text-white'
          >
            Welcome back
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className='text-sm text-gray-600 dark:text-gray-400'
          >
            Enter your email to sign in to your account
          </motion.p>
        </div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className='w-full backdrop-blur-xl'
        >
          <UserAuthForm className='rounded-2xl border border-gray-300 bg-white/80 p-6 shadow-xl dark:border-white/10 dark:bg-black/40' />
        </motion.div>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className='text-center text-sm text-gray-600 dark:text-gray-400'
        >
          <Link
            to='/sign-up'
            className='hover:text-brand text-blue-600 underline underline-offset-4 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </motion.p>
      </div>
    </div>
  )
}
