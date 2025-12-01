import { BookOpen, Calendar, Clock, Star, TrendingUp, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { EVENTS, globalEvents } from '../../utils/helpers';
import StatCard from '../StatCard';
import { Badge } from '../ui/badge';

interface StudentDashboardProps {
  userData?: any;
}

export default function StudentDashboard({ userData }: StudentDashboardProps) {
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    totalSessions: 0,
    currentTutors: 0,
    attendanceRate: '0%'
  });
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [recentProgress, setRecentProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 FIX: Get email from localStorage OR userData prop as fallback
  const currentUserEmail = localStorage.getItem('currentUserEmail') || userData?.email;

  useEffect(() => {
    loadDashboardData();

    // 🔔 Listen for real-time updates from other tabs/components
    const handleSessionUpdate = () => {
      console.log('🔄 Dashboard auto-refreshing due to session update...');
      loadDashboardData();
    };

    const handleProgressUpdate = () => {
      console.log('🔄 Dashboard auto-refreshing due to progress update...');
      loadDashboardData();
    };

    globalEvents.on(EVENTS.SESSION_UPDATED, handleSessionUpdate);
    globalEvents.on(EVENTS.SESSION_CREATED, handleSessionUpdate);
    globalEvents.on(EVENTS.SESSION_COMPLETED, handleSessionUpdate);
    globalEvents.on(EVENTS.SESSION_CANCELLED, handleSessionUpdate);
    globalEvents.on(EVENTS.PROGRESS_UPDATED, handleProgressUpdate);

    // Cleanup listeners on unmount
    return () => {
      globalEvents.off(EVENTS.SESSION_UPDATED, handleSessionUpdate);
      globalEvents.off(EVENTS.SESSION_CREATED, handleSessionUpdate);
      globalEvents.off(EVENTS.SESSION_COMPLETED, handleSessionUpdate);
      globalEvents.off(EVENTS.SESSION_CANCELLED, handleSessionUpdate);
      globalEvents.off(EVENTS.PROGRESS_UPDATED, handleProgressUpdate);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('📊 [Dashboard] Loading data...');
      
      if (!currentUserEmail) {
        console.error('❌ [Dashboard] No user email found! Check localStorage or userData prop');
        setLoading(false);
        return;
      }
      
      console.log('📧 [Dashboard] Email:', currentUserEmail);
      
      const userResult = await api.getUserByEmail(currentUserEmail);
      if (!userResult.user) {
        console.error('❌ [Dashboard] User not found for email:', currentUserEmail);
        setLoading(false);
        return;
      }
      
      console.log('👤 [Dashboard] User:', userResult.user.name);

      // Get all sessions for this student
      const sessionsResult = await api.getSessions({ studentId: userResult.user.id });
      const allSessions = sessionsResult.sessions || [];
      
      console.log('📅 [Dashboard] Total sessions:', allSessions.length);

      // Calculate stats
      const now = new Date();
      const upcoming = allSessions.filter((s: any) => {
        const sessionDate = new Date(s.date);
        return (s.status === 'confirmed' || s.status === 'pending') && sessionDate >= now;
      }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const completed = allSessions.filter((s: any) => s.status === 'completed');
      const total = allSessions.filter((s: any) => s.status !== 'cancelled').length;
      
      // Count unique tutors
      const uniqueTutors = new Set(allSessions.map((s: any) => s.tutorId));
      
      // Calculate attendance (completed vs total scheduled)
      const attendance = total > 0 ? Math.round((completed.length / total) * 100) : 100;

      console.log('📊 [Dashboard] Stats:', {
        upcoming: upcoming.length,
        completed: completed.length,
        tutors: uniqueTutors.size,
        attendance: attendance + '%'
      });

      setStats({
        upcomingSessions: upcoming.length,
        totalSessions: completed.length,
        currentTutors: uniqueTutors.size,
        attendanceRate: `${attendance}%`
      });

      // Get upcoming sessions with tutor details
      const upcomingWithDetails = await Promise.all(
        upcoming.slice(0, 3).map(async (session: any) => {
          const tutorResult = await api.getUser(session.tutorId);
          return {
            ...session,
            tutorName: tutorResult.user?.name || 'Unknown Tutor',
            statusBadge: session.status === 'confirmed' ? 'Confirmed' : 'Pending'
          };
        })
      );
      setUpcomingSessions(upcomingWithDetails);

      // Get recent progress from progress tracking system
      const progressRecords = await api.getProgressForStudent(userResult.user.id);
      
      // Get the 3 most recent progress records (sorted by last session date)
      const recentProgressRecords = progressRecords
        .sort((a: any, b: any) => 
          new Date(b.lastSessionDate).getTime() - new Date(a.lastSessionDate).getTime()
        )
        .slice(0, 3);

      const progressWithTutors = await Promise.all(
        recentProgressRecords.map(async (record: any) => {
          // Find a session for this subject to get tutor info
          const subjectSession = completed.find((s: any) => s.subject === record.subject);
          const tutorResult = subjectSession ? await api.getUser(subjectSession.tutorId) : null;
          
          // Get last feedback from most recent session
          const recentSession = completed
            .filter((s: any) => s.subject === record.subject)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          
          return {
            subject: record.subject,
            tutor: tutorResult?.user?.name || 'Unknown Tutor',
            sessionsCompleted: record.sessionsAttended,
            lastSession: new Date(record.lastSessionDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            progress: recentSession?.tutorFeedback || 
                     (record.improvementScore >= 75 ? 'Excellent progress!' : 
                      record.improvementScore >= 50 ? 'Making good progress' : 
                      'Keep working hard!')
          };
        })
      );
      
      setRecentProgress(progressWithTutors);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">Welcome, {userData?.name || 'Student'}!</h1>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Welcome, {userData?.name || 'Student'}!</h1>
        <p className="text-muted-foreground">Here's your academic support overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Calendar}
          label="Upcoming Sessions"
          value={stats.upcomingSessions.toString()}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          icon={BookOpen}
          label="Completed Sessions"
          value={stats.totalSessions.toString()}
          iconBgColor="bg-green-50"
        />
        <StatCard
          icon={User}
          label="Current Tutors"
          value={stats.currentTutors.toString()}
          iconBgColor="bg-purple-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Attendance Rate"
          value={stats.attendanceRate}
          iconBgColor="bg-orange-50"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6">
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
                <p className="text-sm text-muted-foreground mt-1">Book a session to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-foreground">{session.subject}</h3>
                        <p className="text-sm text-muted-foreground">{session.tutorName}</p>
                      </div>
                      <Badge className={getStatusColor(session.statusBadge)}>
                        {session.statusBadge}
                      </Badge>
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
                      <span className="inline-flex items-center gap-1">
                        {session.type === 'online' ? '💻' : '📍'} {session.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Progress */}
        <div className="bg-white rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-foreground">Recent Progress</h2>
          </div>
          <div className="p-6">
            {recentProgress.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No progress data yet</p>
                <p className="text-sm text-muted-foreground mt-1">Complete sessions to track your progress</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProgress.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-foreground">{item.subject}</h3>
                        <p className="text-sm text-muted-foreground">{item.tutor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Sessions</p>
                        <p className="text-lg text-foreground">{item.sessionsCompleted}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Last session: {item.lastSession}
                    </p>
                    <p className="text-sm text-foreground italic">"{item.progress}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <BookOpen className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="text-foreground mb-1">Find a Tutor</h3>
          <p className="text-sm text-muted-foreground">Browse available tutors and book sessions</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <Star className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="text-foreground mb-1">View Materials</h3>
          <p className="text-sm text-muted-foreground">Access learning resources from your tutors</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="text-foreground mb-1">Track Progress</h3>
          <p className="text-sm text-muted-foreground">Monitor your learning journey and feedback</p>
        </div>
      </div>
    </div>
  );
}
