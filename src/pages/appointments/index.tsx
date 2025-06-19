import { useState, useEffect } from 'react';
import { Button } from '@/components/custom/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, Calendar, Clock, User, Settings, ExternalLink, Edit } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useApiKey } from '@/hooks/useApiKey';
import { LoadingSpinner } from '@/components/custom/loading-spinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CalendlySettings {
    calendly_url: string;
    calendly_access_token: string;
    event_type_uri: string;
    auto_embed: boolean;
}

interface CalendlyEvent {
    uri: string;
    name: string;
    duration: number;
    status: string;
    booking_url: string;
}

interface CalendlySlot {
    start_time: string;
    scheduling_url: string;
}

export default function AppointmentsPage() {
    const { apiKey } = useApiKey();
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState<CalendlySettings>({
        calendly_url: '',
        calendly_access_token: '',
        event_type_uri: '',
        auto_embed: true
    });
    const [isEditing, setIsEditing] = useState(false);

    // Query for Calendly settings
    const { data: settingsData, isLoading: settingsLoading } = useQuery({
        queryKey: ['calendly-settings', apiKey],
        queryFn: async () => {
            if (!apiKey) throw new Error('No API key');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/calendly/settings`, {
                headers: { 'X-API-Key': apiKey }
            });
            return response.data.settings;
        },
        enabled: !!apiKey,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });

    // Query for Calendly events
    const { data: events = [] } = useQuery<CalendlyEvent[]>({
        queryKey: ['calendly-events', apiKey],
        queryFn: async () => {
            if (!apiKey) throw new Error('No API key');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/calendly/events`, {
                headers: { 'X-API-Key': apiKey }
            });
            return response.data.events || [];
        },
        enabled: !!apiKey && !!settingsData?.calendly_access_token,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });

    // Query for Calendly stats
    const { data: stats = { total_events: 0, active_events: 0, upcoming_bookings: 0 } } = useQuery({
        queryKey: ['calendly-stats', apiKey],
        queryFn: async () => {
            if (!apiKey) throw new Error('No API key');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/calendly/stats`, {
                headers: { 'X-API-Key': apiKey }
            });
            return response.data.stats || { total_events: 0, active_events: 0, upcoming_bookings: 0 };
        },
        enabled: !!apiKey && !!settingsData?.calendly_access_token,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });

    // Query for available slots
    const { data: availableSlots = [] } = useQuery<CalendlySlot[]>({
        queryKey: ['calendly-availability', apiKey, settings.event_type_uri],
        queryFn: async () => {
            if (!apiKey || !settings.event_type_uri) throw new Error('Missing requirements');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/calendly/availability`, {
                headers: { 'X-API-Key': apiKey },
                params: { event_type_uri: settings.event_type_uri }
            });
            return response.data.slots || [];
        },
        enabled: !!apiKey && !!settings.event_type_uri && !!settingsData?.calendly_access_token,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
    });

    // Test connection mutation
    const testConnectionMutation = useMutation({
        mutationFn: async (accessToken: string) => {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/appointments/calendly/test-connection`,
                { access_token: accessToken },
                { headers: { 'X-API-Key': apiKey } }
            );
            return response.data;
        },
        onSuccess: (data) => {
            if (data.valid) {
                toast.success('Calendly connection successful!');
                // Invalidate and refetch related queries
                queryClient.invalidateQueries({ queryKey: ['calendly-events', apiKey] });
                queryClient.invalidateQueries({ queryKey: ['calendly-stats', apiKey] });
            } else {
                toast.error('Invalid Calendly access token');
            }
        },
        onError: () => {
            toast.error('Failed to connect to Calendly');
        }
    });

    // Save settings mutation
    const saveSettingsMutation = useMutation({
        mutationFn: async (settingsToSave: CalendlySettings) => {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/appointments/calendly/settings`,
                settingsToSave,
                { headers: { 'X-API-Key': apiKey } }
            );
        },
        onSuccess: () => {
            toast.success('Calendly settings saved successfully');
            setIsEditing(false);
            // Invalidate all related queries
            queryClient.invalidateQueries({ queryKey: ['calendly-settings', apiKey] });
            queryClient.invalidateQueries({ queryKey: ['calendly-events', apiKey] });
            queryClient.invalidateQueries({ queryKey: ['calendly-stats', apiKey] });
        },
        onError: () => {
            toast.error('Failed to save Calendly settings');
        }
    });

    // Update settings when data is loaded
    useEffect(() => {
        if (settingsData) {
            setSettings(settingsData);
        }
    }, [settingsData]);

    // Check if connection is valid (has events)
    const connectionValid = events.length > 0;

    const handleTestConnection = () => {
        if (!settings.calendly_access_token) {
            toast.error('Please enter your Calendly access token');
            return;
        }
        testConnectionMutation.mutate(settings.calendly_access_token);
    };

    const handleSaveSettings = () => {
        if (!apiKey) return;
        saveSettingsMutation.mutate(settings);
    };

    const handleEditToken = () => {
        setIsEditing(true);
    };

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        };
    };

    console.log('Calendly stats data:', stats);
    console.log('Calendly events data:', events);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Calendly Integration</h1>
                <p className="text-muted-foreground">
                    Connect your Calendly account to enable AI-powered appointment booking.
                </p>
            </div>

            {/* Setup Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Setup Instructions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">How to get your Calendly Access Token:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Go to your <a href="https://calendly.com/integrations/api_webhooks" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Calendly API & Webhooks page</a></li>
                            <li>Click "Create token" under Personal Access Tokens</li>
                            <li>Give your token a name (e.g., "AI Assistant")</li>
                            <li>Copy the generated token and paste it below</li>
                        </ol>
                    </div>
                </CardContent>
            </Card>

            {/* Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Settings Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Calendly Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {settingsLoading ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : (
                            <>
                                

                                <div className="space-y-2">
                                    <Label htmlFor="access-token">Calendly Access Token *</Label>
                                    <Input
                                        id="access-token"
                                        type="password"
                                        placeholder="Enter your Calendly Personal Access Token"
                                        value={settings.calendly_access_token}
                                        onChange={(e) => setSettings({ ...settings, calendly_access_token: e.target.value })}
                                        disabled={connectionValid && !isEditing}
                                    />
                                    {connectionValid && (
                                        <p className="text-xs text-green-600">✓ Connection verified</p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {/* Only show Test Connection button when editing */}
                                    {isEditing && (
                                        <Button
                                            variant="outline"
                                            onClick={handleTestConnection}
                                            disabled={testConnectionMutation.isPending || !settings.calendly_access_token}
                                        >
                                            <div className="flex items-center gap-2">
                                                {testConnectionMutation.isPending ? (
                                                    <>
                                                        <LoadingSpinner size="sm" />
                                                        <span>Testing...</span>
                                                    </>
                                                ) : (
                                                    <span>Test Connection</span>
                                                )}
                                            </div>
                                        </Button>
                                    )}

                                    {/* Show different buttons based on state */}
                                    {!connectionValid || isEditing ? (
                                        <Button
                                            onClick={handleSaveSettings}
                                            disabled={saveSettingsMutation.isPending || !settings.calendly_access_token}
                                        >
                                            <div className="flex items-center gap-2">
                                                {saveSettingsMutation.isPending ? (
                                                    <>
                                                        <LoadingSpinner size="sm" />
                                                        <span>Saving...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4" />
                                                        <span>
                                                            {connectionValid ? 'Update Token' : 'Save & Connect'}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={handleEditToken}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Edit className="h-4 w-4" />
                                                <span>Edit Token</span>
                                            </div>
                                        </Button>
                                    )}
                                </div>

                                {events.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="event-type">Select Event Type for AI Booking</Label>
                                        <select
                                            id="event-type"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            value={settings.event_type_uri}
                                            onChange={(e) => {
                                                const newSettings = { ...settings, event_type_uri: e.target.value };
                                                setSettings(newSettings);
                                                // Auto-save when event type is selected
                                                if (apiKey && e.target.value) {
                                                    saveSettingsMutation.mutate(newSettings);
                                                }
                                            }}
                                        >
                                            <option value="">Select an event type...</option>
                                            {events.map((event: CalendlyEvent) => (
                                                <option key={event.uri} value={event.uri}>
                                                    {event.name} ({event.duration} min)
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-muted-foreground">
                                            This event type will be used for AI-powered booking
                                        </p>
                                        {saveSettingsMutation.isPending && (
                                            <p className="text-xs text-blue-600 flex items-center gap-1">
                                                <LoadingSpinner size="sm" />
                                                Saving selection...
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Your Event Types Section - Moved here */}
                                {events.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="border-t pt-4">
                                            <h4 className="font-medium mb-3">Your Event Types</h4>
                                            <div className="space-y-3">
                                                {events.map((event: CalendlyEvent) => (
                                                    <div key={event.uri} className="p-3 border rounded-lg bg-gray-50">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h5 className="font-medium text-sm">{event.name}</h5>
                                                            {settings.event_type_uri === event.uri && (
                                                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                                                                    AI Enabled
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span>{event.duration} minutes</span>
                                                                </div>
                                                                <Badge variant={event.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                                                    {event.status}
                                                                </Badge>
                                                            </div>
                                                            <Button variant="outline" size="sm" asChild>
                                                                <a href={event.booking_url} target="_blank" rel="noopener noreferrer">
                                                                    <span className="flex items-center text-xs">
                                                                        <ExternalLink className="w-3 h-3 mr-1" />
                                                                        View Page
                                                                    </span>
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Stats & Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Overview</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Your Calendly integration status and key metrics
                        </p>
                    </CardHeader>
                    <CardContent>
                        {connectionValid ? (
                            <div className="space-y-6">
                                {/* Main Stats Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="text-center p-4 border rounded-lg bg-blue-50">
                                        <div className="text-2xl font-bold text-blue-600">{stats.total_events}</div>
                                        <div className="text-sm text-muted-foreground">Total Events</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg bg-green-50">
                                        <div className="text-2xl font-bold text-green-600">{stats.active_events}</div>
                                        <div className="text-sm text-muted-foreground">Active Events</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg bg-purple-50">
                                        <div className="text-2xl font-bold text-purple-600">{availableSlots.length}</div>
                                        <div className="text-sm text-muted-foreground">Available Slots</div>
                                        <div className="text-xs text-muted-foreground mt-1">Next 7 days</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg bg-orange-50">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {settings.event_type_uri ? '✓' : '⚠'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">AI Integration</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {settings.event_type_uri ? 'Configured' : 'Setup needed'}
                                        </div>
                                    </div>
                                </div>

                                {/* Connection Status */}
                                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="font-medium text-green-800">Connected to Calendly</span>
                                    </div>
                                    <p className="text-sm text-green-700">
                                        Your AI assistant can now access your calendar and book appointments automatically.
                                    </p>
                                </div>

                                {/* Quick Insights
                                {availableSlots.length > 0 && (
                                    <div className="p-4 border rounded-lg bg-blue-50">
                                        <h4 className="font-medium text-blue-800 mb-2">📊 Availability Insights</h4>
                                        <div className="space-y-2 text-sm text-blue-700">
                                            <p>• Next available: {(() => {
                                                const nextSlot = availableSlots[0];
                                                if (nextSlot) {
                                                    const { date, time } = formatDateTime(nextSlot.start_time);
                                                    return `${date} at ${time}`;
                                                }
                                                return 'Loading...';
                                            })()}</p>
                                            <p>• Total slots this week: {availableSlots.length}</p>
                                            <p>• Average slots per day: {Math.round(availableSlots.length / 7)}</p>
                                        </div>
                                    </div>
                                )} */}

                                {/* AI Configuration Status */}
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-medium mb-3">🤖 AI Assistant Configuration</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Calendly Access Token</span>
                                            <Badge variant="outline" className="bg-green-100 text-green-800">
                                                ✓ Connected
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Event Type Selected</span>
                                            {settings.event_type_uri ? (
                                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                                    ✓ Configured
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                                    ⚠ Required
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>AI Booking Status</span>
                                            {settings.event_type_uri ? (
                                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                                    ✓ Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                {/* <div className="space-y-3">
                                    <h4 className="font-medium">⚡ Quick Actions</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {settings.calendly_url && (
                                            <Button variant="outline" asChild size="sm">
                                                <a href={settings.calendly_url} target="_blank" rel="noopener noreferrer">
                                                    <span className="flex items-center">
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        View Public Profile
                                                    </span>
                                                </a>
                                            </Button>
                                        )}
                                        <Button variant="outline" asChild size="sm">
                                            <a href="https://calendly.com/app/scheduled_events" target="_blank" rel="noopener noreferrer">
                                                <span className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Manage Bookings
                                                </span>
                                            </a>
                                        </Button>
                                        <Button variant="outline" asChild size="sm">
                                            <a href="https://calendly.com/app/event_types" target="_blank" rel="noopener noreferrer">
                                                <span className="flex items-center">
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    Edit Event Types
                                                </span>
                                            </a>
                                        </Button>
                                        <Button variant="outline" asChild size="sm">
                                            <a href="https://calendly.com/app/availability" target="_blank" rel="noopener noreferrer">
                                                <span className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    Set Availability
                                                </span>
                                            </a>
                                        </Button>
                                    </div>
                                </div> */}

                                {/* Integration Tips */}
                                {!settings.event_type_uri && (
                                    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                                        <div className="flex items-start gap-2">
                                            <div className="text-yellow-600 mt-0.5">💡</div>
                                            <div>
                                                <h4 className="font-medium text-yellow-800 mb-1">Complete Your Setup</h4>
                                                <p className="text-sm text-yellow-700 mb-2">
                                                    Select an event type above to enable AI-powered booking for your customers.
                                                </p>
                                                <p className="text-xs text-yellow-600">
                                                    This allows your AI assistant to automatically show available times and provide direct booking links.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h3 className="font-medium mb-2">Connect Your Calendly Account</h3>
                                <p className="text-sm mb-4">
                                    Get detailed insights about your booking performance and AI integration status.
                                </p>
                                <p className="text-xs">
                                    Add your access token above to get started with powerful analytics and automation.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Available Slots Preview */}
            {availableSlots.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Next Available Slots</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            These are the slots your AI assistant will offer to customers
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {availableSlots.slice(0, 6).map((slot: CalendlySlot, index: number) => {
                                const { date, time } = formatDateTime(slot.start_time);
                                return (
                                    <div key={index} className="p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
                                        <div className="text-sm font-medium">{date}</div>
                                        <div className="text-lg font-semibold">{time}</div>
                                        <Button variant="outline" size="sm" asChild className="w-full mt-2">
                                            <a href={slot.scheduling_url} target="_blank" rel="noopener noreferrer">
                                                <span className="flex items-center justify-center">
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    Booking URL
                                                </span>
                                            </a>
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                        {availableSlots.length > 6 && (
                            <p className="text-sm text-muted-foreground text-center mt-4">
                                ... and {availableSlots.length - 6} more slots available
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* How it Works */}
            <Card>
                <CardHeader>
                    <CardTitle>How AI Booking Works</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <h4 className="font-medium mb-2">1. AI Fetches Availability</h4>
                            <p className="text-sm text-muted-foreground">
                                Your AI assistant automatically checks your Calendly for available time slots
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <User className="w-6 h-6 text-green-600" />
                            </div>
                            <h4 className="font-medium mb-2">2. Customer Selects Time</h4>
                            <p className="text-sm text-muted-foreground">
                                Customers chat with AI and choose from available appointment slots
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <ExternalLink className="w-6 h-6 text-purple-600" />
                            </div>
                            <h4 className="font-medium mb-2">3. Direct Calendly Booking</h4>
                            <p className="text-sm text-muted-foreground">
                                AI provides a direct Calendly booking link for the selected time slot
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 