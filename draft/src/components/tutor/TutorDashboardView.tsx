import { Calendar, Users, Clock, Star, CheckCircle, AlertCircle } from 'lucide-react';
import StatCard from '../StatCard';
import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from 'sonner@2.0.3';
import { globalEvents, EVENTS } from '../../utils/helpers';

interface TutorDashboardViewProps {
  userData?: any;
}

export default function TutorDashboardView({ userData }: TutorDashboardViewProps) {
  const [stats, setStats] = useState({
    todaysSessions: 0,
    activeStudents: 0,
    pendingRequests: 0,
    averageRating: '0.0'
  });
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 FIX: Get email from localStorage OR userData prop as fallback
  const currentUserEmail = localStorage.getItem('currentUserEmail') || userData?.email;

  useEffect(() => {
    loadDashboardData();

    // 🔔 Auto-refresh when sessions updated
    const handleUpdate = () => {
      console.log('🔄 Tutor Dashboard auto-refreshing...');
      loadDashboardData();
    };

    globalEvents.on(EVENTS.SESSION_UPDATED, handleUpdate);
    globalEvents.on(EVENTS.SESSION_CREATED, handleUpdate);
    globalEvents.on(EVENTS.SESSION_COMPLETED, handleUpdate);
    globalEvents.on(EVENTS.SESSION_CANCELLED, handleUpdate);

    return () => {
      globalEvents.off(EVENTS.SESSION_UPDATED, handleUpdate);
      globalEvents.off(EVENTS.SESSION_CREATED, handleUpdate);
      globalEvents.off(EVENTS.SESSION_COMPLETED, handleUpdate);
      globalEvents.off(EVENTS.SESSION_CANCELLED, handleUpdate);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const userResult = await api.getUserByEmail(currentUserEmail!);
      if (!userResult.user) return;

      // Get all sessions for this tutor
      const sessionsResult = await api.getSessions({ tutorId: userResult.user.id });
      const allSessions = sessionsResult.sessions || [];

      const today = new Date().toISOString().split('T')[0];
      const now = new Date();

      // Calculate stats
      const todaysSessions = allSessions.filter((s: any) => s.date === today && s.status === 'confirmed');
      const pending = allSessions.filter((s: any) => s.status === 'pending');
      const completed = allSessions.filter((s: any) => s.status === 'completed');
      
      // Count unique students
      const uniqueStudents = new Set(allSessions.filter((s: any) => s.status !== 'cancelled').map((s: any) => s.studentId));
      
      // Calculate average rating
      const ratings = completed.filter((s: any) => s.rating).map((s: any) => s.rating);
      const avgRating = ratings.length > 0
        ? (ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length).toFixed(1)
        : '0.0';

      setStats({
        todaysSessions: todaysSessions.length,
        activeStudents: uniqueStudents.size,
        pendingRequests: pending.length,
        averageRating: avgRating
      });

      // Get upcoming sessions (next 3 scheduled)
      const upcoming = allSessions
        .filter((s: any) => {
          const sessionDate = new Date(s.date);
          return s.status === 'confirmed' && sessionDate >= now;
        })
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);

      const upcomingWithStudents = await Promise.all(
        upcoming.map(async (session: any) => {
          const studentResult = await api.getUser(session.studentId);
          return {
            ...session,
            studentName: studentResult.user?.name || 'Unknown Student',
            studentEmail: studentResult.user?.email || ''
          };
        })
      );
      setUpcomingSessions(upcomingWithStudents);

      // Get pending requests with student details
      const pendingWithStudents = await Promise.all(
        pending.slice(0, 3).map(async (session: any) => {
          const studentResult = await api.getUser(session.studentId);
          const timeAgo = getTimeAgo(new Date(session.createdAt));
          return {
            ...session,
            studentName: studentResult.user?.name || 'Unknown Student',
            submittedAt: timeAgo
          };
        })
      );
      setPendingRequests(pendingWithStudents);

      // Get recent feedback (last 3 with ratings)
      const withFeedback = completed
        .filter((s: any) => s.rating && s.feedback)
        .sort((a: any, b: any) => new Date(b.completedAt || b.date).getTime() - new Date(a.completedAt || a.date).getTime())
        .slice(0, 3);

      const feedbackWithStudents = await Promise.all(
        withFeedback.map(async (session: any) => {
          const studentResult = await api.getUser(session.studentId);
          return {
            student: studentResult.user?.name || 'Unknown Student',
            subject: session.subject,
            rating: session.rating,
            date: new Date(session.completedAt || session.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            comment: session.feedback
          };
        })
      );
      setRecentFeedback(feedbackWithStudents);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const handleAcceptRequest = async (sessionId: string) => {
    try {
      await api.updateSession(sessionId, { status: 'scheduled' });
      
      const session = pendingRequests.find(r => r.id === sessionId);
      if (session) {
        // Create notification for student
        await api.createNotification({
          userId: session.studentId,
          title: 'Session Request Accepted',
          message: `Your ${session.subject} session request has been accepted`,
          type: 'session_accepted',
          relatedId: sessionId,
          actionType: 'view'
        });
      }
      
      toast.success('Session request accepted');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (sessionId: string) => {
    try {
      await api.updateSession(sessionId, { status: 'cancelled' });
      
      const session = pendingRequests.find(r => r.id === sessionId);
      if (session) {
        // Create notification for student
        await api.createNotification({
          userId: session.studentId,
          title: 'Session Request Declined',
          message: `Your ${session.subject} session request was declined`,
          type: 'cancelled',
          relatedId: sessionId,
          actionType: 'view'
        });
      }
      
      toast.success('Session request declined');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to decline request');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">Welcome, {userData?.name || 'Tutor'}!</h1>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Welcome, {userData?.name || 'Tutor'}!</h1>
        <p className="text-muted-foreground">Here's your tutoring overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Calendar}
          label="Today's Sessions"
          value={stats.todaysSessions.toString()}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          icon={Users}
          label="Active Students"
          value={stats.activeStudents.toString()}
          iconBgColor="bg-green-50"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Requests"
          value={stats.pendingRequests.toString()}
          iconBgColor="bg-yellow-50"
        />
        <StatCard
          icon={Star}
          label="Average Rating"
          value={stats.averageRating}
          iconBgColor="bg-purple-50"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-foreground">Upcoming Sessions</h2>
          </div>
          <div className="p-6">
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming sessions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-foreground">{session.subject}</h3>
                        <p className="text-sm text-muted-foreground">{session.studentName}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(session.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.startTime} - {session.endTime}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {session.type === 'online' ? '💻' : '📍'} {session.location}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-foreground">Pending Requests</h2>
          </div>
          <div className="p-6">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-muted-foreground">All caught up!</p>
                <p className="text-sm text-muted-foreground mt-1">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-foreground">{request.subject}</h3>
                        <p className="text-sm text-muted-foreground">{request.studentName}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{request.submittedAt}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4" />
                      {formatDate(request.date)} at {request.startTime}
                    </div>
                    {request.notes && (
                      <p className="text-sm text-muted-foreground mb-3 italic">"{request.notes}"</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90 text-white"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDeclineRequest(request.id)}
                      >
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
      <div className="bg-white rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-foreground">Recent Student Feedback</h2>
        </div>
        <div className="p-6">
          {recentFeedback.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No feedback yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentFeedback.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-foreground">{item.student}</h3>
                      <p className="text-sm text-muted-foreground">{item.subject}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.date}</p>
                  <p className="text-sm text-foreground italic">"{item.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
