import {
  IconApps,
  IconBoxSeam,
  IconCalendar,
  IconLayoutDashboard,
  IconMessages,
  IconQuestionMark,
  IconRouteAltLeft,
  IconTruck,
} from '@tabler/icons-react'

export interface NavLink {
  title: string
  label?: string
  href: string
  icon: JSX.Element
}

export interface SideLink extends NavLink {
  sub?: NavLink[]
}

export const sidelinks: SideLink[] = [
  // Dashboard
  {
    title: 'Dashboard',
    label: '',
    href: '/dashboard',
    icon: <IconLayoutDashboard size={18} />,
  },
  // Chats
  {
    title: 'Chats',
    label: '9',
    href: '/dashboard/chats',
    icon: <IconMessages size={18} />,
  },
  // Leads just below chat
  {
    title: 'Leads',
    label: '',
    href: '/dashboard/leads',
    icon: <IconBoxSeam size={18} />,
  },
  // Apps after leads
  {
    title: 'Apps',
    label: '',
    href: '/dashboard/apps',
    icon: <IconApps size={18} />,
  },
  {
    title: 'Settings',
    label: '3',
    href: '/dashboard/requests',
    icon: <IconRouteAltLeft size={18} />,
    sub: [
      {
        title: 'User Profile',
        href: '/dashboard/user-profile',
        icon: <IconTruck size={18} />,
      },
      {
        title: 'Account Settings',
        label: '',
        href: '/dashboard/user-settings',
        icon: <IconBoxSeam size={18} />,
      },
      {
        title: 'Chat Widget Setup',
        label: '',
        href: '/dashboard/chat-widget-setup',
        icon: <IconMessages size={18} />,
      },
    ],
  },
  {
    title: 'Ai',
    label: '3',
    href: '/requests',
    icon: <IconRouteAltLeft size={18} />,
    sub: [
      {
        title: 'Train AI',
        href: '/dashboard/train-ai',
        icon: <IconTruck size={18} />,
      },
      {
        title: 'System Settings',
        label: '',
        href: '/dashboard/system-settings',
        icon: <IconBoxSeam size={18} />,
      },
      {
        title: 'Appointments',
        label: '',
        href: '/dashboard/appointments',
        icon: <IconCalendar size={18} />,
      },
      {
        title: 'Unknown Questions',
        label: '',
        href: '/dashboard/unknown-questions',
        icon: <IconQuestionMark size={18} />,
      },
    ],
  },
  // {
  //   title: 'Analysis',
  //   label: '',
  //   href: '/analysis',
  //   icon: <IconChartHistogram size={18} />,
  // },
  // {
  //   title: 'Extra Components',
  //   label: '',
  //   href: '/extra-components',
  //   icon: <IconComponents size={18} />,
  // },
  // {
  //   title: 'Error Pages',
  //   label: '',
  //   href: '',
  //   icon: <IconExclamationCircle size={18} />,
  //   sub: [
  //     {
  //       title: 'Not Found',
  //       label: '',
  //       href: '/404',
  //       icon: <IconError404 size={18} />,
  //     },
  //     {
  //       title: 'Internal Server Error',
  //       label: '',
  //       href: '/500',
  //       icon: <IconServerOff size={18} />,
  //     },
  //     {
  //       title: 'Maintenance Error',
  //       label: '',
  //       href: '/503',
  //       icon: <IconBarrierBlock size={18} />,
  //     },
  //     {
  //       title: 'Unauthorised Error',
  //       label: '',
  //       href: '/401',
  //       icon: <IconLock size={18} />,
  //     },
  //   ],
  // },
  // {
  //   title: 'Settings',
  //   label: '',
  //   href: '/settings',
  //   icon: <IconSettings size={18} />,
  // },
]
