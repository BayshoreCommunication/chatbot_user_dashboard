import { useToast } from '@/components/ui/use-toast'
import { useApiKey } from '@/hooks/useApiKey'
import { useCallback, useEffect, useState } from 'react'
import useAxiosPublic from './useAxiosPublic'

export interface Lead {
  name: string
  email: string | null
  phone?: string | null
  inquiry?: string | null
  session_id: string
  created_at: string
  organization_id: string
  status?: string
}

// Backend /api/leads-list-byorg returns: { organization_id, leads }
export interface LeadsResponseOrg {
  organization_id: string
  leads: Lead[]
}

export interface LeadsStats {
  total_profiles: number
  valid_leads: number
  leads_with_email: number
  leads_with_name: number
  organization_id: string
}

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { apiKey } = useApiKey()
  const axiosPublic = useAxiosPublic()

  const fetchLeads = useCallback(async () => {
    if (!apiKey) {
      setError('API key not found')
      toast({
        title: 'Error',
        description: 'API key not found. Please check your settings.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await axiosPublic.get<LeadsResponseOrg>(
        '/api/leads-list-byorg',
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      const data = res.data
      const list = Array.isArray(data.leads) ? data.leads : []
      setLeads(list)

      // Compute stats locally
      const computed: LeadsStats = {
        total_profiles: list.length,
        valid_leads: list.filter(
          (l) =>
            (l.email && l.email.trim()) || (l.phone && String(l.phone).trim())
        ).length,
        leads_with_email: list.filter((l) => l.email && l.email.trim()).length,
        leads_with_name: list.filter((l) => l.name && l.name.trim()).length,
        organization_id: data.organization_id || '',
      }
      setStats(computed)

      toast({
        title: 'Success',
        description: `Loaded ${list.length} leads successfully.`,
      })
    } catch (err) {
      const maybeAxios = err as
        | { response?: { data?: { detail?: string } } }
        | Error
      const errorMessage =
        (typeof maybeAxios === 'object' &&
          'response' in maybeAxios &&
          maybeAxios.response?.data?.detail) ||
        (maybeAxios instanceof Error ? maybeAxios.message : 'Unknown error')
      setError(errorMessage)
      console.error('Error fetching leads:', err)

      // More specific error messages
      let userMessage = 'Failed to fetch leads. Please try again.'
      if (
        error instanceof TypeError &&
        error.message.includes('Failed to fetch')
      ) {
        userMessage =
          'Cannot connect to the server. Please check if the backend is running and accessible.'
      } else if (error instanceof Error && error.message.includes('CORS')) {
        userMessage =
          'CORS error: Backend needs to allow requests from this domain.'
      }

      toast({
        title: 'Connection Error',
        description: userMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [apiKey, toast, axiosPublic])

  // Stats are computed locally after fetching leads now
  const fetchStats = useCallback(async () => {}, [])

  const downloadCSV = async () => {
    if (!apiKey) {
      toast({
        title: 'Error',
        description: 'API key not found. Please check your settings.',
        variant: 'destructive',
      })
      return
    }

    try {
      // Create CSV content
      const csvHeaders = [
        'Name',
        'Email',
        'Session ID',
        'Created At',
        'Organization ID',
      ]
      const csvRows = leads.map((lead) => [
        lead.name,
        lead.email,
        lead.session_id,
        new Date(lead.created_at).toLocaleString(),
        lead.organization_id,
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row) => row.map((field) => `"${field}"`).join(',')),
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `leads_${new Date().toISOString().split('T')[0]}.csv`
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Success',
        description: 'Leads data downloaded successfully!',
      })
    } catch (error) {
      console.error('Error downloading CSV:', error)
      toast({
        title: 'Error',
        description: 'Failed to download CSV. Please try again.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    if (apiKey) {
      fetchLeads()
      fetchStats()
    }
  }, [apiKey, fetchLeads, fetchStats])

  return {
    leads,
    stats,
    loading,
    error,
    fetchLeads,
    fetchStats,
    downloadCSV,
  }
}
