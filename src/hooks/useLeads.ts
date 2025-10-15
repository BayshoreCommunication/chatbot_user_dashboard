import { useToast } from '@/components/ui/use-toast'
import { useApiKey } from '@/hooks/useApiKey'
import { useCallback, useEffect, useState } from 'react'

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

      // Resolve backend base URL for live deployments
      // Resolve backend base URL for live and local
      const rawBase =
        (import.meta as { env?: { VITE_API_URL?: string } })?.env
          ?.VITE_API_URL || ''
      const resolvedBase =
        rawBase && rawBase.trim().length > 0
          ? rawBase
          : typeof window !== 'undefined'
            ? window.location.origin
            : ''
      const base = resolvedBase.replace(/\/+$/, '') // remove trailing slash(es)
      const leadsUrl = `${base}/api/leads-list-byorg`
      console.log('Fetching leads from:', leadsUrl)
      console.log('Using API key:', apiKey)

      const response = await fetch(leadsUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        mode: 'cors',
      })

      console.log('Response status:', response.status)
      console.log(
        'Response headers:',
        Object.fromEntries(response.headers.entries())
      )

      // Ensure we got JSON, not an HTML fallback (e.g., index.html)
      const contentType = response.headers.get('content-type') || ''
      if (!response.ok) {
        const errorText = await response.text()
        console.log('Error response body:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }
      if (!contentType.toLowerCase().includes('application/json')) {
        const bodyPreview = await response.text()
        console.error('Expected JSON but received:', bodyPreview.slice(0, 200))
        throw new Error(
          'Unexpected response type (not JSON). Check API base URL and CORS.'
        )
      }

      const data: LeadsResponseOrg = await response.json()
      console.log('Leads data received:', data)
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching leads:', error)

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
  }, [apiKey, toast])

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
