// Simple API connectivity test utility
export const testApiConnection = async (baseUrl: string, apiKey: string) => {
  const tests = [
    {
      name: 'Basic connectivity',
      url: baseUrl,
      method: 'GET',
    },
    {
      name: 'Leads endpoint',
      url: `${baseUrl}/lead/leads`,
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    },
    {
      name: 'Health check',
      url: `${baseUrl}/health`,
      method: 'GET',
    },
  ]

  const results = []

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`)
      console.log(`📍 URL: ${test.url}`)

      const response = await fetch(test.url, {
        method: test.method,
        headers: test.headers || {},
        mode: 'cors',
      })

      const result: {
        name: string
        url: string
        status: number
        statusText: string
        success: boolean
        headers: { [k: string]: string }
        data?: string
        error?: string
      } = {
        name: test.name,
        url: test.url,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      }

      if (response.ok) {
        try {
          const data = await response.text()
          result.data = data.substring(0, 500) // First 500 chars
        } catch (e) {
          result.data = 'Could not read response body'
        }
      } else {
        try {
          result.error = await response.text()
        } catch (e) {
          result.error = `HTTP ${response.status}: ${response.statusText}`
        }
      }

      results.push(result)
      console.log(`✅ ${test.name}:`, result)
    } catch (error) {
      const result = {
        name: test.name,
        url: test.url,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name || 'Unknown',
      }
      results.push(result)
      console.log(`❌ ${test.name}:`, result)
    }
  }

  return results
}

// Quick test function you can call from browser console
export const quickApiTest = () => {
  const baseUrl =
    import.meta.env.VITE_API_URL || 'https://api.bayshorecommunication.org'
  const apiKey = localStorage.getItem('apiKey') || 'test-key'

  console.log('🚀 Starting API connectivity test...')
  console.log('📍 Base URL:', baseUrl)
  console.log('🔑 API Key:', apiKey ? 'Present' : 'Missing')

  return testApiConnection(baseUrl, apiKey)
}
