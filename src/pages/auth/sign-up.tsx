import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserAuthForm } from './components/user-auth-form';
import { Bot } from 'lucide-react';

export default function SignUp() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000000,#1a1a1a,#000000)] opacity-40" />
        <div className="absolute w-full h-full bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="container relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex items-center space-x-2"
          >
            <Bot className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AI Assistant
            </span>
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold tracking-tight text-white"
          >
            Create an account
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            Enter your email below to create your account
          </motion.p>
        </div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <UserAuthForm className="bg-black/50 p-6 rounded-lg border border-gray-800" isSignUp />
        </motion.div>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-8 text-center text-sm text-muted-foreground"
        >
          <Link
            to="/sign-in"
            className="hover:text-brand underline underline-offset-4 text-blue-400 hover:text-blue-300"
          >
            Already have an account? Sign In
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
