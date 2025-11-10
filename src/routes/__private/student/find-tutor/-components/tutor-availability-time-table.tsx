import { CheckCircle, Clock } from 'lucide-react';

interface TutorAvailabilityTimetableProps {
    schedule: Record<string, string[]>;
    compact?: boolean; // Compact view for dialogs
    editable?: boolean; // Can toggle slots
    onSlotToggle?: (day: string, slot: string) => void;
}

export const TutorAvailabilityTimetable = ({
    schedule,
    compact = false,
    editable = false,
    onSlotToggle,
}: TutorAvailabilityTimetableProps) => {
    // Time slots from 7 AM to 9 PM
    const timeSlots = [
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

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return compact
            ? `${displayHour}${ampm}`
            : `${displayHour}:${minutes}${ampm}`;
    };

    const isSlotAvailable = (day: string, slot: string) => {
        return (schedule[day] || []).includes(slot);
    };

    const getTotalSlotsForDay = (day: string) => {
        return (schedule[day] || []).length;
    };

    const handleSlotClick = (day: string, slot: string) => {
        if (editable && onSlotToggle) {
            onSlotToggle(day, slot);
        }
    };

    if (compact) {
        // Compact view for dialog - smaller, cleaner
        return (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-[#0F2D52] to-[#1a4070] px-4 py-3">
                    <div className="flex items-center gap-2 text-white">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                            Weekly Availability Schedule
                        </span>
                    </div>
                </div>

                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="sticky left-0 z-10 w-14 border-r border-gray-200 bg-gray-50 px-2 py-2 text-left text-[10px] text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Time</span>
                                </div>
                            </th>
                            {weekDays.map((day) => (
                                <th
                                    key={day}
                                    className="min-w-[50px] border border-gray-200 px-1 py-2 text-center"
                                >
                                    <div className="text-[11px] font-semibold text-foreground">
                                        {day.slice(0, 3)}
                                    </div>
                                    <div className="mt-0.5 text-[9px] font-medium text-green-600">
                                        {getTotalSlotsForDay(day)} slots
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((slot, slotIndex) => {
                            const [start] = slot.split('-');
                            return (
                                <tr
                                    key={slot}
                                    className={
                                        slotIndex % 2 === 0
                                            ? 'bg-white'
                                            : 'bg-gray-50/50'
                                    }
                                >
                                    <td className="sticky left-0 z-10 border-r border-gray-200 bg-inherit px-2 py-1.5 text-[10px] text-muted-foreground">
                                        <div className="font-medium">
                                            {formatTime(start)}
                                        </div>
                                    </td>
                                    {weekDays.map((day) => {
                                        const isAvailable = isSlotAvailable(
                                            day,
                                            slot,
                                        );
                                        return (
                                            <td
                                                key={`${day}-${slot}`}
                                                className="border border-gray-200 p-0.5"
                                            >
                                                <div
                                                    className={`flex h-7 w-full items-center justify-center rounded transition-all ${
                                                        isAvailable
                                                            ? 'bg-gradient-to-br from-green-400 to-green-500 shadow-sm'
                                                            : 'bg-gray-100'
                                                    } `}
                                                    title={
                                                        isAvailable
                                                            ? `Available: ${slot}`
                                                            : 'Not available'
                                                    }
                                                >
                                                    {isAvailable && (
                                                        <CheckCircle className="h-3 w-3 text-white" />
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Legend */}
                <div className="border-t border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="flex items-center justify-center gap-4 text-[10px]">
                        <div className="flex items-center gap-1">
                            <div className="h-4 w-4 rounded bg-gradient-to-br from-green-400 to-green-500" />
                            <span className="text-muted-foreground">
                                Available
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-4 w-4 rounded bg-gray-100" />
                            <span className="text-muted-foreground">
                                Not Available
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Full view for main availability page - ENHANCED TIMETABLE
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0F2D52] to-[#1a4070] px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <Clock className="h-6 w-6" />
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
                                                    disabled={!editable}
                                                    className={`flex h-12 w-full items-center justify-center rounded-lg text-xs font-medium transition-all ${
                                                        isAvailable
                                                            ? 'transform bg-gradient-to-br from-green-400 to-green-500 text-white shadow-md hover:scale-105 hover:shadow-lg'
                                                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 hover:from-gray-200 hover:to-gray-300'
                                                    } ${editable ? 'cursor-pointer' : 'cursor-default'} ${editable && !isAvailable ? 'hover:text-gray-600' : ''} `}
                                                    title={
                                                        isAvailable
                                                            ? `Available: ${slot}`
                                                            : editable
                                                              ? 'Click to mark as available'
                                                              : 'Not available'
                                                    }
                                                >
                                                    {isAvailable && (
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <CheckCircle className="h-5 w-5" />
                                                            <span className="text-[10px] font-medium">
                                                                Free
                                                            </span>
                                                        </div>
                                                    )}
                                                    {!isAvailable &&
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
};
