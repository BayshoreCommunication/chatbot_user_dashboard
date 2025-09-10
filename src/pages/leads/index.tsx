import { Button } from '@/components/custom/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLeads } from '@/hooks/useLeads'
import { quickApiTest } from '@/utils/apiTest'
import { Calendar, Download, Mail, RefreshCw, Users } from 'lucide-react'
import React from 'react'

const LeadsPage: React.FC = () => {
  const { leads, stats, loading, fetchLeads, downloadCSV } = useLeads()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleDebugTest = async () => {
    console.log('🔧 Running API debug test...')
    const results = await quickApiTest()
    console.table(results)
    alert('Debug test completed. Check browser console for detailed results.')
  }

  return (
    <div className='min-h-screen bg-gray-50/50 p-6'>
      <div className='mx-auto space-y-8'>
        {/* Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
              Visitor Leads
            </h1>
            <p className='text-gray-600'>
              View and manage all visitor contact information collected by your
              chatbot
            </p>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <Button
              variant='outline'
              onClick={fetchLeads}
              disabled={loading}
              className='flex items-center gap-2 border-gray-300 hover:bg-gray-50'
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button
              onClick={downloadCSV}
              disabled={loading || leads.length === 0}
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700'
            >
              <Download className='h-4 w-4' />
              Download CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            <Card className='border-0 bg-white shadow-sm transition-shadow hover:shadow-md'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-sm font-medium text-gray-600'>
                  Total Leads
                </CardTitle>
                <div className='rounded-full bg-blue-100 p-2'>
                  <Users className='h-4 w-4 text-blue-600' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-gray-900'>
                  {stats.valid_leads}
                </div>
                <p className='mt-1 text-sm text-gray-500'>
                  Complete contact information
                </p>
              </CardContent>
            </Card>

            <Card className='border-0 bg-white shadow-sm transition-shadow hover:shadow-md'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-sm font-medium text-gray-600'>
                  With Email
                </CardTitle>
                <div className='rounded-full bg-green-100 p-2'>
                  <Mail className='h-4 w-4 text-green-600' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-gray-900'>
                  {stats.leads_with_email}
                </div>
                <p className='mt-1 text-sm text-gray-500'>
                  Email addresses collected
                </p>
              </CardContent>
            </Card>

            <Card className='border-0 bg-white shadow-sm transition-shadow hover:shadow-md'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-sm font-medium text-gray-600'>
                  With Name
                </CardTitle>
                <div className='rounded-full bg-purple-100 p-2'>
                  <Users className='h-4 w-4 text-purple-600' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-gray-900'>
                  {stats.leads_with_name}
                </div>
                <p className='mt-1 text-sm text-gray-500'>Names collected</p>
              </CardContent>
            </Card>

            <Card className='border-0 bg-white shadow-sm transition-shadow hover:shadow-md'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-sm font-medium text-gray-600'>
                  Total Profiles
                </CardTitle>
                <div className='rounded-full bg-orange-100 p-2'>
                  <Calendar className='h-4 w-4 text-orange-600' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-gray-900'>
                  {stats.total_profiles}
                </div>
                <p className='mt-1 text-sm text-gray-500'>All user profiles</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leads Table */}
        <Card className='border-0 bg-white shadow-sm'>
          <CardHeader className='border-b border-gray-200 bg-gray-50/50 px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-xl font-semibold text-gray-900'>
                  Visitor Leads
                </CardTitle>
                <CardDescription className='mt-1 text-gray-600'>
                  All visitor contact information collected by your chatbot
                </CardDescription>
              </div>
              <div className='text-sm text-gray-500'>
                {leads.length} {leads.length === 1 ? 'lead' : 'leads'} found
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            {loading ? (
              <div className='flex items-center justify-center py-12'>
                <div className='flex items-center gap-3'>
                  <RefreshCw className='h-5 w-5 animate-spin text-blue-600' />
                  <span className='text-gray-600'>Loading leads...</span>
                </div>
              </div>
            ) : leads.length === 0 ? (
              <div className='py-16 text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                  <Users className='h-8 w-8 text-gray-400' />
                </div>
                <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                  No leads found
                </h3>
                <p className='mx-auto max-w-sm text-gray-500'>
                  No visitor contact information has been collected yet. Start
                  conversations with your chatbot to begin collecting leads.
                </p>
              </div>
            ) : (
              <div className='overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow className='border-gray-200 bg-gray-50/50'>
                      <TableHead className='font-semibold text-gray-700'>
                        Name
                      </TableHead>
                      <TableHead className='font-semibold text-gray-700'>
                        Email
                      </TableHead>
                      <TableHead className='font-semibold text-gray-700'>
                        Session ID
                      </TableHead>
                      <TableHead className='font-semibold text-gray-700'>
                        Created At
                      </TableHead>
                      <TableHead className='font-semibold text-gray-700'>
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead, index) => (
                      <TableRow
                        key={lead.session_id || index}
                        className='border-gray-100 transition-colors hover:bg-gray-50/50'
                      >
                        <TableCell className='font-medium text-gray-900'>
                          {lead.name}
                        </TableCell>
                        <TableCell className='text-gray-600'>
                          {lead.email}
                        </TableCell>
                        <TableCell className='font-mono text-sm text-gray-500'>
                          {lead.session_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className='text-gray-600'>
                          {formatDate(lead.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='secondary'
                            className='bg-green-100 text-green-800 hover:bg-green-100'
                          >
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LeadsPage
