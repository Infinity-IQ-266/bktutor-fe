/* ======================================================================== */
/* NỘI DUNG ĐẦY ĐỦ CỦA FILE ChairDashboardView.tsx                    */
/* (Đã sửa lỗi logic khi đọc dữ liệu progress)                            */
/* ======================================================================== */

import { useState, useEffect } from 'react';
import { Users, TrendingUp, BookOpen, Award, Loader2, Calendar, Star } from 'lucide-react';
import StatCard from '../StatCard';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api'; 

interface ChairDashboardViewProps {
  userData?: any;
}

export default function ChairDashboardView({ userData }: ChairDashboardViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [departmentName, setDepartmentName] = useState('...');
  
  // State cho dữ liệu thật
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    activeInProgram: 0,
    participationRate: 0,
    avgRating: 0,
    activeSubjects: 0
  });
  const [topSubjects, setTopSubjects] = useState<any[]>([]);
  const [studentsByYear, setStudentsByYear] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useEffect(() => {
    if (!userData?.department) {
      setIsLoading(false);
      setDepartmentName('Unknown Department');
      return;
    }

    setDepartmentName(userData.department);

    const loadData = async () => {
      try {
        setIsLoading(true);
        const dept = userData.department;

        const [studentsRes, sessionsRes] = await Promise.all([
          api.getUsers({ role: 'student', department: dept }),
          api.getSessions() // Lấy all sessions để lọc
        ]);
        
        const students = studentsRes.users || [];
        const studentIdsInDept = new Set(students.map((s: any) => s.id));

        const deptSessions = (sessionsRes.sessions || []).filter((s: any) => 
          studentIdsInDept.has(s.studentId)
        );

        // --- 1. Tính toán Stats ---
        const totalDeptStudents = students.length;
        
        const progressPromises = students.map((s: any) => api.getProgress(s.id));
        const progressResults = await Promise.all(progressPromises);
        
        // 🔥 FIX: Phải truy cập .progress.records
        const studentsWithProgress = progressResults.filter((p: any) => p.progress.records && p.progress.records.length > 0);
        const studentsInProgram = studentsWithProgress.length;

        // 🔥 FIX: Phải truy cập .progress.records
        const allRatings = progressResults
          .flatMap((p: any) => p.progress.records || []) 
          .map((r: any) => r.averageRating)
          .filter((r: number) => r > 0);
          
        const avgRatingValue = allRatings.length > 0
          ? (allRatings.reduce((acc: number, r: number) => acc + r, 0) / allRatings.length)
          : 0;
        
        const subjectSet = new Set(deptSessions.map((s: any) => s.subject));

        setStats({
          totalStudents: totalDeptStudents,
          activeInProgram: studentsInProgram,
          participationRate: totalDeptStudents > 0 ? Math.round((studentsInProgram / totalDeptStudents) * 100) : 0,
          avgRating: avgRatingValue.toFixed(1),
          activeSubjects: subjectSet.size
        });

        // --- 2. Tính Top Subjects ---
        const subjectCounts: any = {};
        deptSessions.forEach((s: any) => {
          subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
        });
        const sortedSubjects = Object.keys(subjectCounts)
          .map(subject => ({
            name: subject,
            count: subjectCounts[subject]
          }))
          .sort((a, b) => b.count - a.count);
        
        setTopSubjects(sortedSubjects.slice(0, 4));

        // --- 3. Tính Students by Year ---
        const yearCounts: any = {};
        students.forEach((s: any) => {
          yearCounts[s.year] = (yearCounts[s.year] || 0) + 1;
        });
        const yearData = Object.keys(yearCounts)
          .map(year => ({
            year: `Year ${year}`,
            count: yearCounts[year],
            percentage: totalDeptStudents > 0 ? Math.round((yearCounts[year] / totalDeptStudents) * 100) : 0
          }))
          .sort((a, b) => a.year.localeCompare(b.year));
          
        setStudentsByYear(yearData);

        // --- 4. Lấy Recent Sessions (lấy tên student) ---
        const recent = deptSessions
          .filter((s: any) => s.status === 'completed')
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
          
        const enrichedRecent = await Promise.all(
          recent.map(async (session: any) => {
            const student = students.find((s:any) => s.id === session.studentId);
            return {
              ...session,
              studentName: student?.name || 'Unknown Student'
            };
          })
        );
        
        setRecentSessions(enrichedRecent);

      } catch (error) {
        console.error("Lỗi tải Chair Dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userData]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Welcome, {userData?.name || 'Department Chair'}!</h1>
        <p className="text-muted-foreground">{departmentName} Department</p>
      </div>

      {/* Stats Grid - DÙNG DỮ LIỆU THẬT */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Students (In Dept)"
          value={stats.totalStudents.toString()}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          icon={TrendingUp}
          label="In Tutor Program"
          value={stats.activeInProgram.toString()}
          change={`${stats.participationRate}% of dept`}
          iconBgColor="bg-green-50"
        />
        <StatCard
          icon={BookOpen}
          label="Active Subjects"
          value={stats.activeSubjects.toString()}
          iconBgColor="bg-purple-50"
        />
        <StatCard
          icon={Award}
          label="Avg Student Rating"
          value={stats.avgRating.toString()}
          change=""
          iconBgColor="bg-yellow-50"
        />
      </div>

      {/* Content Grid - DÙNG DỮ LIỆU THẬT */}
      <div className="grid grid-cols-3 gap-6">
        {/* Top Subjects */}
        <div className="col-span-2 bg-white rounded-xl border border-border p-6">
          <h3 className="text-foreground mb-4">Subject Participation (by Session count)</h3>
          
          <div className="space-y-4">
            {topSubjects.length === 0 && <p className="text-muted-foreground">No session data for this department.</p>}
            {topSubjects.map((item, idx) => (
              <div key={idx} className="pb-4 border-b border-border last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-foreground">{item.name}</h4>
                  <Badge variant="secondary">{item.count} sessions</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students by Year */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-foreground mb-4">Students by Year (In Dept)</h3>
          
          <div className="space-y-4">
            {studentsByYear.length === 0 && <p className="text-muted-foreground">No students found.</p>}
            {studentsByYear.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">{item.year}</span>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Completed Sessions */}
        <div className="col-span-3 bg-white rounded-xl border border-border p-6">
          <h3 className="text-foreground mb-4">Recent Completed Sessions</h3>
          
          <div className="grid grid-cols-3 gap-4">
            {recentSessions.length === 0 && <p className="text-muted-foreground">No recent completed sessions.</p>}
            {recentSessions.map((session, idx) => (
              <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground mb-1">{session.studentName}</p>
                    <p className="text-sm text-muted-foreground mb-2">{session.subject}</p>
                    <p className="text-xs text-muted-foreground">{new Date(session.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}