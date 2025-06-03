import { Button } from '@/components/custom/button'
import { Card } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons'
import { useToast } from '@/components/ui/use-toast'
import { useApiKey } from '@/hooks/useApiKey'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { useChatWidgetSettings } from '@/hooks/useChatWidgetSettings'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function ChatWidgetInstall() {
    const navigate = useNavigate()
    const [platform, setPlatform] = useState('wordpress')
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const { toast } = useToast()
    const { apiKey, isLoading: isApiKeyLoading } = useApiKey()
    const { data: settings, isLoading: isSettingsLoading } = useChatWidgetSettings()
    const queryClient = useQueryClient()

    // Add states for chat widget settings
    const [name, setName] = useState('Bay AI')
    const [selectedColor, setSelectedColor] = useState('black')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [scriptTag, setScriptTag] = useState('')

    useEffect(() => {
        if (!apiKey) return

        // Generate script tag with API key as data attribute
        setScriptTag(`<script src="${import.meta.env.VITE_BOT_URL}" data-api-key="${apiKey}" async></script>`)

        // Update states from settings when they're available
        if (settings) {
            setName(settings.name)
            setSelectedColor(settings.selectedColor)
            if (settings.avatarUrl) {
                setAvatarUrl(settings.avatarUrl)
            }
        }
    }, [apiKey, settings])

    const handleBack = () => {
        navigate('/dashboard/chat-widget-setup')
    }

    const handleConnect = async () => {
        try {
            console.log('[DEBUG] Current settings:', settings)

            // Prepare settings payload
            const settingsPayload = {
                name: settings?.name || name,
                selectedColor: settings?.selectedColor || selectedColor,
                leadCapture: settings?.leadCapture || true,
                botBehavior: settings?.botBehavior || '2',
                avatarUrl: settings?.avatarUrl || avatarUrl,
                is_bot_connected: true  // Always true when connecting
            }

            console.log('[DEBUG] Sending settings payload:', settingsPayload)

            // Save settings to MongoDB with bot connected status
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chatbot/save-settings`,
                settingsPayload,
                {
                    headers: {
                        'X-API-Key': apiKey
                    }
                }
            )

            console.log('[DEBUG] Save settings response:', response.data)

            if (response.data.status === 'success') {
                // Invalidate and refetch chatWidgetSettings query
                await queryClient.invalidateQueries({ queryKey: ['chatWidgetSettings'] })

                // Show success modal
                setShowSuccessModal(true)

                // Automatically navigate to system settings after 1.5s
                setTimeout(() => {
                    navigate('/dashboard/system-settings')
                }, 1500)
            }
        } catch (error) {
            console.error('Error connecting bot:', error)
            toast({
                title: 'Error',
                description: 'Failed to connect the bot',
                variant: 'destructive'
            })
        }
    }

    const handleCopyToClipboard = () => {
        const code = document.getElementById('code-snippet')?.textContent
        if (code) {
            navigator.clipboard.writeText(code)
            // Could add a toast notification here
            toast({
                title: 'Success',
                description: 'Code copied to clipboard',
            })
        }
    }

    // Update loading state to use LoadingSpinner
    if (isSettingsLoading || isApiKeyLoading) {
        return (
            <div className="w-full h-[calc(100vh-120px)] flex items-center justify-center">
                <LoadingSpinner
                    size="lg"
                    text="Loading settings..."
                />
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col h-[calc(100vh-120px)]">
            <div className="flex-1 overflow-y-auto space-y-6">
                {/* Chat Widget Installation Section */}
                <div>
                    <div>
                        <h3 className="text-xl font-medium">Set up the chat widget</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">
                            Set up a chat widget to streamline communication, improve customer satisfaction, and drive conversions
                            with real-time assistance.
                        </p>
                    </div>

                    <Card className="p-6 border rounded-lg">
                        <div className="space-y-6">


                            {/* Two-column layout */}
                            <div className="flex flex-col lg:flex-row justify-between gap-8">
                                {/* Left Column - Installation Instructions */}
                                <div className="w-full lg:w-3/5">



                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 text-gray-400 text-xs">
                                                1
                                            </div>
                                            <span className="ml-2 text-gray-500 text-sm">—</span>
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs">
                                                2
                                            </div>
                                        </div>
                                        <h4 className="text-sm text-gray-500">Talk to your visitors via live chat</h4>
                                        <h3 className="text-xl font-bold">Install your chat widget</h3>
                                    </div>

                                    {/* Platform Selection */}
                                    <div className="space-y-2 mb-6">
                                        <label className="block text-sm font-medium">
                                            Select platform
                                        </label>
                                        <Select
                                            value={platform}
                                            onValueChange={(value) => setPlatform(value)}
                                        >
                                            <SelectTrigger className="w-full max-w-[250px] h-10">
                                                <SelectValue placeholder="Select a platform" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="wordpress">
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path>
                                                        </svg>
                                                        WordPress
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="manual">
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                            <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                                                            <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                                                            <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                                                            <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                                                        </svg>
                                                        Manual install
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {platform === 'wordpress' && (
                                        <div className="space-y-4">
                                            <ol className="list-decimal pl-6 space-y-2">
                                                <li className="text-sm">Log in to your WordPress account and go to Dashboard</li>
                                                <li className="text-sm">Navigate to the "Plugins" section and select "Add New"</li>
                                                <li className="text-sm">Type "Tidio" in the search bar and hit the "Install New" button Tip</li>
                                                <li className="text-sm">Once installed, make sure to hit the "Activate" button before moving on</li>
                                                <li className="text-sm">Click "Tidio Chat" in the left-hand side menu. Choose "Log in" and enter your email and password</li>
                                            </ol>
                                        </div>
                                    )}

                                    {/* Manual Installation Instructions */}
                                    {platform === 'manual' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
                                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs">
                                                    2
                                                </div>
                                                <span className="text-sm dark:text-gray-300">Paste this code snippet just before the &lt;/body&gt; tag</span>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg relative">
                                                <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200" id="code-snippet">
                                                    {scriptTag || 'Loading script tag...'}
                                                </pre>
                                                <button
                                                    onClick={handleCopyToClipboard}
                                                    className="absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
                                                >
                                                    <span className="mr-1 text-xs">Copy to clipboard</span>
                                                    <CopyIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right side - Preview */}
                                <div className="w-[320px]">
                                    <div className="sticky top-6">
                                        <div className="relative">
                                            <div className="w-[300px] h-[500px] bg-white rounded-xl shadow-lg border overflow-hidden">
                                                {/* Chat header */}
                                                <div className={`p-4 ${selectedColor === 'black' ? 'bg-black' : `bg-${selectedColor}-500`} text-white`}>
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                                            {avatarUrl ? (
                                                                <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                                                            ) : (
                                                                <span className="text-black text-xs font-bold">BA</span>
                                                            )}
                                                        </div>
                                                        <div className="ml-2">
                                                            <p className="text-sm"><span className="font-bold">{name}</span></p>
                                                            <p className="text-xs opacity-70">online conversation</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Chat content */}
                                                <div className="p-4 h-[350px] flex flex-col justify-end">
                                                    <div className="bg-gray-100 rounded-lg p-3 max-w-[75%] mb-2">
                                                        <p className="text-sm text-black">Hi yes, David have found it, ask our concierge <span className="font-bold text-lg">👋</span></p>
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <div className="bg-gray-800 text-white rounded-lg p-3 max-w-[75%]">
                                                            <p className="text-sm">Thank you for work, see you!</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Chat input */}
                                                <div className="border-t p-4 flex items-center">
                                                    <div className="flex-1 flex items-center relative">
                                                        <svg className="h-5 w-5 text-gray-400 absolute left-2" viewBox="0 0 24 24" fill="none">
                                                            <path d="M19 13C19 16.866 15.866 20 12 20C8.13401 20 5 16.866 5 13C5 9.13401 8.13401 6 12 6C15.866 6 19 9.13401 19 13Z" stroke="currentColor" strokeWidth="2" />
                                                        </svg>
                                                        <input
                                                            type="text"
                                                            placeholder="Type your message here..."
                                                            className="flex-1 pl-8 pr-2 py-2 rounded-full border border-gray-200 outline-none text-sm"
                                                        />
                                                    </div>
                                                    <button className={`ml-2 w-8 h-8 rounded-full ${selectedColor === 'black' ? 'bg-black' : `bg-${selectedColor}-500`} text-white flex items-center justify-center`}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <CheckIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Successfully Connected</h3>
                            <p className="text-sm text-gray-500">Your chat widget has been set up successfully. You will be redirected shortly.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom navigation */}
            <div className="flex justify-between py-4 border-t mt-4">
                <a href="#" className="text-sm text-blue-500 hover:underline">
                    Learn more about account setting
                </a>
                <div className="space-x-2">
                    <Button variant="outline" className="px-6" onClick={handleBack}>
                        Back
                    </Button>
                    <Button variant="default" className="bg-black text-white dark:bg-slate-950 px-6" onClick={handleConnect}>
                        Connect
                    </Button>
                </div>
            </div>
        </div>
    )
} 