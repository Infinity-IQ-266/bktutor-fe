import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookingService } from '@/services/booking';
import type { TutorDashboardDto } from '@/services/tutor';
import { TutorService } from '@/services/tutor';
import { createFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
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
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/__private/tutor/dashboard/')({
    component: RouteComponent,
});

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    bgColor: string;
}

function RouteComponent() {
    const [dashboardData, setDashboardData] =
        useState<TutorDashboardDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const data = await TutorService.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId: number) => {
        try {
            await BookingService.confirmBooking(requestId);
            await fetchDashboard(); // Refresh dashboard
        } catch (error) {
            console.error('Failed to accept request:', error);
        }
    };

    const handleDeclineRequest = async (requestId: number) => {
        try {
            await BookingService.rejectBooking(requestId);
            await fetchDashboard(); // Refresh dashboard
        } catch (error) {
            console.error('Failed to decline request:', error);
        }
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

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-8">
                <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-8">
                <p className="text-muted-foreground">
                    Failed to load dashboard data
                </p>
            </div>
        );
    }

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
                    value={dashboardData.todaySessionsCount}
                    bgColor="bg-blue-50"
                />
                <StatCard
                    icon={Users}
                    label="Active Students"
                    value={dashboardData.activeStudentsCount}
                    bgColor="bg-green-50"
                />
                <StatCard
                    icon={AlertCircle}
                    label="Pending Requests"
                    value={dashboardData.pendingRequestsCount}
                    bgColor="bg-yellow-50"
                />
                <StatCard
                    icon={Star}
                    label="Average Rating"
                    value={dashboardData.averageRating.toFixed(1)}
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
                        {dashboardData.upcomingSessions.length === 0 ? (
                            <div className="py-8 text-center">
                                <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    No upcoming sessions
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {dashboardData.upcomingSessions.map(
                                    (session) => (
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
                                                    {dayjs(
                                                        session.startTime,
                                                    ).format('MMM D, YYYY')}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {dayjs(
                                                        session.startTime,
                                                    ).format('HH:mm')}{' '}
                                                    -{' '}
                                                    {dayjs(
                                                        session.endTime,
                                                    ).format('HH:mm')}
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}
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
                        {dashboardData.pendingRequests.length === 0 ? (
                            <div className="py-8 text-center">
                                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    No pending requests
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {dashboardData.pendingRequests.map(
                                    (request) => (
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
                                                    <Badge
                                                        variant="outline"
                                                        className="mt-1"
                                                    >
                                                        {request.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="mb-3 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {dayjs(
                                                        request.startTime,
                                                    ).format('MMM D, YYYY')}
                                                </div>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    {dayjs(
                                                        request.startTime,
                                                    ).format('HH:mm')}{' '}
                                                    -{' '}
                                                    {dayjs(
                                                        request.endTime,
                                                    ).format('HH:mm')}
                                                </div>
                                                {request.studentNotes && (
                                                    <p className="mt-2 italic">
                                                        "{request.studentNotes}"
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
                                    ),
                                )}
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
                    {dashboardData.recentFeedback.length === 0 ? (
                        <div className="py-8 text-center">
                            <Star className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">
                                No feedback yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {dashboardData.recentFeedback.map((feedback) => (
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
                                    {feedback.comment && (
                                        <p className="text-sm text-muted-foreground italic">
                                            "{feedback.comment}"
                                        </p>
                                    )}
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {dayjs(feedback.createdAt).format(
                                            'MMM D, YYYY',
                                        )}
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
