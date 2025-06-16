import { useState, useEffect } from 'react';
import { Button } from '@/components/custom/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useApiKey } from '@/hooks/useApiKey';
import { LoadingSpinner } from '@/components/custom/loading-spinner';

interface TimeSlot {
    id: string;
    start_time: string;
    end_time: string;
}

interface AppointmentAvailability {
    date: string;
    time_slots: TimeSlot[];
}

// Helper function to convert 24-hour format to 12-hour AM/PM format
const convertTo12Hour = (time24: string): string => {
    if (!time24) return '';

    // If already in AM/PM format, return as is
    if (time24.includes('AM') || time24.includes('PM')) {
        return time24;
    }

    try {
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
        return time24;
    }
};

// Helper function to convert 12-hour AM/PM format to 24-hour format for input
// const convertTo24Hour = (time12: string): string => {
//     if (!time12) return '';

//     // If already in 24-hour format, return as is
//     if (!time12.includes('AM') && !time12.includes('PM')) {
//         return time12;
//     }

//     try {
//         const [time, period] = time12.split(' ');
//         const [hours, minutes] = time.split(':').map(Number);

//         let hour24 = hours;
//         if (period === 'AM' && hours === 12) {
//             hour24 = 0;
//         } else if (period === 'PM' && hours !== 12) {
//             hour24 = hours + 12;
//         }

//         return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//     } catch (error) {
//         return time12;
//     }
// };

export default function AppointmentsPage() {
    const { apiKey } = useApiKey();
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [availabilities, setAvailabilities] = useState<AppointmentAvailability[]>([]);
    const [currentTimeSlots, setCurrentTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
    const [newSlot, setNewSlot] = useState({ start_time: '', end_time: '' });

    // Get current month and year for calendar
    const currentDate = new Date();
    const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
    const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

    // Load existing availabilities
    useEffect(() => {
        if (apiKey) {
            loadAvailabilities();
        }
    }, [apiKey]);

    console.log('apiKey : ', apiKey)

    // Load time slots for selected date
    useEffect(() => {
        if (selectedDate) {
            const availability = availabilities.find(a => a.date === selectedDate);
            setCurrentTimeSlots(availability ? availability.time_slots : []);
        }
    }, [selectedDate, availabilities]);

    const loadAvailabilities = async () => {
        if (!apiKey) return;

        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/availability`, {
                headers: { 'X-API-Key': apiKey }
            });
            setAvailabilities(response.data);
        } catch (error) {
            console.error('Error loading availabilities:', error);
            toast.error('Failed to load appointment availabilities');
        } finally {
            setLoading(false);
        }
    };

    const saveAvailability = async () => {
        console.log('selectedDate : ', selectedDate, "apiKey : ", apiKey)
        if (!apiKey || !selectedDate) return;

        setSaving(true);
        try {
            // Convert time slots to AM/PM format before sending
            const formattedTimeSlots = currentTimeSlots.map(slot => ({
                ...slot,
                start_time: convertTo12Hour(slot.start_time),
                end_time: convertTo12Hour(slot.end_time)
            }));

            await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments/availability`, {
                date: selectedDate,
                time_slots: formattedTimeSlots
            }, {
                headers: { 'X-API-Key': apiKey }
            });

            // Update local state
            const existingIndex = availabilities.findIndex(a => a.date === selectedDate);
            if (existingIndex >= 0) {
                const updated = [...availabilities];
                updated[existingIndex] = { date: selectedDate, time_slots: formattedTimeSlots };
                setAvailabilities(updated);
                setCurrentTimeSlots(formattedTimeSlots);
            } else {
                setAvailabilities([...availabilities, { date: selectedDate, time_slots: formattedTimeSlots }]);
                setCurrentTimeSlots(formattedTimeSlots);
            }

            toast.success('Appointment availability saved successfully');
        } catch (error) {
            console.error('Error saving availability:', error);
            toast.error('Failed to save appointment availability');
        } finally {
            setSaving(false);
        }
    };

    const deleteTimeSlot = async (slotId: string) => {
        if (!apiKey || !selectedDate) return;

        setDeletingSlotId(slotId);
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/appointments/availability/slot`, {
                headers: { 'X-API-Key': apiKey },
                data: {
                    date: selectedDate,
                    slot_id: slotId
                }
            });

            // Update local state
            const updatedSlots = currentTimeSlots.filter(slot => slot.id !== slotId);
            setCurrentTimeSlots(updatedSlots);

            // Update availabilities state
            const existingIndex = availabilities.findIndex(a => a.date === selectedDate);
            if (existingIndex >= 0) {
                const updated = [...availabilities];
                if (updatedSlots.length === 0) {
                    // Remove the entire date if no slots remain
                    updated.splice(existingIndex, 1);
                } else {
                    updated[existingIndex] = { date: selectedDate, time_slots: updatedSlots };
                }
                setAvailabilities(updated);
            }

            toast.success('Time slot deleted successfully');
        } catch (error) {
            console.error('Error deleting time slot:', error);
            toast.error('Failed to delete time slot');
        } finally {
            setDeletingSlotId(null);
        }
    };

    const addTimeSlot = () => {
        if (!newSlot.start_time || !newSlot.end_time) {
            toast.error('Please enter both start and end times');
            return;
        }

        if (newSlot.start_time >= newSlot.end_time) {
            toast.error('End time must be after start time');
            return;
        }

        const slot: TimeSlot = {
            id: Date.now().toString(),
            start_time: convertTo12Hour(newSlot.start_time),
            end_time: convertTo12Hour(newSlot.end_time)
        };

        setCurrentTimeSlots([...currentTimeSlots, slot]);
        setNewSlot({ start_time: '', end_time: '' });
    };

    const generateCalendar = () => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dateString = date.toISOString().split('T')[0];
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isPast = date < today;
            const isSelected = dateString === selectedDate;
            const hasAvailability = availabilities.some(a => a.date === dateString);

            days.push({
                date,
                dateString,
                day: date.getDate(),
                isCurrentMonth,
                isPast,
                isSelected,
                hasAvailability
            });
        }

        return days;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Appointment Management</h1>
                <p className="text-muted-foreground">
                    Set your available time slots for appointments. Select dates and configure time ranges.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Select Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Month Navigation */}
                                <div className="flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigateMonth('prev')}
                                    >
                                        ←
                                    </Button>
                                    <h3 className="text-lg font-semibold">
                                        {monthNames[currentMonth]} {currentYear}
                                    </h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigateMonth('next')}
                                    >
                                        →
                                    </Button>
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {/* Day Headers */}
                                    {dayNames.map(day => (
                                        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                                            {day}
                                        </div>
                                    ))}

                                    {/* Calendar Days */}
                                    {generateCalendar().map((day, index) => (
                                        <button
                                            key={index}
                                            onClick={() => !day.isPast && day.isCurrentMonth && setSelectedDate(day.dateString)}
                                            disabled={day.isPast || !day.isCurrentMonth}
                                            className={`
                        p-2 text-sm relative rounded-md transition-colors
                        ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                        ${day.isPast ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted'}
                        ${day.isSelected ? 'bg-primary text-primary-foreground' : ''}
                        ${!day.isCurrentMonth ? 'opacity-40' : ''}
                      `}
                                        >
                                            {day.day}
                                            {day.hasAvailability && (
                                                <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Has availability</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Time Slots Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Time Slots
                            {selectedDate && (
                                <Badge variant="outline">
                                    {new Date(selectedDate).toLocaleDateString()}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!selectedDate ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Select a date from the calendar to manage time slots
                            </div>
                        ) : (
                            <>
                                {/* Add New Time Slot */}
                                <div className="space-y-3">
                                    <Label>Add Time Slot</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label htmlFor="start-time" className="text-xs">Start Time</Label>
                                            <Input
                                                id="start-time"
                                                type="time"
                                                value={newSlot.start_time}
                                                onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="end-time" className="text-xs">End Time</Label>
                                            <Input
                                                id="end-time"
                                                type="time"
                                                value={newSlot.end_time}
                                                onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <Button onClick={addTimeSlot} className="w-full" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Time Slot
                                    </Button>
                                </div>

                                {/* Current Time Slots */}
                                {currentTimeSlots.length > 0 && (
                                    <div className="space-y-3">
                                        <Label>Current Time Slots</Label>
                                        <div className="space-y-2">
                                            {currentTimeSlots.map((slot) => (
                                                <div
                                                    key={slot.id}
                                                    className="flex items-center justify-between p-3 border rounded-md"
                                                >
                                                    <span className="font-mono text-sm">
                                                        {slot.start_time} - {slot.end_time}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteTimeSlot(slot.id)}
                                                        disabled={deletingSlotId === slot.id}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        {deletingSlotId === slot.id ? (
                                                            <LoadingSpinner size="sm" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Save Button */}
                                <Button
                                    onClick={saveAvailability}
                                    disabled={saving || !selectedDate}
                                    className="w-full"
                                >
                                    {saving ? (
                                        <>
                                            <LoadingSpinner size="sm" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Availability
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Summary */}
            {availabilities.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Availability Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availabilities.map((availability) => (
                                <div key={availability.date} className="p-3 border rounded-md">
                                    <h4 className="font-medium mb-2">
                                        {new Date(availability.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </h4>
                                    <div className="space-y-1">
                                        {availability.time_slots.map((slot) => (
                                            <div key={slot.id} className="text-sm font-mono text-muted-foreground">
                                                {slot.start_time} - {slot.end_time}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 