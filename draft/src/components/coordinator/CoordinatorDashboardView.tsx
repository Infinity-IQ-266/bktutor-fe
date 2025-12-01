// MỚI: Thêm useState, useEffect
import { useState, useEffect } from 'react';
import { Users, GraduationCap, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import StatCard from '../StatCard';
import { Badge } from '../ui/badge';
// MỚI: Import API (ĐÃ SỬA ĐƯỜNG DẪN)
import { api } from '../../utils/api';

interface CoordinatorDashboardViewProps {
  userData?: any;
}

export default function CoordinatorDashboardView({ userData }: CoordinatorDashboardViewProps) {
  // MỚI: State cho dữ liệu động và loading
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [pendingMatches, setPendingMatches] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);

  // MỚI: useEffect để tải dữ liệu
  useEffect(() => {
    loadCoordinatorData();
  }, []);

  const loadCoordinatorData = async () => {
    try {
      setLoading(true);

      // 1. Tải song song
      const [studentsResult, tutorsResult, sessionsResult] = await Promise.all([
        api.getUsers({ role: 'student' }),
        api.getUsers({ role: 'tutor' }),
        api.getSessions({})
      ]);

      const allStudents = studentsResult.users || [];
      const allTutors = tutorsResult.users || [];
      const allSessions = sessionsResult.sessions || [];

      // 2. Tính toán Stats
      // (Giả sử API chưa có, chúng ta tự tính)
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // Lấy sinh viên chưa được ghép cặp (chưa có session nào)
      const unmatchedStudents = allStudents.filter((student: any) => {
        return !allSessions.some((s: any) => s.studentId === student.id);
      });
      
      const sessionsThisWeek = allSessions.filter((s: any) => {
        const sessionDate = new Date(s.date);
        return sessionDate >= now && sessionDate <= oneWeekFromNow && s.status !== 'cancelled';
      });

      setStats({
        activeStudents: allStudents.length,
        activeTutors: allTutors.length,
        pendingMatches: unmatchedStudents.length,
        sessionsThisWeek: sessionsThisWeek.length
      });

      // 3. Xử lý Pending Matches
      // (Lấy 2 sinh viên chưa được ghép cặp)
      const pendingStudents = unmatchedStudents.slice(0, 2).map((student: any) => ({
        student: student.name,
        studentId: student.studentId,
        faculty: student.department,
        subjects: student.expertise || ['General'], // Giả sử student có expertise
        requestDate: new Date(student.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        suggestedTutors: allTutors.length // Tạm thời
      }));
      setPendingMatches(pendingStudents);

      // 4. Xử lý Upcoming Sessions
      const today = now.toISOString().split('T')[0];
      const upcomingToday = allSessions
        .filter((s: any) => s.date === today && (s.status === 'confirmed' || s.status === 'pending'))
        .sort((a: any, b: any) => a.time.localeCompare(b.time));

      const enrichedUpcoming = await Promise.all(
        upcomingToday.slice(0, 2).map(async (session: any) => {
          const [tutor, student] = await Promise.all([
            api.getUser(session.tutorId),
            api.getUser(session.studentId)
          ]);
          return {
            ...session,
            tutor: tutor.user?.name || 'Unknown',
            student: student.user?.name || 'Unknown',
            date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
        })
      );
      setUpcomingSessions(enrichedUpcoming);
      
      // 5. Xử lý Recent Activity (Tạm thời giữ hardcoded vì API không có)
      setRecentActivity([
        { type: 'pending_match', message: `${unmatchedStudents.length} students waiting for assignment`, time: 'Just now', icon: AlertCircle, color: 'bg-yellow-50 text-yellow-600' },
        { type: 'new_student', message: 'New student registered for the program', time: '2 hours ago', icon: Users, color: 'bg-blue-50 text-blue-600' },
        { type: 'session_completed', message: 'A session was completed', time: '3 hours ago', icon: CheckCircle, color: 'bg-green-50 text-green-600' },
        { type: 'new_tutor', message: 'A new tutor joined', time: '1 day ago', icon: GraduationCap, color: 'bg-purple-50 text-purple-600' },
      ]);

    } catch (error) {
      console.error("Error loading coordinator dashboard:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // MỚI: Thêm trạng thái Loading
  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-foreground mb-2">Welcome, {userData?.name || 'Coordinator'}!</h1>
        <p className="text-muted-foreground">Loading coordination overview...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Welcome, {userData?.name || 'Coordinator'}!</h1>
        <p className="text-muted-foreground">Program coordination overview and management</p>
      </div>

      {/* Stats Grid (Dùng state) */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Active Students"
          value={stats.activeStudents?.toString() || '0'}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          icon={GraduationCap}
          label="Active Tutors"
          value={stats.activeTutors?.toString() || '0'}
          iconBgColor="bg-green-50"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Matches"
          value={stats.pendingMatches?.toString() || '0'}
          iconBgColor="bg-yellow-50"
        />
        <StatCard
          icon={Calendar}
          label="Sessions This Week"
          value={stats.sessionsThisWeek?.toString() || '0'}
          iconBgColor="bg-purple-50"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Pending Matches (Dùng state) */}
        <div className="col-span-2 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="text-foreground">Pending Student Matches</h3>
            </div>
            <div className="space-y-3">
              {pendingMatches.map((match, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-foreground">{match.student}</p>
                      <p className="text-sm text-muted-foreground">ID: {match.studentId}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{match.requestDate}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{match.faculty}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(match.subjects || []).map((subject: string, i: number) => (
                      <Badge key={i} variant="secondary">{subject}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {match.suggestedTutors} suggested tutors available
                    </span>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
                      Match Now
                    </button>
                  </div>
                </div>
              ))}
              {pendingMatches.length === 0 && (
                <p className="text-center text-yellow-700 py-4">No students waiting for a match. Great job!</p>
              )}
            </div>
          </div>

          {/* Upcoming Sessions (Dùng state) */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">Upcoming Sessions Today</h3>
              <a href="#" className="text-sm text-primary hover:underline">View all</a>
            </div>
            
            <div className="space-y-3">
              {upcomingSessions.map((session, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-foreground">{session.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.tutor} → {session.student}
                      </p>
                    </div>
                    <Badge className={session.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {session.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{session.date}</span>
                    </div>
                    <span>{session.time}</span>
                  </div>
                </div>
              ))}
              {upcomingSessions.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No sessions scheduled for today.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity (Dùng state) */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-foreground mb-4">Recent Activity</h3>
          
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={idx} className="flex gap-3">
                  <div className={`${activity.color} p-2 rounded-lg h-fit`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground mb-1">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}