import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';
import {
    AlertCircle,
    Bell,
    Calendar,
    CheckCheck,
    FileText,
    MessageSquare,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/__private/student/notifications/')({
    component: RouteComponent,
});

// TODO: Replace with actual API integration
const mockNotifications = [
    {
        id: '1',
        type: 'session_accepted',
        title: 'Session Confirmed',
        message:
            'Your session request for Data Structures has been confirmed by Dr. Nguyen Van A for Nov 28 at 2:00 PM.',
        createdAt: '2025-11-26T10:30:00Z',
        read: false,
        actionRequired: false,
    },
    {
        id: '2',
        type: 'material_shared',
        title: 'New Material Shared',
        message:
            'Dr. Nguyen Van A shared "Binary Search Trees - Implementation Guide" for Data Structures.',
        createdAt: '2025-11-25T14:20:00Z',
        read: false,
        actionRequired: false,
    },
    {
        id: '3',
        type: 'feedback_received',
        title: 'Feedback Received',
        message:
            'Prof. Tran Thi B left feedback on your Calculus II session: "Excellent understanding of Integration techniques"',
        createdAt: '2025-11-23T16:45:00Z',
        read: true,
        actionRequired: false,
    },
    {
        id: '4',
        type: 'session_rescheduled',
        title: 'Session Rescheduled',
        message:
            'Your Data Structures session has been rescheduled to Nov 29 at 3:00 PM.',
        createdAt: '2025-11-22T09:15:00Z',
        read: true,
        actionRequired: false,
    },
];

function RouteComponent() {
    const [notifications, setNotifications] = useState(mockNotifications);
    const [loading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    const markAsRead = async (notificationId: string) => {
        // TODO: Implement API call to mark notification as read
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n,
            ),
        );
        toast.success('Notification marked as read');
    };

    const markAllAsRead = async () => {
        // TODO: Implement API call to mark all notifications as read
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success('All notifications marked as read');
    };

    const deleteNotification = async (notificationId: string) => {
        // TODO: Implement API call to delete notification
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success('Notification deleted');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'session_request':
            case 'session_accepted':
            case 'session_declined':
            case 'session_rescheduled':
            case 'session_cancelled':
                return Calendar;
            case 'material_shared':
                return FileText;
            case 'feedback_received':
                return MessageSquare;
            default:
                return Bell;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'session_request':
                return 'text-blue-600 bg-blue-50';
            case 'session_accepted':
                return 'text-green-600 bg-green-50';
            case 'session_declined':
            case 'session_cancelled':
                return 'text-red-600 bg-red-50';
            case 'session_rescheduled':
                return 'text-orange-600 bg-orange-50';
            case 'material_shared':
                return 'text-purple-600 bg-purple-50';
            case 'feedback_received':
                return 'text-yellow-600 bg-yellow-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor(
            (now.getTime() - date.getTime()) / 60000,
        );

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440)
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        if (diffInMinutes < 10080)
            return `${Math.floor(diffInMinutes / 1440)}d ago`;

        return date.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter((n) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !n.read;
        if (activeTab === 'action') return n.actionRequired;
        return true;
    });

    const unreadCount = notifications.filter((n) => !n.read).length;
    const actionRequiredCount = notifications.filter(
        (n) => n.actionRequired && !n.read,
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
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark All as Read
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-3">
                            <Bell className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total
                            </p>
                            <p className="text-foreground">
                                {notifications.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-50 p-3">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Unread
                            </p>
                            <p className="text-foreground">{unreadCount}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-red-50 p-3">
                            <Calendar className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Action Required
                            </p>
                            <p className="text-foreground">
                                {actionRequiredCount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">
                        All ({notifications.length})
                    </TabsTrigger>
                    <TabsTrigger value="unread">
                        Unread ({unreadCount})
                    </TabsTrigger>
                    <TabsTrigger value="action">
                        Action Required ({actionRequiredCount})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    <div className="space-y-3">
                        {loading ? (
                            <div className="py-8 text-center">
                                <p className="text-muted-foreground">
                                    Loading notifications...
                                </p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <Bell className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    No notifications
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => {
                                const Icon = getIcon(notification.type);
                                const iconColor = getIconColor(
                                    notification.type,
                                );

                                return (
                                    <div
                                        key={notification.id}
                                        className={`rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md ${
                                            !notification.read
                                                ? 'border-l-4 border-l-primary'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`rounded-lg p-3 ${iconColor}`}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="mb-1 flex items-start justify-between">
                                                    <h3 className="text-foreground">
                                                        {notification.title}
                                                    </h3>
                                                    <span className="ml-4 text-xs whitespace-nowrap text-muted-foreground">
                                                        {formatDate(
                                                            notification.createdAt,
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="mb-3 text-sm text-muted-foreground">
                                                    {notification.message}
                                                </p>

                                                <div className="flex items-center gap-2">
                                                    {!notification.read && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-primary/10 text-primary"
                                                        >
                                                            New
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {!notification.read && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            markAsRead(
                                                                notification.id,
                                                            )
                                                        }
                                                    >
                                                        <CheckCheck className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        deleteNotification(
                                                            notification.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
