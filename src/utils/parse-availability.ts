import type { Availability } from '@/types';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

interface ParsedAvailability {
    availability: Record<string, string[]>;
    availableSlots: string[];
}

export function parseAvailability(slots: Availability[]): ParsedAvailability {
    const availability: Record<string, string[]> = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
    };

    const availableSlots: string[] = [];

    const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];
    const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (const slot of slots) {
        if (slot.status !== 'AVAILABLE') continue;

        const start = dayjs(slot.startTime);
        const end = dayjs(slot.endTime);

        const dayName = dayNames[start.day()];
        const shortDay = shortDayNames[start.day()];

        // --- Build hourly availability (e.g., "14:00-15:00") ---
        let current = start;
        while (current.isBefore(end)) {
            const next = current.add(1, 'hour');
            const timeRange = `${current.format('HH:mm')}-${next.format('HH:mm')}`;
            availability[dayName].push(timeRange);
            current = next;
        }

        // --- Build readable slot (e.g., "Mon 2:00 PM-4:00 PM") ---
        const formattedRange = `${shortDay} ${start.format('h:mm A')}-${end.format('h:mm A')}`;
        availableSlots.push(formattedRange);
    }

    return { availability, availableSlots };
}
