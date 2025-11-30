import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingService } from '@/services/booking';
import type { Session } from '@/types';
import { createFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { Calendar, Clock, Eye, Laptop, MapPin, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/__private/student/my-sessions/')({
    component: RouteComponent,
});

function RouteComponent() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<Session | null>(
        null,
    );
    const [showDetailDialog, setShowDetailDialog] = useState(false);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const response = await BookingService.getMyBookings({
                direction: 'DESC',
            });
            setSessions(response || []);
        } catch (error) {
            console.error('Error loading sessions:', error);
            toast.error('Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSession = async (sessionId: number) => {
        try {
            await BookingService.cancelBooking(sessionId);
            toast.success('Session cancellation request sent');
            loadSessions();
        } catch (error) {
            console.error('Error cancelling session:', error);
            toast.error('Failed to cancel session');
        }
    };

    const handleViewDetails = (session: Session) => {
        setSelectedSession(session);
        setShowDetailDialog(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-100 text-green-700';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-700';
            case 'CANCELED':
                return 'bg-red-100 text-red-700';
            case 'REJECTED':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const upcomingSessions = sessions.filter((s) => s.status === 'CONFIRMED');
    const pendingSessions = sessions.filter((s) => s.status === 'PENDING');
    const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
    const allPastSessions = sessions.filter(
        (s) =>
            s.status === 'COMPLETED' ||
            s.status === 'CANCELED' ||
            s.status === 'REJECTED',
    );

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-foreground">My Sessions</h1>
                <p className="text-muted-foreground">
                    View and manage your tutoring sessions
                </p>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-50 p-3">
                            <Calendar className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Upcoming
                            </p>
                            <p className="text-2xl font-semibold text-foreground">
                                {upcomingSessions.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-yellow-50 p-3">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Pending
                            </p>
                            <p className="text-2xl font-semibold text-foreground">
                                {pendingSessions.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-3">
                            <Star className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Completed
                            </p>
                            <p className="text-2xl font-semibold text-foreground">
                                {completedSessions.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-50 p-3">
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total
                            </p>
                            <p className="text-2xl font-semibold text-foreground">
                                {sessions.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="upcoming">
                <TabsList>
                    <TabsTrigger value="upcoming">
                        Upcoming ({upcomingSessions.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                        Pending ({pendingSessions.length})
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        History ({allPastSessions.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-6">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="py-8 text-center">
                                <p className="text-muted-foreground">
                                    Loading sessions...
                                </p>
                            </div>
                        ) : upcomingSessions.length === 0 ? (
                            <div className="py-8 text-center">
                                <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    No upcoming sessions
                                </p>
                            </div>
                        ) : (
                            upcomingSessions.map((session) => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    showActions
                                    onCancel={handleCancelSession}
                                    onViewDetails={handleViewDetails}
                                    getStatusColor={getStatusColor}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="pending" className="mt-6">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="py-8 text-center">
                                <p className="text-muted-foreground">
                                    Loading sessions...
                                </p>
                            </div>
                        ) : pendingSessions.length === 0 ? (
                            <div className="py-8 text-center">
                                <Clock className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    No pending sessions
                                </p>
                            </div>
                        ) : (
                            pendingSessions.map((session) => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    showActions
                                    onCancel={handleCancelSession}
                                    onViewDetails={handleViewDetails}
                                    getStatusColor={getStatusColor}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="py-8 text-center">
                                <p className="text-muted-foreground">
                                    Loading sessions...
                                </p>
                            </div>
                        ) : allPastSessions.length === 0 ? (
                            <div className="py-8 text-center">
                                <Star className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    No session history
                                </p>
                            </div>
                        ) : (
                            allPastSessions.map((session) => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    showActions={false}
                                    onViewDetails={handleViewDetails}
                                    getStatusColor={getStatusColor}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Session Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Session Details</DialogTitle>
                        <DialogDescription>
                            Complete information about this tutoring session
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSession && (
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {selectedSession.subject}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        with {selectedSession.tutorName}
                                    </p>
                                </div>
                                <Badge
                                    className={getStatusColor(
                                        selectedSession.status,
                                    )}
                                >
                                    {selectedSession.status}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Date & Time
                                        </p>
                                        <p className="text-foreground">
                                            {dayjs(
                                                selectedSession.startTime,
                                            ).format('MMMM D, YYYY')}{' '}
                                            at{' '}
                                            {dayjs(
                                                selectedSession.startTime,
                                            ).format('h:mm A')}{' '}
                                            -{' '}
                                            {dayjs(
                                                selectedSession.endTime,
                                            ).format('h:mm A')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {selectedSession.type === 'ONLINE' ? (
                                        <Laptop className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <MapPin className="h-5 w-5 text-muted-foreground" />
                                    )}
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedSession.type === 'ONLINE'
                                                ? 'Online Session'
                                                : 'In-Person Session'}
                                        </p>
                                        <p className="text-foreground">
                                            {selectedSession.locationOrLink}
                                        </p>
                                    </div>
                                </div>

                                {selectedSession.studentNotes && (
                                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                                        <p className="mb-1 text-sm font-medium text-foreground">
                                            Your Notes
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedSession.studentNotes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface SessionCardProps {
    session: Session;
    showActions: boolean;
    onCancel?: (id: number) => void;
    onViewDetails: (session: Session) => void;
    getStatusColor: (status: string) => string;
}

function SessionCard({
    session,
    showActions,
    onCancel,
    onViewDetails,
    getStatusColor,
}: SessionCardProps) {
    return (
        <div className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-3">
                    <Calendar className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between">
                        <div>
                            <h3 className="mb-1 font-semibold text-foreground">
                                {session.subject}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                with {session.tutorName}
                            </p>
                        </div>
                        <Badge className={getStatusColor(session.status)}>
                            {session.status}
                        </Badge>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {dayjs(session.startTime).format('MMM D, YYYY')}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {dayjs(session.startTime).format('h:mm A')} -{' '}
                            {dayjs(session.endTime).format('h:mm A')}
                        </div>
                        <div className="flex items-center gap-1">
                            {session.type === 'ONLINE' ? (
                                <>
                                    <Laptop className="h-4 w-4" />
                                    Online
                                </>
                            ) : (
                                <>
                                    <MapPin className="h-4 w-4" />
                                    In-Person
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewDetails(session)}
                        >
                            <Eye className="mr-1 h-4 w-4" />
                            View Details
                        </Button>
                        {showActions && session.status === 'CONFIRMED' && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => onCancel?.(session.id)}
                            >
                                <X className="mr-1 h-4 w-4" />
                                Cancel
                            </Button>
                        )}
                        {showActions && session.status === 'PENDING' && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => onCancel?.(session.id)}
                            >
                                <X className="mr-1 h-4 w-4" />
                                Cancel Request
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
