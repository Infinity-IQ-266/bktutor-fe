import { CheckCircle, Clock, X } from 'lucide-react';

export interface AvailabilityTimetableProps {
    schedule: Record<string, string[]>; // Available slots: { "Monday": ["08:00-09:00"], ... }
    bookedSlots: Record<string, string[]>; // Booked slots: { "Monday": ["09:00-10:00"], ... }
    editable?: boolean;
    onSlotToggle?: (day: string, slot: string) => void;
}

const timeSlots = [
    '00:00-01:00',
    '01:00-02:00',
    '02:00-03:00',
    '03:00-04:00',
    '04:00-05:00',
    '05:00-06:00',
    '06:00-07:00',
    '07:00-08:00',
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',
    '19:00-20:00',
    '20:00-21:00',
    '21:00-22:00',
    '22:00-23:00',
    '23:00-00:00',
];

const weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

// Convert time string (HH:mm) to minutes since midnight
function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Check if a predefined slot overlaps with any custom slots
function isSlotCovered(slot: string, daySlots: string[]): boolean {
    const [slotStart, slotEnd] = slot.split('-');
    const slotStartMins = timeToMinutes(slotStart);
    const slotEndMins = timeToMinutes(slotEnd);

    return daySlots.some((customSlot) => {
        const [customStart, customEnd] = customSlot.split('-');
        const customStartMins = timeToMinutes(customStart);
        const customEndMins = timeToMinutes(customEnd);

        // Check if custom slot fully covers or overlaps with this slot
        return customStartMins <= slotStartMins && customEndMins >= slotEndMins;
    });
}

export function AvailabilityTimetable({
    schedule,
    bookedSlots,
    editable = false,
    onSlotToggle,
}: AvailabilityTimetableProps) {
    const isSlotAvailable = (day: string, slot: string): boolean => {
        const daySlots = schedule[day] || [];
        // Check exact match or if this slot is covered by any time range
        return daySlots.includes(slot) || isSlotCovered(slot, daySlots);
    };

    const isSlotBooked = (day: string, slot: string): boolean => {
        const dayBookedSlots = bookedSlots[day] || [];
        // Check exact match or if this slot is covered by any booked time range
        return (
            dayBookedSlots.includes(slot) || isSlotCovered(slot, dayBookedSlots)
        );
    };

    const handleSlotClick = (day: string, slot: string) => {
        if (editable && onSlotToggle) {
            onSlotToggle(day, slot);
        }
    };

    const getTotalSlotsForDay = (day: string): number => {
        return schedule[day]?.length || 0;
    };

    const formatTime = (time: string): string => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        return `${hour.toString().padStart(2, '0')}:${minutes}`;
    };

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-[#0F2D52] to-[#1a4070] p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">
                                Weekly Availability Schedule
                            </h3>
                            <p className="mt-0.5 text-sm text-white/80">
                                {editable
                                    ? 'Click slots to toggle availability'
                                    : 'Your current availability'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right text-white">
                        <div className="text-2xl font-bold">
                            {Object.values(schedule).reduce(
                                (sum, slots) => sum + slots.length,
                                0,
                            )}
                        </div>
                        <div className="text-sm text-white/80">Total Slots</div>
                    </div>
                </div>
            </div>

            {/* Timetable */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-b from-gray-100 to-gray-50">
                            <th className="sticky left-0 z-10 w-24 border-r border-gray-200 bg-gray-100 px-4 py-3 text-left text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Time</span>
                                </div>
                            </th>
                            {weekDays.map((day) => (
                                <th
                                    key={day}
                                    className="min-w-[100px] border border-gray-200 px-3 py-3 text-center"
                                >
                                    <div>
                                        <div className="text-sm font-semibold text-foreground">
                                            {day}
                                        </div>
                                        <div className="mt-1 text-xs font-medium text-green-600">
                                            <CheckCircle className="mr-1 inline h-3 w-3" />
                                            {getTotalSlotsForDay(day)} slots
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((slot, slotIndex) => {
                            const [start, end] = slot.split('-');
                            return (
                                <tr
                                    key={slot}
                                    className={`transition-colors hover:bg-blue-50/30 ${slotIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                >
                                    <td className="sticky left-0 z-10 border-r border-gray-200 bg-inherit px-4 py-3 text-xs text-muted-foreground">
                                        <div className="font-semibold text-foreground">
                                            {formatTime(start)}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            {formatTime(end)}
                                        </div>
                                    </td>
                                    {weekDays.map((day) => {
                                        const isAvailable = isSlotAvailable(
                                            day,
                                            slot,
                                        );
                                        const isBooked = isSlotBooked(
                                            day,
                                            slot,
                                        );

                                        // Priority: Booked > Available > Empty
                                        let status:
                                            | 'booked'
                                            | 'available'
                                            | 'empty';
                                        if (isBooked) {
                                            status = 'booked';
                                        } else if (isAvailable) {
                                            status = 'available';
                                        } else {
                                            status = 'empty';
                                        }

                                        return (
                                            <td
                                                key={`${day}-${slot}`}
                                                className="border border-gray-200 p-1.5"
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleSlotClick(
                                                            day,
                                                            slot,
                                                        )
                                                    }
                                                    disabled={
                                                        !editable || isBooked
                                                    }
                                                    className={`flex h-12 w-full items-center justify-center rounded-lg text-xs font-medium transition-all ${
                                                        status === 'booked'
                                                            ? 'cursor-not-allowed bg-gradient-to-br from-red-400 to-red-500 text-white shadow-md'
                                                            : status ===
                                                                'available'
                                                              ? 'transform cursor-pointer bg-gradient-to-br from-green-400 to-green-500 text-white shadow-md hover:scale-105 hover:shadow-lg'
                                                              : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 hover:from-gray-200 hover:to-gray-300'
                                                    } ${editable && status === 'empty' ? 'cursor-pointer hover:text-gray-600' : ''} ${!editable || status === 'booked' ? 'cursor-not-allowed' : ''} `}
                                                    title={
                                                        status === 'booked'
                                                            ? `Booked: ${slot}`
                                                            : status ===
                                                                'available'
                                                              ? `Available: ${slot}`
                                                              : editable
                                                                ? 'Click to mark as available'
                                                                : 'Not available'
                                                    }
                                                >
                                                    {status === 'booked' && (
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <X className="h-5 w-5" />
                                                            <span className="text-[10px] font-medium">
                                                                Booked
                                                            </span>
                                                        </div>
                                                    )}
                                                    {status === 'available' && (
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <CheckCircle className="h-5 w-5" />
                                                            <span className="text-[10px] font-medium">
                                                                Free
                                                            </span>
                                                        </div>
                                                    )}
                                                    {status === 'empty' &&
                                                        editable && (
                                                            <span className="text-[10px]">
                                                                +
                                                            </span>
                                                        )}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer with Daily Summary */}
            <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-4">
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => {
                        const slots = getTotalSlotsForDay(day);
                        return (
                            <div
                                key={day}
                                className="rounded-lg border border-gray-200 bg-white p-2 text-center"
                            >
                                <div className="text-xs font-semibold text-foreground">
                                    {day.slice(0, 3)}
                                </div>
                                <div
                                    className={`mt-1 text-lg font-bold ${slots > 0 ? 'text-green-600' : 'text-gray-400'}`}
                                >
                                    {slots}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {slots === 1 ? 'slot' : 'slots'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
