import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';
import {
    Bell,
    Calendar,
    Check,
    CheckCheck,
    Clock,
    MessageSquare,
    Star,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/__private/tutor/notifications/')({
    component: RouteComponent,
});

type NotificationType = 'booking' | 'message' | 'feedback' | 'system';
type NotificationStatus = 'unread' | 'read';

interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    status: NotificationStatus;
    actionRequired?: boolean;
    bookingId?: number;
}

// Mock data - Replace with actual API calls
const mockNotifications: Notification[] = [
    {
        id: 1,
        type: 'booking',
        title: 'New Session Request',
        message:
            'Nguyen Van An (2154321) requested a Data Structures session on Friday, Nov 1 at 14:00',
        time: '5 minutes ago',
        status: 'unread',
        actionRequired: true,
        bookingId: 101,
    },
    {
        id: 2,
        type: 'booking',
        title: 'Session Confirmed',
        message:
            'Your session with Tran Thi Binh for Algorithms has been confirmed for Nov 2 at 10:00',
        time: '1 hour ago',
        status: 'unread',
        actionRequired: false,
    },
    {
        id: 3,
        type: 'feedback',
        title: 'New Feedback Received',
        message:
            'You received a 5-star review from a student for your Database Systems session',
        time: '2 hours ago',
        status: 'unread',
        actionRequired: false,
    },
    {
        id: 4,
        type: 'booking',
        title: 'Session Cancellation',
        message:
            'Le Van Cuong cancelled their session scheduled for Oct 31 at 16:00. Refund processed.',
        time: '3 hours ago',
        status: 'read',
        actionRequired: false,
    },
    {
        id: 5,
        type: 'message',
        title: 'New Message',
        message:
            'Pham Thi Dung sent you a message regarding your upcoming Algorithms session',
        time: 'Yesterday',
        status: 'read',
        actionRequired: false,
    },
    {
        id: 6,
        type: 'system',
        title: 'Profile Update Required',
        message:
            'Please update your availability schedule for the upcoming week',
        time: 'Yesterday',
        status: 'read',
        actionRequired: true,
    },
    {
        id: 7,
        type: 'booking',
        title: 'Session Reminder',
        message:
            'You have an upcoming session with Hoang Van Enh tomorrow at 09:00 for Data Structures',
        time: '2 days ago',
        status: 'read',
        actionRequired: false,
    },
    {
        id: 8,
        type: 'feedback',
        title: 'New Feedback Received',
        message:
            'You received a 5-star review from a student for your Database Systems session',
        time: '3 days ago',
        status: 'read',
        actionRequired: false,
    },
];

function RouteComponent() {
    const [notifications, setNotifications] = useState(mockNotifications);
    const [activeTab, setActiveTab] = useState('all');

    const handleMarkAsRead = (id: number) => {
        setNotifications(
            notifications.map((notif) =>
                notif.id === id ? { ...notif, status: 'read' as const } : notif,
            ),
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications(
            notifications.map((notif) => ({
                ...notif,
                status: 'read' as const,
            })),
        );
    };

    const handleAcceptBooking = (bookingId: number, notificationId: number) => {
        // TODO: Call BookingService.confirmBooking(bookingId)
        console.log('Accept booking:', bookingId);
        handleMarkAsRead(notificationId);
    };

    const handleDeclineBooking = (
        bookingId: number,
        notificationId: number,
    ) => {
        // TODO: Call BookingService.rejectBooking(bookingId)
        console.log('Decline booking:', bookingId);
        handleMarkAsRead(notificationId);
    };

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'booking':
                return Calendar;
            case 'message':
                return MessageSquare;
            case 'feedback':
                return Star;
            case 'system':
                return Bell;
        }
    };

    const getIconBgColor = (type: NotificationType) => {
        switch (type) {
            case 'booking':
                return 'bg-blue-50 text-blue-600';
            case 'message':
                return 'bg-green-50 text-green-600';
            case 'feedback':
                return 'bg-yellow-50 text-yellow-600';
            case 'system':
                return 'bg-purple-50 text-purple-600';
        }
    };

    const filteredNotifications = notifications.filter((notif) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return notif.status === 'unread';
        if (activeTab === 'action-required') return notif.actionRequired;
        return true;
    });

    const unreadCount = notifications.filter(
        (n) => n.status === 'unread',
    ).length;
    const actionRequiredCount = notifications.filter(
        (n) => n.actionRequired,
    ).length;

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="mb-2 text-foreground">Notifications</h1>
                    <p className="text-muted-foreground">
                        Stay updated with your tutoring activities
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark All as Read
                </Button>
            </div>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-6">
                <div className="rounded-xl border border-border bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-blue-50 p-3">
                            <Bell className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {notifications.length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-orange-50 p-3">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Unread
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {unreadCount}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-red-50 p-3">
                            <User className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Action Required
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {actionRequiredCount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">
                        Unread
                        {unreadCount > 0 && (
                            <Badge className="ml-2 bg-blue-500 text-white">
                                {unreadCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="action-required">
                        Action Required
                        {actionRequiredCount > 0 && (
                            <Badge className="ml-2 bg-red-500 text-white">
                                {actionRequiredCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    <div className="space-y-4">
                        {filteredNotifications.length === 0 ? (
                            <div className="rounded-xl border border-border bg-white p-12 text-center">
                                <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    No notifications in this category
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notif) => {
                                const Icon = getNotificationIcon(notif.type);
                                return (
                                    <div
                                        key={notif.id}
                                        className={`rounded-xl border p-6 transition-colors ${
                                            notif.status === 'unread'
                                                ? 'border-blue-200 bg-blue-50'
                                                : 'border-border bg-white'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`rounded-lg p-3 ${getIconBgColor(notif.type)}`}
                                            >
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-start justify-between">
                                                    <div>
                                                        <h4 className="mb-1 text-foreground">
                                                            {notif.title}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {notif.message}
                                                        </p>
                                                    </div>
                                                    {notif.status ===
                                                        'unread' && (
                                                        <Badge className="bg-blue-500 text-white">
                                                            New
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-muted-foreground">
                                                        {notif.time}
                                                    </span>
                                                    {notif.actionRequired &&
                                                        notif.bookingId && (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleAcceptBooking(
                                                                            notif.bookingId!,
                                                                            notif.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Check className="mr-1 h-4 w-4" />
                                                                    Accept
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        handleDeclineBooking(
                                                                            notif.bookingId!,
                                                                            notif.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <X className="mr-1 h-4 w-4" />
                                                                    Decline
                                                                </Button>
                                                            </div>
                                                        )}
                                                    {notif.status ===
                                                        'unread' &&
                                                        !notif.actionRequired && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    handleMarkAsRead(
                                                                        notif.id,
                                                                    )
                                                                }
                                                            >
                                                                <Check className="mr-1 h-4 w-4" />
                                                                Mark as Read
                                                            </Button>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
