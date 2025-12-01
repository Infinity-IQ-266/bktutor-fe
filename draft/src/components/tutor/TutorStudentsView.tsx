import { Search, TrendingUp, Calendar, FileText, MessageSquare, Eye, User } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { useState } from 'react';

export default function TutorStudentsView() {
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showStudentDetailDialog, setShowStudentDetailDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const activeStudents = [
    {
      id: 1,
      name: 'Tran Minh B',
      studentId: '2011234',
      email: 'tran.minhb@hcmut.edu.vn',
      phone: '+84 901 234 567',
      faculty: 'Computer Science & Engineering',
      year: 'Year 3',
      subjects: ['Data Structures', 'Algorithms'],
      totalSessions: 8,
      attendanceRate: '100%',
      lastSession: 'Oct 30, 2025',
      progress: 'Good understanding of data structures. Ready for advanced topics.',
      status: 'Active',
      notes: [
        { date: 'Oct 30, 2025', note: 'Covered binary search trees. Excellent progress.' },
        { date: 'Oct 25, 2025', note: 'Started AVL trees and rotations.' },
      ],
    },
    {
      id: 2,
      name: 'Nguyen Van C',
      studentId: '2011567',
      email: 'nguyen.vanc@hcmut.edu.vn',
      phone: '+84 902 345 678',
      faculty: 'Computer Science & Engineering',
      year: 'Year 3',
      subjects: ['Algorithms'],
      totalSessions: 5,
      attendanceRate: '100%',
      lastSession: 'Oct 28, 2025',
      progress: 'Making steady progress in sorting and searching algorithms.',
      status: 'Active',
      notes: [
        { date: 'Oct 28, 2025', note: 'Working on quicksort and merge sort.' },
      ],
    },
    {
      id: 3,
      name: 'Le Thi D',
      studentId: '2012345',
      email: 'le.thid@hcmut.edu.vn',
      phone: '+84 903 456 789',
      faculty: 'Computer Science & Engineering',
      year: 'Year 2',
      subjects: ['Database Systems'],
      totalSessions: 3,
      attendanceRate: '100%',
      lastSession: 'Oct 25, 2025',
      progress: 'Needs more practice with SQL queries and normalization.',
      status: 'Active',
      notes: [
        { date: 'Oct 25, 2025', note: 'Covered ER diagrams and basic normalization.' },
      ],
    },
  ];

  const pastStudents = [
    {
      id: 4,
      name: 'Pham Van E',
      studentId: '2010123',
      email: 'pham.vane@hcmut.edu.vn',
      phone: '+84 904 567 890',
      faculty: 'Computer Science & Engineering',
      year: 'Year 4',
      subjects: ['Data Structures'],
      totalSessions: 12,
      completedDate: 'Sep 15, 2025',
      finalNote: 'Successfully completed course. Excellent progress.',
    },
  ];

  const handleAddNote = (student: any) => {
    setSelectedStudent(student);
    setShowAddNoteDialog(true);
  };

  const handleSchedule = (student: any) => {
    setSelectedStudent(student);
    setShowScheduleDialog(true);
  };

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setShowStudentDetailDialog(true);
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">My Students</h1>
        <p className="text-muted-foreground">View and manage students you're currently tutoring</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search students by name, ID, or subject..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Students ({activeStudents.length})</TabsTrigger>
          <TabsTrigger value="past">Past Students ({pastStudents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {activeStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-xl border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button 
                        onClick={() => handleViewStudent(student)}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <h3 className="text-foreground">{student.name}</h3>
                        <User className="w-4 h-4" />
                      </button>
                      <Badge variant="secondary">ID: {student.studentId}</Badge>
                      <Badge className="bg-green-100 text-green-700">{student.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{student.faculty}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {student.subjects.map((subject, idx) => (
                        <Badge key={idx} variant="outline">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleAddNote(student)}>
                      <FileText className="w-4 h-4 mr-1" />
                      Add Note
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" onClick={() => handleSchedule(student)}>
                      <Calendar className="w-4 h-4 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-4 pb-4 border-b border-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                    <p className="text-xl text-foreground">{student.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
                    <p className="text-xl text-foreground">{student.attendanceRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Session</p>
                    <p className="text-xl text-foreground">{student.lastSession}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <p className="text-sm text-foreground">Latest Progress Note</p>
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{student.progress}"</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="space-y-4">
            {pastStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-xl border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-foreground">{student.name}</h3>
                      <Badge variant="secondary">ID: {student.studentId}</Badge>
                      <Badge className="bg-gray-100 text-gray-700">Completed</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{student.faculty}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {student.subjects.map((subject, idx) => (
                        <Badge key={idx} variant="outline">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-4 pb-4 border-b border-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                    <p className="text-xl text-foreground">{student.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                    <p className="text-xl text-foreground">{student.completedDate}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-foreground mb-2">Final Note</p>
                  <p className="text-sm text-muted-foreground italic">"{student.finalNote}"</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Note Dialog */}
      <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Progress Note</DialogTitle>
            <DialogDescription>
              Record student progress and observations
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Student</p>
                <p className="text-foreground mb-3">{selectedStudent.name} (ID: {selectedStudent.studentId})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.subjects.map((subject: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{subject}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="note-type">Note Type</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select note type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">Progress Update</SelectItem>
                    <SelectItem value="concern">Concern</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="general">General Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Related Subject (Optional)</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedStudent.subjects.map((subject: string, idx: number) => (
                      <SelectItem key={idx} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="progress-note">Progress Note *</Label>
                <Textarea
                  id="progress-note"
                  placeholder="Describe the student's progress, challenges, achievements, or any observations..."
                  className="mt-1 min-h-[150px]"
                />
              </div>

              <div>
                <Label htmlFor="recommendations">Recommendations (Optional)</Label>
                <Textarea
                  id="recommendations"
                  placeholder="Suggest next steps, practice problems, or areas to focus on..."
                  className="mt-1 min-h-[100px]"
                />
              </div>

              {selectedStudent.notes && selectedStudent.notes.length > 0 && (
                <div>
                  <Label className="mb-2 block">Previous Notes</Label>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-[200px] overflow-y-auto space-y-3">
                    {selectedStudent.notes.map((note: any, idx: number) => (
                      <div key={idx} className="pb-3 border-b border-border last:border-0">
                        <p className="text-xs text-muted-foreground mb-1">{note.date}</p>
                        <p className="text-sm text-foreground">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddNoteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={() => setShowAddNoteDialog(false)}
                >
                  Save Note
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Session Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Session</DialogTitle>
            <DialogDescription>
              Create a new tutoring session with {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="text-foreground">{selectedStudent.name}</p>
                <p className="text-sm text-muted-foreground">ID: {selectedStudent.studentId}</p>
              </div>

              <div>
                <Label htmlFor="session-subject">Subject *</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedStudent.subjects.map((subject: string, idx: number) => (
                      <SelectItem key={idx} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-1 justify-start text-left">
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? selectedDate.toLocaleDateString() : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="session-time">Time Slot *</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8-9">8:00 AM - 9:00 AM</SelectItem>
                    <SelectItem value="9-10">9:00 AM - 10:00 AM</SelectItem>
                    <SelectItem value="10-11">10:00 AM - 11:00 AM</SelectItem>
                    <SelectItem value="11-12">11:00 AM - 12:00 PM</SelectItem>
                    <SelectItem value="14-15">2:00 PM - 3:00 PM</SelectItem>
                    <SelectItem value="15-16">3:00 PM - 4:00 PM</SelectItem>
                    <SelectItem value="16-17">4:00 PM - 5:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="session-type">Session Type *</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-person</SelectItem>
                    <SelectItem value="online">Online (Zoom/Teams)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="session-notes">Session Notes (Optional)</Label>
                <Textarea
                  id="session-notes"
                  placeholder="Add any preparation notes or topics to cover..."
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowScheduleDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={() => setShowScheduleDialog(false)}
                >
                  Schedule Session
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Student Details Dialog */}
      <Dialog open={showStudentDetailDialog} onOpenChange={setShowStudentDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-foreground mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                    <p className="text-foreground">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Student ID</p>
                    <p className="text-foreground">{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="text-foreground">{selectedStudent.phone}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-foreground mb-3">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Faculty</p>
                    <p className="text-foreground">{selectedStudent.faculty}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Year</p>
                    <p className="text-foreground">{selectedStudent.year}</p>
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div>
                <h3 className="text-foreground mb-3">Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.subjects.map((subject: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-sm">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Session Statistics */}
              <div>
                <h3 className="text-foreground mb-3">Session Statistics</h3>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                    <p className="text-2xl text-foreground">{selectedStudent.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
                    <p className="text-2xl text-foreground">{selectedStudent.attendanceRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Session</p>
                    <p className="text-foreground">{selectedStudent.lastSession}</p>
                  </div>
                </div>
              </div>

              {/* Progress Notes */}
              {selectedStudent.notes && selectedStudent.notes.length > 0 && (
                <div>
                  <h3 className="text-foreground mb-3">Progress History</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    {selectedStudent.notes.map((note: any, idx: number) => (
                      <div key={idx} className="pb-4 border-b border-border last:border-0">
                        <p className="text-sm text-muted-foreground mb-1">{note.date}</p>
                        <p className="text-foreground">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowStudentDetailDialog(false)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={() => {
                    setShowStudentDetailDialog(false);
                    handleSchedule(selectedStudent);
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
