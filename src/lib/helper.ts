// Helper functions for the BK TUTOR system

/**
 * Get initials from a name
 * Returns the first letter of the first word and first letter of the last word
 */
export function getInitials(name: string): string {
    if (!name) return 'U';

    const words = name.trim().split(' ');

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    // Get first letter of first word and first letter of last word
    const firstInitial = words[0].charAt(0).toUpperCase();
    const lastInitial = words[words.length - 1].charAt(0).toUpperCase();

    return firstInitial + lastInitial;
}

/**
 * Format a date string to a more readable format
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Format time string (HH:MM to readable format)
 */
export function formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'bg-green-100 text-green-700';
        case 'scheduled':
            return 'bg-blue-100 text-blue-700';
        case 'cancelled':
            return 'bg-red-100 text-red-700';
        case 'in-progress':
            return 'bg-yellow-100 text-yellow-700';
        case 'pending':
            return 'bg-orange-100 text-orange-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

/**
 * Calculate average rating
 */
export function calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return sum / ratings.length;
}

/**
 * Get relative time (e.g., "2 days ago", "in 3 days")
 */
export function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays === -1) return 'Yesterday';
    if (diffInDays > 0) return `in ${diffInDays} days`;
    return `${Math.abs(diffInDays)} days ago`;
}

/**
 * Event Emitter for Real-Time Updates
 * This allows different components to communicate and auto-refresh
 */
type EventCallback = (data?: unknown) => void;

class EventEmitter {
    private events: Map<string, EventCallback[]> = new Map();

    on(event: string, callback: EventCallback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(callback);
    }

    off(event: string, callback: EventCallback) {
        const callbacks = this.events.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event: string, data?: unknown) {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.forEach((callback) => callback(data));
        }
        console.log(`🔔 Event emitted: ${event}`, data);
    }
}

// Global event emitter for cross-component communication
export const globalEvents = new EventEmitter();

// Event names
export const EVENTS = {
    SESSION_UPDATED: 'session:updated',
    SESSION_CREATED: 'session:created',
    SESSION_CANCELLED: 'session:cancelled',
    SESSION_COMPLETED: 'session:completed',
    PROGRESS_UPDATED: 'progress:updated',
    NOTIFICATION_RECEIVED: 'notification:received',
    MATERIAL_UPLOADED: 'material:uploaded',
    PROFILE_UPDATED: 'profile:updated',
};
