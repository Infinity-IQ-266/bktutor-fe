/* ======================================================================== */
/* NỘI DUNG ĐẦY ĐỦ CỦA FILE ChairStudentsView.tsx                    */
/* (Đã sửa lỗi logic khi đọc dữ liệu progress)                            */
/* ======================================================================== */

import { useState, useEffect } from 'react';
import { Search, Filter, Download, TrendingUp, Loader2, Star } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { generateReport, downloadReportAsHTML } from '../../utils/reportGenerator';
import { api } from '../../utils/api'; 

interface ChairStudentsViewProps {
  userData?: any; 
}

export default function ChairStudentsView({ userData }: ChairStudentsViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [departmentName, setDepartmentName] = useState('...');
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // State cho dữ liệu thật
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  
  // State cho filter
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
        const studentsRes = await api.getUsers({ 
          role: 'student', 
          department: userData.department 
        });
        
        const students = studentsRes.users || [];
        
        // Làm giàu dữ liệu (enrich) sinh viên với thông tin program
        const enrichedStudentsPromises = students.map(async (student: any) => {
          const progressRes = await api.getProgress(student.id);
          
          // 🔥 FIX: Phải truy cập .progress.records
          const studentProgress = progressRes.progress.records || []; 
          
          const totalSessions = studentProgress.reduce((sum: number, p: any) => sum + p.sessionsAttended, 0);
          const ratings = studentProgress.map((p: any) => p.averageRating).filter((r: number) => r > 0);
          const averageRating = ratings.length > 0 
            ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
            : 0;

          return {
            ...student,
            totalSessions: totalSessions,
            averageRating: averageRating,
          };
        });
        
        const enrichedStudents = await Promise.all(enrichedStudentsPromises);

        setAllStudents(enrichedStudents);
        setFilteredStudents(enrichedStudents);
      } catch (error) {
        console.error("Lỗi tải danh sách sinh viên:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userData]);

  // Effect để chạy filter
  useEffect(() => {
    let students = [...allStudents];

    if (yearFilter !== 'all') {
      students = students.filter(s => s.year.toString() === yearFilter);
    }

    if (statusFilter === 'in-program') {
      students = students.filter(s => (s.totalSessions || 0) > 0);
    } else if (statusFilter === 'not-in-program') {
      students = students.filter(s => (s.totalSessions || 0) === 0);
    }
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      students = students.filter(s =>
        s.name.toLowerCase().includes(lowerSearch) ||
        (s.studentId && s.studentId.toLowerCase().includes(lowerSearch))
      );
    }
    
    setFilteredStudents(students);
  }, [yearFilter, statusFilter, searchTerm, allStudents]);


  const handleViewDetails = (student: any) => {
    setSelectedStudent(student);
    setShowDetailDialog(true);
  };

  const exportData = (format: string) => {
    const report = generateReport({
      title: `Department Students Report (${departmentName})`,
      generatedDate: new Date().toLocaleDateString('vi-VN'),
      generatedBy: userData?.name || 'Department Chair',
      department: departmentName,
      sections: [
        {
          title: 'Student List (Real Data)',
          type: 'table',
          data: {
            columns: ['Student', 'Year', 'GPA', 'Sessions', 'Rating'],
            rows: filteredStudents.map(s => [
              `${s.name} (${s.studentId})`,
              s.year,
              s.gpa,
              s.totalSessions || 0,
              `★ ${s.averageRating || 'N/A'}`
            ])
          }
        }
      ]
    });
    
    const filename = `BK_TUTOR_Student_Report_${departmentName.replace(/\s+/g, '_')}.html`;
    downloadReportAsHTML(report, filename);
  };
  
  // Tính toán stats từ dữ liệu thật
  const studentsInProgram = allStudents.filter(s => (s.totalSessions || 0) > 0).length;
  const participationRate = allStudents.length > 0 
    ? Math.round((studentsInProgram / allStudents.length) * 100)
    : 0;
  const totalSessions = allStudents.reduce((sum, s) => sum + (s.totalSessions || 0), 0);

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Department Students</h1>
          <p className="text-muted-foreground">{departmentName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('html')}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats - DÙNG DỮ LIỆU THẬT */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Students</p>
          <p className="text-2xl text-foreground">{allStudents.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">In Program</p>
          <p className="text-2xl text-foreground">{studentsInProgram}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Participation Rate</p>
          <p className="text-2xl text-foreground">{participationRate}%</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
          <p className="text-2xl text-foreground">{totalSessions}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
            <div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                  <SelectItem value="4">Year 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="in-program">In Program Only</SelectItem>
                  <SelectItem value="not-in-program">Not in Program</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Students Table - DÙNG DỮ LIỆU THẬT */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm text-muted-foreground">Student Info</th>
                <th className="text-left p-4 text-sm text-muted-foreground">Academic</th>
                <th className="text-left p-4 text-sm text-muted-foreground">Program Status</th>
                <th className="text-left p-4 text-sm text-muted-foreground">Sessions</th>
                <th className="text-left p-4 text-sm text-muted-foreground">Avg. Rating</th>
                <th className="text-left p-4 text-sm text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    No students found.
                  </td>
                </tr>
              )}
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-border last:border-b-0 hover:bg-gray-50">
                  <td className="p-4">
                    <p className="text-foreground">{student.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {student.studentId}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-foreground">Year {student.year}</p>
                    <p className="text-sm text-muted-foreground">GPA: {student.gpa}</p>
                  </td>
                  <td className="p-4">
                    {(student.totalSessions || 0) > 0 ? (
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Not Enrolled</Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="text-foreground">{student.totalSessions || 0}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {(student.averageRating || 0) > 0 ? (
                        <>
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-foreground">{student.averageRating}</span>
                        </>
                      ) : (
                         <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(student)}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground">{selectedStudent.name}</h3>
                <Badge className={(selectedStudent.totalSessions || 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                  {(selectedStudent.totalSessions || 0) > 0 ? 'In Program' : 'Not Enrolled'}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm text-muted-foreground mb-3">Academic Information</h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Student ID</p>
                    <p className="text-foreground">{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Year</p>
                    <p className="text-foreground">{selectedStudent.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Department</p>
                    <p className="text-foreground">{selectedStudent.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">GPA</p>
                    <p className="text-foreground">{selectedStudent.gpa}</p>
                  </div>
                </div>
              </div>

              {(selectedStudent.totalSessions || 0) > 0 && (
                <>
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-3">Program Participation</h4>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                        <p className="text-foreground">{selectedStudent.totalSessions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                        <p className="text-foreground">{selectedStudent.averageRating}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}