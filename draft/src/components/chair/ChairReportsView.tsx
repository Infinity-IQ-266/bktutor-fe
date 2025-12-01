/* ======================================================================== */
/* NỘI DUNG ĐẦY ĐỦ CỦA FILE ChairReportsView.tsx                    */
/* (Đã sửa lỗi logic khi đọc dữ liệu progress)                            */
/* ======================================================================== */

import { useState, useEffect } from 'react';
import { FileDown, BarChart3, TrendingUp, Users, BookOpen, Loader2, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { generateReport, downloadReportAsHTML } from '../../utils/reportGenerator';
import { api } from '../../utils/api'; 

interface ChairReportsViewProps {
  userData?: any;
}

export default function ChairReportsView({ userData }: ChairReportsViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [departmentName, setDepartmentName] = useState('...');
  
  // State cho dữ liệu thật
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);

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
          api.getSessions() // Lấy tất cả, lọc sau
        ]);
        
        const studentsInDept = studentsRes.users || [];
        const studentIdsInDept = new Set(studentsInDept.map((s: any) => s.id));
        
        const sessionsInDept = (sessionsRes.sessions || []).filter((s: any) => 
          studentIdsInDept.has(s.studentId)
        );
        
        // Lấy progress cho từng sinh viên
        const progressPromises = studentsInDept.map((s: any) => api.getProgress(s.id));
        const progressResults = await Promise.all(progressPromises);
        
        // 🔥 FIX: Phải truy cập .progress.records
        const allProgress = progressResults.flatMap((p: any) => p.progress.records || []);

        setStudents(studentsInDept);
        setSessions(sessionsInDept);
        setProgress(allProgress);
        
      } catch (error) {
        console.error("Lỗi tải Chair Reports data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userData]);

  const handleDownloadReport = (reportName: string, reportId: string) => {
    let report;
    const commonProps = {
      title: reportName,
      generatedDate: new Date().toLocaleDateString('vi-VN'),
      generatedBy: userData.name || 'Department Chair',
      department: departmentName,
      period: 'Toàn bộ thời gian',
    };

    // --- Tạo Báo cáo ĐỘNG từ state ---
    
    if (reportId === 'participation') {
      const studentsInProgram = progress.length > 0 ? new Set(progress.map(p => p.studentId)).size : 0;
      report = generateReport({
        ...commonProps,
        sections: [
          {
            title: 'Participation Overview (Real Data)',
            type: 'stats',
            data: [
              { label: 'Total Students', value: students.length },
              { label: 'Active Students', value: studentsInProgram },
              { label: 'Total Sessions', value: sessions.length },
              { label: 'Participation Rate', value: `${students.length > 0 ? Math.round(studentsInProgram / students.length * 100) : 0}%` }
            ]
          },
          {
            title: 'Participation by Year',
            type: 'table',
            data: {
              columns: ['Year', 'Total Students', 'Active Students'],
              rows: students.reduce((acc: any[], s: any) => {
                const year = `Year ${s.year}`;
                let entry = acc.find(item => item[0] === year);
                if (!entry) {
                  entry = [year, 0, 0]; // [Year, Total, Active]
                  acc.push(entry);
                }
                entry[1]++; // Tăng total
                if (progress.some(p => p.studentId === s.id)) {
                  entry[2]++; // Tăng active
                }
                return acc;
              }, []).sort((a,b) => a[0].localeCompare(b[0]))
            }
          }
        ]
      });
    } else if (reportId === 'performance') {
      const allRatings = progress.map(p => p.averageRating).filter(r => r > 0);
      const avgRatingValue = allRatings.length > 0
          ? (allRatings.reduce((acc, r) => acc + r, 0) / allRatings.length)
          : 0;
      const avgRating = avgRatingValue.toFixed(1);
          
      report = generateReport({
        ...commonProps,
        sections: [
          {
            title: 'Performance Metrics (Real Data)',
            type: 'stats',
            data: [
              { label: 'Average Student Rating', value: `★ ${avgRating}` },
              { label: 'Total Sessions', value: sessions.length },
            ]
          },
          {
            title: 'Performance by Subject',
            type: 'table',
            data: {
              columns: ['Subject', 'Student', 'Avg Rating', 'Sessions'],
              rows: progress.map(p => [
                p.subject,
                students.find(s => s.id === p.studentId)?.name || 'N/A',
                `★ ${p.averageRating}`,
                p.sessionsAttended
              ])
            }
          }
        ]
      });
    } else {
      // Báo cáo mặc định
      report = generateReport({ ...commonProps, sections: [] });
    }
    
    const filename = `BK_TUTOR_${reportName.replace(/\s+/g, '_')}.html`;
    downloadReportAsHTML(report, filename);
  };

  // Dữ liệu tĩnh cho UI (giữ nguyên)
  const departmentReports = [
    { id: 'participation', name: 'Student Participation Report', description: 'Overview of department student participation', icon: Users },
    { id: 'performance', name: 'Academic Performance Report', description: 'Analysis of student progress and outcomes', icon: TrendingUp },
  ];
  
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Department Reports</h1>
        <p className="text-muted-foreground">{departmentName}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-4">
            {departmentReports.map((report) => {
              const Icon = report.icon;
              return (
                <div key={report.id} className="bg-white rounded-xl border border-border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-foreground mb-1">{report.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" onClick={() => handleDownloadReport(report.name, report.id)}>
                        <FileDown className="w-4 h-4 mr-1" />
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="text-foreground mb-4">Performance by Subject (Real Data)</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm text-muted-foreground">Subject</th>
                    <th className="text-left p-4 text-sm text-muted-foreground">Student</th>
                    <th className="text-center p-4 text-sm text-muted-foreground">Avg Rating</th>
                    <th className="text-center p-4 text-sm text-muted-foreground">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {progress.length === 0 && (
                     <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No progress data found for this department.
                      </td>
                    </tr>
                  )}
                  {progress.map((p, idx) => (
                    <tr key={idx} className="border-b border-border last:border-b-0">
                      <td className="p-4">
                        <p className="text-foreground">{p.subject}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-foreground">{students.find(s => s.id === p.studentId)?.name || 'N/A'}</p>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-foreground">{p.averageRating}</span>
                          <span className="text-yellow-500">⭐</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <p className="text-foreground">{p.sessionsAttended}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab Export giữ nguyên vì là UI tĩnh */}
        <TabsContent value="export" className="mt-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="text-foreground mb-4">Export Department Data</h3>
             <p className="text-muted-foreground">Vui lòng chọn từ tab 'Overview' để tạo báo cáo.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}