// MỚI: Thêm import cho useState, useEffect
import { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, TrendingUp, Star, Clock } from 'lucide-react';
import StatCard from './StatCard';
// MỚI: Thêm import cho api
import { api } from '../utils/api';
// MỚI: Thêm import cho Badge (để hiển thị trạng thái session)
import { Badge } from './ui/badge';

interface DashboardViewProps {
  userData?: any;
}

// MỚI: Hàm trợ giúp để lấy màu sắc và nhãn cho trạng thái session
const getSessionStatus = (status: string) => {
  switch (status) {
    case 'completed':
      return { label: 'Completed', color: 'bg-green-100 text-green-700' };
    case 'confirmed':
      return { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' };
    case 'pending':
      return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' };
    case 'cancelled':
    case 'declined':
      return { label: 'Cancelled', color: 'bg-red-100 text-red-700' };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-700' };
  }
};

export default function DashboardView({ userData }: DashboardViewProps) {
  // MỚI: State để quản lý dữ liệu động và trạng thái loading
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [topTutors, setTopTutors] = useState<any[]>([]);

  // MỚI: useEffect để tải dữ liệu khi component được mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Lấy
      // Lấy Stat Card (API đã hỗ trợ sẵn)
      const statsResult = await api.getDashboardStats({ role: 'administrator' });
      setStats(statsResult.stats || {});

      // 2. Lấy
      // Lấy TẤT CẢ sessions và TẤT CẢ tutors để tính toán
      const [sessionsResult, tutorsResult] = await Promise.all([
        api.getSessions({}),
        api.getUsers({ role: 'tutor' })
      ]);
      
      const allSessions = sessionsResult.sessions || [];
      const allTutors = tutorsResult.users || [];

      // 3. Xử
      // Xử lý "Recent Sessions"
      // Sắp xếp sessions theo ngày (mới nhất trước) và lấy 3 session
      const sortedSessions = allSessions.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const recent = sortedSessions.slice(0, 3);

      // Làm giàu dữ liệu (enrich) cho recent sessions (lấy tên tutor và student)
      const enrichedRecentSessions = await Promise.all(
        recent.map(async (session: any) => {
          const [tutor, student] = await Promise.all([
            api.getUser(session.tutorId),
            api.getUser(session.studentId)
          ]);
          return {
            ...session,
            tutorName: tutor.user?.name || 'Unknown Tutor',
            studentName: student.user?.name || 'Unknown Student',
            statusInfo: getSessionStatus(session.status) // Dùng hàm trợ giúp
          };
        })
      );
      setRecentSessions(enrichedRecentSessions);

      // 4. Xử
      // Xử lý "Top Tutors"
      const tutorStats = allTutors.map((tutor: any) => {
        const tutorSessions = allSessions.filter((s: any) => 
          s.tutorId === tutor.id && s.status === 'completed'
        );
        const ratings = tutorSessions.map((s: any) => s.rating).filter(Boolean);
        const avgRating = ratings.length > 0
          ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length)
          : 0;
        
        return {
          ...tutor,
          sessions: tutorSessions.length,
          rating: avgRating.toFixed(1)
        };
      });

      // Sắp xếp
      // Sắp xếp tutors theo rating, sau đó theo số lượng sessions
      const sortedTutors = tutorStats.sort((a: any, b: any) => 
        b.rating - a.rating || b.sessions - a.sessions
      );
      
      setTopTutors(sortedTutors.slice(0, 4));

    } catch (error) {
      console.error("Error loading admin dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // MỚI: Tính toán tỷ lệ hoàn thành
  const completionRate = (stats.totalSessions > 0)
    ? ((stats.completedSessions / stats.totalSessions) * 100).toFixed(1)
    : '0.0';

  // MỚI: Xử lý trạng thái loading
  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">Welcome, {userData?.name || 'Administrator'}!</h1>
          <p className="text-muted-foreground">Loading program overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Welcome, {userData?.name || 'Administrator'}!</h1>
        <p className="text-muted-foreground">BK TUTOR Program Administration - Overview of program activities</p>
      </div>

      {/* Stats Grid - ĐÃ CẬP NHẬT */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={BookOpen}
          label="Total Tutors"
          value={stats.totalTutors?.toString() || '0'}
          // change="+8%" (Tạm ẩn thay đổi,
          // (Tạm ẩn thay đổi, vì API chưa cấp)
          iconBgColor="bg-blue-50"
        />
        <StatCard
          icon={Users}
          label="Active Students"
          value={stats.totalStudents?.toString() || '0'}
          // change="+12%"
          iconBgColor="bg-blue-50"
        />
        <StatCard
          icon={Calendar}
          label="Total Sessions"
          value={stats.totalSessions?.toString() || '0'}
          // change="+18%"
          iconBgColor="bg-blue-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${completionRate}%`} // Dùng
          // Dùng giá trị đã tính
          // change="+3.2%"
          iconBgColor="bg-blue-50"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Sessions - ĐÃ CẬP NHẬT */}
        <div className="col-span-2 bg-white rounded-xl border border-border p-6">
          <h3 className="text-foreground mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {recentSessions.map((session, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">{session.tutorName}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-foreground">{session.studentName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{session.time}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{session.subject}</p>
                  {/* Dùng Badge và màu động */}
                  <Badge className={`text-xs px-3 py-1 rounded-full ${session.statusInfo.color}`}>
                    {session.statusInfo.label}
                  </Badge>
                </div>
              </div>
            ))}
            {recentSessions.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No recent sessions found.</p>
            )}
          </div>
        </div>

        {/* Top Tutors - ĐÃ CẬP NHẬT */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-foreground mb-4">Top Tutors</h3>
          <div className="space-y-4">
            {topTutors.map((tutor, index) => (
              <div key={index} className="pb-4 border-b border-border last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-foreground">{tutor.name}</p>
                    <p className="text-sm text-muted-foreground">{tutor.department}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{tutor.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{tutor.sessions} completed sessions</p>
              </div>
            ))}
            {topTutors.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No tutor data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}