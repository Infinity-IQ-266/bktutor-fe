import { AvailabilityTimetable } from '@/components/tutor/availability-timetable';
import { Button } from '@/components/ui/button';
import { TutorService } from '@/services/tutor';
import type { Availability } from '@/types';
import { createFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { AlertCircle, Info, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/__private/tutor/availability/')({
    component: RouteComponent,
});

// Helper to convert API Availability[] to UI schedule format
// Separate available and booked slots
function convertToScheduleFormat(
    availabilities: Availability[],
    status: 'AVAILABLE' | 'BOOKED',
): Record<string, string[]> {
    const schedule: Record<string, string[]> = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
    };

    availabilities
        .filter((slot) => slot.status === status)
        .forEach((slot) => {
            const startTime = dayjs(slot.startTime);
            const endTime = dayjs(slot.endTime);
            const dayName = startTime.format('dddd');
            const timeSlot = `${startTime.format('HH:mm')}-${endTime.format('HH:mm')}`;

            // Add unique time slots for each day (deduplicate)
            if (schedule[dayName] && !schedule[dayName].includes(timeSlot)) {
                schedule[dayName].push(timeSlot);
            }
        });

    // Sort time slots for each day
    Object.keys(schedule).forEach((day) => {
        schedule[day].sort();
    });

    return schedule;
}

// Helper to get next occurrence of a specific weekday
function getNextWeekday(dayName: string, timeSlot: string): Date {
    const dayMap: Record<string, number> = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        Sunday: 0,
    };

    const targetDay = dayMap[dayName];
    const [startTime] = timeSlot.split('-');
    const [hours, minutes] = startTime.split(':').map(Number);

    // Start from next week to avoid conflicts with current week
    const now = dayjs().add(7, 'days');
    const currentDay = now.day();

    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) {
        daysToAdd += 7;
    }

    return now
        .add(daysToAdd, 'days')
        .hour(hours)
        .minute(minutes)
        .second(0)
        .toDate();
}

// Helper to convert UI schedule format back to API format
function convertToApiFormat(
    schedule: Record<string, string[]>,
): { startTime: string; endTime: string }[] {
    const slots: { startTime: string; endTime: string }[] = [];

    Object.entries(schedule).forEach(([dayName, timeSlots]) => {
        timeSlots.forEach((timeSlot) => {
            const [startTime, endTime] = timeSlot.split('-');
            const [startHours, startMinutes] = startTime.split(':').map(Number);
            const [endHours, endMinutes] = endTime.split(':').map(Number);

            const baseDate = getNextWeekday(dayName, timeSlot);
            const startDate = dayjs(baseDate)
                .hour(startHours)
                .minute(startMinutes)
                .second(0);
            const endDate = dayjs(baseDate)
                .hour(endHours)
                .minute(endMinutes)
                .second(0);

            slots.push({
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
            });
        });
    });

    return slots;
}

function RouteComponent() {
    const [originalSchedule, setOriginalSchedule] = useState<
        Record<string, string[]>
    >({
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
    });
    const [schedule, setSchedule] = useState<Record<string, string[]>>({
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
    });
    const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const hasChanges =
        JSON.stringify(schedule) !== JSON.stringify(originalSchedule);

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            setLoading(true);
            const data = await TutorService.getMyAvailability();
            console.log('📊 Raw availability data from API:', data);
            console.log('📈 Statistics:', {
                total: data?.length || 0,
                available:
                    data?.filter((s) => s.status === 'AVAILABLE').length || 0,
                booked: data?.filter((s) => s.status === 'BOOKED').length || 0,
            });
            const scheduleData = convertToScheduleFormat(
                data || [],
                'AVAILABLE',
            );
            const bookedData = convertToScheduleFormat(data || [], 'BOOKED');
            console.log(
                '📅 Converted schedule data (AVAILABLE):',
                scheduleData,
            );
            console.log('🔒 Converted booked data (BOOKED):', bookedData);
            console.log(
                '✅ Total slots configured:',
                Object.values(scheduleData).reduce(
                    (sum, slots) => sum + slots.length,
                    0,
                ),
            );
            console.log(
                '❌ Total booked slots:',
                Object.values(bookedData).reduce(
                    (sum, slots) => sum + slots.length,
                    0,
                ),
            );
            setOriginalSchedule(scheduleData);
            setSchedule(scheduleData);
            setBookedSlots(bookedData);
        } catch (error) {
            console.error('Failed to fetch availability:', error);
            toast.error('Failed to load availability');
        } finally {
            setLoading(false);
        }
    };

    const handleSlotToggle = (day: string, slot: string) => {
        setSchedule((prev) => {
            const newSchedule = { ...prev };
            const daySlots = [...(newSchedule[day] || [])];

            if (daySlots.includes(slot)) {
                // Remove slot
                newSchedule[day] = daySlots.filter((s) => s !== slot);
            } else {
                // Add slot
                daySlots.push(slot);
                newSchedule[day] = daySlots.sort();
            }

            return newSchedule;
        });
    };

    const handleSaveSchedule = async () => {
        try {
            setSaving(true);
            const apiSlots = convertToApiFormat(schedule);
            await TutorService.updateMyAvailability(apiSlots);
            setOriginalSchedule(schedule);
            toast.success('Availability schedule saved successfully');
        } catch (error) {
            console.error('Failed to save availability:', error);
            toast.error('Failed to save availability');
        } finally {
            setSaving(false);
        }
    };

    const handleDiscardChanges = () => {
        setSchedule(originalSchedule);
        toast.info('Changes discarded');
    };

    const handleClearAll = () => {
        setSchedule({
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: [],
        });
        toast.info('All slots cleared');
    };

    const totalSlots = Object.values(schedule).reduce(
        (sum, slots) => sum + slots.length,
        0,
    );

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="mb-2 text-foreground">Availability Schedule</h1>
                <p className="text-muted-foreground">
                    Manage your weekly recurring availability for student
                    bookings
                </p>
            </div>

            {/* Action Buttons */}
            {!loading && (
                <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${hasChanges ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}
                        >
                            {hasChanges ? (
                                <AlertCircle className="h-5 w-5" />
                            ) : (
                                <Sparkles className="h-5 w-5" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {hasChanges
                                    ? 'You have unsaved changes'
                                    : 'All changes saved'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {totalSlots} total slot
                                {totalSlots !== 1 ? 's' : ''} configured
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {hasChanges && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDiscardChanges}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Discard
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveSchedule}
                                    disabled={saving}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {saving ? 'Saving...' : 'Save Schedule'}
                                </Button>
                            </>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearAll}
                            disabled={totalSlots === 0}
                        >
                            Clear All
                        </Button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center rounded-xl border border-border bg-white py-16">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#0F2D52]" />
                        <p className="text-muted-foreground">
                            Loading availability...
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Timetable */}
                    <AvailabilityTimetable
                        schedule={schedule}
                        bookedSlots={bookedSlots}
                        editable={true}
                        onSlotToggle={handleSlotToggle}
                    />

                    {/* Legend */}
                    <div className="mt-6 rounded-lg border border-border bg-white p-4">
                        <h3 className="mb-3 text-sm font-semibold text-foreground">
                            Legend:
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded bg-gradient-to-br from-green-400 to-green-500" />
                                <span className="text-sm text-muted-foreground">
                                    Available (you can edit)
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded bg-gradient-to-br from-red-400 to-red-500" />
                                <span className="text-sm text-muted-foreground">
                                    Booked by students (read-only)
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded bg-gradient-to-br from-gray-100 to-gray-200" />
                                <span className="text-sm text-muted-foreground">
                                    Not available
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex gap-3">
                            <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
                            <div className="text-sm text-blue-900">
                                <p className="mb-2 font-semibold">
                                    How to use:
                                </p>
                                <ul className="list-inside list-disc space-y-1">
                                    <li>
                                        Click on gray slots to mark yourself as
                                        available
                                    </li>
                                    <li>
                                        Click on green slots to remove your
                                        availability
                                    </li>
                                    <li>
                                        Red slots are already booked by students
                                        and cannot be edited
                                    </li>
                                    <li>
                                        Your schedule repeats every week
                                        starting from next week
                                    </li>
                                    <li>
                                        Remember to click "Save Schedule" to
                                        confirm your changes
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Best Practices */}
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex gap-3">
                            <Sparkles className="h-5 w-5 flex-shrink-0 text-green-600" />
                            <div className="text-sm text-green-900">
                                <p className="mb-2 font-semibold">
                                    Best Practices:
                                </p>
                                <ul className="list-inside list-disc space-y-1">
                                    <li>
                                        Set consistent weekly hours to help
                                        students plan
                                    </li>
                                    <li>
                                        Keep at least 10-15 hours available per
                                        week
                                    </li>
                                    <li>
                                        Update your schedule regularly to avoid
                                        conflicts
                                    </li>
                                    <li>
                                        Consider peak study times (evenings and
                                        weekends)
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
