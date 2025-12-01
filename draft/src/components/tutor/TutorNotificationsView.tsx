import { Bell, CheckCheck, Trash2, Calendar, FileText, MessageSquare, AlertCircle, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner@2.0.3';

interface TutorNotificationsViewProps {
  userData?: any;
}

export default function TutorNotificationsView({ userData }: TutorNotificationsViewProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadNotifications();
    
    // Poll for new notifications every 10 seconds
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [userData]);

  const loadNotifications = async () => {
    if (!userData?.id) return;
    
    try {
      const response = await api.getNotifications(userData.id);
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead(userData.id);
      await loadNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.deleteNotification(notificationId);
      await loadNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleAcceptSession = async (sessionId: string, notificationId: string) => {
    try {
      await api.acceptSession(sessionId, userData.id);
      await markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error accepting session:', error);
      toast.error('Failed to accept session');
    }
  };

  const handleDeclineSession = async (sessionId: string, notificationId: string) => {
    try {
      await api.declineSession(sessionId, userData.id);
      await markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error declining session:', error);
      toast.error('Failed to decline session');
    }
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
        return Star;
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
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'action') return n.actionRequired;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Notifications</h1>
          <p className="text-muted-foreground">Manage your session requests and student interactions</p>
        </div>
        <Button 
          variant="outline"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck className="w-4 h-4 mr-2" />
          Mark All as Read
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-foreground">{notifications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unread</p>
              <p className="text-foreground">{unreadCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-3 rounded-lg">
              <Calendar className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Action Required</p>
              <p className="text-foreground">{actionRequiredCount}</p>
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
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getIcon(notification.type);
                const iconColor = getIconColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow ${
                      !notification.read ? 'border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-foreground">{notification.title}</h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              New
                            </Badge>
                          )}
                          
                          {notification.actionRequired && notification.actionType === 'accept_decline' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAcceptSession(notification.relatedId, notification.id)}
                              >
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeclineSession(notification.relatedId, notification.id)}
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCheck className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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
