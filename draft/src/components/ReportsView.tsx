// MỚI: Thêm useState và useEffect
import { useState, useEffect } from 'react';
import { Download, TrendingUp, Users, Calendar, Award, Star, Filter, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input'; // ĐÃ SỬA TỪ 'in'
import { Badge } from './ui/badge'; // ĐÃ SỬA TỪ 'in'
import StatCard from './StatCard';
import { generateReport, downloadReportAsHTML } from '../utils/reportGenerator';
// MỚI: Import API
import { api } from '../utils/api'; // ĐÃ SỬA TỪ 'in'

export default function ReportsView() {
  const [showFilters, setShowFilters] = useState(false);
  
  // MỚI: Thêm state cho loading và dữ liệu động
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [departmentPerformance, setDepartmentPerformance] = useState<any[]>([]);
  const [tutorPerformance, setTutorPerformance] = useState<any[]>([]);
  const [studentEngagement, setStudentEngagement] = useState<any[]>([]);
  
  // MỚI: Hàm trợ giúp tính toán tiến độ trung bình
  const getAverageProgress = (scores: number[]) => {
    if (!scores || scores.length === 0) return 'N/A';
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg >= 75) return 'Excellent';
    if (avg >= 50) return 'Good';
    return 'Needs Improvement';
  };
  
  // MỚI: Hàm tải dữ liệu chính
  const loadReportData = async () => {
    try {
      setLoading(true);

      // 1. Tải tất cả dữ liệu thô song song
      const [
        statsResult,
        tutorsResult,
        studentsResult,
        sessionsResult,
        progressResult,
        deptStatsResult
      ] = await Promise.all([
        api.getDashboardStats({ role: 'administrator' }),
        api.getUsers({ role: 'tutor' }),
        api.getUsers({ role: 'student' }),
        api.getSessions({}),
        api.getAllProgress(),
        api.getAllDepartmentStats() // API này rất quan trọng
      ]);

      const allTutors = tutorsResult.users || [];
      const allStudents = studentsResult.users || [];
      const allSessions = sessionsResult.sessions || [];
      const allProgress = progressResult.progress || [];

      // 2. Set Stats cho Card
      const dashboardStats = statsResult.stats || {};
      const completedSessions = dashboardStats.completedSessions || 0;
      const totalSessions = dashboardStats.totalSessions || 0;
      
      const completionRate = (totalSessions > 0)
        ? ((completedSessions / totalSessions) * 100).toFixed(1)
        : '0.0';
      
      // Tự tính Avg Rating
      const allRatings = allSessions
        .map((s: any) => s.rating)
        .filter(Boolean); // Lọc ra các session có rating
      
      const avgRating = allRatings.length > 0
        ? (allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length).toFixed(1)
        : '0.0';

      setStats({
        ...dashboardStats,
        completionRate: `${completionRate}%`,
        avgRating: `${avgRating}/5` // Dùng
        // Dùng giá trị vừa tính
      });

      // 3. Set Tab "By Department"
      // deptStatsResult.stats là một mảng, nhưng tutors, students, sessions là MẢNG
      setDepartmentPerformance(deptStatsResult.stats || []);

      // 4. Xử lý Tab "By Tutor"
      const tutorData = allTutors.map((tutor: any) => {
        const tutorSessions = allSessions.filter((s: any) => s.tutorId === tutor.id);
        const completedSessions = tutorSessions.filter((s: any) => s.status === 'completed');
        const ratings = completedSessions.map((s: any) => s.rating).filter(Boolean);
        const avgRating = ratings.length > 0
          ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length)
          : 0;
        const activeStudents = new Set(tutorSessions.map((s: any) => s.studentId)).size;
        
        return {
          id: tutor.tutorId || tutor.id,
          name: tutor.name,
          department: tutor.department,
          totalSessions: tutorSessions.length,
          activeStudents: activeStudents,
          avgRating: avgRating,
          completionRate: tutorSessions.length > 0 
            ? Math.round((completedSessions.length / tutorSessions.length) * 100)
            : 0,
          responseTime: 'N/A' // Dữ liệu này không có sẵn
        };
      });
      setTutorPerformance(tutorData.sort((a, b) => b.avgRating - a.avgRating));

      // 5. Xử lý Tab "By Student"
      const studentData = allStudents.map((student: any) => {
        const studentSessions = allSessions.filter((s: any) => s.studentId === student.id);
        const completedSessions = studentSessions.filter((s: any) => s.status === 'completed');
        const studentProgress = allProgress.filter((p: any) => p.studentId === student.id);
        const progressScores = studentProgress.map((p: any) => p.improvementScore);

        return {
          id: student.studentId || student.id,
          name: student.name,
          faculty: student.department,
          year: `Year ${student.year}`,
          totalSessions: studentSessions.length,
          attendanceRate: studentSessions.length > 0
            ? Math.round((completedSessions.length / studentSessions.length) * 100)
            : 0,
          avgProgress: getAverageProgress(progressScores),
          tutorsWorkedWith: new Set(studentSessions.map((s: any) => s.tutorId)).size
        };
      });
      setStudentEngagement(studentData);

    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  };

  // MỚI: Tải dữ liệu khi component mount
  useEffect(() => {
    loadReportData();
  }, []);

  // Dữ liệu timeline vẫn hardcoded VÌ API KHÔNG CUNG CẤP
  const timelineData = [
    { month: 'May 2025', newStudents: 45, newTutors: 8, totalSessions: 178, avgRating: 4.5 },
    { month: 'Jun 2025', newStudents: 52, newTutors: 6, totalSessions: 234, avgRating: 4.6 },
    { month: 'Jul 2025', newStudents: 38, newTutors: 5, totalSessions: 289, avgRating: 4.6 },
    { month: 'Aug 2025', newStudents: 67, newTutors: 12, totalSessions: 356, avgRating: 4.7 },
    { month: 'Sep 2025', newStudents: 78, newTutors: 9, totalSessions: 445, avgRating: 4.7 },
    { month: 'Oct 2025', newStudents: 89, newTutors: 11, totalSessions: 512, avgRating: 4.7 },
  ];

  // MỚI: Sửa hàm export để dùng DỮ LIỆU TỪ STATE
  const handleExportReport = () => {
    // Generate comprehensive report with all data
    const report = generateReport({
      title: 'Program Analytics Report',
      generatedDate: new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      generatedBy: 'Admin - BK TUTOR System',
      period: 'This Semester (2025)',
      sections: [
        {
          title: 'Overview Statistics',
          type: 'stats',
          data: [
            { label: 'Total Tutors', value: stats.totalTutors || '0' },
            { label: 'Total Students', value: stats.totalStudents || '0' },
            { label: 'Total Sessions', value: stats.totalSessions || '0' },
            { label: 'Completion Rate', value: stats.completionRate || '0%' },
            { label: 'Average Satisfaction', value: stats.avgRating || 'N/A' }
          ]
        },
        {
          title: 'Department Performance',
          type: 'table',
          data: {
            columns: ['Department', 'Tutors', 'Students', 'Sessions', 'Rating'],
            // DÙNG STATE
            rows: departmentPerformance.map(dept => [
              dept.department,
              // 🔥 FIX CHỐNG CRASH (Sửa ở đây)
              (dept.tutors || []).length,
              (dept.students || []).length,
              (dept.sessions || []).length,
              `★ ${(dept.avgRating || 0).toFixed(1)}`
            ])
          }
        },
        {
          title: 'Top Performing Tutors',
          type: 'table',
          data: {
            columns: ['Tutor', 'Department', 'Sessions', 'Students', 'Rating', 'Status'],
            // DÙNG STATE
            rows: tutorPerformance.map(tutor => [
              `${tutor.name} (${tutor.id})`,
              tutor.department,
              tutor.totalSessions,
              tutor.activeStudents,
              `★ ${(tutor.avgRating || 0).toFixed(1)}`,
              {
                type: 'badge',
                variant: (tutor.avgRating || 0) >= 4.8 ? 'success' : 'info',
                text: (tutor.avgRating || 0) >= 4.8 ? 'Excellent' : 'Good'
              }
            ])
          }
        },
        {
          title: 'Student Engagement',
          type: 'table',
          data: {
            columns: ['Student', 'Faculty', 'Sessions', 'Attendance', 'Progress'],
            // DÙNG STATE
            rows: studentEngagement.map(student => [
              `${student.name} (${student.id})`,
              `${student.faculty} - ${student.year}`,
              student.totalSessions,
              `${student.attendanceRate}%`,
              {
                type: 'badge',
                variant: student.avgProgress === 'Excellent' ? 'success' : 'info',
                text: student.avgProgress
              }
            ])
          }
        },
        {
          title: '6-Month Timeline Analysis (Static)',
          type: 'table',
          data: {
            columns: ['Month', 'New Students', 'New Tutors', 'Total Sessions', 'Rating'],
            rows: timelineData.map(data => [
              data.month,
              data.newStudents,
              data.newTutors,
              data.totalSessions,
              `★ ${data.avgRating}`
            ])
          }
        },
        {
          title: 'Summary',
          type: 'text',
          // MỚI: Cập nhật tóm tắt với dữ liệu động
          data: `The BK TUTOR program has shown excellent growth. There are currently ${stats.totalTutors || 'N/A'} tutors and ${stats.totalStudents || 'N/A'} students participating, completing ${stats.totalSessions || 'N/A'} sessions with a completion rate of ${stats.completionRate || 'N/A'}. The program continues to demonstrate strong effectiveness in providing academic support to HCMUT students.`
        }
      ]
    });
    
    const filename = `BK_TUTOR_Program_Analytics_${new Date().toISOString().split('T')[0]}.html`;
    downloadReportAsHTML(report, filename);
  };
  
  // MỚI: Thêm trạng thái loading
  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-foreground mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground">Loading comprehensive reports...</p>
      </div>
    );
  }

  // === JSX (Phần Giao diện) ===
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">View comprehensive reports and analytics for the tutoring program.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters (ĐẦY ĐỦ) */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-border p-4 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-semester">This Semester</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="cse">Computer Science & Engineering</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Performance Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="excellent">Excellent (4.5+)</SelectItem>
                  <SelectItem value="good">Good (4.0-4.5)</SelectItem>
                  <SelectItem value="fair">Fair (3.5-4.0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats (Dùng state) */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={TrendingUp}
          label="Total Students"
          value={stats.totalStudents?.toString() || '0'}
          iconBgColor="bg-green-50"
        />
        <StatCard
          icon={Users}
          label="Total Tutors"
          value={stats.totalTutors?.toString() || '0'}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          icon={Calendar}
          label="Total Sessions"
          value={stats.totalSessions?.toString() || '0'}
          iconBgColor="bg-purple-50"
        />
        <StatCard
          icon={Award}
          label="Avg. Satisfaction"
          value={stats.avgRating || 'N/A'}
          iconBgColor="bg-yellow-50"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="department" className="mb-6">
        <TabsList>
          <TabsTrigger value="department">By Department</TabsTrigger>
          <TabsTrigger value="tutor">By Tutor</TabsTrigger>
          <TabsTrigger value="student">By Student</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="department" className="mt-6">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-foreground">Department Performance</h3>
              <p className="text-sm text-muted-foreground mt-1">Performance metrics across all departments</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm text-muted-foreground">Department</th>
                    <th className="px-6 py-4 text-left text-sm text-muted-foreground">Total Tutors</th>
                    <th className="px-6 py-4 text-left text-sm text-muted-foreground">Total Students</th>
                    <th className="px-6 py-4 text-left text-sm text-muted-foreground">Total Sessions</th>
                    <th className="px-6 py-4 text-left text-sm text-muted-foreground">Avg. Rating</th>
                    <th className="px-6 py-4 text-left text-sm text-muted-foreground">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* DÙNG STATE */}
                  {departmentPerformance.map((dept, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-foreground">{dept.department}</p>
                      </td>
                      <td className="px-6 py-4">
                        {/* 🔥 FIX CHỐNG CRASH: Thêm .length */}
                        <p className="text-sm text-foreground">{(dept.tutors || []).length}</p>
                      </td>
                      <td className="px-6 py-4">
                        {/* 🔥 FIX CHỐNG CRASH: Thêm .length */}
                        <p className="text-sm text-foreground">{(dept.students || []).length}</p>
                      </td>
                      <td className="px-6 py-4">
                        {/* 🔥 FIX CHỐNG CRASH: Thêm .length (cho an toàn) */}
                        <p className="text-sm text-foreground">{(dept.sessions || []).length}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <p className="text-sm text-foreground">{(dept.avgRating || 0).toFixed(1)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${((dept.avgRating || 0) / 5) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tutor" className="mt-6">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              {/* PHẦN SEARCH ĐẦY ĐỦ */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-foreground">Tutor Performance Analysis</h3>
                  <p className="text-sm text-muted-foreground mt-1">Individual tutor statistics and ratings</p>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search tutors..."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm text-muted-foreground">Tutor</th>
                    <th className="px-6 py-4 text-left text-sm text-muted-foreground">Department</th>
                    <th className="px-6 py-4 text-center text-sm text-muted-foreground">Sessions</th>
                    <th className="px-6 py-4 text-center text-sm text-muted-foreground">Students</th>
                    <th className="px-6 py-4 text-center text-sm text-muted-foreground">Rating</th>
                    <th className="px-6 py-4 text-center text-sm text-muted-foreground">Completion</th>
                    <th className="px-6 py-4 text-left text-sm text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* DÙNG STATE */}
                  {tutorPerformance.map((tutor) => (
                    <tr key={tutor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-foreground">{tutor.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {tutor.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">{tutor.department}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-sm text-foreground">{tutor.totalSessions}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-sm text-foreground">{tutor.activeStudents}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <p className="text-sm text-foreground">{(tutor.avgRating || 0).toFixed(1)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-sm text-foreground">{tutor.completionRate}%</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={(tutor.avgRating || 0) >= 4.8 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                          {(tutor.avgRating || 0) >= 4.8 ? 'Excellent' : 'Good'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="student" className="mt-6">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              {/* PHẦN SEARCH ĐẦY ĐỦ */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-foreground">Student Engagement Analysis</h3>
                  <p className="text-sm text-muted-foreground mt-1">Student participation and progress metrics</p>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search students..."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm text-muted-foreground">Student</th>
                    <th className="px-6 py-4 text-left text-sm text-muted-foreground">Faculty</th>
                    <th className="px-6 py-4 text-center text-sm text-muted-foreground">Sessions</th>
                    <th className="px-6 py-4 text-center text-sm text-muted-foreground">Attendance</th>
                    <th className="px-6 py-4 text-center text-sm text-muted-foreground">Tutors</th>
                    <th className="px-6 py-4 text-left text-sm text-muted-foreground">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* DÙNG STATE */}
                  {studentEngagement.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {student.id} • {student.year}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">{student.faculty}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-sm text-foreground">{student.totalSessions}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-sm text-foreground">{student.attendanceRate}%</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-sm text-foreground">{student.tutorsWorkedWith}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={
                          student.avgProgress === 'Excellent' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }>
                          {student.avgProgress}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="text-foreground mb-4">6-Month Program Timeline</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Track program growth and performance over time
            </p>
            
            <div className="space-y-6">
              {/* Monthly Breakdown (ĐẦY ĐỦ) */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm text-muted-foreground">Month</th>
                      <th className="px-6 py-4 text-center text-sm text-muted-foreground">New Students</th>
                      <th className="px-6 py-4 text-center text-sm text-muted-foreground">New Tutors</th>
                      <th className="px-6 py-4 text-center text-sm text-muted-foreground">Total Sessions</th>
                      <th className="px-6 py-4 text-center text-sm text-muted-foreground">Avg Rating</th>
                      <th className="px-6 py-4 text-left text-sm text-muted-foreground">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {timelineData.map((data, idx) => {
                      const prevMonth = idx > 0 ? timelineData[idx - 1] : null;
                      const growth = prevMonth 
                        ? ((data.totalSessions - prevMonth.totalSessions) / (prevMonth.totalSessions || 1) * 100).toFixed(1)
                        : 0;
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="text-foreground">{data.month}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <p className="text-sm text-foreground">{data.newStudents}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <p className="text-sm text-foreground">{data.newTutors}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <p className="text-sm text-foreground">{data.totalSessions}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <p className="text-sm text-foreground">{data.avgRating}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {prevMonth && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className={`w-4 h-4 ${parseFloat(growth.toString()) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                <span className={`text-sm ${parseFloat(growth.toString()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {parseFloat(growth.toString()) >= 0 ? '+' : ''}{growth}%
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary (ĐẦY ĐỦ) */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Growth</p>
                  <p className="text-2xl text-foreground mb-1">+187%</p>
                  <p className="text-sm text-muted-foreground">in sessions over 6 months</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Student Growth</p>
                  <p className="text-2xl text-foreground mb-1">+369</p>
                  <p className="text-sm text-muted-foreground">new students joined</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Rating Improvement</p>
                  <p className="text-2xl text-foreground mb-1">+0.2</p>
                  <p className="text-sm text-muted-foreground">average rating increase</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}