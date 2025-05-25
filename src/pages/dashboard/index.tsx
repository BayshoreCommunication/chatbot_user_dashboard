import { Layout } from '@/components/custom/layout'
import { Search } from '@/components/search'
import ThemeSwitch from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { AnalyticsCards } from './components/analytics-cards'
import { AnalyticsChart } from './components/analytics-chart'
import { TrafficSources } from './components/traffic-sources'
import { MessageList } from './components/message-list'
import { Notifications, ActiveUsers } from './components/notifications'


export default function Dashboard() {
  

  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      

      <Layout className="dark:bg-gray-950">
        {/* ===== Top Heading ===== */}
        <Layout.Header className="dark:bg-gray-950 dark:border-gray-800">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard dark:text-gray-300"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
              </div>
              <span className="text-lg font-medium dark:text-white">Dashboards</span>
            </div>
          </div>
          <div className='ml-auto flex items-center space-x-4'>
            <Search />
            <ThemeSwitch />
            <UserNav />
          </div>
        </Layout.Header>

        {/* ===== Main ===== */}
        <Layout.Body className="dark:bg-gray-950">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main content - left side */}
            <div className="lg:w-3/4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium dark:text-gray-300">Analytics</h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right dark:text-gray-400"><path d="m9 18 6-6-6-6" /></svg>
              </div>

              {/* Analytics Cards */}
              <AnalyticsCards />

              {/* Analytics Chart and Traffic Sources */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-10 mt-4">
                <AnalyticsChart />
                <TrafficSources />
              </div>

              {/* Messages Table */}
              <div className="mt-4">
                <MessageList />
              </div>
            </div>

            {/* Notifications and Active Users - right side */}
            <div className="lg:w-1/4">
              <div className="sticky top-4">
                <Notifications />
                <div className="mt-4">
                  <ActiveUsers />
                </div>
              </div>
            </div>
          </div>
        </Layout.Body>
      </Layout>
    </div>
  )
}
