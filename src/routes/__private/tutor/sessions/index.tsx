import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingService } from '@/services/booking';
import { createFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { Calendar, CheckCircle, Clock, MapPin, Video, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/__private/tutor/sessions/')({
    component: RouteComponent,
});

interface Session {
    id: number;
    subject: string;
    studentName?: string;
    status: string;
    startTime: string;
    endTime: string;
    type?: string;
    location?: string;
    locationOrLink?: string;
    notes?: string;
    studentNotes?: string;
}

function RouteComponent() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await BookingService.getMyBookings({});
            setSessions(data || []);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSession = async (sessionId: number) => {
        try {
            await BookingService.confirmBooking(sessionId);
            fetchSessions();
        } catch (error) {
            console.error('Failed to confirm session:', error);
        }
    };

    const handleRejectSession = async (sessionId: number) => {
        try {
            await BookingService.rejectBooking(sessionId);
            fetchSessions();
        } catch (error) {
            console.error('Failed to reject session:', error);
        }
    };

    const handleCancelSession = async (sessionId: number) => {
        try {
            await BookingService.cancelBooking(sessionId);
            fetchSessions();
        } catch (error) {
            console.error('Failed to cancel session:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-100 text-green-700';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700';
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-700';
            case 'REJECTED':
            case 'CANCELED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const SessionCard = ({ session }: { session: Session }) => (
        <div className="rounded-xl border border-border bg-white p-5">
            <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="mb-1 text-foreground">{session.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                        with {session.studentName || 'Student'}
                    </p>
                </div>
                <Badge className={getStatusColor(session.status)}>
                    {session.status}
                </Badge>
            </div>

            <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {dayjs(session.startTime).format('MMM D, YYYY')}
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {dayjs(session.startTime).format('HH:mm')} -{' '}
                    {dayjs(session.endTime).format('HH:mm')}
                </div>
                <div className="flex items-center gap-2">
                    {session.type === 'ONLINE' ? (
                        <Video className="h-4 w-4" />
                    ) : (
                        <MapPin className="h-4 w-4" />
                    )}
                    {session.type === 'ONLINE' ? 'Online' : 'In Person'} •{' '}
                    {session.locationOrLink}
                </div>
            </div>

            {session.studentNotes && (
                <div className="mb-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Student Notes:</span>{' '}
                        {session.studentNotes}
                    </p>
                </div>
            )}

            {session.status === 'PENDING' && (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        className="bg-primary text-white hover:bg-primary/90"
                        onClick={() => handleConfirmSession(session.id)}
                    >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Confirm
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectSession(session.id)}
                    >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                    </Button>
                </div>
            )}

            {session.status === 'CONFIRMED' && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelSession(session.id)}
                >
                    Cancel Session
                </Button>
            )}
        </div>
    );

    const pendingSessions = sessions.filter((s) => s.status === 'PENDING');
    const upcomingSessions = sessions.filter((s) => s.status === 'CONFIRMED');
    const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-foreground">My Sessions</h1>
                <p className="text-muted-foreground">
                    Manage your tutoring sessions and requests
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">
                        Pending ({pendingSessions.length})
                    </TabsTrigger>
                    <TabsTrigger value="upcoming">
                        Upcoming ({upcomingSessions.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        Completed ({completedSessions.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    {loading ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">
                                Loading sessions...
                            </p>
                        </div>
                    ) : pendingSessions.length === 0 ? (
                        <div className="py-8 text-center">
                            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">
                                No pending session requests
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingSessions.map((session) => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="upcoming" className="mt-6">
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
                                No upcoming sessions scheduled
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingSessions.map((session) => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                    {loading ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">
                                Loading sessions...
                            </p>
                        </div>
                    ) : completedSessions.length === 0 ? (
                        <div className="py-8 text-center">
                            <Clock className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">
                                No completed sessions yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {completedSessions.map((session) => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
