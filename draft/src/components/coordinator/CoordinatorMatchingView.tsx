// MỚI: Thêm useState, useEffect
import { useState, useEffect } from 'react';
import { GitMerge, User, GraduationCap, Star, Clock, CheckCircle, AlertCircle, Eye, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
// MỚI: Import API (ĐÃ SỬA ĐƯỜNG DẪN)
import { api } from '../../utils/api';
// MỚI: Import globalEvents (ĐÃ SỬA ĐƯỜNG DẪN)
import { globalEvents, EVENTS } from '../../utils/helpers';


export default function CoordinatorMatchingView() {
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [showPairDetailDialog, setShowPairDetailDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [selectedPair, setSelectedPair] = useState<any>(null);

  // MỚI: State cho dữ liệu động
  const [loading, setLoading] = useState(true);
  const [unmatchedStudents, setUnmatchedStudents] = useState<any[]>([]);
  const [availableTutors, setAvailableTutors] = useState<any[]>([]);
  const [activePairs, setActivePairs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  
  // MỚI: useEffect để tải dữ liệu
  useEffect(() => {
    loadMatchingData();
    
    // MỚI: Lắng nghe sự kiện để tự động cập nhật
    globalEvents.on(EVENTS.SESSION_CREATED, loadMatchingData);
    globalEvents.on(EVENTS.USER_CREATED, loadMatchingData);

    return () => {
      globalEvents.off(EVENTS.SESSION_CREATED, loadMatchingData);
      globalEvents.off(EVENTS.USER_CREATED, loadMatchingData);
    };
  }, []);

  const loadMatchingData = async () => {
    try {
      setLoading(true);

      // 1. Tải tất cả dữ liệu thô
      const [studentsResult, tutorsResult, sessionsResult, progressResult] = await Promise.all([
        api.getUsers({ role: 'student' }),
        api.getUsers({ role: 'tutor' }),
        api.getSessions({}),
        api.getAllProgress()
      ]);

      const allStudents = studentsResult.users || [];
      const allTutors = tutorsResult.users || [];
      const allSessions = sessionsResult.sessions || [];
      const allProgress = progressResult.progress || [];

      // 2. Xử lý Tab 1: Unmatched Students
      // Sinh viên "unmatched" là người chưa từng có session nào
      const unmatched = allStudents.filter((student: any) => {
        return !allSessions.some((s: any) => s.studentId === student.id);
      }).map((student: any) => ({
        ...student,
        subjects: student.expertise || ['General'], // API nên thêm trường này cho student
        preferredTime: 'Any', // API nên thêm trường này
        registeredDate: new Date(student.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        priority: 'Normal' // Logic nghiệp vụ
      }));
      setUnmatchedStudents(unmatched);

      // 3. Xử lý Tab 3: Available Tutors
      const tutorsWithLoad = allTutors.map((tutor: any) => {
        // Tìm các session đang active (confirmed, pending)
        const activeSessions = allSessions.filter((s: any) => 
          s.tutorId === tutor.id && (s.status === 'confirmed' || s.status === 'pending')
        );
        const currentStudents = new Set(activeSessions.map((s: any) => s.studentId)).size;
        
        // Tính rating
        const completedSessions = allSessions.filter((s: any) => s.tutorId === tutor.id && s.status === 'completed');
        const ratings = completedSessions.map((s: any) => s.rating).filter(Boolean);
        const avgRating = ratings.length > 0
          ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length)
          : 0;
          
        return {
          ...tutor,
          rating: avgRating,
          totalSessions: completedSessions.length,
          currentStudents: currentStudents,
          maxStudents: tutor.maxStudents || 10, // Giả sử max là 10 nếu API không có
          availability: tutor.availability || [] // API nên có
        };
      });
      setAvailableTutors(tutorsWithLoad);

      // 4. Xử lý Tab 2: Active Pairs
      // Một "pair" là một cặp (studentId, tutorId) duy nhất từ các session
      const pairsMap = new Map<string, any>();
      for (const session of allSessions) {
        if (!session.studentId || !session.tutorId) continue; // Bỏ qua nếu thiếu ID
        
        const pairKey = `${session.studentId}-${session.tutorId}`;
        
        if (!pairsMap.has(pairKey)) {
          // Lần đầu thấy cặp này, lấy thông tin
          const [student, tutor] = await Promise.all([
            api.getUser(session.studentId),
            api.getUser(session.tutorId)
          ]);
          
          if (!student.user || !tutor.user) continue;

          pairsMap.set(pairKey, {
            student: student.user.name,
            studentId: student.user.studentId || student.user.id,
            studentEmail: student.user.email,
            studentFaculty: student.user.department,
            studentYear: `Year ${student.user.year}`,
            tutor: tutor.user.name,
            tutorId: tutor.user.tutorId || tutor.user.id,
            tutorEmail: tutor.user.email,
            tutorDepartment: tutor.user.department,
            subjects: new Set<string>(),
            allSessions: [],
            matchedDate: session.createdAt
          });
        }

        // Thêm session và subject vào cặp
        const pair = pairsMap.get(pairKey);
        pair.allSessions.push(session);
        pair.subjects.add(session.subject);
        // Cập nhật ngày ghép cặp là ngày sớm nhất
        if (new Date(session.createdAt) < new Date(pair.matchedDate)) {
          pair.matchedDate = session.createdAt;
        }
      }
      
      // Tính toán stats cho từng cặp
      const activePairsData = Array.from(pairsMap.values()).map(pair => {
        const completed = pair.allSessions.filter((s: any) => s.status === 'completed');
        const upcoming = pair.allSessions.filter((s: any) => new Date(s.date) >= new Date() && (s.status === 'confirmed' || s.status === 'pending'));
        const ratings = completed.map((s: any) => s.rating).filter(Boolean);
        const avgRating = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';
        const attendedSessions = pair.allSessions.filter((s:any) => s.status === 'completed');
        const totalValidSessions = pair.allSessions.filter((s:any) => s.status === 'completed' || s.status === 'cancelled'); // Logic này có thể cần xem lại
        const attendance = totalValidSessions.length > 0 ? ((attendedSessions.length / totalValidSessions.length) * 100).toFixed(0) : '100';
        
        const lastSession = completed.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const nextSession = upcoming.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
        
        // Tìm studentId gốc (user:student:X)
        const originalStudent = allStudents.find((s:any) => s.studentId === pair.studentId || s.id === pair.studentId);
        const studentProgress = originalStudent ? allProgress.filter((p: any) => p.studentId === originalStudent.id) : [];
        const avgProgress = studentProgress.length > 0 ? studentProgress[0].improvementScore : 50; // Tạm
        
        return {
          ...pair,
          subjects: Array.from(pair.subjects),
          matchedDate: new Date(pair.matchedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          totalSessions: pair.allSessions.length,
          completedSessions: completed.length,
          upcomingSessions: upcoming.length,
          attendanceRate: `${attendance}%`,
          averageRating: avgRating,
          status: 'Active',
          lastSession: lastSession ? new Date(lastSession.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
          nextSession: nextSession ? new Date(nextSession.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
          progress: avgProgress >= 75 ? 'Excellent progress.' : 'Making good progress.'
        };
      });
      
      setActivePairs(activePairsData);
      
      // 5. Set Stats (cho Card)
      setStats({
        unmatched: unmatched.length,
        active: activePairsData.length,
        available: tutorsWithLoad.filter(t => t.currentStudents < t.maxStudents).length
      });

    } catch (error) {
      console.error("Error loading matching data:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleViewPairDetails = (pair: any) => {
    setSelectedPair(pair);
    setShowPairDetailDialog(true);
  };

  const handleStartMatch = (student: any) => {
    setSelectedStudent(student);
    setSelectedTutor(null);
    setShowMatchDialog(true);
  };

  const handleSelectTutor = (tutor: any) => {
    setSelectedTutor(tutor);
  };

  // MỚI: Cập nhật logic ghép cặp
  const confirmMatch = async () => {
    if (!selectedStudent || !selectedTutor) return;
    
    // Logic để confirm match
    // Ở đây, chúng ta nên tạo một session "pending" đầu tiên
    try {
      await api.createSession({
        studentId: selectedStudent.id,
        tutorId: selectedTutor.id,
        subject: selectedStudent.subjects[0] || 'Introduction',
        topic: 'Initial Consultation',
        status: 'pending', // Bắt đầu bằng pending
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 ngày sau
        time: '10:00',
        duration: 60,
        location: 'TBD',
      });
      
      // Tải lại dữ liệu để cập nhật danh sách
      loadMatchingData();
      
    } catch (error) {
      console.error("Error confirming match:", error);
    } finally {
      setShowMatchDialog(false);
      setSelectedStudent(null);
      setSelectedTutor(null);
    }
  };

  const getSuggestedTutors = (student: any) => {
    if (!student || !student.subjects) return [];
    // Filter tutors based on student's subjects
    return availableTutors.filter(tutor => 
      student.subjects?.some((subject: string) => 
        tutor.expertise?.some((exp: string) => exp?.toLowerCase().includes(subject?.toLowerCase()))
      )
    );
  };
  
  // MỚI: Thêm trạng thái loading
  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-foreground mb-2">Tutor-Student Matching</h1>
        <p className="text-muted-foreground">Loading matching data...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Tutor-Student Matching</h1>
        <p className="text-muted-foreground">Match students with suitable tutors based on expertise and availability</p>
      </div>

      {/* Stats (Dùng state) */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl text-foreground">{stats.unmatched || 0}</p>
              <p className="text-sm text-muted-foreground">Awaiting Match</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl text-foreground">{stats.active || 0}</p>
              <p className="text-sm text-muted-foreground">Active Pairs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl text-foreground">{stats.available || 0}</p>
              <p className="text-sm text-muted-foreground">Available Tutors</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-3 rounded-lg">
              <GitMerge className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              {/* Tỷ lệ thành công tạm thời hardcode */}
              <p className="text-2xl text-foreground">95%</p>
              <p className="text-sm text-muted-foreground">Match Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs (Dùng state) */}
      <Tabs defaultValue="unmatched">
        <TabsList>
          <TabsTrigger value="unmatched">Unmatched Students ({unmatchedStudents.length})</TabsTrigger>
          <TabsTrigger value="active">Active Pairs ({activePairs.length})</TabsTrigger>
          <TabsTrigger value="tutors">Available Tutors ({availableTutors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="unmatched" className="mt-6">
          <div className="space-y-4">
            {unmatchedStudents.map((student) => {
              const suggestedTutors = getSuggestedTutors(student);
              return (
                <div key={student.id} className="bg-white rounded-xl border border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-foreground">{student.name}</h3>
                        <Badge variant="secondary">ID: {student.studentId}</Badge>
                        <Badge className={student.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>
                          {student.priority} Priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {student.department} • Year {student.year}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-sm text-muted-foreground">Needs support in:</span>
                        {student.subjects.map((subject: string, idx: number) => (
                          <Badge key={idx} variant="outline">{subject}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Prefers {student.preferredTime}</span>
                        </div>
                        <span>Registered {student.registeredDate}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        className="bg-primary hover:bg-primary/90 text-white"
                        onClick={() => handleStartMatch(student)}
                      >
                        <GitMerge className="w-4 h-4 mr-2" />
                        Match Student
                      </Button>
                      <span className="text-xs text-center text-muted-foreground">
                        {suggestedTutors.length} suggested
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {unmatchedStudents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No students are currently waiting for a match.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {activePairs.map((pair, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-green-100 text-green-700">{pair.status}</Badge>
                      <span className="text-sm text-muted-foreground">Matched {pair.matchedDate}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Student</p>
                        <p className="text-foreground">{pair.student}</p>
                        <p className="text-sm text-muted-foreground">ID: {pair.studentId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tutor</p>
                        <p className="text-foreground">{pair.tutor}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-sm text-muted-foreground">Subjects:</span>
                      {pair.subjects.map((subject: string, i: number) => (
                        <Badge key={i} variant="secondary">{subject}</Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pair.completedSessions} sessions completed
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleViewPairDetails(pair)}>
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
            {activePairs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No active pairs found.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tutors" className="mt-6">
          <div className="space-y-4">
            {availableTutors.map((tutor) => (
              <div key={tutor.id} className="bg-white rounded-xl border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-foreground">{tutor.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm">{(tutor.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{tutor.department}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(tutor.expertise || []).map((skill: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Sessions</p>
                        <p className="text-foreground">{tutor.totalSessions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Load</p>
                        <p className="text-foreground">{tutor.currentStudents}/{tutor.maxStudents} students</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Capacity</p>
                        <p className={tutor.currentStudents < tutor.maxStudents ? 'text-green-600' : 'text-red-600'}>
                          {tutor.currentStudents < tutor.maxStudents ? 'Available' : 'Full'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Match Dialog (Dùng state) */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Match Student with Tutor</DialogTitle>
            <DialogDescription>
              Select the most suitable tutor based on expertise, availability, and current workload
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Student</p>
                <p className="text-foreground mb-1">{selectedStudent.name} (ID: {selectedStudent.studentId})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.subjects.map((subject: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{subject}</Badge>
                  ))}
                </div>
              </div>

              {/* Suggested Tutors */}
              <div>
                <Label>Suggested Tutors (Based on Expertise Match)</Label>
                <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
                  {getSuggestedTutors(selectedStudent).map((tutor) => (
                    <div
                      key={tutor.id}
                      onClick={() => handleSelectTutor(tutor)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTutor?.id === tutor.id
                          ? 'border-primary bg-blue-50'
                          : 'border-border hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-foreground">{tutor.name}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm">{(tutor.rating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                        {selectedTutor?.id === tutor.id && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(tutor.expertise || []).map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tutor.currentStudents}/{tutor.maxStudents} students • {tutor.totalSessions} sessions
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTutor && (
                <div>
                  <Label htmlFor="match-note">Matching Note (Optional)</Label>
                  <Textarea
                    id="match-note"
                    placeholder="Add any notes about this match..."
                    className="mt-1"
                  />
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowMatchDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  disabled={!selectedTutor}
                  onClick={confirmMatch}
                >
                  Confirm Match
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pair Details Dialog (Dùng state) */}
      <Dialog open={showPairDetailDialog} onOpenChange={setShowPairDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tutor-Student Pair Details</DialogTitle>
            <DialogDescription>
              View detailed information about this mentoring relationship
            </DialogDescription>
          </DialogHeader>
          
          {selectedPair && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-700 px-4 py-2">
                  {selectedPair.status} • Matched {selectedPair.matchedDate}
                </Badge>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-foreground">{selectedPair.averageRating} Average Rating</span>
                </div>
              </div>

              {/* Student and Tutor Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-foreground mb-3">Student Information</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="text-foreground">{selectedPair.student}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Student ID</p>
                      <p className="text-foreground">{selectedPair.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-foreground">{selectedPair.studentEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Faculty</p>
                      <p className="text-foreground">{selectedPair.studentFaculty}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="text-foreground">{selectedPair.studentYear}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-foreground mb-3">Tutor Information</h3>
                  <div className="bg-green-50 rounded-lg p-4 space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="text-foreground">{selectedPair.tutor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tutor ID</p>
                      <p className="text-foreground">{selectedPair.tutorId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-foreground">{selectedPair.tutorEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="text-foreground">{selectedPair.tutorDepartment}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div>
                <h3 className="text-foreground mb-3">Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPair.subjects.map((subject: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-sm">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Session Statistics */}
              <div>
                <h3 className="text-foreground mb-3">Session Statistics</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                    <p className="text-2xl text-foreground">{selectedPair.totalSessions}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                    <p className="text-2xl text-foreground">{selectedPair.completedSessions}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
                    <p className="text-2xl text-foreground">{selectedPair.upcomingSessions}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-1">Attendance</p>
                    <p className="text-2xl text-foreground">{selectedPair.attendanceRate}</p>
                  </div>
                </div>
              </div>

              {/* Session Timeline */}
              <div>
                <h3 className="text-foreground mb-3">Session Timeline</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Last Session</span>
                    </div>
                    <span className="text-foreground">{selectedPair.lastSession}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">Next Session</span>
                    </div>
                    <span className="text-primary">{selectedPair.nextSession}</span>
                  </div>
                </div>
              </div>

              {/* Progress Summary */}
              <div>
                <h3 className="text-foreground mb-3">Progress Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                    <p className="text-foreground">{selectedPair.progress}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPairDetailDialog(false)}
                >
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