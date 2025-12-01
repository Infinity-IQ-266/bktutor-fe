import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookingService } from '@/services/booking';
import { createFileRoute } from '@tanstack/react-router';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    type LucideIcon,
    Star,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/__private/tutor/dashboard/')({
    component: RouteComponent,
});

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    bgColor: string;
}

// TODO: Replace with actual API integration
const mockStats = {
    todaysSessions: 3,
    activeStudents: 12,
    pendingRequests: 2,
    averageRating: '4.8',
};

const mockUpcomingSessions = [
    {
        id: 1,
        subject: 'Data Structures',
        studentName: 'Tran Minh B',
        date: '2025-12-01',
        startTime: '10:00',
        endTime: '11:30',
        type: 'ONLINE',
        status: 'CONFIRMED',
    },
    {
        id: 2,
        subject: 'Algorithms',
        studentName: 'Nguyen Van C',
        date: '2025-12-01',
        startTime: '14:00',
        endTime: '15:30',
        type: 'IN_PERSON',
        status: 'CONFIRMED',
    },
];

const mockPendingRequests = [
    {
        id: 3,
        subject: 'Database Systems',
        studentName: 'Le Thi D',
        requestDate: '2025-11-30T08:30:00',
        preferredDate: '2025-12-02',
        preferredTime: '15:00-16:30',
        type: 'ONLINE',
        notes: 'Need help with normalization and SQL queries',
    },
    {
        id: 4,
        subject: 'Operating Systems',
        studentName: 'Pham Van E',
        requestDate: '2025-11-30T10:15:00',
        preferredDate: '2025-12-03',
        preferredTime: '10:00-11:30',
        type: 'IN_PERSON',
        notes: 'Struggling with process scheduling concepts',
    },
];

const mockRecentFeedback = [
    {
        id: 1,
        studentName: 'Hoang Thi F',
        subject: 'Data Structures',
        rating: 5,
        date: '2025-11-28',
        comment:
            'Excellent explanation of binary trees. Very patient and knowledgeable!',
    },
    {
        id: 2,
        studentName: 'Tran Van G',
        subject: 'Algorithms',
        rating: 4,
        date: '2025-11-27',
        comment:
            'Great session on sorting algorithms. Would appreciate more practice problems.',
    },
];

function RouteComponent() {
    const [stats] = useState(mockStats);
    const [upcomingSessions] = useState(mockUpcomingSessions);
    const [pendingRequests, setPendingRequests] = useState(mockPendingRequests);
    const [recentFeedback] = useState(mockRecentFeedback);

    const handleAcceptRequest = async (requestId: number) => {
        try {
            await BookingService.confirmBooking(requestId);
            setPendingRequests((prev) =>
                prev.filter((r) => r.id !== requestId),
            );
        } catch (error) {
            console.error('Failed to accept request:', error);
        }
    };

    const handleDeclineRequest = async (requestId: number) => {
        try {
            await BookingService.rejectBooking(requestId);
            setPendingRequests((prev) =>
                prev.filter((r) => r.id !== requestId),
            );
        } catch (error) {
            console.error('Failed to decline request:', error);
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24)
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) > 1 ? 's' : ''} ago`;
    };

    const StatCard = ({ icon: Icon, label, value, bgColor }: StatCardProps) => (
        <div className="rounded-xl border border-border bg-white p-6">
            <div className="flex items-center gap-4">
                <div className={`rounded-lg ${bgColor} p-3`}>
                    <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold text-foreground">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-foreground">Welcome, Tutor!</h1>
                <p className="text-muted-foreground">
                    Here's your tutoring overview for today
                </p>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid grid-cols-4 gap-6">
                <StatCard
                    icon={Calendar}
                    label="Today's Sessions"
                    value={stats.todaysSessions}
                    bgColor="bg-blue-50"
                />
                <StatCard
                    icon={Users}
                    label="Active Students"
                    value={stats.activeStudents}
                    bgColor="bg-green-50"
                />
                <StatCard
                    icon={AlertCircle}
                    label="Pending Requests"
                    value={stats.pendingRequests}
                    bgColor="bg-yellow-50"
                />
                <StatCard
                    icon={Star}
                    label="Average Rating"
                    value={stats.averageRating}
                    bgColor="bg-purple-50"
                />
            </div>

            {/* Main Content Grid */}
            <div className="mb-6 grid grid-cols-2 gap-6">
                {/* Upcoming Sessions */}
                <div className="rounded-xl border border-border bg-white">
                    <div className="border-b border-border p-6">
                        <h2 className="text-foreground">Upcoming Sessions</h2>
                    </div>
                    <div className="p-6">
                        {upcomingSessions.length === 0 ? (
                            <div className="py-8 text-center">
                                <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    No upcoming sessions
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                                    >
                                        <div className="mb-2 flex items-start justify-between">
                                            <div>
                                                <h3 className="text-foreground">
                                                    {session.subject}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {session.studentName}
                                                </p>
                                            </div>
                                            <Badge className="bg-green-100 text-green-800">
                                                {session.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(
                                                    session.date,
                                                ).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {session.startTime} -{' '}
                                                {session.endTime}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Requests */}
                <div className="rounded-xl border border-border bg-white">
                    <div className="border-b border-border p-6">
                        <h2 className="text-foreground">Pending Requests</h2>
                    </div>
                    <div className="p-6">
                        {pendingRequests.length === 0 ? (
                            <div className="py-8 text-center">
                                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    No pending requests
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                                    >
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-foreground">
                                                    {request.subject}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {request.studentName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Requested{' '}
                                                    {getTimeAgo(
                                                        request.requestDate,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mb-3 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(
                                                    request.preferredDate,
                                                ).toLocaleDateString()}{' '}
                                                • {request.preferredTime}
                                            </div>
                                            {request.notes && (
                                                <p className="mt-2 italic">
                                                    "{request.notes}"
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-primary text-white hover:bg-primary/90"
                                                onClick={() =>
                                                    handleAcceptRequest(
                                                        request.id,
                                                    )
                                                }
                                            >
                                                <CheckCircle className="mr-1 h-4 w-4" />
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleDeclineRequest(
                                                        request.id,
                                                    )
                                                }
                                            >
                                                <X className="mr-1 h-4 w-4" />
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Feedback */}
            <div className="rounded-xl border border-border bg-white">
                <div className="border-b border-border p-6">
                    <h2 className="text-foreground">Recent Feedback</h2>
                </div>
                <div className="p-6">
                    {recentFeedback.length === 0 ? (
                        <div className="py-8 text-center">
                            <Star className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">
                                No feedback yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentFeedback.map((feedback) => (
                                <div
                                    key={feedback.id}
                                    className="rounded-lg border border-border p-4"
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div>
                                            <h3 className="text-foreground">
                                                {feedback.studentName}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {feedback.subject}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                        i < feedback.rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">
                                        "{feedback.comment}"
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {new Date(
                                            feedback.date,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
