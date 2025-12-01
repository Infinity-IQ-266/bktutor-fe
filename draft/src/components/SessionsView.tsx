/* ======================================================================== */
/* NỘI DUNG ĐẦY ĐỦ CỦA FILE SessionsView.tsx                          */
/* (Đã sửa để gọi API, xóa dữ liệu tĩnh, và thêm chức năng tạo session)   */
/* ======================================================================== */

import { Plus, Search, Filter, Calendar as CalendarIcon, Clock, MapPin, Video, Eye, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
// MỚI: Thêm useState, useEffect
import { useState, useEffect } from 'react';
// MỚI: Import API (sửa đường dẫn nếu cần, file này ở src/components/)
import { api } from '../utils/api'; 
import { globalEvents, EVENTS } from '../utils/helpers';

// MỚI: Hàm trợ giúp để lấy màu sắc badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return { label: 'Completed', color: 'bg-green-100 text-green-700' };
    case 'confirmed':
    case 'scheduled': // Gộp 'scheduled' vào 'confirmed'
      return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' };
    case 'pending':
      return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' };
    case 'cancelled':
    case 'declined':
      return { label: 'Cancelled', color: 'bg-red-100 text-red-700' };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-700' };
  }
};

export default function SessionsView() {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // MỚI: State cho dữ liệu động
  const [isLoading, setIsLoading] = useState(true);
  const [allSessions, setAllSessions] = useState<any[]>([]); // Danh sách gốc
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]); // Danh sách hiển thị
  const [tutorsList, setTutorsList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  
  // MỚI: State cho filter
  const [currentTab, setCurrentTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // MỚI: State cho form tạo session
  const [newSessionTutor, setNewSessionTutor] = useState('');
  const [newSessionStudent, setNewSessionStudent] = useState('');
  const [newSessionSubject, setNewSessionSubject] = useState('');
  const [newSessionDate, setNewSessionDate] = useState<Date | undefined>(new Date());
  const [newSessionTime, setNewSessionTime] = useState('');
  const [newSessionType, setNewSessionType] = useState('in-person');
  const [newSessionLocation, setNewSessionLocation] = useState('');
  const [newSessionNotes, setNewSessionNotes] = useState('');


  // MỚI: Hàm tải dữ liệu
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sessionsRes, tutorsRes, studentsRes] = await Promise.all([
        api.getSessions({}),
        api.getUsers({ role: 'tutor' }),
        api.getUsers({ role: 'student' })
      ]);

      const tutors = tutorsRes.users || [];
      const students = studentsRes.users || [];
      const sessions = sessionsRes.sessions || [];

      // Làm giàu dữ liệu session với tên
      const enrichedSessions = sessions.map((session: any) => {
        const tutor = tutors.find((t: any) => t.id === session.tutorId);
        const student = students.find((s: any) => s.id === session.studentId);
        const statusInfo = getStatusBadge(session.status);
        
        return {
          ...session,
          tutorName: tutor?.name || 'Unknown Tutor',
          tutorId: tutor?.tutorId || 'N/A', // Hiển thị ID gia sư
          studentName: student?.name || 'Unknown Student',
          studentId: student?.studentId || 'N/A', // Hiển thị ID SV
          statusColor: statusInfo.color,
          statusLabel: statusInfo.label,
          type: session.type || (session.location?.toLowerCase().includes('http') ? 'Online' : 'In-person'),
        };
      }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sắp xếp mới nhất trước

      setAllSessions(enrichedSessions);
      setTutorsList(tutors);
      setStudentsList(students);
      
    } catch (error) {
      console.error("Lỗi tải dữ liệu sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // MỚI: Tải dữ liệu khi component mount
  useEffect(() => {
    loadData();
    
    // Lắng nghe sự kiện để tự động cập nhật
    globalEvents.on(EVENTS.SESSION_UPDATED, loadData);
    globalEvents.on(EVENTS.SESSION_CREATED, loadData);
    globalEvents.on(EVENTS.SESSION_CANCELLED, loadData);

    return () => {
      globalEvents.off(EVENTS.SESSION_UPDATED, loadData);
      globalEvents.off(EVENTS.SESSION_CREATED, loadData);
      globalEvents.off(EVENTS.SESSION_CANCELLED, loadData);
    };
  }, []);

  // MỚI: Effect để lọc dữ liệu khi tab hoặc search thay đổi
  useEffect(() => {
    let sessions = [...allSessions];

    // 1. Lọc theo Tab
    if (currentTab !== 'all') {
      sessions = sessions.filter(s => s.status === currentTab);
    }
    
    // 2. Lọc theo Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      sessions = sessions.filter(s => 
        s.subject.toLowerCase().includes(lowerSearch) ||
        s.tutorName.toLowerCase().includes(lowerSearch) ||
        s.studentName.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredSessions(sessions);
  }, [allSessions, currentTab, searchTerm]);
  
  
  // MỚI: Hàm xử lý tạo session
  const handleScheduleSession = async () => {
    if (!newSessionTutor || !newSessionStudent || !newSessionSubject || !newSessionDate || !newSessionTime) {
      alert('Please fill in all required fields (*)');
      return;
    }

    try {
      const newSession = {
        tutorId: newSessionTutor,
        studentId: newSessionStudent,
        subject: newSessionSubject,
        topic: newSessionSubject, // Dùng subject cho cả topic
        date: newSessionDate.toISOString().split('T')[0],
        time: newSessionTime.split(' ')[0], // "9:00 AM - 10:00 AM" -> "9:00"
        duration: 60, // Mặc định 60
        type: newSessionType,
        location: newSessionLocation,
        status: 'scheduled', // Admin tạo thì scheduled luôn
        notes: newSessionNotes,
      };

      await api.createSession(newSession);
      
      // Đóng dialog và reset form
      setShowScheduleDialog(false);
      setNewSessionTutor('');
      setNewSessionStudent('');
      setNewSessionSubject('');
      setNewSessionDate(new Date());
      setNewSessionTime('');
      setNewSessionLocation('');
      setNewSessionNotes('');
      
      // Tải lại dữ liệu (hoặc event listener sẽ làm)
      // loadData(); // Không cần nếu globalEvent hoạt động
      
    } catch (error) {
      console.error("Lỗi tạo session:", error);
      alert('Failed to create session. Please try again.');
    }
  };

  const handleViewDetails = (session: any) => {
    setSelectedSession(session);
    setShowDetailDialog(true);
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Session Management</h1>
          <p className="text-muted-foreground">Manage and monitor all tutoring sessions.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => setShowScheduleDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Session
        </Button>
      </div>

      {/* Tabs (MỚI: Thêm onValueChange) */}
      <Tabs defaultValue="all" onValueChange={setCurrentTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Sessions</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        {/* Filters and Search (MỚI: Kết nối state) */}
        <div className="bg-white rounded-xl border border-border p-4 mt-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search sessions by tutor, student, or subject..."
                className="w-full pl-10 pr-4 py-2 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* <Button variant="outline" className="border-border">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button> */}
          </div>
        </div>

        {/* MỚI: Thêm trạng thái Loading */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        )}

        {/* MỚI: Các Tab Content giờ dùng chung 1 component (filteredSessions) */}
        {/* Chúng ta không cần các TabsContent riêng biệt nữa vì logic filter đã xử lý */}
        
        {!isLoading && (
          <div className="space-y-4">
            {filteredSessions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No sessions found for this filter.
              </p>
            )}
            
            {filteredSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-foreground">{session.subject}</h3>
                      <Badge className={session.statusColor}>
                        {session.statusLabel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.tutorName} → {session.studentName}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(session)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(session.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{session.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {session.type === 'Online' ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    <span>{session.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">
                      {session.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Tabs>

      {/* Schedule Session Dialog (MỚI: Kết nối state) */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Session</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tutor">Select Tutor *</Label>
                <Select value={newSessionTutor} onValueChange={setNewSessionTutor}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose tutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutorsList.map(tutor => (
                      <SelectItem key={tutor.id} value={tutor.id}>
                        {tutor.name} ({tutor.tutorId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="student">Select Student *</Label>
                <Select value={newSessionStudent} onValueChange={setNewSessionStudent}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose student" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentsList.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.studentId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="subject">Subject/Topic *</Label>
              <Input
                id="subject"
                placeholder="e.g., Data Structures"
                className="mt-1"
                value={newSessionSubject}
                onChange={(e) => setNewSessionSubject(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Select Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-1 justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newSessionDate ? newSessionDate.toLocaleDateString() : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newSessionDate}
                      onSelect={setNewSessionDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="time">Time Slot *</Label>
                <Select value={newSessionTime} onValueChange={setNewSessionTime}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8:00 AM - 9:00 AM">8:00 AM - 9:00 AM</SelectItem>
                    <SelectItem value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</SelectItem>
                    <SelectItem value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</SelectItem>
                    <SelectItem value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</SelectItem>
                    <SelectItem value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</SelectItem>
                    <SelectItem value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</SelectItem>
                    <SelectItem value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Session Type *</Label>
                <Select value={newSessionType} onValueChange={setNewSessionType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-person</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Room A1-301 or Zoom link"
                  className="mt-1"
                  value={newSessionLocation}
                  onChange={(e) => setNewSessionLocation(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Session Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes or topics to cover..."
                className="mt-1 min-h-[80px]"
                value={newSessionNotes}
                onChange={(e) => setNewSessionNotes(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowScheduleDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                onClick={handleScheduleSession}
              >
                Schedule Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Detail Dialog (Đã kết nối) */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground">{selectedSession.subject}</h3>
                <Badge className={selectedSession.statusColor}>
                  {selectedSession.statusLabel}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm text-muted-foreground mb-3">Participants</h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tutor</p>
                    <p className="text-foreground">{selectedSession.tutorName}</p>
                    <p className="text-sm text-muted-foreground">ID: {selectedSession.tutorId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Student</p>
                    <p className="text-foreground">{selectedSession.studentName}</p>
                    <p className="text-sm text-muted-foreground">ID: {selectedSession.studentId}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm text-muted-foreground mb-3">Session Information</h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="text-foreground">{new Date(selectedSession.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Time</p>
                    <p className="text-foreground">{selectedSession.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Type</p>
                    <p className="text-foreground">{selectedSession.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="text-foreground">{selectedSession.location}</p>
                  </div>
                </div>
              </div>

              {selectedSession.notes && (
                <div>
                  <h4 className="text-sm text-muted-foreground mb-2">Session Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-foreground">{selectedSession.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDetailDialog(false)}
                >
                  Close
                </Button>
                {/* Nút này tạm thời chưa có chức năng
                {selectedSession.status !== 'Completed' && (
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-white">
                    Edit Session
                  </Button>
                )} 
                */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}