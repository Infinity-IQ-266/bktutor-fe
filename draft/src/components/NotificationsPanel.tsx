import { Bell, Check, X, AlertCircle, Info, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface NotificationsPanelProps {
  userData?: any;
}

export default function NotificationsPanel({ userData }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [userData]);

  const loadNotifications = async () => {
    if (!userData?.id) return;
    
    try {
      setLoading(true);
      const response = await api.getNotifications(userData.id);
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSession = async (notificationId: string, sessionId: string) => {
    try {
      await api.acceptSession(sessionId, userData.id);
      await api.markNotificationAsRead(notificationId);
      
      // Reload notifications to show updated state
      loadNotifications();
      
      toast.success('Session accepted successfully!');
    } catch (error) {
      console.error('Error accepting session:', error);
      toast.error('Failed to accept session');
    }
  };

  const handleDeclineSession = async (notificationId: string, sessionId: string) => {
    try {
      await api.declineSession(sessionId, userData.id);
      await api.markNotificationAsRead(notificationId);
      
      // Reload notifications to show updated state
      loadNotifications();
      
      toast.info('Session declined');
    } catch (error) {
      console.error('Error declining session:', error);
      toast.error('Failed to decline session');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session_request':
        return Calendar;
      case 'session_accepted':
        return Check;
      case 'session_declined':
        return X;
      case 'session_cancelled':
        return AlertCircle;
      case 'session_rescheduled':
        return Calendar;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'session_request':
        return 'bg-blue-50 text-blue-600';
      case 'session_accepted':
        return 'bg-green-50 text-green-600';
      case 'session_declined':
        return 'bg-red-50 text-red-600';
      case 'session_cancelled':
        return 'bg-orange-50 text-orange-600';
      case 'session_rescheduled':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date().getTime();
    const notificationTime = new Date(date).getTime();
    const diff = now - notificationTime;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Get pending notifications that need action
  const pendingNotifications = notifications.filter(n => n.actionRequired && !n.read);
  const otherNotifications = notifications.filter(n => !n.actionRequired || n.read);

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-foreground">Notifications</h2>
          {pendingNotifications.length > 0 && (
            <Badge className="bg-red-500 text-white">{pendingNotifications.length}</Badge>
          )}
        </div>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await api.markAllNotificationsAsRead(userData.id);
              loadNotifications();
            }}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pending Notifications (Need Action) */}
          {pendingNotifications.length > 0 && (
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Requires Action</h3>
              {pendingNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-foreground">{notification.title}</h3>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {notification.message}
                        </p>
                        
                        {notification.actionType === 'accept_decline' && notification.relatedId && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-[#0f2d52] hover:bg-[#0f2d52]/90 text-white"
                              onClick={() => handleAcceptSession(notification.id, notification.relatedId)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeclineSession(notification.id, notification.relatedId)}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                        
                        {notification.actionType === 'acknowledge' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Got it
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Other Notifications */}
          {otherNotifications.length > 0 && (
            <div>
              {pendingNotifications.length > 0 && (
                <h3 className="text-sm text-muted-foreground mb-2 mt-4">Recent</h3>
              )}
              {otherNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`rounded-lg p-4 mb-2 ${notification.read ? 'opacity-60' : ''} hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-foreground">{notification.title}</h3>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-xs"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
