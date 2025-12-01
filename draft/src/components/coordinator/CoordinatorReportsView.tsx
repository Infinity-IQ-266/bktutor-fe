// MỚI: Thêm useState, useEffect
import { useState, useEffect } from 'react';
import { FileDown, Filter, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { generateReport, downloadReportAsHTML } from '../../utils/reportGenerator';
// MỚI: Import API (Đường dẫn này đã đúng)
import { api } from '../../utils/api';

export default function CoordinatorReportsView() {
  
  // MỚI: State cho dữ liệu động
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState<any>({});
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allTutors, setAllTutors] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [deptStats, setDeptStats] = useState<any[]>([]);
  
  // MỚI: useEffect để tải dữ liệu
  useEffect(() => {
    loadReportData();
  }, []);
  
  const loadReportData = async () => {
    try {
      setLoading(true);

      // 1. Tải tất cả dữ liệu thô
      const [
        statsResult,
        tutorsResult,
        studentsResult,
        sessionsResult,
        deptStatsResult
      ] = await Promise.all([
        api.getDashboardStats({ role: 'coordinator' }), // Giả sử API có thể nhận role này
        api.getUsers({ role: 'tutor' }),
        api.getUsers({ role: 'student' }),
        api.getSessions({}),
        api.getAllDepartmentStats()
      ]);

      setAllTutors(tutorsResult.users || []);
      setAllStudents(studentsResult.users || []);
      setAllSessions(sessionsResult.sessions || []);
      setDeptStats(deptStatsResult.stats || []);

      // 2. Tính Quick Stats
      const dashboardStats = statsResult.stats || {};
      const completedSessions = dashboardStats.completedSessions || 0;
      const totalSessions = dashboardStats.totalSessions || 0;
      const completionRate = (totalSessions > 0)
        ? ((completedSessions / totalSessions) * 100).toFixed(0)
        : 0;
        
      const allRatings = (sessionsResult.sessions || []).map((s: any) => s.rating).filter(Boolean);
      const avgRating = allRatings.length > 0
        ? (allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length).toFixed(1)
        : '0.0';

      setQuickStats({
        totalSessions: totalSessions,
        completionRate: completionRate,
        avgRating: avgRating,
        activeStudents: (studentsResult.users || []).length,
        activeTutors: (tutorsResult.users || []).length,
      });

    } catch (error) {
      console.error("Error loading coordinator reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (reportName: string, reportId: string) => {
    // Generate specific report based on type
    let report;
    
    if (reportId === 'program-overview') {
      report = generateReport({
        title: 'Program Overview Report',
        generatedDate: new Date().toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        generatedBy: 'Coordinator - BK TUTOR System',
        period: 'This Semester',
        sections: [
          {
            title: 'Program Statistics',
            type: 'stats',
            data: [
              { label: 'Total Sessions', value: quickStats.totalSessions?.toString() || '0' },
              { label: 'Completion Rate', value: `${quickStats.completionRate || '0'}%` },
              { label: 'Average Rating', value: `${quickStats.avgRating || '0'}/5` },
              { label: 'Active Students', value: quickStats.activeStudents?.toString() || '0' },
              { label: 'Active Tutors', value: quickStats.activeTutors?.toString() || '0' }
            ]
          },
          {
            title: 'Summary',
            type: 'text',
            data: 'The tutoring program continues to show strong performance with high completion rates and excellent student satisfaction. Active participation from both tutors and students has increased compared to previous months.'
          }
        ]
      });
    } else if (reportId === 'tutor-performance') {
      // Tính toán top tutors
      const tutorData = allTutors.map((tutor: any) => {
        const completedSessions = allSessions.filter((s: any) => s.tutorId === tutor.id && s.status === 'completed');
        const ratings = completedSessions.map((s: any) => s.rating).filter(Boolean);
        const avgRating = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) : 0;
        const activeStudents = new Set(allSessions.filter((s: any) => s.tutorId === tutor.id).map((s: any) => s.studentId)).size;
        
        return {
          name: `${tutor.name} (${tutor.tutorId})`,
          sessions: completedSessions.length,
          students: activeStudents,
          rating: avgRating,
          completion: completedSessions.length > 0 ? 100 : 0 // Tạm
        };
      }).sort((a, b) => b.rating - a.rating);

      report = generateReport({
        title: 'Tutor Performance Report',
        generatedBy: 'Coordinator - BK TUTOR System',
        period: 'This Semester',
        sections: [
          {
            title: 'Top Performing Tutors',
            type: 'table',
            data: {
              columns: ['Tutor', 'Sessions', 'Students', 'Rating', 'Completion Rate'],
              rows: tutorData.slice(0, 10).map(t => [
                t.name,
                t.sessions,
                t.students,
                `★ ${t.rating.toFixed(1)}`,
                `${t.completion}%`
              ])
            }
          }
        ]
      });
    } else if (reportId === 'student-participation') {
      report = generateReport({
        title: 'Student Participation Report',
        generatedBy: 'Coordinator - BK TUTOR System',
        period: 'This Semester',
        sections: [
          {
            title: 'Active Students by Department',
            type: 'table',
            data: {
              columns: ['Department', 'Students', 'Sessions', 'Avg Rating'],
              rows: deptStats.map(dept => [
                dept.department,
                (dept.students || []).length,
                (dept.sessions || []).length,
                `★ ${(dept.avgRating || 0).toFixed(1)}`
              ])
            }
          }
        ]
      });
    } else {
      // Báo cáo mặc định
      report = generateReport({
        title: reportName,
        generatedDate: new Date().toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        generatedBy: 'Coordinator - BK TUTOR System',
        sections: []
      });
    }
    
    // Download report directly as HTML file
    const filename = `BK_TUTOR_${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    downloadReportAsHTML(report, filename);
  };

  const reportTemplates = [
    {
      id: 'program-overview',
      name: 'Program Overview Report',
      description: 'Comprehensive summary of program activities, participation rates, and outcomes',
      frequency: 'Monthly',
      lastGenerated: 'Live Data',
    },
    {
      id: 'tutor-performance',
      name: 'Tutor Performance Report',
      description: 'Detailed analysis of tutor ratings, session counts, and student feedback',
      frequency: 'Monthly',
      lastGenerated: 'Live Data',
    },
    {
      id: 'student-participation',
      name: 'Student Participation Report',
      description: 'Student enrollment, attendance rates, and engagement metrics',
      frequency: 'Monthly',
      lastGenerated: 'Live Data',
    },
  ];

  // MỚI: Thêm trạng thái loading
  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-foreground mb-2">Program Reports</h1>
        <p className="text-muted-foreground">Loading report data...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Program Reports</h1>
        <p className="text-muted-foreground">Generate and export comprehensive reports for stakeholders</p>
      </div>

      {/* Quick Stats (Dùng state) */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
          <p className="text-2xl text-foreground">{quickStats.totalSessions}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
          <p className="text-2xl text-foreground">{quickStats.completionRate}%</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg Rating</p>
          <p className="text-2xl text-foreground">{quickStats.avgRating} ⭐</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Students</p>
          <p className="text-2xl text-foreground">{quickStats.activeStudents}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Tutors</p>
          <p className="text-2xl text-foreground">{quickStats.activeTutors}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <div className="space-y-4">
            {reportTemplates.map((report) => (
              <div key={report.id} className="bg-white rounded-xl border border-border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <h3 className="text-foreground">{report.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Frequency: {report.frequency}</span>
                      <span>•</span>
                      <span>Last generated: {report.lastGenerated}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(`${report.name}_Excel`, report.id)}
                    >
                      <FileDown className="w-4 h-4 mr-1" />
                      Excel
                    </Button> */}
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={() => handleDownload(report.name, report.id)}
                    >
                      <FileDown className="w-4 h-4 mr-1" />
                      Generate Report
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="text-foreground mb-4">Create Custom Report</h3>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <Label>Report Type</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sessions">Sessions</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="tutors">Tutors</SelectItem>
                    <SelectItem value="performance">Performance Metrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Time Period</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="this-semester">This Semester</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Faculty/Department</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {deptStats.map(dept => (
                      <SelectItem key={dept.department} value={dept.department}>
                        {dept.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Include</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Session details</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Ratings & feedback</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm">Student demographics</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <FileDown className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="text-foreground mb-4">Recently Generated Reports</h3>
            
            <div className="space-y-3">
              {[
                { name: 'Program Overview Report - This Semester', date: 'Live Data', format: 'HTML', size: '...' },
                { name: 'Tutor Performance Report - This Semester', date: 'Live Data', format: 'HTML', size: '...' },
              ].map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <FileDown className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-foreground">{report.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.date} • {report.format} • {report.size}
                      </p>
                    </div>
                  </div>
                  {/* <Button size="sm" variant="outline" onClick={() => handleDownload(report.name, 'default')}>
                    Download
                  </Button> */}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}