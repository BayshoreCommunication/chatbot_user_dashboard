import SignIn from '@/pages/auth/sign-in'
import SignUp from '@/pages/auth/sign-up'
import LandingPage from '@/pages/landing'
import { createBrowserRouter } from 'react-router-dom'
import GeneralError from './pages/errors/general-error'
import MaintenanceError from './pages/errors/maintenance-error'
import NotFoundError from './pages/errors/not-found-error'
import UnauthorisedError from './pages/errors/unauthorised-error.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/sign-in',
    element: <SignIn />,
  },
  {
    path: '/sign-up',
    element: <SignUp />,
  },
  // Landing page
  {
    path: '/landing',
    lazy: async () => ({
      Component: (await import('./pages/landing')).default,
    }),
  },
  // Payment success page
  {
    path: '/payment-success',
    lazy: async () => ({
      Component: (await import('./pages/payment-success')).default,
    }),
  },
  // Auth routes
  {
    path: '/sign-in-2',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-in-2')).default,
    }),
  },
  {
    path: '/forgot-password',
    lazy: async () => ({
      Component: (await import('./pages/auth/forgot-password')).default,
    }),
  },
  {
    path: '/otp',
    lazy: async () => ({
      Component: (await import('./pages/auth/otp')).default,
    }),
  },

  // Main routes
  {
    path: '/dashboard',
    lazy: async () => {
      const AppShell = await import('./components/app-shell')
      return { Component: AppShell.default }
    },
    errorElement: <GeneralError />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('./pages/dashboard')).default,
        }),
      },
      {
        path: 'chats',
        lazy: async () => ({
          Component: (await import('@/pages/chats/index.tsx')).default,
        }),
      },
      {
        path: 'apps',
        lazy: async () => ({
          Component: (await import('@/pages/apps')).default,
        }),
      },
      {
        path: 'users',
        lazy: async () => ({
          Component: (await import('@/components/coming-soon')).default,
        }),
      },
      {
        path: 'analysis',
        lazy: async () => ({
          Component: (await import('@/components/coming-soon')).default,
        }),
      },
      {
        path: 'extra-components',
        lazy: async () => ({
          Component: (await import('@/pages/extra-components')).default,
        }),
      },
      {
        path: 'user-profile',
        lazy: async () => ({
          Component: (await import('@/pages/settings/account/index.tsx'))
            .default,
        }),
      },
      {
        path: 'user-settings',
        lazy: async () => ({
          Component: (await import('@/pages/settings/accountSetting/index.tsx'))
            .default,
        }),
      },
      {
        path: 'system-settings',
        lazy: async () => ({
          Component: (await import('./pages/settings/systemSetting/index.tsx'))
            .default,
        }),
        errorElement: <GeneralError />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('./pages/settings/profile')).default,
            }),
          },
          {
            path: 'account',
            lazy: async () => ({
              Component: (await import('./pages/settings/account')).default,
            }),
          },
          {
            path: 'appearance',
            lazy: async () => ({
              Component: (await import('./pages/settings/appearance')).default,
            }),
          },
          {
            path: 'notifications',
            lazy: async () => ({
              Component: (await import('./pages/settings/notifications'))
                .default,
            }),
          },
          {
            path: 'display',
            lazy: async () => ({
              Component: (await import('./pages/settings/display')).default,
            }),
          },
          {
            path: 'error-example',
            lazy: async () => ({
              Component: (await import('./pages/settings/error-example'))
                .default,
            }),
            errorElement: <GeneralError className='h-[50svh]' minimal />,
          },
        ],
      },
      {
        path: 'chat-widget-setup',
        lazy: async () => ({
          Component: (
            await import('./pages/settings/systemSetting/chatWidgetSetupPage')
          ).default,
        }),
      },
      {
        path: 'chat-widget-install',
        lazy: async () => ({
          Component: (
            await import('./pages/settings/systemSetting/chatWidgetInstallPage')
          ).default,
        }),
      },
      // {
      //   path: 'settings',
      //   lazy: async () => ({
      //     Component: (await import('./pages/settings')).default,
      //   }),
      //   errorElement: <GeneralError />,
      //   children: [
      //     {
      //       index: true,
      //       lazy: async () => ({
      //         Component: (await import('./pages/settings/profile')).default,
      //       }),
      //     },
      //     {
      //       path: 'account',
      //       lazy: async () => ({
      //         Component: (await import('./pages/settings/account')).default,
      //       }),
      //     },
      //     {
      //       path: 'appearance',
      //       lazy: async () => ({
      //         Component: (await import('./pages/settings/appearance')).default,
      //       }),
      //     },
      //     {
      //       path: 'notifications',
      //       lazy: async () => ({
      //         Component: (await import('./pages/settings/notifications'))
      //           .default,
      //       }),
      //     },
      //     {
      //       path: 'display',
      //       lazy: async () => ({
      //         Component: (await import('./pages/settings/display')).default,
      //       }),
      //     },
      //     {
      //       path: 'error-example',
      //       lazy: async () => ({
      //         Component: (await import('./pages/settings/error-example'))
      //           .default,
      //       }),
      //       errorElement: <GeneralError className='h-[50svh]' minimal />,
      //     },
      //   ],
      // },
      {
        path: 'train-ai',
        lazy: async () => ({
          Component: (await import('@/pages/AI/aiHome/index.tsx')).default,
        }),
      },
      {
        path: 'train-ai-page',
        lazy: async () => ({
          Component: (await import('@/pages/AI/trainAi/index.tsx')).default,
        }),
      },
      {
        path: 'ai-behavior',
        lazy: async () => ({
          Component: (await import('@/pages/AI/aiBehavior/index.tsx')).default,
        }),
      },
      {
        path: 'ai-training',
        lazy: async () => ({
          Component: (await import('@/pages/AI/aiTraining/index.tsx')).default,
        }),
      },
      {
        path: 'instant-reply',
        lazy: async () => ({
          Component: (await import('@/pages/AI/instantReply/index.tsx'))
            .default,
        }),
      },
      {
        path: 'faq',
        lazy: async () => ({
          Component: (await import('@/pages/AI/faq/index.tsx')).default,
        }),
      },
      {
        path: 'appointments',
        lazy: async () => ({
          Component: (await import('@/pages/appointments/index.tsx')).default,
        }),
      },
    ],
  },

  // Error routes
  { path: '/500', Component: GeneralError },
  { path: '/404', Component: NotFoundError },
  { path: '/503', Component: MaintenanceError },
  { path: '/401', Component: UnauthorisedError },

  // Fallback 404 route
  { path: '*', Component: NotFoundError },
])

export default router
